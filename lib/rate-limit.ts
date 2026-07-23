import "server-only";
import type { NextRequest } from "next/server";

/**
 * Per-IP rate limiting. `limit()` uses Upstash Redis when configured (correct
 * across serverless instances / cold starts), and falls back to the in-memory
 * sliding window below when it isn't — so local dev and a Redis outage both
 * degrade gracefully instead of locking real users out.
 */

const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000; // hard cap so the map can't grow unbounded

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** In-memory sliding window — the fallback when Upstash isn't configured. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const prev = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (prev.length >= limit) {
    hits.set(key, prev);
    return false;
  }
  prev.push(now);
  if (!hits.has(key) && hits.size >= MAX_KEYS) hits.clear();
  hits.set(key, prev);
  return true;
}

// --- Upstash Redis (REST) fixed-window limiter ---------------------------------

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Fixed-window counter via Upstash REST: INCR the key, and on the first hit set
 * a TTL (EXPIRE … NX). Returns null when Upstash isn't configured OR on any
 * network/HTTP error, so the caller falls back to the in-memory limiter.
 * REST + fetch keeps this edge-compatible with no SDK dependency.
 */
async function upstashLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const rkey = `rl:${key}`;
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", rkey],
        ["EXPIRE", rkey, windowSec, "NX"],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number }[];
    const count = Number(data?.[0]?.result ?? 0);
    return count <= max;
  } catch {
    return null;
  }
}

/**
 * True if this key is within `max` calls per `windowMs`. Prefers Upstash;
 * fails open to the in-memory limiter on any Redis hiccup.
 */
export async function limit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const viaRedis = await upstashLimit(key, max, windowMs);
  return viaRedis === null ? rateLimit(key, max, windowMs) : viaRedis;
}

import "server-only";
import type { NextRequest } from "next/server";

/**
 * Per-IP sliding-window rate limiter.
 * ponytail: in-memory, per server instance — fine for a single-node/standalone
 * deploy; swap for Upstash/Redis if this ever runs multi-instance serverless.
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

/** True if this key is within `limit` calls per `windowMs`. */
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

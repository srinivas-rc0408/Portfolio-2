import "server-only";
import { timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Server-side session auth. Credentials are validated against env vars
 * (admin) or the Neon users table (visitors); a signed, httpOnly JWT
 * cookie carries the session. Nothing sensitive reaches the client bundle.
 */

export interface SessionPayload {
  name: string;
  email: string;
  role: "admin" | "user";
}

export const SESSION_COOKIE = "portfolio_session";
const MAX_AGE = 60 * 60 * 24; // 24h

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    // Refuse to run production with a known secret — forgeable admin JWTs.
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set in production");
    }
    return new TextEncoder().encode("insecure-dev-secret-set-AUTH_SECRET");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      (payload.role === "admin" || payload.role === "user")
    ) {
      return { name: payload.name, email: payload.email, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

/** Read + verify the current session from the request cookie. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Constant-time string compare (length leak only). */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** True if the credentials match the server-side admin (env vars). */
export function isAdminCredential(email: string, password: string): boolean {
  const e = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const p = process.env.ADMIN_PASSWORD || "";
  if (!e || !p) return false;
  // Evaluate both before combining — no early-exit timing signal.
  const emailOk = safeEqual(email.trim().toLowerCase(), e);
  const passOk = safeEqual(password, p);
  return emailOk && passOk;
}

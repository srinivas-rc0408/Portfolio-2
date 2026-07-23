import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Edge proxy (Next.js 16 middleware convention) — defense-in-depth admin guard.
 *
 * Every admin API handler already verifies the session server-side, and the
 * `/admin` page renders its own login gate for signed-out visitors (so it is
 * NOT redirected here — that would make logging in impossible). What this adds
 * is a fast, centralized 401 at the edge for *mutating* admin API calls whose
 * session cookie is missing or forged, before they ever reach the DB.
 *
 * Public routes are deliberately excluded: GET reads, /api/auth/*, /api/chat,
 * and feedback submission (POST /api/feedback) must stay open.
 */

const SESSION_COOKIE = "portfolio_session";

// Path → methods that require a valid admin session.
const GUARDED: { prefix: string; methods: Set<string> }[] = [
  { prefix: "/api/cms", methods: new Set(["POST", "PUT", "DELETE"]) },
  { prefix: "/api/settings", methods: new Set(["PUT"]) },
  { prefix: "/api/feedback", methods: new Set(["PATCH", "DELETE"]) },
];

// Mirrors lib/auth.ts secret(): refuse the insecure dev fallback in production
// so a missing AUTH_SECRET fails closed (thrown → caught → 401) instead of
// verifying against a publicly-known key.
function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set in production");
    }
    return new TextEncoder().encode("insecure-dev-secret-set-AUTH_SECRET");
  }
  return new TextEncoder().encode(s);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rule = GUARDED.find(
    (g) => pathname.startsWith(g.prefix) && g.methods.has(req.method)
  );
  if (!rule) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const unauthorized = () =>
    NextResponse.json(
      { error: "Your admin session expired — please log in again." },
      { status: 401 }
    );

  if (!token) return unauthorized();
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin") return unauthorized();
  } catch {
    return unauthorized();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/cms/:path*", "/api/settings/:path*", "/api/feedback/:path*"],
};

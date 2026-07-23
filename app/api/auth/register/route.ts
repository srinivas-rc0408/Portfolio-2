import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "@/lib/db";
import { isAdminCredential, setSessionCookie } from "@/lib/auth";
import { clientIp, limit } from "@/lib/rate-limit";
import { sendEmail, welcomeEmail } from "@/lib/email";

// Basic shape check — real deliverability is confirmed by the welcome email.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public visitor registration → stored in Fluxbase (app_user), password hashed
 * with bcrypt, session cookie set, and a best-effort welcome email sent via
 * Resend. The env-only admin credential can never be shadowed by a DB user.
 */
export async function POST(req: NextRequest) {
  // 5 sign-ups / 10 min per IP — blunts automated account creation.
  if (!(await limit(`register:${clientIp(req)}`, 5, 10 * 60_000))) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a little while." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || name.length > 60) {
    return NextResponse.json(
      { error: "Please enter your name (2–60 characters)." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      { error: "Password must be 8–128 characters." },
      { status: 400 }
    );
  }
  // The admin credential lives in env only — never let it be shadowed in the DB.
  if (
    isAdminCredential(email, password) ||
    email === (process.env.ADMIN_EMAIL || "").toLowerCase()
  ) {
    return NextResponse.json(
      { error: "That email can't be registered." },
      { status: 409 }
    );
  }

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with this email already exists — try signing in." },
        { status: 409 }
      );
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hash);
    const session = { name: user.name, email: user.email, role: "user" as const };
    await setSessionCookie(session);
    // Best-effort welcome email — awaited so the serverless function doesn't
    // suspend before it's sent, but never allowed to fail the registration.
    await sendEmail({ to: email, ...welcomeEmail(name) });
    return NextResponse.json({ user: session });
  } catch (e) {
    console.error("register error:", e);
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 }
    );
  }
}

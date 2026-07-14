import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // 5 registrations / 10 min per IP — blunts bot signups.
  if (!rateLimit(`register:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  const { name, email, password } = await req.json().catch(() => ({}));
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }
  if (name.length > 100 || email.length > 254 || password.length > 128) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase()) {
    return NextResponse.json({ error: "That email is reserved." }, { status: 409 });
  }

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }
    const hash = await bcrypt.hash(password, 10);
    const created = await createUser(name.trim(), email, hash);
    const user = { name: created.name, email: created.email, role: "user" as const };
    await setSessionCookie(user);
    return NextResponse.json({ user });
  } catch (e) {
    console.error("register error:", e);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}

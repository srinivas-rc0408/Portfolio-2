import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { isAdminCredential, setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // 10 attempts / 5 min per IP — blunts credential brute-forcing.
  if (!rateLimit(`login:${clientIp(req)}`, 10, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  if (email.length > 254 || password.length > 128) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (isAdminCredential(email, password)) {
    const user = { name: "Srinivas", email: email.trim(), role: "admin" as const };
    await setSessionCookie(user);
    return NextResponse.json({ user });
  }

  try {
    const found = await findUserByEmail(email);
    if (found && (await bcrypt.compare(password, found.password))) {
      const user = { name: found.name, email: found.email, role: "user" as const };
      await setSessionCookie(user);
      return NextResponse.json({ user });
    }
  } catch (e) {
    console.error("login error:", e);
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

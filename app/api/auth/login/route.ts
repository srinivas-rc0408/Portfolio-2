import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { isAdminCredential, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
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

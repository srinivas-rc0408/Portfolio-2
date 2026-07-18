import { NextResponse } from "next/server";

/**
 * Public registration is disabled — this is a private admin panel, not a
 * registration flow. Only the env-configured admin credential can sign in
 * (see /api/auth/login). The route stays mounted so old clients get a clear
 * answer instead of a 404.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Registration is disabled." },
    { status: 403 }
  );
}

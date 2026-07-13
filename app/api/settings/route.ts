import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings, type DbSettings } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    return NextResponse.json({ settings: await getSettings() });
  } catch (e) {
    console.error("settings GET error:", e);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const patch: Partial<DbSettings> = {};
  if (typeof body.displayName === "string") patch.displayName = body.displayName;
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.themeAccent === "string") patch.themeAccent = body.themeAccent;
  if (typeof body.profileImage === "string" || body.profileImage === null) {
    patch.profileImage = body.profileImage;
  }
  try {
    return NextResponse.json({ settings: await updateSettings(patch) });
  } catch (e) {
    console.error("settings PUT error:", e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

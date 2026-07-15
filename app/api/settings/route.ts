import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings, type DbSettings } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Theme/profile/name changes must be fresh on next load, deployed.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      { settings: await getSettings() },
      { headers: { "Cache-Control": "no-store, must-revalidate" } }
    );
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
  if (typeof body.displayName === "string" && body.displayName.length <= 100) {
    patch.displayName = body.displayName;
  }
  if (typeof body.title === "string" && body.title.length <= 200) {
    patch.title = body.title;
  }
  // Accent must be a hex color — it's injected into CSS variables client-side.
  if (typeof body.themeAccent === "string" && /^#[0-9a-fA-F]{3,8}$/.test(body.themeAccent)) {
    patch.themeAccent = body.themeAccent;
  }
  // Data-URL image, capped at ~2.5MB so a bad upload can't bloat the DB row.
  if (body.profileImage === null) {
    patch.profileImage = null;
  } else if (
    typeof body.profileImage === "string" &&
    body.profileImage.startsWith("data:image/") &&
    body.profileImage.length <= 2_500_000
  ) {
    patch.profileImage = body.profileImage;
  }
  try {
    return NextResponse.json({ settings: await updateSettings(patch) });
  } catch (e) {
    console.error("settings PUT error:", e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

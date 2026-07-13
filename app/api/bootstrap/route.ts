import { NextResponse } from "next/server";
import { getSettings, getAllEntries } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** One call to hydrate the client: settings + public entries + session. */
export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "admin";
    const [settings, entries] = await Promise.all([
      getSettings(),
      getAllEntries(isAdmin),
    ]);
    return NextResponse.json({
      settings,
      entries,
      user: session ?? null,
    });
  } catch (e) {
    console.error("bootstrap error:", e);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSettings, getAllEntries } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Never cache — admin edits must show up on the very next page load, deployed.
export const dynamic = "force-dynamic";

/** One call to hydrate the client: settings + public entries + session. */
export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "admin";
    const [settings, entries] = await Promise.all([
      getSettings(),
      getAllEntries(isAdmin),
    ]);
    return NextResponse.json(
      {
        settings,
        entries,
        user: session ?? null,
      },
      { headers: { "Cache-Control": "no-store, must-revalidate" } }
    );
  } catch (e) {
    console.error("bootstrap error:", e);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }
}

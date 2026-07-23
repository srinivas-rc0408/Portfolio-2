import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Lightweight session probe: verifies only the signed JWT cookie — no DB and
// no CMS payload. The admin gate uses this to decide instantly instead of
// waiting on the full /api/bootstrap hydrate (which ships every entry, incl.
// multi-MB data-URL PDFs/images).
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  return NextResponse.json(
    { user: user ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}

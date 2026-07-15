import { NextRequest, NextResponse } from "next/server";
import {
  getAllEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  type DbCmsEntry,
} from "@/lib/db";
import { getSession } from "@/lib/auth";

// Admin CMS edits (resume link, projects, …) must be fresh on next load.
export const dynamic = "force-dynamic";

const SECTIONS = new Set([
  "resume", "cv", "projects", "certificates",
  "education", "experience", "achievements", "connect",
]);

function parseEntry(b: Record<string, unknown>): Omit<DbCmsEntry, "id"> | null {
  if (typeof b.section !== "string" || !SECTIONS.has(b.section)) return null;
  if (typeof b.title !== "string" || !b.title.trim()) return null;
  return {
    section: b.section,
    title: b.title.trim(),
    description: typeof b.description === "string" ? b.description : "",
    link: typeof b.link === "string" && b.link ? b.link : null,
    githubUrl: typeof b.githubUrl === "string" && b.githubUrl ? b.githubUrl : null,
    date: typeof b.date === "string" && b.date ? b.date : null,
    tech: Array.isArray(b.tech) ? b.tech.filter((t): t is string => typeof t === "string") : [],
    imageUrl: typeof b.imageUrl === "string" && b.imageUrl ? b.imageUrl : null,
    isPrivate: b.isPrivate === true,
    sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : 0,
  };
}

// Public read — private entries only for an authenticated admin.
export async function GET() {
  try {
    const session = await getSession();
    const entries = await getAllEntries(session?.role === "admin");
    return NextResponse.json(
      { entries, admin: session?.role === "admin" },
      { headers: { "Cache-Control": "no-store, must-revalidate" } }
    );
  } catch (e) {
    console.error("cms GET error:", e);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

async function requireAdmin() {
  const session = await getSession();
  return session?.role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const parsed = parseEntry(body);
  if (!parsed) return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  return NextResponse.json({ entry: await createEntry(parsed) });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const parsed = parseEntry(body);
  if (!parsed || typeof body.id !== "string") {
    return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  }
  await updateEntry({ ...parsed, id: body.id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteEntry(id);
  return NextResponse.json({ ok: true });
}

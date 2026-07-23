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

// Uploaded docs/images ride in link/imageUrl as data URLs. Cap them so the
// public bootstrap payload stays lean (and under the serverless body limit).
const MAX_ASSET_CHARS = 4_200_000; // ~3MB file as base64

function assetTooLarge(b: Record<string, unknown>): boolean {
  const link = typeof b.link === "string" ? b.link : "";
  const img = typeof b.imageUrl === "string" ? b.imageUrl : "";
  return link.length > MAX_ASSET_CHARS || img.length > MAX_ASSET_CHARS;
}

function parseEntry(b: Record<string, unknown>): Omit<DbCmsEntry, "id"> | null {
  if (typeof b.section !== "string" || !SECTIONS.has(b.section)) return null;
  if (typeof b.title !== "string" || !b.title.trim()) return null;
  return {
    section: b.section,
    title: b.title.trim().slice(0, 200),
    description: typeof b.description === "string" ? b.description.slice(0, 8000) : "",
    link: typeof b.link === "string" && b.link ? b.link : null,
    githubUrl: typeof b.githubUrl === "string" && b.githubUrl ? b.githubUrl.slice(0, 500) : null,
    date: typeof b.date === "string" && b.date ? b.date.slice(0, 60) : null,
    tech: Array.isArray(b.tech)
      ? b.tech.filter((t): t is string => typeof t === "string").slice(0, 40)
      : [],
    imageUrl: typeof b.imageUrl === "string" && b.imageUrl ? b.imageUrl : null,
    isPrivate: b.isPrivate === true,
    sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : 0,
    pinned: b.pinned === true,
    starred: b.starred === true,
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
  if (assetTooLarge(body)) {
    return NextResponse.json(
      { error: "File is too large (max ~3MB). Please upload a smaller file." },
      { status: 413 }
    );
  }
  const parsed = parseEntry(body);
  if (!parsed) return NextResponse.json({ error: "Invalid entry — a title is required." }, { status: 400 });
  try {
    return NextResponse.json({ entry: await createEntry(parsed) });
  } catch (e) {
    console.error("cms POST error:", e);
    return NextResponse.json({ error: "Could not save the entry. Please try again." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (assetTooLarge(body)) {
    return NextResponse.json(
      { error: "File is too large (max ~3MB). Please upload a smaller file." },
      { status: 413 }
    );
  }
  const parsed = parseEntry(body);
  if (!parsed || typeof body.id !== "string") {
    return NextResponse.json({ error: "Invalid entry — a title is required." }, { status: 400 });
  }
  try {
    await updateEntry({ ...parsed, id: body.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cms PUT error:", e);
    return NextResponse.json({ error: "Could not save the entry. Please try again." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteEntry(id);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  type DbCmsEntry,
} from "@/lib/db";
import { getSession } from "@/lib/auth";

/** Purge stale SSR cache for every public-facing route after a CMS mutation. */
function invalidatePublicPages(): void {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/skills");
  revalidatePath("/experience");
  revalidatePath("/about");
  revalidatePath("/contact");
}

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

/**
 * Public read — two modes:
 *   1. `?id=<entryId>` → single item. If the item exists but is private and
 *      the requester is NOT an admin, return a 403 with the PRIVATE_RESOURCE
 *      code (no item data leaked).
 *   2. No params → full list. Private entries are only included for admins.
 */
export async function GET(req: NextRequest) {
  const itemId = new URL(req.url).searchParams.get("id");

  try {
    const session = await getSession();
    const isAdmin = session?.role === "admin";

    // --- Single-item query (e.g. fetching a specific resume/project by ID) ---
    if (itemId) {
      // First check if it exists at all (including private).
      const full = await getEntryById(itemId, true);
      if (!full) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      // Exists but private — 403 with the PRIVATE_RESOURCE code.
      if (full.isPrivate && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            code: "PRIVATE_RESOURCE",
            message: "Admin has made this Private.",
          },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        );
      }
      // Public or admin — return the entry.
      return NextResponse.json(
        { entry: full },
        { headers: { "Cache-Control": "no-store, must-revalidate" } }
      );
    }

    // --- Full list query ---
    const entries = await getAllEntries(isAdmin);
    return NextResponse.json(
      { entries, admin: isAdmin },
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
    const entry = await createEntry(parsed);
    invalidatePublicPages();
    return NextResponse.json({ entry });
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
    invalidatePublicPages();
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
  invalidatePublicPages();
  return NextResponse.json({ ok: true });
}

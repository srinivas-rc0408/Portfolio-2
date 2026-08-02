import "server-only";
import { projects as seedProjects } from "@/lib/portfolio-data";
import { CERTIFICATES, EDUCATION } from "@/lib/section-fallbacks";

/**
 * Fluxbase data layer (REST POST /api/execute-sql). Server-only — never
 * imported by client code. Schema is created + seeded lazily on first use
 * (idempotent).
 *
 * The Fluxbase endpoint executes a raw SQL string (no bind parameters), so the
 * tagged-template `sql` below inlines interpolated values as SQL literals. To
 * stay injection-safe it single-quote-escapes every string (doubling `'`).
 * This is safe because the Fluxbase Postgres runs with
 * standard_conforming_strings = on (verified), so a backslash is a literal
 * character and cannot be used to break out of a string. `sql` keeps the exact
 * shape of the old neon() template, so every query call-site below is unchanged.
 */

const FLUXBASE_URL =
  process.env.FLUXBASE_URL || "https://fluxbase.vercel.app/api/execute-sql";
const FLUXBASE_API_KEY = process.env.FLUXBASE_API_KEY ?? "";
const FLUXBASE_PROJECT_ID = process.env.FLUXBASE_PROJECT_ID ?? "";

/** Render a JS value as a safe SQL literal. */
function lit(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  const s = typeof v === "string" ? v : String(v);
  if (s === "") return "''";
  // Fluxbase's SQL parser mangles a few substrings even INSIDE quoted literals:
  // `--` (read as a line comment → truncates the string) and `//host.` (a stray
  // comment/URL regex that deletes `//<text>.`). Values hitting those — the
  // GitHub repo URLs, anything with an embedded URL — are hex-encoded and
  // rebuilt server-side, so the wire SQL is pure hex and no value content can
  // affect parsing. Everything else uses a plain single-quote literal: safe
  // because standard_conforming_strings is on (verified), so doubling `'` is
  // sufficient — and it keeps large values (e.g. image data URLs) compact and
  // under the request-body size limit.
  if (/--|\/\/[^/]*\.|\/\*|\*\//.test(s)) {
    const hex = Array.from(new TextEncoder().encode(s))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `convert_from(decode('${hex}', 'hex'), 'UTF8')`;
  }
  return `'${s.replace(/'/g, "''")}'`;
}

interface FluxResponse {
  success: boolean;
  result?: { rows?: unknown[] };
  error?: { message?: string; code?: string };
}

// Hard ceilings. A serverless invocation dies at ~10s, so an unbounded DB call
// takes the whole page down with a 500/504 instead of degrading. Every request
// is bounded, and the retry budget is bounded too — callers that can fall back
// (the SSR theme, the public sections) would rather fail fast than hang.
const REQUEST_TIMEOUT_MS = 4_000;
const TOTAL_BUDGET_MS = 8_000;
const MAX_ATTEMPTS = 3;

/**
 * POST a raw SQL string to Fluxbase and return result.rows.
 *
 * Retries a few times on HTTP 429 (the project limit is 30 requests / 10s), but
 * never past TOTAL_BUDGET_MS, and each individual attempt is aborted after
 * REQUEST_TIMEOUT_MS. A cold or unreachable database therefore surfaces as a
 * thrown error in a few seconds — which every caller already handles — rather
 * than hanging the request until the platform kills it.
 */
async function exec<T = Record<string, unknown>>(query: string): Promise<T[]> {
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (let attempt = 0; ; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error("Fluxbase request timed out");

    let res: Response;
    try {
      res = await fetch(FLUXBASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLUXBASE_API_KEY}`,
        },
        body: JSON.stringify({ projectId: FLUXBASE_PROJECT_ID, query }),
        cache: "no-store",
        signal: AbortSignal.timeout(Math.min(REQUEST_TIMEOUT_MS, remaining)),
      });
    } catch (e) {
      // AbortError (timeout) or a network failure — both are terminal for this
      // call. Surface a clear error so callers can fall back immediately.
      throw new Error(
        e instanceof Error && e.name === "TimeoutError"
          ? "Fluxbase request timed out"
          : `Fluxbase unreachable: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    if (res.status === 429 && attempt < MAX_ATTEMPTS - 1) {
      const backoff = Math.min(1200, Math.max(0, deadline - Date.now()));
      if (backoff === 0) throw new Error("Fluxbase rate-limited (budget spent)");
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }
    const json = (await res.json().catch(() => null)) as FluxResponse | null;
    if (!res.ok || !json?.success) {
      throw new Error(
        json?.error?.message || `Fluxbase request failed (${res.status})`
      );
    }
    return (json.result?.rows ?? []) as T[];
  }
}

/** Tagged-template drop-in for the old neon `sql` — safely inlines values. */
function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  let query = "";
  strings.forEach((str, i) => {
    query += str + (i < values.length ? lit(values[i]) : "");
  });
  return exec<T>(query);
}

export interface DbCmsEntry {
  id: string;
  section: string;
  title: string;
  description: string;
  link: string | null;
  githubUrl: string | null;
  date: string | null;
  tech: string[];
  imageUrl: string | null;
  isPrivate: boolean;
  sortOrder: number;
  pinned: boolean;
  starred: boolean;
}

export interface DbSettings {
  displayName: string;
  title: string;
  themeAccent: string;
  profileImage: string | null;
  summary: string;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

function id(): string {
  // Cryptographically-random id (never used as a secret/capability, but this
  // removes any doubt vs. Math.random()).
  return crypto.randomUUID();
}

let ready: Promise<void> | null = null;

/** Create tables + seed once per server process. */
export function ensureDb(): Promise<void> {
  if (!ready) {
    // Don't memoize a rejected promise — a one-off network blip during init
    // must not poison every later request for the life of the process.
    ready = init().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

async function init(): Promise<void> {
  // Fail closed if the DB isn't running with standard_conforming_strings=on —
  // lit()'s single-quote escaping is only injection-safe under that setting
  // (see the header note). An endpoint that doesn't support SHOW is tolerated;
  // only an explicit "off" aborts startup.
  try {
    const rows = (await sql`SHOW standard_conforming_strings`) as Record<
      string,
      string
    >[];
    const val = rows[0] && Object.values(rows[0])[0];
    if (typeof val === "string" && val.toLowerCase() === "off") {
      throw new Error(
        "Refusing to start: standard_conforming_strings is OFF (SQL escaping unsafe)."
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Refusing to start")) throw e;
    /* SHOW unsupported / transient — don't block on it */
  }

  // Fast path — after the very first deploy the schema always exists, so a
  // cold start pays just this probe + backfill instead of the full 8-call setup.
  try {
    // Backfill columns added after the table may have first been created.
    // CREATE TABLE IF NOT EXISTS never alters an existing table, so a table
    // created before pin/star existed keeps 500-ing getAllEntries (which orders
    // by `pinned`) until these run. Idempotent + concurrent (~1 round-trip),
    // and once per process via ensureDb(). MUST live here, not only in the
    // first-run branch below — that branch is skipped whenever the table exists.
    await Promise.all([
      sql`ALTER TABLE cms_entry ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false`,
      sql`ALTER TABLE cms_entry ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT false`,
    ]);
    const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM cms_entry`) as {
      count: number;
    }[];
    if (count === 0) await seed();
    return;
  } catch {
    /* table missing — first run against a fresh project; create schema below */
  }

  // First run only: create independent tables in parallel (4 round-trips → 1).
  await Promise.all([
    sql`CREATE TABLE IF NOT EXISTS app_user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
    sql`CREATE TABLE IF NOT EXISTS site_setting (
      id INT PRIMARY KEY,
      display_name TEXT NOT NULL DEFAULT 'Srinivas RC',
      title TEXT NOT NULL DEFAULT 'AI / ML Engineer',
      theme_accent TEXT NOT NULL DEFAULT '#ffffff',
      profile_image TEXT,
      summary TEXT,
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
    sql`CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL,
      starred BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
    sql`CREATE TABLE IF NOT EXISTS cms_entry (
      id TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      link TEXT,
      github_url TEXT,
      date TEXT,
      tech JSONB NOT NULL DEFAULT '[]',
      image_url TEXT,
      is_private BOOLEAN NOT NULL DEFAULT false,
      sort_order INT NOT NULL DEFAULT 0,
      pinned BOOLEAN NOT NULL DEFAULT false,
      starred BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  ]);

  // Migrate tables created before pin/star existed.
  await sql`ALTER TABLE cms_entry ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE cms_entry ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT false`;

  await sql`INSERT INTO site_setting (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
  await seed();
}

async function seed(): Promise<void> {
  const rows: Omit<DbCmsEntry, "id">[] = [];
  const push = (section: string, e: Partial<DbCmsEntry> & { title: string }) =>
    rows.push({
      section,
      title: e.title,
      description: e.description ?? "",
      link: e.link ?? null,
      githubUrl: e.githubUrl ?? null,
      date: e.date ?? null,
      tech: e.tech ?? [],
      imageUrl: e.imageUrl ?? null,
      isPrivate: e.isPrivate ?? false,
      sortOrder: e.sortOrder ?? 0,
      pinned: e.pinned ?? false,
      starred: e.starred ?? false,
    });

  push("resume", {
    title: "Srinivas RC — Resume (PDF)",
    description: "AI/ML Engineer resume: skills, projects, certifications, education.",
    link: "/srinivas-rc-resume.pdf",
    date: "2026",
  });
  push("cv", {
    title: "Srinivas RC — CV (PDF)",
    description: "Full CV, same document as the resume.",
    link: "/srinivas-rc-resume.pdf",
    date: "2026",
  });
  seedProjects.forEach((p, i) =>
    push("projects", {
      title: p.name,
      description: p.description,
      link: p.liveUrl,
      githubUrl: p.githubUrl,
      tech: p.tech,
      imageUrl: p.imageUrl,
      sortOrder: i,
    })
  );
  // Seeded from lib/section-fallbacks.ts — the same module the public sections
  // fall back to, so the DB copy and the offline copy can never drift.
  CERTIFICATES.forEach((e, i) =>
    push("certificates", { ...e, sortOrder: i })
  );
  EDUCATION.forEach((e, i) => push("education", { ...e, sortOrder: i }));
  push("experience", {
    title: "Independent AI/ML Engineering — Self-Directed Projects",
    description:
      "Design, build, and ship full-stack AI products end to end — from a 4-stage Gemini prompt-chaining platform (ArchAgent) to MLOps pipelines and LLM-powered web apps (12 shipped). Integrate real production stacks (Google Gemini, Hugging Face, Firebase, Supabase, Three.js), and continuously explore the open-source ecosystem on GitHub — evaluating new frameworks, plugins, and tooling and turning them into production-grade builds. Open to AI/ML internships and placements.",
    date: "Self-directed · 2025 – Present",
  });
  push("experience", {
    title: "Core Member & Head of Media — Yantra IoT Club, REVA University",
    description:
      "Led media and outreach for the club, running promotional campaigns for 2 robotics events — ROBONEMESIS microcontroller training and a Follow Bot Competition — that drew 17K+ combined views. Coordinated technical workshops and career panels with professionals from Amazon and Google, reaching 100+ students across university events.",
    date: "2025",
    sortOrder: 1,
  });
  push("achievements", {
    title: "Certified — Deep Learning (IIT Ropar / NPTEL)",
    description: "Completed the 12-week proctored academic programme.",
    date: "2026",
  });
  push("connect", {
    title: "Email",
    description: "srinivasrc01@gmail.com",
    link: "mailto:srinivasrc01@gmail.com",
  });
  push("connect", {
    title: "GitHub",
    description: "github.com/srinivas-rc0408",
    link: "https://github.com/srinivas-rc0408",
    sortOrder: 1,
  });
  push("connect", {
    title: "Phone",
    description: "+91 72049 54568",
    link: "tel:+917204954568",
    sortOrder: 2,
  });

  // One multi-row INSERT (not 30+ separate calls) so seeding a fresh project
  // never trips the 30-requests / 10-seconds Fluxbase rate limit.
  const valuesSql = rows
    .map(
      (r) =>
        `(${lit(id())}, ${lit(r.section)}, ${lit(r.title)}, ${lit(r.description)}, ${lit(r.link)}, ${lit(r.githubUrl)}, ${lit(r.date)}, ${lit(JSON.stringify(r.tech))}::jsonb, ${lit(r.imageUrl)}, ${lit(r.isPrivate)}, ${lit(r.sortOrder)})`
    )
    .join(",\n");
  await exec(
    `INSERT INTO cms_entry
      (id, section, title, description, link, github_url, date, tech, image_url, is_private, sort_order)
      VALUES ${valuesSql}`
  );
}

// --- CMS queries ---

interface CmsRow {
  id: string;
  section: string;
  title: string;
  description: string;
  link: string | null;
  github_url: string | null;
  date: string | null;
  tech: string[];
  image_url: string | null;
  is_private: boolean;
  sort_order: number;
  pinned: boolean;
  starred: boolean;
}

function mapEntry(r: CmsRow): DbCmsEntry {
  return {
    id: r.id,
    section: r.section,
    title: r.title,
    description: r.description,
    link: r.link,
    githubUrl: r.github_url,
    date: r.date,
    tech: Array.isArray(r.tech) ? r.tech : [],
    imageUrl: r.image_url,
    isPrivate: r.is_private,
    sortOrder: r.sort_order,
    pinned: !!r.pinned,
    starred: !!r.starred,
  };
}

export async function getAllEntries(
  includePrivate: boolean
): Promise<DbCmsEntry[]> {
  await ensureDb();
  // Pinned entries float to the top of their section.
  const rows = (
    includePrivate
      ? await sql`SELECT * FROM cms_entry ORDER BY section, pinned DESC, sort_order, created_at`
      : await sql`SELECT * FROM cms_entry WHERE is_private = false ORDER BY section, pinned DESC, sort_order, created_at`
  ) as CmsRow[];
  return rows.map(mapEntry);
}

/**
 * Public-only entries for a single section — used by SSR pages so they query
 * the DB (with the is_private filter) instead of rendering stale seed data.
 * Falls back to an empty array on error so callers can degrade gracefully.
 */
export async function getPublicEntriesBySection(
  section: string
): Promise<DbCmsEntry[]> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM cms_entry WHERE section = ${section} AND is_private = false ORDER BY pinned DESC, sort_order, created_at`) as CmsRow[];
  return rows.map(mapEntry);
}

/**
 * Fetch a single entry by id. When includePrivate is false, private entries
 * return null — callers should render notFound() to mask the item's existence.
 */
export async function getEntryById(
  entryId: string,
  includePrivate: boolean
): Promise<DbCmsEntry | null> {
  await ensureDb();
  const rows = (
    includePrivate
      ? await sql`SELECT * FROM cms_entry WHERE id = ${entryId}`
      : await sql`SELECT * FROM cms_entry WHERE id = ${entryId} AND is_private = false`
  ) as CmsRow[];
  return rows.length > 0 ? mapEntry(rows[0]) : null;
}

export async function createEntry(
  e: Omit<DbCmsEntry, "id">
): Promise<DbCmsEntry> {
  await ensureDb();
  const newId = id();
  await sql`INSERT INTO cms_entry
    (id, section, title, description, link, github_url, date, tech, image_url, is_private, sort_order, pinned, starred)
    VALUES (${newId}, ${e.section}, ${e.title}, ${e.description}, ${e.link},
      ${e.githubUrl}, ${e.date}, ${JSON.stringify(e.tech)}::jsonb, ${e.imageUrl},
      ${e.isPrivate}, ${e.sortOrder}, ${e.pinned}, ${e.starred})`;
  return { ...e, id: newId };
}

export async function updateEntry(e: DbCmsEntry): Promise<void> {
  await ensureDb();
  await sql`UPDATE cms_entry SET
    title = ${e.title}, description = ${e.description}, link = ${e.link},
    github_url = ${e.githubUrl}, date = ${e.date}, tech = ${JSON.stringify(e.tech)}::jsonb,
    image_url = ${e.imageUrl}, is_private = ${e.isPrivate}, sort_order = ${e.sortOrder},
    pinned = ${e.pinned}, starred = ${e.starred}
    WHERE id = ${e.id}`;
}

export async function deleteEntry(entryId: string): Promise<void> {
  await ensureDb();
  await sql`DELETE FROM cms_entry WHERE id = ${entryId}`;
}

// --- Settings ---

export async function getSettings(): Promise<DbSettings> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM site_setting WHERE id = 1`) as {
    display_name: string;
    title: string;
    theme_accent: string;
    profile_image: string | null;
    summary: string | null;
  }[];
  const r = rows[0];
  return {
    displayName: r.display_name,
    title: r.title,
    themeAccent: r.theme_accent,
    profileImage: r.profile_image,
    summary: r.summary ?? "",
  };
}

export async function updateSettings(p: Partial<DbSettings>): Promise<DbSettings> {
  await ensureDb();
  const cur = await getSettings();
  const next = { ...cur, ...p };
  await sql`UPDATE site_setting SET
    display_name = ${next.displayName}, title = ${next.title},
    theme_accent = ${next.themeAccent}, profile_image = ${next.profileImage},
    summary = ${next.summary}, updated_at = now() WHERE id = 1`;
  return next;
}

// --- Feedback ---

export interface DbFeedback {
  id: string;
  name: string;
  email: string | null;
  message: string;
  starred: boolean;
  createdAt: string; // ISO timestamp
}

interface FeedbackRow {
  id: string;
  name: string;
  email: string | null;
  message: string;
  starred: boolean;
  created_at: string;
}

const mapFeedback = (r: FeedbackRow): DbFeedback => ({
  id: r.id,
  name: r.name,
  email: r.email,
  message: r.message,
  starred: r.starred,
  createdAt: new Date(r.created_at).toISOString(),
});

export async function addFeedback(
  name: string,
  email: string | null,
  message: string
): Promise<void> {
  await ensureDb();
  await sql`INSERT INTO feedback (id, name, email, message)
    VALUES (${id()}, ${name}, ${email}, ${message})`;
}

export async function getFeedback(): Promise<DbFeedback[]> {
  await ensureDb();
  const rows =
    (await sql`SELECT * FROM feedback ORDER BY created_at DESC`) as FeedbackRow[];
  return rows.map(mapFeedback);
}

export async function setFeedbackStarred(
  fid: string,
  starred: boolean
): Promise<void> {
  await ensureDb();
  await sql`UPDATE feedback SET starred = ${starred} WHERE id = ${fid}`;
}

export async function deleteFeedback(fid: string): Promise<void> {
  await ensureDb();
  await sql`DELETE FROM feedback WHERE id = ${fid}`;
}

// --- Users ---

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM app_user WHERE email = ${email.toLowerCase()}`) as DbUser[];
  return rows[0] ?? null;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<DbUser> {
  await ensureDb();
  const newId = id();
  await sql`INSERT INTO app_user (id, name, email, password)
    VALUES (${newId}, ${name}, ${email.toLowerCase()}, ${passwordHash})`;
  return { id: newId, name, email: email.toLowerCase(), password: passwordHash };
}

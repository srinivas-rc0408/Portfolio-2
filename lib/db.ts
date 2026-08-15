import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { projects as seedProjects } from "@/lib/portfolio-data";
import { CERTIFICATES, EDUCATION } from "@/lib/section-fallbacks";

/**
 * Neon PostgreSQL data layer — server-only.
 *
 * Uses @neondatabase/serverless with the connection-pooler URL for all
 * serverless/edge invocations. Schema is created + seeded lazily on first use
 * (idempotent). Every public interface is identical to the old FluxBase layer
 * so no call-sites need to change.
 */

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_zDSoqGATgp16@ep-steep-fog-azle6cqr-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Module-level singleton — reused across hot-reloads in dev.
let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) _sql = neon(DATABASE_URL);
  return _sql;
}

/** Tagged-template helper that proxies to the Neon client. */
async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const client = getSql();
  const rows = await client(strings, ...values);
  return rows as T[];
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

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
  createdAt?: string;
  updatedAt?: string | null;
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
  return crypto.randomUUID();
}

let ready: Promise<void> | null = null;

/** Create tables + seed once per server process. */
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = init().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

async function init(): Promise<void> {
  // Fast path — backfill columns added after the table may have first been
  // created. Idempotent, one round-trip on warm starts.
  try {
    await Promise.all([
      sql`ALTER TABLE cms_entry ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false`,
      sql`ALTER TABLE cms_entry ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT false`,
      sql`ALTER TABLE cms_entry ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`,
    ]);
    const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM cms_entry`) as {
      count: number;
    }[];
    if (count === 0) await seed();
    return;
  } catch {
    /* table missing — first run against a fresh project; create schema below */
  }

  // First run: create independent tables in parallel.
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
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  ]);

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

  // Batch insert all seed rows.
  for (const r of rows) {
    const newId = id();
    await sql`INSERT INTO cms_entry
      (id, section, title, description, link, github_url, date, tech, image_url, is_private, sort_order, pinned, starred)
      VALUES (
        ${newId}, ${r.section}, ${r.title}, ${r.description},
        ${r.link}, ${r.githubUrl}, ${r.date},
        ${JSON.stringify(r.tech)}::jsonb, ${r.imageUrl},
        ${r.isPrivate}, ${r.sortOrder}, ${r.pinned}, ${r.starred}
      )
      ON CONFLICT (id) DO NOTHING`;
  }
}

// ─── Row mappers ─────────────────────────────────────────────────────────────

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
  created_at: string;
  updated_at: string | null;
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
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? r.created_at,
  };
}

// ─── CMS queries ─────────────────────────────────────────────────────────────

export async function getAllEntries(
  includePrivate: boolean
): Promise<DbCmsEntry[]> {
  await ensureDb();
  const rows = (
    includePrivate
      ? await sql`SELECT * FROM cms_entry ORDER BY section, pinned DESC, sort_order, created_at`
      : await sql`SELECT * FROM cms_entry WHERE is_private = false ORDER BY section, pinned DESC, sort_order, created_at`
  ) as CmsRow[];
  return rows.map(mapEntry);
}

export async function getPublicEntriesBySection(
  section: string
): Promise<DbCmsEntry[]> {
  await ensureDb();
  const rows = (await sql`SELECT * FROM cms_entry WHERE section = ${section} AND is_private = false ORDER BY pinned DESC, sort_order, created_at`) as CmsRow[];
  return rows.map(mapEntry);
}

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
    VALUES (
      ${newId}, ${e.section}, ${e.title}, ${e.description}, ${e.link},
      ${e.githubUrl}, ${e.date}, ${JSON.stringify(e.tech)}::jsonb, ${e.imageUrl},
      ${e.isPrivate}, ${e.sortOrder}, ${e.pinned}, ${e.starred}
    )`;
  return { ...e, id: newId };
}

export async function updateEntry(e: DbCmsEntry): Promise<void> {
  await ensureDb();
  await sql`UPDATE cms_entry SET
    title = ${e.title}, description = ${e.description}, link = ${e.link},
    github_url = ${e.githubUrl}, date = ${e.date}, tech = ${JSON.stringify(e.tech)}::jsonb,
    image_url = ${e.imageUrl}, is_private = ${e.isPrivate}, sort_order = ${e.sortOrder},
    pinned = ${e.pinned}, starred = ${e.starred}, updated_at = now()
    WHERE id = ${e.id}`;
}

export async function deleteEntry(entryId: string): Promise<void> {
  await ensureDb();
  await sql`DELETE FROM cms_entry WHERE id = ${entryId}`;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

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

// ─── Feedback ─────────────────────────────────────────────────────────────────

export interface DbFeedback {
  id: string;
  name: string;
  email: string | null;
  message: string;
  starred: boolean;
  createdAt: string;
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

// ─── Users ────────────────────────────────────────────────────────────────────

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

import "server-only";
import { neon } from "@neondatabase/serverless";
import { projects as seedProjects } from "@/lib/portfolio-data";

/**
 * Neon Postgres data layer. Server-only — never imported by client code.
 * Schema is created + seeded lazily on first use (idempotent).
 */

const sql = neon(process.env.DATABASE_URL ?? "");

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
}

export interface DbSettings {
  displayName: string;
  title: string;
  themeAccent: string;
  profileImage: string | null;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

function id(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  );
}

let ready: Promise<void> | null = null;

/** Create tables + seed once per server process. */
export function ensureDb(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}

async function init(): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS app_user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS site_setting (
    id INT PRIMARY KEY,
    display_name TEXT NOT NULL DEFAULT 'Srinivas RC',
    title TEXT NOT NULL DEFAULT 'AI / ML Engineer',
    theme_accent TEXT NOT NULL DEFAULT '#22d3ee',
    profile_image TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS cms_entry (
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
    created_at TIMESTAMPTZ DEFAULT now()
  )`;

  await sql`INSERT INTO site_setting (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;

  const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM cms_entry`) as {
    count: number;
  }[];
  if (count === 0) await seed();
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
  [
    ["Deep Learning — 12-Week Academic Programme", "IIT Ropar / NPTEL", "2025"],
    ["Software Engineering Fundamentals", "Microsoft", "2025"],
    ["LLM-Driven AI Engineering Bootcamp", "REVA University", "2025"],
    ["Prompt Engineering Certification", "Infosys Springboard", "2025"],
    ["Machine Learning Certification", "Rinex Organization, NSDC / Skill India — Grade: A+", "2024"],
    ["Python Programming", "Certification", "2025"],
  ].forEach(([title, description, date]) =>
    push("certificates", { title, description, date })
  );
  [
    ["B.Tech — Artificial Intelligence & Machine Learning", "REVA University, Bengaluru. CGPA: 7.5. Expected 2027.", "2023 – 2027"],
    ["PUC (PCMB)", "MES College of Arts, Science & Commerce, Bengaluru. 82.5%.", "2023"],
    ["ICSE — Class X", "Mount Senoria School, Bengaluru. 88.8%.", "2021"],
  ].forEach(([title, description, date]) =>
    push("education", { title, description, date })
  );
  push("experience", {
    title: "Core Member & Head of Media — Yantra IoT Club, REVA University",
    description:
      "Spearheaded digital outreach for university-wide technical events; organised 2 technical workshops and coordinated career panels for 100+ students.",
    date: "Ongoing",
  });
  push("experience", {
    title: "Independent AI/ML Project Work",
    description:
      "Built agentic AI frameworks and ML web apps (ArchAgent, Language Detector). Open to internships and placements.",
    date: "Ongoing",
    sortOrder: 1,
  });
  push("achievements", {
    title: "Certified — Deep Learning (IIT Ropar / NPTEL)",
    description: "Completed the 12-week academic programme.",
    date: "2025",
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

  for (const r of rows) {
    await sql`INSERT INTO cms_entry
      (id, section, title, description, link, github_url, date, tech, image_url, is_private, sort_order)
      VALUES (${id()}, ${r.section}, ${r.title}, ${r.description}, ${r.link},
        ${r.githubUrl}, ${r.date}, ${JSON.stringify(r.tech)}, ${r.imageUrl},
        ${r.isPrivate}, ${r.sortOrder})`;
  }
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
  };
}

export async function getAllEntries(
  includePrivate: boolean
): Promise<DbCmsEntry[]> {
  await ensureDb();
  const rows = (
    includePrivate
      ? await sql`SELECT * FROM cms_entry ORDER BY section, sort_order, created_at`
      : await sql`SELECT * FROM cms_entry WHERE is_private = false ORDER BY section, sort_order, created_at`
  ) as CmsRow[];
  return rows.map(mapEntry);
}

export async function createEntry(
  e: Omit<DbCmsEntry, "id">
): Promise<DbCmsEntry> {
  await ensureDb();
  const newId = id();
  await sql`INSERT INTO cms_entry
    (id, section, title, description, link, github_url, date, tech, image_url, is_private, sort_order)
    VALUES (${newId}, ${e.section}, ${e.title}, ${e.description}, ${e.link},
      ${e.githubUrl}, ${e.date}, ${JSON.stringify(e.tech)}, ${e.imageUrl},
      ${e.isPrivate}, ${e.sortOrder})`;
  return { ...e, id: newId };
}

export async function updateEntry(e: DbCmsEntry): Promise<void> {
  await ensureDb();
  await sql`UPDATE cms_entry SET
    title = ${e.title}, description = ${e.description}, link = ${e.link},
    github_url = ${e.githubUrl}, date = ${e.date}, tech = ${JSON.stringify(e.tech)},
    image_url = ${e.imageUrl}, is_private = ${e.isPrivate}, sort_order = ${e.sortOrder}
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
  }[];
  const r = rows[0];
  return {
    displayName: r.display_name,
    title: r.title,
    themeAccent: r.theme_accent,
    profileImage: r.profile_image,
  };
}

export async function updateSettings(p: Partial<DbSettings>): Promise<DbSettings> {
  await ensureDb();
  const cur = await getSettings();
  const next = { ...cur, ...p };
  await sql`UPDATE site_setting SET
    display_name = ${next.displayName}, title = ${next.title},
    theme_accent = ${next.themeAccent}, profile_image = ${next.profileImage},
    updated_at = now() WHERE id = 1`;
  return next;
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

/**
 * Client-side data adapter for the Neon-backed portfolio API.
 *
 * Public reads (getItems / loadSettings / currentUser) are synchronous and
 * served from an in-memory cache that `hydrate()` fills from /api/bootstrap.
 * Writes and auth are async and go through the secured API routes; on success
 * they refresh the cache and dispatch events so live components re-read.
 *
 * No secrets or privileged logic live here — the admin password and all
 * private-entry filtering happen server-side.
 */

export interface CmsItem {
  id: string;
  section?: string;
  title: string;
  description: string;
  link?: string;
  githubUrl?: string;
  date?: string;
  tech?: string[];
  imageUrl?: string;
  private: boolean;
}

export const CMS_SECTIONS = [
  "resume",
  "cv",
  "projects",
  "certificates",
  "education",
  "experience",
  "achievements",
  "connect",
] as const;

export type CmsSection = (typeof CMS_SECTIONS)[number];

export interface SessionUser {
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface SiteSettings {
  displayName: string;
  title: string;
  profileImage: string | null;
  themeAccent: string;
  /** Professional summary shown in the terminal `about` section. */
  summary: string;
}

export const DEFAULT_SUMMARY =
  "I'm a results-driven AI/ML Engineer and AIML undergraduate with proven experience building end-to-end ML pipelines, LLM-powered applications, and autonomous agentic AI frameworks. Proficient in Python, Linux (Arch Linux, Ubuntu), and MLOps tooling, and certified by IIT Ropar/NPTEL in Deep Learning and Microsoft in Software Engineering. I'm seeking an AI/ML engineering internship to drive real-world impact.";

export const DEFAULT_SETTINGS: SiteSettings = {
  displayName: "Srinivas RC",
  title: "AI / ML Engineer",
  profileImage: null,
  themeAccent: "#22c55e",
  summary: DEFAULT_SUMMARY,
};

export const CMS_UPDATED_EVENT = "cms:updated";
export const AUTH_UPDATED_EVENT = "auth:updated";
export const SETTINGS_UPDATED_EVENT = "settings:updated";

// --- In-memory cache (per page load) ---
let cacheSettings: SiteSettings = DEFAULT_SETTINGS;
let cachePublic: CmsItem[] = [];
let cacheUser: SessionUser | null = null;

// Last-known settings survive reloads so the boot screen and theme accent
// paint with the chosen color immediately (no default-cyan flash while the
// server hydrate is in flight). profileImage is skipped — data URLs are too
// large for localStorage.
const SETTINGS_LS_KEY = "portfolio:settings";

function persistSettings(): void {
  if (typeof window === "undefined") return;
  try {
    const { displayName, title, themeAccent, summary } = cacheSettings;
    localStorage.setItem(
      SETTINGS_LS_KEY,
      JSON.stringify({ displayName, title, themeAccent, summary })
    );
  } catch {
    /* quota / private mode — in-memory cache still works */
  }
}

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);
    if (raw) cacheSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* corrupted entry — fall back to defaults */
  }
}

interface ApiEntry {
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
}

function toItem(e: ApiEntry): CmsItem {
  return {
    id: e.id,
    section: e.section,
    title: e.title,
    description: e.description,
    link: e.link ?? undefined,
    githubUrl: e.githubUrl ?? undefined,
    date: e.date ?? undefined,
    tech: e.tech,
    imageUrl: e.imageUrl ?? undefined,
    private: e.isPrivate,
  };
}

function fire(evt: string): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(evt));
}

/** Hydrate the public cache + session from the server. Call once on mount. */
export async function hydrate(): Promise<void> {
  try {
    const res = await fetch("/api/bootstrap", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    cacheSettings = { ...DEFAULT_SETTINGS, ...data.settings };
    persistSettings();
    cachePublic = (data.entries as ApiEntry[]).map(toItem);
    cacheUser = data.user ?? null;
    fire(SETTINGS_UPDATED_EVENT);
    fire(CMS_UPDATED_EVENT);
    fire(AUTH_UPDATED_EVENT);
  } catch {
    /* offline / server error — keep defaults */
  }
}

// --- Sync reads (cache-backed) ---

export function getItems(
  section: CmsSection | string,
  opts: { includePrivate?: boolean } = {}
): CmsItem[] {
  const list = cachePublic.filter((i) => i.section === section);
  return opts.includePrivate ? list : list.filter((i) => !i.private);
}

export function loadSettings(): SiteSettings {
  return cacheSettings;
}

export function currentUser(): SessionUser | null {
  return cacheUser;
}

export function isAdmin(): boolean {
  return cacheUser?.role === "admin";
}

// --- Auth (async, server-verified) ---

export async function login(email: string, password: string): Promise<boolean> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return false;
  const { user } = await res.json();
  cacheUser = user;
  fire(AUTH_UPDATED_EVENT);
  return true;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<string | null> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return data.error ?? "Registration failed.";
  cacheUser = data.user;
  fire(AUTH_UPDATED_EVENT);
  return null;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  cacheUser = null;
  fire(AUTH_UPDATED_EVENT);
}

// --- Settings (async writes, optimistic) ---

export async function saveSettings(patch: Partial<SiteSettings>): Promise<void> {
  cacheSettings = { ...cacheSettings, ...patch };
  persistSettings();
  fire(SETTINGS_UPDATED_EVENT); // optimistic → live UI updates instantly
  await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).catch(() => {});
}

// --- CMS entries (admin writes) ---

/** Full list incl. private — admin only (server enforces via cookie). */
export async function apiGetAllEntries(): Promise<CmsItem[]> {
  const res = await fetch("/api/cms", { cache: "no-store" });
  if (!res.ok) return [];
  const { entries } = await res.json();
  return (entries as ApiEntry[]).map(toItem);
}

/** Throw a helpful Error if a CMS write failed, so the UI can surface it. */
async function ensureOk(res: Response): Promise<void> {
  if (res.ok) return;
  let msg = `Request failed (HTTP ${res.status})`;
  try {
    const body = await res.json();
    if (body?.error) msg = body.error;
  } catch {
    /* non-JSON error body */
  }
  if (res.status === 413) msg = "File is too large to save. Try a smaller file.";
  if (res.status === 401) msg = "Your admin session expired — please log in again.";
  throw new Error(msg);
}

export async function addItem(
  section: CmsSection,
  item: Omit<CmsItem, "id">
): Promise<void> {
  const res = await fetch("/api/cms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...item, section, isPrivate: item.private }),
  }).catch(() => {
    throw new Error("Network error — could not reach the server.");
  });
  await ensureOk(res);
  await hydrate();
}

export async function updateItem(
  section: CmsSection,
  item: CmsItem
): Promise<void> {
  const res = await fetch("/api/cms", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...item, section, isPrivate: item.private }),
  }).catch(() => {
    throw new Error("Network error — could not reach the server.");
  });
  await ensureOk(res);
  await hydrate();
}

export async function deleteItem(
  _section: CmsSection,
  id: string
): Promise<void> {
  const res = await fetch(`/api/cms?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).catch(() => {
    throw new Error("Network error — could not reach the server.");
  });
  await ensureOk(res);
  await hydrate();
}

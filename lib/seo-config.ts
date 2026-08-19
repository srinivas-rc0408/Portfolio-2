/** Shared site SEO constants — single source of truth for URLs and author. */
// Canonical/OG URL. Resolves to the STABLE production domain automatically:
//   1. NEXT_PUBLIC_SITE_URL          — your custom domain, once you have one
//   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable prod domain (e.g.
//        my-app.vercel.app). Auto-set on every build, incl. previews. This is
//        what canonical/og MUST use — never the per-deployment URL below.
//   3. VERCEL_URL / NEXT_PUBLIC_VERCEL_URL — per-deployment URL (ephemeral,
//        auth-protected). Last-resort only, so previews still self-reference.
//   4. localhost                     — dev only
// (Consumers are all server components, so the non-public vars resolve fine.)
const RESOLVED_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  (process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL}`
    : "") ||
  "http://localhost:3000";

export const SITE_URL = RESOLVED_SITE_URL.replace(/\/+$/, "");
export const SITE_NAME = "Srinivas RC";
// One identity, used everywhere (hero, title, resume all say the same thing).
export const SITE_TAGLINE = "AI / ML Engineer";
export const AUTHOR_URL = SITE_URL;
export const TWITTER_HANDLE = "";
/**
 * The share card. Declared ONCE and imported everywhere — this path used to be
 * hand-written in eight files, which is how it silently drifted to an
 * extension-less URL that 404'd on every subpage.
 *
 * The `?v=` is a cache buster: the asset is served `immutable` for a year, so
 * without it a redesigned card would stay stuck in CDN and social caches.
 * BUMP IT whenever design/opengraph-card.svg is re-rendered.
 */
export const DEFAULT_OG_IMAGE = "/opengraph-image.jpg?v=2";
export const OG_IMAGE_URL = `${SITE_URL}${DEFAULT_OG_IMAGE}`;
/** Structured-data logo (schema.org) — same artwork. */
export const LOGO_URL = OG_IMAGE_URL;

export function toIsoDateTime(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

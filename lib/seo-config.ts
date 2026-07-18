/** Shared site SEO constants — single source of truth for URLs and author. */
// Canonical/OG URL. Resolves to the production domain automatically:
//   1. NEXT_PUBLIC_SITE_URL  — set this to your custom domain when you have one
//   2. NEXT_PUBLIC_VERCEL_URL — auto-provided by Vercel for every deployment
//   3. localhost             — dev only
// This fixes canonical + og:url pointing at localhost in production.
const RESOLVED_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000");

export const SITE_URL = RESOLVED_SITE_URL.replace(/\/+$/, "");
export const SITE_NAME = "Srinivas RC";
// One identity, used everywhere (hero, title, resume all say the same thing).
export const SITE_TAGLINE = "AI / ML Engineer";
export const AUTHOR_URL = SITE_URL;
export const TWITTER_HANDLE = "";
export const DEFAULT_OG_IMAGE = "/images/logo.jpg";
export const LOGO_URL = `${SITE_URL}/images/logo.jpg`;

export const BLOG_PATH = "/blog";
export const BLOG_RSS_PATH = "/blog/rss.xml";
export const BLOG_CANONICAL = `${SITE_URL}${BLOG_PATH}`;
export const BLOG_RSS_URL = `${SITE_URL}${BLOG_RSS_PATH}`;

export const BLOG_DESCRIPTION =
  "Developer blog by Srinivas RC — notes on AI engineering, LLMs, agentic systems, and Linux.";

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

export function postOgImageUrl(slug: string): string {
  return absoluteUrl(`/blog/${slug}/opengraph-image`);
}

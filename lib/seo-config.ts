/** Shared site SEO constants — single source of truth for URLs and author. */
// Update SITE_URL to the real domain when the site is deployed.
export const SITE_URL = "http://localhost:3000";
export const SITE_NAME = "Srinivas RC";
export const SITE_TAGLINE = "Software Developer & AI Engineer";
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

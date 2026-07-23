import { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo-config";

// Bots we explicitly allow to crawl + index. AI search bots (Perplexity, OAI-SearchBot,
// ChatGPT-User, etc.) are surfacing answers from blogs more and more, so we opt-in by
// listing them. Training-only crawlers (GPTBot, anthropic-ai, ClaudeBot, Google-Extended,
// Applebot-Extended) are also allowed here — flip their `allow` to `[]` and add a
// `disallow: "/"` if you want to opt out of model training while still being indexable.
const ALLOWED_USER_AGENTS = [
  // Traditional search engines
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Bingbot",
  "DuckDuckBot",
  "YandexBot",
  "Baiduspider",
  "Slurp", // Yahoo
  "Applebot",
  // AI search / answer engines (live retrieval — high SEO value)
  "PerplexityBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-Web",
  "Claude-SearchBot",
  "YouBot",
  "PhindBot",
  "Bytespider", // ByteDance / Doubao
  "Amazonbot",
  // Model-training crawlers (set to allow — opt out if you change your mind)
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "FacebookBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: every bot can read everything except the API and Next internals
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow: ["/api/", "/.next/", "/admin"],
      },
      // Explicit allow-list (clarifies intent for crawlers that respect named rules)
      ...ALLOWED_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt"],
        disallow: ["/api/", "/.next/", "/admin"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

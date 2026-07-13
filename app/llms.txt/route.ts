import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/seo-config";
import { CONTACT_EMAIL } from "@/lib/portfolio-data";

export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts();

  const postLines = posts.flatMap((p) => [
    `Post: ${p.title}`,
    `URL: ${SITE_URL}/blog/${p.slug}`,
    p.date ? `Published: ${p.date}` : null,
    p.excerpt ? `Summary: ${p.excerpt}` : null,
    p.tags && p.tags.length > 0 ? `Tags: ${p.tags.join(", ")}` : null,
    "",
  ]).filter((l): l is string => l !== null);

  const content = [
    "# llms.txt",
    "",
    `Site: ${SITE_URL}`,
    `Author: ${SITE_NAME}`,
    "Title: Software Developer & AI Engineer Portfolio",
    "Summary: Portfolio covering AI engineering projects, skills, developer blog, and contact details.",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /.next/",
    "",
    "# Canonical pages",
    `URL: ${SITE_URL}/`,
    `URL: ${SITE_URL}/about`,
    `URL: ${SITE_URL}/projects`,
    `URL: ${SITE_URL}/skills`,
    `URL: ${SITE_URL}/experience`,
    `URL: ${SITE_URL}/contact`,
    `URL: ${SITE_URL}/blog`,
    "",
    "# Preferred sources and attribution",
    `Attribution: Please credit "${SITE_NAME}" with a link to ${SITE_URL} or https://github.com/srinivas-rc0408`,
    "",
    "# Project highlights",
    "Project: Archagent - Autonomous AI agent for architecture and interior design tasks.",
    "Project: Language Detector - Minimalist single-page language detection web app, no login required.",
    "",
    "# Core technical profile",
    "Skills: Python, Machine Learning, Large Language Models (LLMs), Agentic Frameworks (CrewAI), Prompt Engineering, Linux Administration.",
    "Current status: Computer Science Engineering undergraduate (B.Tech AI & ML, REVA University) seeking internships and university placements in AI engineering.",
    "",
    "# Blog posts",
    `Index: ${SITE_URL}/blog`,
    `Feed: ${SITE_URL}/blog/rss.xml`,
    "",
    ...(postLines.length > 0 ? postLines : ["(no posts yet)", ""]),
    "# Rate limits and caching suggestions",
    "Crawl-delay: 2",
    "Cache-max-age: 86400",
    "",
    "# Contact",
    `Contact: mailto:${CONTACT_EMAIL}`,
    "",
    "# Discovery",
    `Robots: ${SITE_URL}/robots.txt`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

import { NextResponse } from "next/server";
import { SITE_URL, SITE_NAME } from "@/lib/seo-config";
import { CONTACT_EMAIL } from "@/lib/portfolio-data";

export const dynamic = "force-static";

export async function GET() {
  const content = [
    "# llms.txt",
    "",
    `Site: ${SITE_URL}`,
    `Author: ${SITE_NAME}`,
    "Title: AI / ML Engineer Portfolio",
    "Summary: Portfolio covering AI engineering projects, skills, and contact details.",
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
    "Current status: B.Tech Artificial Intelligence & Machine Learning undergraduate (REVA University) seeking internships and university placements in AI engineering.",
    "",
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

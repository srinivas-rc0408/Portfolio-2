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
    "Project: AEGIS - Air-gapped, on-premise agentic AI workbench for high-security industry (Smart India Hackathon 2026, PS SIH26117). A 7-node LangGraph agent runs vision, hybrid FAISS+BM25 retrieval and sandboxed safety computation entirely offline on open-weight local models (Ollama: Qwen2.5, Qwen2.5-VL), running a 7B model on a 4 GB laptop GPU, with a SHA-256 hash-chained audit trail and human sign-off.",
    "Project: Codebase-Wide Version Migration and Refactoring Agent - B.Tech major project (CAIML, REVA University). An autonomous LLM agent that upgrades whole codebases across breaking library-version changes using AST-based static analysis, a dependency graph and a plan-edit-test-self-correct loop in a Docker sandbox; ships a patch, an audit log, a benchmark report and a research paper.",
    "Project: ArchAgent - AI architectural design platform; plain-language briefs to 3D panoramic renders and itemised INR cost estimates in under 60 seconds via a 4-stage Google Gemini prompt-chaining pipeline (Gemini + Hugging Face FLUX + Three.js + Supabase).",
    "Project: AquaSentinel - Full-stack mission-control platform for an autonomous underwater inspection robot: sensor telemetry, robot-health monitoring, waypoint route planning, AI image defect detection and PDF reports, backed by a 13-document engineering suite. Live demo. (React 19, TypeScript, Node/Express, PostgreSQL/Neon, Computer Vision, Leaflet)",
    "Project: Geo Measure - Geospatial file-measurement REST API: accepts Shapefile/KML uploads and returns polygon areas and line lengths, reprojecting each feature to its local UTM zone and cross-checking against a geodesic calculation. Single Docker image on Render with Alembic-managed PostgreSQL. (Python, FastAPI, React, PostgreSQL/Neon, Alembic, Docker)",
    "",
    "# Core technical profile",
    "Skills: Python, Java, TypeScript, Deep Learning, NLP, Computer Vision, Agentic AI, LLMs, RAG, LangGraph, Hybrid Retrieval (FAISS, BM25), Ollama, Google Gemini, FastAPI, React, Next.js, Docker, PostgreSQL, Linux (Arch, CachyOS, Fedora, Pop!_OS).",
    "Current status: B.Tech Artificial Intelligence and Machine Learning undergraduate (REVA University, 2027) and AI Engineer Intern at IIT Ropar's VLED Lab; open to AI/ML and SDE internships and 2027 roles.",
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

/**
 * Canonical content for the CMS-backed sections.
 *
 * Single source of truth, used two ways:
 *   1. lib/db.ts seeds a fresh database from this.
 *   2. components/TerminalComp/CmsSection.tsx falls back to this when the CMS
 *      returns nothing — a cold/unreachable DB, or /api/bootstrap still in
 *      flight. Without it those sections rendered "no public entries yet",
 *      which reads as broken rather than as empty.
 *
 * Client-safe on purpose (no "server-only"): both the server seed and the
 * browser import it, which is what keeps the two copies from drifting.
 */

export interface SectionEntry {
  title: string;
  description: string;
  date?: string;
  link?: string;
  /** Credential / certificate ID, shown in the certificate viewer. */
  credentialId?: string;
}

/** The combined, verifiable certificate pack (all scans in one PDF). */
export const CERTIFICATES_PDF = "/certificates/srinivas-rc-certificates.pdf";

// Newest first. Dates and credential IDs transcribed from the certificate
// scans in CERTIFICATES_PDF, so the site matches the verifiable documents.
export const CERTIFICATES: SectionEntry[] = [
  {
    title: "Artificial Intelligence: Foundations and Algorithms",
    description: "IIT Delhi / NPTEL",
    date: "2026",
  },
  {
    title: "Copado AI Certification",
    description: "Copado — Copado Certified (Salesforce DevOps)",
    date: "July 2026",
    credentialId: "074453",
  },
  {
    title: "Deep Learning — 12-Week Academic Programme (Proctored)",
    description: "IIT Ropar / NPTEL",
    date: "2026",
  },
  {
    title: "MLOps Zero to Hero",
    description: "Udemy — 12.5 hours, instructor Abhishek Veeramalla",
    date: "March 2026",
    credentialId: "UC-6a75c9fb-585d-4de8-aae4-100f48720ec4",
  },
  {
    title: "Computer Networking by The New Boston",
    description: "Cursa — 4h 01m",
    date: "November 2025",
    credentialId: "u5292829",
  },
  {
    title: "Software Engineering Fundamentals",
    description: "Microsoft",
    date: "2025",
  },
  {
    title: "Innovation and Technology Bootcamp",
    description: "REVA NEST Incubation Centre — startup foundations and product development",
    date: "2025",
  },
  {
    title: "Prompt Engineering Certification",
    description: "Infosys Springboard",
    date: "2025",
  },
  {
    title: "LLM-Driven AI Engineering Bootcamp",
    description: "REVA Academy for Corporate Excellence, REVA University",
    date: "March 2024",
    credentialId: "LDAIE/W24-523",
  },
  {
    title: "Machine Learning Certification",
    description: "Rinex Organization, NSDC / Skill India — Grade: A+",
    date: "November 2023",
    credentialId: "ML23-RNC0-1124",
  },
];

export const EDUCATION: SectionEntry[] = [
  {
    title: "B.Tech — Artificial Intelligence and Machine Learning",
    description: "REVA University, Bengaluru. CGPA: 8.0/10.",
    date: "2023 – 2027",
  },
  {
    title: "PUC (PCMB)",
    description: "MES College of Arts, Science & Commerce, Bengaluru. 82.5%.",
    date: "2023",
  },
  {
    title: "ICSE — Class X",
    description: "Mount Senoria School, Bengaluru. 88.8%.",
    date: "2021",
  },
];

export const EXPERIENCE: SectionEntry[] = [
  {
    title: "AI Engineer Intern — VLED Lab (Vicharanashala Lab for Education Design), IIT Ropar",
    description:
      "Project: Ajrasakha — React, TypeScript, Node.js, Express, MongoDB Atlas Vector Search, Sarvam AI, Ollama. Contributing to Ajrasakha, an open-source assistant that answers farmers' questions in local languages. Working on a 3-tier retrieval pipeline that serves expert-verified answers first, then the Package of Practices database, and calls local LLMs (DeepSeek-R1, Qwen3) through Ollama only as a fallback. Committing code to a live public repository after selection through a competitive evaluation.",
    date: "Remote · Aug 2026 – Oct 2026",
  },
  {
    title: "Independent AI/ML Engineering — Self-Directed Projects",
    description:
      "Design, build, and ship full-stack AI products end to end — from a 4-stage Gemini prompt-chaining platform (ArchAgent) to MLOps pipelines and LLM-powered web apps, plus AEGIS, built with Team Alpha for Smart India Hackathon 2026. Integrate real production stacks (Google Gemini, Hugging Face, FastAPI, PostgreSQL/Neon, Docker, Ollama), and continuously explore the open-source ecosystem on GitHub — evaluating new frameworks, plugins, and tooling and turning them into production-grade builds. Open to AI/ML internships and placements.",
    date: "Self-directed · 2025 – Present",
  },
  {
    title: "Core Member and Head of Media — Yantra IoT Club, REVA University",
    description:
      "Led media and outreach for the club, running promotional campaigns for 2 robotics events — ROBONEMESIS microcontroller training and a Follow Bot Competition — that drew 17K+ combined views. Coordinated technical workshops and career panels with professionals from Amazon and Google, reaching 100+ students across university events.",
    date: "2024 – 2025",
  },
];

export const ACHIEVEMENTS: SectionEntry[] = [
  {
    title: "3rd Place — IoT Hackathon, REVA University",
    description:
      "Placed 3rd in a university IoT hackathon and competed in several more, building working prototypes in teams under tight deadlines.",
    date: "2025",
  },
  {
    title: "Certified — Deep Learning (IIT Ropar / NPTEL)",
    description: "Completed the 12-week proctored academic programme.",
    date: "2026",
  },
];

export const CONNECT: SectionEntry[] = [
  {
    title: "Email",
    description: "srinivasrc0408@gmail.com",
    link: "mailto:srinivasrc0408@gmail.com",
  },
  {
    title: "GitHub",
    description: "github.com/srinivas-rc0408",
    link: "https://github.com/srinivas-rc0408",
  },
  {
    title: "LinkedIn",
    description: "linkedin.com/in/srinivas-r-c",
    link: "https://linkedin.com/in/srinivas-r-c",
  },
];

/** Fallback entries for a CMS section, or [] if that section has none. */
export function fallbackFor(section: string): SectionEntry[] {
  switch (section) {
    case "certificates":
      return CERTIFICATES;
    case "education":
      return EDUCATION;
    case "experience":
      return EXPERIENCE;
    case "achievements":
      return ACHIEVEMENTS;
    case "connect":
      return CONNECT;
    default:
      return [];
  }
}

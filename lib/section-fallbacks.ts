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
}

export const CERTIFICATES: SectionEntry[] = [
  {
    title: "Deep Learning — 12-Week Academic Programme (Proctored)",
    description: "IIT Ropar / NPTEL",
    date: "2026",
  },
  {
    title: "Software Engineering Fundamentals",
    description: "Microsoft",
    date: "2025",
  },
  {
    title: "LLM-Driven AI Engineering Bootcamp",
    description: "REVA University",
    date: "2025",
  },
  {
    title: "Prompt Engineering Certification",
    description: "Infosys Springboard",
    date: "2025",
  },
  {
    title: "Machine Learning Certification",
    description: "Rinex Organization, NSDC / Skill India — Grade: A+",
    date: "2024",
  },
  { title: "Python Programming", description: "Certification", date: "2025" },
];

export const EDUCATION: SectionEntry[] = [
  {
    title: "B.Tech — Artificial Intelligence & Machine Learning",
    description: "REVA University, Bengaluru. Expected 2027.",
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
    title: "Independent AI/ML Engineering — Self-Directed Projects",
    description:
      "Design, build, and ship full-stack AI products end to end — from a 4-stage Gemini prompt-chaining platform (ArchAgent) to MLOps pipelines and LLM-powered web apps (12 shipped). Integrate real production stacks (Google Gemini, Hugging Face, Firebase, Supabase, Three.js), and continuously explore the open-source ecosystem on GitHub — evaluating new frameworks, plugins, and tooling and turning them into production-grade builds. Open to AI/ML internships and placements.",
    date: "Self-directed · 2025 – Present",
  },
  {
    title: "Core Member & Head of Media — Yantra IoT Club, REVA University",
    description:
      "Led media and outreach for the club, running promotional campaigns for 2 robotics events — ROBONEMESIS microcontroller training and a Follow Bot Competition — that drew 17K+ combined views. Coordinated technical workshops and career panels with professionals from Amazon and Google, reaching 100+ students across university events.",
    date: "2025",
  },
];

export const ACHIEVEMENTS: SectionEntry[] = [
  {
    title: "Certified — Deep Learning (IIT Ropar / NPTEL)",
    description: "Completed the 12-week proctored academic programme.",
    date: "2026",
  },
];

export const CONNECT: SectionEntry[] = [
  {
    title: "Email",
    description: "srinivasrc01@gmail.com",
    link: "mailto:srinivasrc01@gmail.com",
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

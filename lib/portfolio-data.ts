// Single source of truth for portfolio content.
//
// Each section is rendered twice — once as a static, SEO-friendly page under
// `app/*/page.tsx` and once as an interactive pane under
// `components/TerminalComp/*`. The two renderings differ on purpose, but the
// underlying data must not. Both sides import from here so the lists stay in
// lock-step (they had already drifted before this was centralized).

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface Project {
  name: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  tech: string[];
}

export const projects: Project[] = [
  {
    name: "ArchAgent — Agentic AI",
    description:
      "A modular agentic AI framework that automates structured dataset generation, cutting manual data-creation time by an estimated 40%. Built production-ready workflows with prompt chaining and custom tool integrations to execute 5+ sequential reasoning tasks autonomously, with configurable memory and a responsive Streamlit interface.",
    imageUrl: "/images/projects/archagent.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/ArchAgent---Agentic-AI",
    tech: ["Python", "LLM APIs", "Prompt Engineering", "Agentic AI", "Streamlit", "Git"],
  },
  {
    name: "AI Travel Planner",
    description:
      "A full-stack travel agent that generates personalized, day-by-day itineraries with Google Gemini. Smart destination autocomplete via the Places API, live interactive Leaflet maps with routed paths, Google OAuth login, and trips persisted to a personal dashboard on Firebase Firestore.",
    imageUrl: "/images/projects/ai-travel-planner.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/AI-travel-planner-final",
    tech: ["React", "Vite", "Firebase Firestore", "Google Gemini", "Google Places API", "Leaflet", "Shadcn UI"],
  },
  {
    name: "Health Risk MLOps",
    description:
      "An end-to-end MLOps pipeline that fully automates training, evaluation, and production deployment of health-risk prediction models. Integrated MLflow for strict model versioning and continuous performance monitoring, and designed 4 reproducible, modular pipeline stages for seamless preprocessing, feature tracking, and standardised evaluation.",
    imageUrl: "/images/projects/health-risk-mlops.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/health-risk-mlops",
    tech: ["Python", "Scikit-learn", "MLflow", "MLOps", "Git"],
  },
  {
    name: "Bank Churn Prediction System",
    description:
      "A churn-prediction system reaching 85%+ classification accuracy on structured banking datasets using Random Forest. Executed advanced data preprocessing and automated feature engineering to optimise metrics and resolve class imbalance, with an interactive low-latency Streamlit frontend delivering real-time churn probability scores to end-users.",
    imageUrl: "/images/projects/bank-churn-ui.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/bank-churn-ui",
    tech: ["Python", "Scikit-learn", "Random Forest", "Feature Engineering", "Streamlit"],
  },
  {
    name: "Bangalore Smart-Toll System",
    description:
      "A full-stack toll management platform with authenticated user and admin flows, live vehicle-class fare calculation, MongoDB-backed transaction history, real-time fleet analytics, and 7-day PDF audit report exports.",
    imageUrl: "/images/projects/toll-check.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/Toll-Check-",
    tech: ["React", "TypeScript", "Express", "MongoDB Atlas", "Zustand", "jsPDF"],
  },
  {
    name: "NLP Language Detector & Translator",
    description:
      "An NLP web-application pipeline built with Scikit-learn to classify and process multilingual text. Developed efficient text preprocessing and translation workflows that extract key semantic features across multiple target languages, with tokenisation routines optimised for low-latency real-time inference.",
    imageUrl: "/images/projects/language-detector.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/Language-Detector",
    tech: ["Python", "NLP", "Scikit-learn"],
  },
  {
    name: "Mini Translator",
    description:
      "A lightweight, high-performance web translator with instant translation across multiple languages, automatic source-language detection, and one-click clipboard integration in a minimalist responsive UI.",
    imageUrl: "/images/projects/mini-translator.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/Mini-Translator-",
    tech: ["TypeScript", "NLP", "Translation API"],
  },
  {
    name: "Managing AD Channels",
    description:
      "An NLP/ML project that models advertising-channel performance: dataset generation, model training, and a prediction app for choosing the best-performing ad channel from campaign data.",
    imageUrl: "/images/projects/ad-channels.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/Managing-AD-channels-",
    tech: ["Python", "Machine Learning", "NLP", "pandas"],
  },
  {
    name: "AI Finance Assistant",
    description:
      "An AI-driven personal finance assistant that answers finance questions, explains budgeting and savings concepts in structured plain language, and demonstrates applied prompt engineering in a real-world domain.",
    imageUrl: "/images/projects/ai-finance.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408",
    tech: ["Python", "LLMs", "Prompt Engineering"],
  },
  {
    name: "Flappy Duck — AI Mode",
    description:
      "A production-grade 2D game engine with an autonomous PID-controlled AI autopilot, 7 characters with unique physics profiles, procedural weather and dynamic biomes, and oscillating obstacles across 5 difficulty phases — zero external dependencies, pure ES6.",
    imageUrl: "/images/projects/flappy-duck.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/Flappy-Duck--AI-mode",
    tech: ["JavaScript (ES6)", "Canvas", "Game AI", "PID Control"],
  },
  {
    name: "Billing System (Java)",
    description:
      "A console-based billing application built on core Java and OOP principles: item entry with price and quantity, automatic total calculation, and structured bill generation.",
    imageUrl: "/images/projects/billing-java.png",
    liveUrl: "#",
    githubUrl: "https://github.com/srinivas-rc0408/billing-project-java",
    tech: ["Java", "OOP"],
  },
];

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export interface SkillsCategory {
  languages: string[];
  ai_ml: string[];
  frameworks: string[];
  tools: string[];
}

export const skills: SkillsCategory = {
  languages: ["Python", "JavaScript / TypeScript", "C / C++"],
  ai_ml: [
    "Large Language Models (LLMs)",
    "Machine Learning",
    "Prompt Engineering",
  ],
  frameworks: [
    "CrewAI (Agentic Frameworks)",
    "React",
    "Next.js",
  ],
  tools: [
    "Linux Administration (Arch / CachyOS)",
    "Git",
    "Web Applications",
  ],
};

// Faux shell command shown above each skill category.
export const skillCommands: Record<keyof SkillsCategory, string> = {
  languages: "ls -la /skills/languages/",
  ai_ml: "python -m pip list | grep ai",
  frameworks: "cat /skills/frameworks/stack.txt",
  tools: "which --all tools",
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const CONTACT_EMAIL = "srinivasrc0408@gmail.com";
export const CONTACT_PHONE = "+91 72049 54568";
export const CONTACT_LOCATION = "Bengaluru, Karnataka, India";
export const RESUME_URL = "/srinivas-rc-resume.pdf";

// Icon rendering differs between the static page and the terminal pane, so each
// side keys its own icon set off `name`; only the link metadata lives here.
export interface SocialLinkData {
  name: string;
  href: string;
  color: string;
}

export const socialLinks: SocialLinkData[] = [
  { name: "GitHub", href: "https://github.com/srinivas-rc0408", color: "purple" },
];

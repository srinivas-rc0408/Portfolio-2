import { SITE_URL } from "@/lib/seo-config";
import { jsonLd } from "@/lib/jsonld";
import { Metadata } from "next";
import type { ReactNode } from "react";
import {
  skills as skillsData,
  skillCommands as terminalCommands,
  type SkillsCategory,
} from "@/lib/portfolio-data";

// Enhanced SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Skills & Tech Stack | AI / ML Engineer",
  description:
    "Technical skills of Srinivas RC: Python, Machine Learning, Large Language Models (LLMs), Agentic Frameworks (CrewAI), Prompt Engineering, and Linux Administration. AI / ML Engineer from Bengaluru, India.",
  keywords: [
    "AI Engineering Skills",
    "JavaScript Developer",
    "TypeScript Expert",
    "React Developer",
    "Node.js Backend",
    "MongoDB Database",
    "Express.js API",
    "Next.js Framework",
    "Python Programming",
    "TensorFlow Machine Learning",
    "Docker Containers",
    "Full Stack Technologies",
    "Web Development Skills",
    "REST API Development",
    "Git Version Control",
    "Cloud Deployment Skills",
    "AI Engineer Bengaluru",
    "Full Stack Developer India",
    "AI ML Developer",
    "Machine Learning Skills",
  ],
  authors: [{ name: "Srinivas RC", url: SITE_URL }],
  creator: "Srinivas RC",
  publisher: "Srinivas RC",
  openGraph: {
    title: "Skills & Tech Stack | AI / ML Engineer",
    description:
      "Python, Machine Learning, LLMs, agentic frameworks (CrewAI), prompt engineering, and Linux administration. AI / ML Engineer from Bengaluru, India.",
    type: "website",
    url: `${SITE_URL}/skills`,
    siteName: "Srinivas RC - Developer Portfolio",
    locale: "en_IN",
    images: [
      {
        url: `${SITE_URL}/images/logo.jpg`,
        width: 1200,
        height: 630,
        alt: "Srinivas RC - Skills & Tech Stack",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
        title: "Skills & Tech Stack | AI / ML Engineer",
    description:
      "Python, machine learning, LLMs, agentic systems, and Linux. Comprehensive technical skills portfolio.",
    images: [`${SITE_URL}/images/logo.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: `${SITE_URL}/skills`,
    languages: {
      en: `${SITE_URL}/skills`,
    },
  },
  category: "Technology",
  classification: "Skills Portfolio",
};

// Type definitions

interface CategoryConfig {
  key: keyof SkillsCategory;
  title: string;
  icon: ReactNode;
  skills: string[];
}


// Simplified SVG Icons
const CodeIcon = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M8.7 15.9L4.8 12l3.9-3.9c.39-.39.39-1.01 0-1.4s-1.01-.39-1.4 0l-4.59 4.59c-.39.39-.39 1.02 0 1.41l4.59 4.6c.39.39 1.01.39 1.4 0 .39-.39.39-1.01 0-1.41zm6.6 0l3.9-3.9-3.9-3.9c-.39-.39-.39-1.01 0-1.4s1.01-.39 1.4 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.6c-.39.39-1.01.39-1.4 0-.39-.39-.39-1.01 0-1.41z" />
  </svg>
);

const LayersIcon = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z" />
  </svg>
);

const ToolIcon = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
  </svg>
);


const BrainIcon = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// Enhanced JSON-LD Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Srinivas RC",
  url: SITE_URL,
  image: `${SITE_URL}/images/logo.jpg`,
  knowsAbout: [
    ...skillsData.languages,
    ...skillsData.ai_ml,
    ...skillsData.frameworks,
    ...skillsData.tools,
  ],
  jobTitle: "AI / ML Engineer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Programming Language",
      competencyRequired: "Python",
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "AI & Machine Learning",
      competencyRequired:
        "Machine Learning, Large Language Models, CrewAI, Prompt Engineering",
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Systems & Tools",
      competencyRequired: "Linux Administration, Git",
    },
  ],
  skills:
    "AI Engineering, Machine Learning, Large Language Models, Agentic Systems, Prompt Engineering, Linux Administration",
};

// Breadcrumb Structured Data
const breadcrumbStructuredData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Skills",
      item: `${SITE_URL}/skills`,
    },
  ],
};

// Lightweight Terminal Window Component
const TerminalWindow = ({
  title,
  command,
  icon,
  skills,
}: {
  title: string;
  command: string;
  icon: ReactNode;
  skills: string[];
}) => {
  return (
    <div itemScope itemType="https://schema.org/ItemList">
      {/* Terminal header */}
      <div>
        <div>
          <div aria-hidden="true">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <span>
            ~ {title}
          </span>
        </div>
        <div aria-hidden="true"></div>
      </div>

      {/* Terminal content */}
      <div>
        {/* Command line */}
        <div>
          <span>$</span>
          <span>{command}</span>
        </div>

        {/* Skills output */}
        <div>
          <div>
            {icon}
            <span>
              {title.toLowerCase()}_modules:
            </span>
          </div>
          <div
            role="list"
            aria-label={`${title} skills`}
            itemProp="itemListElement"
          >
            {skills.map((skill) => (
              <span
                key={skill}
                role="listitem"
                itemProp="name"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Server Component - Lightweight Version
export default function Skills() {
  const categories: CategoryConfig[] = [
    {
      key: "languages",
      title: "Languages",
      icon: <CodeIcon />,
      skills: skillsData.languages,
    },
    {
      key: "ai_ml",
      title: "AI / ML",
      icon: <BrainIcon />,
      skills: skillsData.ai_ml,
    },
    {
      key: "frameworks",
      title: "Frameworks / Agentic",
      icon: <LayersIcon />,
      skills: skillsData.frameworks,
    },
    {
      key: "tools",
      title: "OS & Tools",
      icon: <ToolIcon />,
      skills: skillsData.tools,
    },
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbStructuredData),
        }}
      />

      <section
        id="skills-section"
        aria-labelledby="skills-heading"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <div lang="en">
          {/* Header */}
          <header>
            <h1
              id="skills-heading"
              itemProp="name"
            >
              <span>&lt;</span>
              <span> Skills & Tech Stack </span>
              <span>/&gt;</span>
            </h1>
            <div>
              <span>$</span> ./skills --interactive --display-all
            </div>
          </header>

          {/* Terminal Windows Grid */}
          <div>
            {categories.map((category) => (
              <TerminalWindow
                key={category.key}
                title={category.title}
                command={terminalCommands[category.key]}
                icon={category.icon}
                skills={category.skills}
              />
            ))}
          </div>

          {/* Footer */}
          <footer>
            <p>
              <span>└─$</span>{" "}
              {skillsData.languages.length +
                skillsData.ai_ml.length +
                skillsData.frameworks.length +
                skillsData.tools.length}{" "}
              total skills across {categories.length} categories
            </p>
          </footer>
        </div>
      </section>
    </>
  );
}

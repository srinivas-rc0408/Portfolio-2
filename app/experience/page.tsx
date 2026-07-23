import { Metadata } from "next";
import { jsonLd } from "@/lib/jsonld";
import { SITE_URL, SITE_NAME } from "@/lib/seo-config";

// Static page — re-render daily so content stays fresh between deploys.
export const revalidate = 86400;

// SEO Metadata for Experience page
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Experience | Independent AI Project Work · Open to Placements",
  description: `Experience of ${SITE_NAME}: independent project work building agentic AI systems (Archagent — an autonomous agent for architecture and interior design tasks) and machine learning web applications (Language Detector). Open to internships and university placements in AI engineering.`,
  keywords: [
    `${SITE_NAME} Experience`,
    "AI / ML Engineer",
    "AI Engineer Bengaluru",
    "Agentic Systems",
    "Autonomous AI Agent",
    "CrewAI",
    "Large Language Models",
    "Prompt Engineering",
    "Machine Learning Projects",
    "AI Internship",
    "University Placements",
    "B.Tech AIML",
    "REVA University",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: "Experience | Independent AI Project Work · Open to Placements",
    description:
      "Independent project work building agentic AI systems and ML web apps. Open to internships and university placements in AI engineering.",
    type: "profile",
    url: `${SITE_URL}/experience`,
    siteName: `${SITE_NAME} - Developer Portfolio`,
    locale: "en_IN",
    images: [
      {
        url: `${SITE_URL}/images/logo.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — AI / ML Engineer experience`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Experience | Independent AI Project Work · Open to Placements",
    description:
      "Independent project work building agentic AI systems and ML web apps. Open to internships and university placements.",
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
    canonical: `${SITE_URL}/experience`,
    languages: {
      en: `${SITE_URL}/experience`,
    },
  },
  category: "Technology",
  classification: "Professional Experience",
};

function buildStructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: SITE_NAME,
    url: SITE_URL,
    mainEntityOfPage: `${SITE_URL}/experience`,
    image: `${SITE_URL}/images/logo.jpg`,
    jobTitle: "AI / ML Engineer",
    seeks: {
      "@type": "Demand",
      name: "AI Engineering internships and university placements",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/experience#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Experience",
        item: `${SITE_URL}/experience`,
      },
    ],
  };

  return { personSchema, breadcrumbSchema };
}

export default function Experience() {
  const { personSchema, breadcrumbSchema } = buildStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />

      <section
        id="experience-section"
        aria-labelledby="experience-heading"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <div lang="en">
          <header>
            <h1 id="experience-heading" itemProp="name">
              Experience
            </h1>
            <p>
              Independent project work as a AI / ML Engineer — building
              agentic AI systems and machine learning web applications. Open to
              internships and university placements.
            </p>
          </header>

          <div>
            {/* Independent project work */}
            <article aria-labelledby="independent-heading">
              <header>
                <h2 id="independent-heading">Independent Project Work</h2>
                <p>
                  <strong>Self-directed · Ongoing</strong> · Bengaluru,
                  Karnataka, India
                </p>
              </header>

              {/* Archagent */}
              <section aria-labelledby="archagent-heading">
                <h3 id="archagent-heading">
                  Archagent — Autonomous AI Agent · Agentic systems
                </h3>
                <ul itemProp="description">
                  <li>
                    Designed and built an autonomous AI agent that handles
                    architecture and interior design tasks end to end.
                  </li>
                  <li>
                    Applied agentic frameworks (CrewAI), LLM orchestration, and
                    prompt engineering to a real-world domain.
                  </li>
                </ul>
              </section>

              {/* Language Detector */}
              <section aria-labelledby="langdetector-heading">
                <h3 id="langdetector-heading">
                  Language Detector — ML Web App · Machine learning
                </h3>
                <ul itemProp="description">
                  <li>
                    Built a minimalist, single-page language detection web
                    application requiring no login.
                  </li>
                  <li>
                    Focused on a friction-free user experience: paste text, get
                    the language — nothing else in the way.
                  </li>
                </ul>
              </section>
            </article>

            {/* Open to opportunities */}
            <article aria-labelledby="opportunities-heading">
              <header>
                <h2 id="opportunities-heading">Open to Opportunities</h2>
                <p>
                  <strong>Internships · University placements</strong> · B.Tech
                  AI &amp; ML, REVA University
                </p>
              </header>

              <ul itemProp="description">
                <li>
                  Seeking roles in AI engineering — building and deploying
                  applications powered by LLMs and agentic systems.
                </li>
                <li>
                  Comfortable across the stack that matters for applied AI:
                  Python, machine learning, prompt engineering, and Linux.
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

import { Metadata } from "next";
import BackToHome from "@/components/BackToHome";
import { jsonLd } from "@/lib/jsonld";
import { SITE_URL, SITE_NAME, OG_IMAGE_URL } from "@/lib/seo-config";

// Static page — re-render daily so content stays fresh between deploys.
export const revalidate = 86400;

// SEO Metadata for Experience page
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Experience | Independent AI Project Work · Open to Placements",
  description: `Experience of ${SITE_NAME}: Core Member & Head of Media at the Yantra IoT Club (REVA University), plus self-directed project work building LLM-powered and agentic AI systems (ArchAgent, AI Travel Planner, AI Finance Assistant). Open to internships and university placements in AI engineering.`,
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
        url: OG_IMAGE_URL,
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
    images: [OG_IMAGE_URL],
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
    image: OG_IMAGE_URL,
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
      <BackToHome />
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
            {/* AI Developer Intern — Vicharanashala, IIT Ropar (current role) */}
            <article aria-labelledby="iit-ropar-heading">
              <header>
                <h2 id="iit-ropar-heading">
                  Artificial Intelligence Developer Intern
                </h2>
                <p>
                  <strong>Vicharanashala, IIT Ropar · Aug 2026 – Present</strong>{" "}
                  · Remote · 3-month track
                </p>
              </header>
              <ul itemProp="description">
                <li>
                  <strong>Building &amp; designing AI solutions</strong> —
                  architecting intelligent AI applications with a focus on system
                  design and scalable software architecture.
                </li>
                <li>
                  <strong>Full-stack &amp; AI engineering</strong> — an intensive
                  track integrating foundational AI methodologies with the MERN
                  (MongoDB, Express, React, Node.js) stack via the ViBe platform.
                </li>
                <li>
                  <strong>Mathematical foundations &amp; mentoring</strong> —
                  peer-to-peer technical validation sessions (Matrix Mystics)
                  solving and endorsing the Linear Algebra behind ML models.
                </li>
                <li>
                  <strong>Agile collaboration</strong> — daily agile standups and
                  cross-functional breakout rooms, with asynchronous technical
                  documentation on Discourse.
                </li>
              </ul>
            </article>

            {/* Independent project work */}
            <article aria-labelledby="independent-heading">
              <header>
                <h2 id="independent-heading">Independent Project Work</h2>
                <p>
                  <strong>Self-directed · Ongoing</strong> · Bengaluru,
                  Karnataka, India
                </p>
              </header>

              {/* ArchAgent */}
              <section aria-labelledby="archagent-heading">
                <h3 id="archagent-heading">
                  ArchAgent — AI Architectural Design Platform · Apr – Jun 2026
                </h3>
                <ul itemProp="description">
                  <li>
                    Built an AI platform that turns text design briefs into 3D
                    renders, panoramic views and itemised cost estimates through
                    a 4-stage Google Gemini prompt-chaining pipeline.
                  </li>
                  <li>
                    Combined two AI models — Gemini for design reasoning and
                    Hugging Face FLUX for images — with an interactive Three.js
                    3D viewer, plus Supabase login and project storage.
                  </li>
                  <li>
                    Fixed inaccurate cost estimates (LLM hallucinations) using
                    few-shot prompting with real INR price examples, and added
                    1-click PDF report export with jsPDF.
                  </li>
                </ul>
              </section>

              {/* AI Travel Planner */}
              <section aria-labelledby="travel-heading">
                <h3 id="travel-heading">AI Travel Planner · Jun 2026</h3>
                <ul itemProp="description">
                  <li>
                    Generated personalised, day-by-day itineraries from three
                    inputs — destination, budget and preferences — using
                    structured JSON prompts with Google Gemini.
                  </li>
                  <li>
                    Integrated 4 Google services (Gemini, OAuth, Places API,
                    Firebase Firestore) for secure sign-in, live location data
                    and trips saved across sessions.
                  </li>
                </ul>
              </section>

              {/* AI Finance Assistant */}
              <section aria-labelledby="finance-heading">
                <h3 id="finance-heading">AI Finance Assistant · 2026</h3>
                <ul itemProp="description">
                  <li>
                    Built a personal-finance assistant on Next.js with 3 modules
                    (dashboard, portfolio, transactions) that answers finance
                    questions using prompt-engineered LLM responses.
                  </li>
                  <li>
                    Designed a relational Prisma database with 5+ models served
                    through dedicated REST endpoints, with Inngest serverless
                    functions running background jobs.
                  </li>
                </ul>
              </section>
            </article>

            {/* Leadership — Yantra IoT Club */}
            <article aria-labelledby="yantra-heading">
              <header>
                <h2 id="yantra-heading">Core Member &amp; Head of Media</h2>
                <p>
                  <strong>Yantra IoT Club, REVA University · 2025</strong> ·
                  Bengaluru, Karnataka, India
                </p>
              </header>
              <ul>
                <li>
                  Led media and outreach for the club, running promotional
                  campaigns for 2 robotics events — ROBONEMESIS microcontroller
                  training and a Follow Bot Competition — that drew 17K+
                  combined views.
                </li>
                <li>
                  Coordinated technical workshops and career panels with
                  professionals from Amazon and Google, reaching 100+ students
                  across university events.
                </li>
              </ul>
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

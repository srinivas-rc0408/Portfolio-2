import { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/seo-config";
import { CONTACT_EMAIL } from "@/lib/portfolio-data";

// Enhanced SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `About Me | ${SITE_TAGLINE}`,
  description:
    "AI / ML Engineer from Bengaluru, India. Building and deploying web applications powered by Large Language Models (LLMs) and agentic systems. Passionate about Linux system optimization with CachyOS. Pursuing B.Tech in AI & ML at REVA University.",
  keywords: [
    "AI Engineer",
    "AI / ML Engineer",
    "AI Engineer Bengaluru",
    "AI Engineer India",
    "Machine Learning",
    "Large Language Models",
    "LLM Developer",
    "Agentic Systems",
    "CrewAI",
    "Prompt Engineering",
    "Python Developer",
    "Linux Administration",
    "CachyOS",
    "REVA University",
    "B.Tech AIML",
    "Developer Portfolio",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: `About Me | ${SITE_TAGLINE}`,
    description:
      "AI / ML Engineer building web applications powered by LLMs and agentic systems. Pursuing B.Tech in AI & ML at REVA University, Bengaluru.",
    type: "profile",
    url: `${SITE_URL}/about`,
    siteName: `${SITE_NAME} - Developer Portfolio`,
    locale: "en_IN",
    images: [
      {
        url: `${SITE_URL}/images/logo.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Me | ${SITE_TAGLINE}`,
    description:
      "AI / ML Engineer building LLM-powered web applications and agentic systems. Pursuing B.Tech in AI & ML at REVA University.",
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
    canonical: `${SITE_URL}/about`,
    languages: {
      en: `${SITE_URL}/about`,
    },
  },
  category: "Technology",
  classification: "Developer Portfolio",
};

// Simplified SVG Icons
const CodeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Code icon"
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const SystemIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="System design icon"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Enhanced JSON-LD Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: SITE_NAME,
  givenName: "Srinivas",
  familyName: "RC",
  url: SITE_URL,
  mainEntityOfPage: `${SITE_URL}/about`,
  image: `${SITE_URL}/images/logo.jpg`,
  email: `mailto:${CONTACT_EMAIL}`,
  jobTitle: "AI / ML Engineer",
  description:
    "AI / ML Engineer building web applications powered by Large Language Models and agentic systems. Passionate about Linux system optimization with CachyOS. Based in Bengaluru, India.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  nationality: { "@type": "Country", name: "India" },
  knowsLanguage: ["English"],
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Large Language Models",
    "Agentic Systems",
    "CrewAI",
    "Prompt Engineering",
    "Python",
    "Linux Administration",
    "CachyOS",
    "Web Applications",
  ],
  alumniOf: [
    {
      "@type": "EducationalOrganization",
      name: "REVA University",
      address: { "@type": "PostalAddress", addressCountry: "IN" },
    },
  ],
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      educationalLevel: "Bachelor's Degree",
      about:
        "Bachelor of Technology in Artificial Intelligence & Machine Learning",
      recognizedBy: {
        "@type": "EducationalOrganization",
        name: "REVA University",
      },
    },
  ],
  skills:
    "Python, Machine Learning, Large Language Models, Agentic Frameworks (CrewAI), Prompt Engineering, Linux Administration",
  sameAs: ["https://github.com/srinivas-rc0408"],
};

// AboutPage Structured Data — wraps the Person and is the page's primary entity
const aboutPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about#aboutpage`,
  url: `${SITE_URL}/about`,
  name: `About ${SITE_NAME}`,
  description: `About ${SITE_NAME} — AI / ML Engineer building web applications powered by LLMs and agentic systems, and optimizing Linux (CachyOS).`,
  inLanguage: "en-IN",
  mainEntity: { "@id": `${SITE_URL}/#person` },
  author: { "@id": `${SITE_URL}/#person` },
  about: { "@id": `${SITE_URL}/#person` },
  primaryImageOfPage: `${SITE_URL}/images/logo.jpg`,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  breadcrumb: {
    "@id": `${SITE_URL}/about#breadcrumb`,
  },
  datePublished: "2026-07-01",
  dateModified: new Date().toISOString().slice(0, 10),
};

// Breadcrumb Structured Data
const breadcrumbStructuredData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/about#breadcrumb`,
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
      name: "About",
      item: `${SITE_URL}/about`,
    },
  ],
};

// Main Server Component - Lightweight Version
export default function About() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      <div lang="en">
        {/* Main content */}
        <main>
          {/* Header */}
          <header>
            <h1 itemProp="name">About Me</h1>
            <p>
              By{" "}
              <a
                href={SITE_URL}
                rel="author"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <span itemProp="name">{SITE_NAME}</span>
              </a>
              {" · "}
              <span itemProp="jobTitle">AI / ML Engineer</span>
              {" · "}
              <a href={`mailto:${CONTACT_EMAIL}`} rel="me">
                {CONTACT_EMAIL}
              </a>
            </p>
          </header>

          <div>
            {/* About Me Section */}
            <section id="about-section" aria-labelledby="about-heading">
              <div>
                <span>$</span>
                <h2 id="about-heading">About Me</h2>
              </div>

              <div>
                <p>
                  I am a Computer Science Engineering undergraduate and an{" "}
                  <strong>AI / ML Engineer</strong>. I specialize in
                  building and deploying web applications powered by{" "}
                  <strong>Large Language Models (LLMs)</strong> and{" "}
                  <strong>agentic systems</strong>. I am passionate about Linux
                  system optimization (specifically CachyOS) and leveraging AI
                  to solve real-world problems. Off the keyboard, I enjoy
                  motorcycle photography and use AI tools for image
                  enhancement.
                </p>

                <div role="list" aria-label="Technical skills">
                  {[
                    "Python",
                    "Machine Learning",
                    "LLMs",
                    "CrewAI",
                    "Prompt Engineering",
                    "Linux",
                  ].map((tech) => (
                    <span key={tech} role="listitem">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Education Section */}
            <section id="education-section" aria-labelledby="education-heading">
              <div>
                <span>$</span>
                <h2 id="education-heading">Education</h2>
              </div>

              <div
                itemScope
                itemType="https://schema.org/EducationalOccupationalCredential"
              >
                {/* REVA University */}
                <article
                  aria-labelledby="reva-heading"
                  itemScope
                  itemType="https://schema.org/EducationalOrganization"
                >
                  <div>
                    <h3 id="reva-heading" itemProp="name">
                      REVA University
                    </h3>
                    <time itemProp="temporalCoverage">Present</time>
                  </div>
                  <p itemProp="description">
                    Pursuing Bachelor of Technology in Artificial Intelligence
                    &amp; Machine Learning.
                  </p>
                  <div>
                    <span itemProp="credentialCategory">CGPA: 7.5</span>
                  </div>
                </article>
              </div>
            </section>

            {/* Current focus */}
            <section id="focus-section" aria-labelledby="focus-heading">
              <div>
                <span>$</span>
                <h2 id="focus-heading">What I&apos;m Doing</h2>
              </div>

              <div>
                {/* Agentic AI systems */}
                <article>
                  <div>
                    <CodeIcon />
                  </div>
                  <h3>Agentic AI Systems</h3>
                  <p>
                    Building autonomous agents with <strong>LLMs</strong> and{" "}
                    <strong>CrewAI</strong>, like Archagent — an agent that
                    handles architecture and interior design tasks end to end.
                    Focused on prompt engineering and shipping AI-powered web
                    applications.
                  </p>
                </article>

                {/* Linux optimization */}
                <article>
                  <div>
                    <SystemIcon />
                  </div>
                  <h3>Linux System Optimization</h3>
                  <p>
                    Daily-driving and tuning <strong>CachyOS</strong> (Arch
                    Linux), digging into system administration and performance
                    optimization, and using AI tooling to automate repetitive
                    work from my day-to-day flow.
                  </p>
                </article>
              </div>
            </section>

            {/* Status footer */}
            <footer>
              <div>
                <span>Status: Ready for new challenges</span>
                <span>Online</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}

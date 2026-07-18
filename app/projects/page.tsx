import { SITE_URL } from "@/lib/seo-config";
import { Metadata } from "next";
import Image from "next/image";
import { projects as projectsData } from "@/lib/portfolio-data";

// Enhanced SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Projects | Software Developer Portfolio",
  description:
    "Explore Srinivas RC's portfolio: Archagent, an autonomous AI agent for architecture and interior design tasks, and Language Detector, a minimalist single-page ML web application. Built with Python, LLMs, and agentic frameworks.",
  keywords: [
    "Software Developer Projects",
    "Developer Portfolio",
    "Autonomous AI Agent",
    "AI Finance Tracker",
    "Neural Network Projects",
    "Network Marketing Platform",
    "YouTube Backend Clone",
    "React TypeScript Projects",
    "MongoDB Express Projects",
    "Machine Learning Projects",
    "Python Neural Network",
    "Web Development Portfolio",
    "Node.js Projects",
    "REST API Projects",
    "Software Developer Portfolio India",
    "Next.js Projects",
    "Open Source Projects",
    "GitHub Portfolio",
  ],
  authors: [{ name: "Srinivas RC", url: SITE_URL }],
  creator: "Srinivas RC",
  publisher: "Srinivas RC",
  openGraph: {
    title: "Projects | Software Developer Portfolio",
    description:
      "Portfolio showcasing web applications, AI projects, and machine learning implementations by Srinivas RC. Built with TypeScript, Python, and modern web technologies. All projects open-source on GitHub.",
    type: "website",
    url: `${SITE_URL}/projects`,
    siteName: "Srinivas RC - Developer Portfolio",
    locale: "en_IN",
    images: [
      {
        url: `${SITE_URL}/images/logo.jpg`,
        width: 1200,
        height: 630,
        alt: "Srinivas RC - Software Developer Projects Portfolio",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
        title: "Projects | Software Developer Portfolio",
    description:
      "Agentic AI systems and machine learning web applications. Projects by a Software Developer and aspiring AI Engineer.",
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
    canonical: `${SITE_URL}/projects`,
    languages: {
      en: `${SITE_URL}/projects`,
    },
  },
  category: "Technology",
  classification: "Portfolio",
};


// Simplified SVG Icons
const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const TerminalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM3 7v12h18V7H3zm6.5 6l-2-2 2-2L8 7.5 5.5 10 8 12.5 9.5 11zm6 2h-3v-2h3v2z" />
  </svg>
);

// Enhanced JSON-LD Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Software Development Projects Portfolio",
  description:
    "Portfolio of web applications, AI, and machine learning projects by Srinivas RC",
  author: {
    "@type": "Person",
    name: "Srinivas RC",
    url: SITE_URL,
  },
  itemListElement: projectsData.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SoftwareApplication",
      name: project.name,
      description: project.description,
      applicationCategory: "WebApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      url: project.liveUrl !== "#" ? project.liveUrl : project.githubUrl,
      codeRepository: project.githubUrl,
      programmingLanguage: project.tech,
      creator: {
        "@type": "Person",
        name: "Srinivas RC",
      },
    },
  })),
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
      name: "Projects",
      item: `${SITE_URL}/projects`,
    },
  ],
};

// Main Server Component - Lightweight Version
export default function Projects() {
  return (
    <>
      {/* JSON-LD Structured Data */}
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
      {/* Copy-to-clipboard for git clone blocks (server-rendered page) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(() => {
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    return Promise.resolve();
  }

  document.addEventListener('click', async (e) => {
    const el = e.target && e.target.closest ? e.target.closest('[data-clone-cmd]') : null;
    if (!el) return;
    const cmd = el.getAttribute('data-clone-cmd');
    if (!cmd) return;
    try {
      await copyText(cmd);
      const label = el.querySelector('[data-copy-label]');
      if (label) {
        const prev = label.textContent;
        label.textContent = 'Copied!';
        setTimeout(() => { label.textContent = prev; }, 1200);
      }
    } catch {}
  });
})();
          `.trim(),
        }}
      />

      <section
        id="projects-section"
        aria-labelledby="projects-heading"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <div lang="en">
          {/* Header */}
          <header>
            <TerminalIcon />
            <h1 id="projects-heading" itemProp="name">
              Projects
            </h1>
            <span>{projectsData.length} repos</span>
          </header>

          {/* Projects Grid */}
          <div>
            {projectsData.map((project, index) => (
              <article
                key={index}
                aria-labelledby={`project-${index}-title`}
                itemScope
                itemType="https://schema.org/SoftwareApplication"
              >
                {/* Card */}
                <div>
                  {/* Terminal header bar */}
                  <header>
                    <div aria-hidden="true">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <div>
                      <span>
                        {project.name.toLowerCase().replace(/\s+/g, "-")}
                      </span>
                    </div>
                  </header>

                  {/* Project Image */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "300px",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={project.imageUrl}
                      alt={`${project.name} - Full-stack web application screenshot`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      priority
                      loading="eager"
                    />
                  </div>

                  {/* Project Content */}
                  <div>
                    <div>
                      <h2 id={`project-${index}-title`} itemProp="name">
                        {project.name}
                      </h2>
                    </div>

                    {/* Tech stack badges */}
                    <div role="list" aria-label="Technologies used">
                      {project.tech.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          role="listitem"
                          itemProp="programmingLanguage"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <p itemProp="description">{project.description}</p>

                    {/* Terminal command */}
                    <div
                      data-clone-cmd={`git clone ${project.githubUrl}.git`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Copy git clone command for ${project.name}`}
                      style={{
                        marginTop: "12px",
                        padding: "10px 12px",
                        border: "1px solid rgba(34,211,238,0.25)",
                        borderRadius: "8px",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        cursor: "pointer",
                        userSelect: "none",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ color: "#22d3ee" }} aria-hidden="true">
                        $
                      </span>
                      <span style={{ color: "#9ca3af" }}>git clone</span>
                      <span style={{ color: "#60a5fa", wordBreak: "break-all", flex: "1 1 auto" }}>
                        {project.githubUrl}.git
                      </span>
                      <span
                        data-copy-label
                        style={{ color: "rgba(229,231,235,0.8)", fontSize: "12px", whiteSpace: "nowrap" }}
                      >
                        Click to copy
                      </span>
                    </div>

                    {/* Links Section */}
                    <footer>
                      <nav aria-label="Project links">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${project.name} live demo`}
                          itemProp="url"
                        >
                          <ExternalLinkIcon />
                          <span>live</span>
                        </a>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${project.name} source code on GitHub`}
                          itemProp="codeRepository"
                        >
                          <GitHubIcon />
                          <span>code</span>
                        </a>
                      </nav>

                      {/* Status indicator */}
                      <div>
                        <div></div>
                        <span>active</span>
                      </div>
                    </footer>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary footer */}
          <footer>
            <div>
              <span>Total projects: {projectsData.length}</span>
              <div>
                <div></div>
                <span>All repositories active</span>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}

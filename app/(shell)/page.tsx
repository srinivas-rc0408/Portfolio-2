"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import TerminalComp from "@/components/TerminalComp";
import { useShell } from "@/context/ShellContext";
import { SITE_URL } from "@/lib/seo-config";
import { CONTACT_EMAIL } from "@/lib/portfolio-data";

function HomeTerminal() {
  const searchParams = useSearchParams();
  const { setHideIdentityOnMobile } = useShell();
  const section = searchParams.get("section");
  const cmd = searchParams.get("cmd");

  const handleFirstCommand = (): void => {
    setHideIdentityOnMobile(true);
  };

  return (
    <TerminalComp
      onFirstCommand={handleFirstCommand}
      initialSection={section}
      initialCommand={cmd}
    />
  );
}

export default function Home() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Srinivas RC",
    jobTitle: "Software Developer & AI Engineer",
    description:
      "Computer Science Engineering undergraduate building web applications powered by Large Language Models and agentic systems",
    image: `${SITE_URL}/images/logo.jpg`,
    email: CONTACT_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "India",
    },
    knowsAbout: [
      "Python",
      "Machine Learning",
      "Large Language Models",
      "Agentic Frameworks",
      "CrewAI",
      "Prompt Engineering",
      "Linux Administration",
      "AI Engineering",
    ],
    sameAs: ["https://github.com/srinivas-rc0408"],
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "REVA University",
      sameAs: "https://www.reva.edu.in/",
    },
    workLocation: {
      "@type": "Place",
      name: "Bengaluru, Karnataka, India",
    },
    url: `${SITE_URL}/`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Srinivas RC",
    alternateName: "Srinivas RC Portfolio",
    url: SITE_URL,
    description:
      "Software Developer & AI Engineer portfolio showcasing projects, skills, experience, and a developer blog.",
    inLanguage: "en-IN",
    creator: {
      "@type": "Person",
      name: "Srinivas RC",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Srinivas RC",
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Script
        id="person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <HomeTerminal />
      </Suspense>
      <Script
        id="seo-meta-tags"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              const metaDescription = document.querySelector('meta[name="description"]');
              if (!metaDescription) {
                const meta = document.createElement('meta');
                meta.name = 'description';
                meta.content = 'Software Developer & AI Engineer from Bengaluru, India. Building web applications powered by Large Language Models (LLMs) and agentic systems.';
                document.head.appendChild(meta);
              }
            }
          `,
        }}
      />
    </>
  );
}

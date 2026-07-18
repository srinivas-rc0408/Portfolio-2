import { SITE_URL } from "@/lib/seo-config";
import { CONTACT_EMAIL } from "@/lib/portfolio-data";
import HomeTerminal from "@/components/HomeTerminal";

/**
 * Home page — a server component so the JSON-LD is in the initial HTML (best
 * for crawlers, and no client "script tag in a component" warning). The
 * interactive terminal is a client child (HomeTerminal).
 */
export default function Home() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Srinivas RC",
    jobTitle: "AI / ML Engineer",
    description:
      "AI / ML Engineer building web applications powered by Large Language Models and agentic systems",
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
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    ],
  };

  // WebSite schema lives site-wide in the root layout — not duplicated here.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HomeTerminal />
    </>
  );
}

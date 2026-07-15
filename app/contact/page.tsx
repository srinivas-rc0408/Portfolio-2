import { Metadata } from "next";
import {
  socialLinks as socialLinkData,
  CONTACT_EMAIL,
  RESUME_URL,
} from "@/lib/portfolio-data";

// Enhanced SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Contact | Get in Touch with Software Developer",
  description:
    "Connect with Srinivas RC for collaboration opportunities, project inquiries, and technical discussions. Software developer based in Bengaluru, Karnataka, India. Available for development projects, API development, and machine learning collaborations. Response time less than 24 hours.",
  keywords: [
    "Contact Software Developer",
    "Hire Software Developer",
    "Software Developer Contact",
    "Web Development Services",
    "AI Engineer Bengaluru",
    "Software Developer India",
    "TypeScript Developer Contact",
    "MongoDB Expert Contact",
    "React Developer Hire",
    "Node.js Developer Contact",
    "Freelance Developer India",
    "AI Engineer Karnataka",
    "API Development Services",
    "Next.js Developer Contact",
    "Machine Learning Developer Contact",
    "Developer Portfolio Contact",
  ],
  authors: [{ name: "Srinivas RC", url: "http://localhost:3000" }],
  creator: "Srinivas RC",
  publisher: "Srinivas RC",
  openGraph: {
    title: "Contact | Get in Touch with Software Developer",
    description:
      "Connect with Srinivas RC for collaboration opportunities. Available for full-stack development, API development, and machine learning projects. Based in Bengaluru, Karnataka, India.",
    type: "website",
    url: "http://localhost:3000/contact",
    siteName: "Srinivas RC - Developer Portfolio",
    locale: "en_IN",
    images: [
      {
        url: "http://localhost:3000/images/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Srinivas RC - Contact Software Developer",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
        title: "Contact | Get in Touch with Software Developer",
    description:
      "Connect with Srinivas RC for project collaborations and development opportunities. Available for hire.",
    images: ["http://localhost:3000/images/logo.jpg"],
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
    canonical: "http://localhost:3000/contact",
    languages: {
      en: "http://localhost:3000/contact",
    },
  },
  category: "Technology",
  classification: "Contact Page",
};

// Type definitions
interface SocialLink {
  icon: () => React.ReactNode;
  name: string;
  href: string;
  color: string;
}

// Simplified SVG Icons
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const YoutubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect width="4" height="12" x="2" y="9"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
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

const LeetcodeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" x2="20" y1="19" y2="19"></line>
  </svg>
);

const ResumeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7,10 12,15 17,10"></polyline>
    <line x1="12" x2="12" y1="15" y2="3"></line>
  </svg>
);

const SteamIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="15.5" cy="8.5" r="2.5" />
    <circle cx="8.5" cy="15" r="2" />
    <path d="m13.7 10.5-4 3.2" />
  </svg>
);

// Enhanced JSON-LD Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Srinivas RC",
  url: "http://localhost:3000",
  image: "http://localhost:3000/images/logo.jpg",
  email: CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  sameAs: [
    "https://github.com/srinivas-rc0408",
  ],
  jobTitle: "Software Developer",
  description:
    "Software Developer & AI Engineer from Bengaluru, India building web applications powered by LLMs and agentic systems. Open to internships and placements.",
  availability: "Available for hire",
  workLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: CONTACT_EMAIL,
    contactType: "Professional",
    areaServed: "Worldwide",
    availableLanguage: ["English"],
  },
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
      item: "http://localhost:3000",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Contact",
      item: "http://localhost:3000/contact",
    },
  ],
};

// Main Server Component - Lightweight Version
export default function Contact() {
  // Link metadata (name/href/color) is shared; icons stay local to this page.
  const socialIcons: Record<string, () => React.ReactNode> = {
    YouTube: YoutubeIcon,
    "Twitter / X": TwitterIcon,
    Instagram: InstagramIcon,
    "Instagram (Personal)": InstagramIcon,
    LinkedIn: LinkedinIcon,
    GitHub: GithubIcon,
    LeetCode: LeetcodeIcon,
    Steam: SteamIcon,
  };

  // Skip any link without a matching icon so we never render <undefined />.
  const socialLinks: SocialLink[] = socialLinkData
    .filter((link) => socialIcons[link.name])
    .map((link) => ({ ...link, icon: socialIcons[link.name] }));

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

      <div lang="en">
        <div>
          <article aria-labelledby="contact-heading">
            {/* Header */}
            <header>
              <h1 id="contact-heading" itemProp="name">
                <span>$</span> Contact
              </h1>
            </header>

            {/* Status message */}
            <div>
              <p>
                <span>&gt;</span> Establishing secure connection...
              </p>
              <p>
                Ready to collaborate on innovative projects and opportunities.
              </p>
            </div>

            <div>
              {/* Direct Contact Section */}
              <section
                id="direct-contact"
                aria-labelledby="direct-contact-heading"
                itemScope
                itemType="https://schema.org/ContactPage"
              >
                <div>
                  <h2 id="direct-contact-heading">Direct Contact</h2>
                </div>

                {/* Email */}
                <div itemScope itemType="https://schema.org/ContactPoint">
                  <div>
                    <div>
                      <MailIcon />
                    </div>
                    <div>
                      <p>EMAIL</p>
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        itemProp="email"
                      >
                        {CONTACT_EMAIL}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div itemScope itemType="https://schema.org/PostalAddress">
                  <div>
                    <div>
                      <LocationIcon />
                    </div>
                    <div>
                      <p>LOCATION</p>
                      <p>
                        <span itemProp="addressLocality">Bengaluru</span>,{" "}
                        <span itemProp="addressRegion">Karnataka</span>,{" "}
                        <span itemProp="addressCountry">India</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resume Button */}
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download resume (opens in new tab)"
                >
                  <div>
                    <div>
                      <ResumeIcon />
                    </div>
                    <div>
                      <p>RESUME</p>
                      <p>Download CV</p>
                    </div>
                    <div>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" x2="12" y1="15" y2="3"></line>
                      </svg>
                    </div>
                  </div>
                </a>
              </section>

              {/* Social Links Section */}
              <section id="social-links" aria-labelledby="social-links-heading">
                <div>
                  <h2 id="social-links-heading">Social Links</h2>
                </div>

                <nav aria-label="Social media links">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${social.name} profile (opens in new tab)`}
                    >
                      <div>
                        <div>
                          <social.icon />
                        </div>
                        <span>{social.name}</span>
                      </div>
                    </a>
                  ))}
                </nav>
              </section>
            </div>

            {/* Status footer */}
            <footer>
              <div>
                <div>
                  <span>✓ Available for collaboration</span>
                  <span>|</span>
                  <span>Response time: &lt;24hrs</span>
                </div>
                <div>
                  <span>Online</span>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}

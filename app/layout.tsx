import type { Metadata } from "next";
import { jsonLd } from "@/lib/jsonld";
import { cache } from "react";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/seo-config";
import ThemeApplier from "@/components/ThemeApplier";
import { getSettings } from "@/lib/db";
import "./globals.css";

/** #rrggbb → "r, g, b" (falls back to the default green). */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n) || full.length < 6) return "255, 255, 255";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * Resolve the admin-chosen accent server-side (deduped per request). Injected
 * as an inline style on <html> so the FIRST paint — including the boot overlay
 * — always matches the DB theme on every device / first visit, with no
 * localStorage lag. Falls back to the default green if the DB is unavailable so
 * a data outage never breaks page render.
 */
const resolveAccent = cache(async (): Promise<string> => {
  try {
    const { themeAccent } = await getSettings();
    return /^#[0-9a-fA-F]{3,8}$/.test(themeAccent) ? themeAccent : "#ffffff";
  } catch {
    return "#ffffff";
  }
});

// Single site font — JetBrains Mono everywhere (mapped to `font-mono` and the
// body font-family in globals.css).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Single source of truth — SITE_URL already resolves the stable prod domain.
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Srinivas RC — AI / ML Engineer from Bengaluru, India. Builds and ships LLM-powered web applications and agentic systems (Google Gemini, prompt pipelines, React/Next.js), with a strong grounding in machine learning, MLOps, and Linux.",
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
    "Developer Portfolio",
    "AIML Student",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  formatDetection: {
    email: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      "AI / ML Engineer building web applications powered by LLMs and agentic systems. Based in Bengaluru, Karnataka, India.",
    images: [
      {
        url: "/images/logo.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      "AI / ML Engineer building web applications powered by LLMs and agentic systems.",
    images: ["/images/logo.jpg"],
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
    canonical: SITE_URL,
    types: {
      "application/rss+xml": [
        { url: `${SITE_URL}/blog/rss.xml`, title: `${SITE_NAME} — Blog RSS` },
      ],
    },
  },
  referrer: "strict-origin-when-cross-origin",
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accent = await resolveAccent();
  const accentRgb = hexToRgb(accent);

  return (
    // Theme accent is injected inline on <html> (server-rendered from the DB),
    // so first paint + the boot overlay always match the chosen color with no
    // flash or localStorage lag. suppressHydrationWarning: ThemeApplier keeps
    // this in sync client-side for live cross-tab changes.
    <html
      lang="en"
      suppressHydrationWarning
      style={
        {
          "--accent": accent,
          "--accent-rgb": accentRgb,
          "--theme-accent": accent,
          "--theme-accent-rgb": accentRgb,
        } as React.CSSProperties
      }
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="application-name" content={`${SITE_NAME} - Developer`} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <link rel="icon" href="/images/logo.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href={SITE_URL} />
        <link
          rel="alternate"
          type="text/plain"
          title="LLMs Description"
          href={`${SITE_URL}/llms.txt`}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE_NAME} — Blog (RSS)`}
          href={`${SITE_URL}/blog/rss.xml`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              alternateName: `${SITE_NAME} Portfolio`,
              url: `${SITE_URL}/`,
              inLanguage: "en-IN",
              publisher: {
                "@type": "Person",
                name: SITE_NAME,
                url: `${SITE_URL}/`,
              },
            }),
          }}
        />
      </head>
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        <ThemeApplier />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

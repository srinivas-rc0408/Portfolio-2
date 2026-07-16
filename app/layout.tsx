import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/seo-config";
import ThemeApplier from "@/components/ThemeApplier";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : SITE_URL)
  ),
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Computer Science Engineering undergraduate and Software Developer and aspiring AI Engineer from Bengaluru, India. Building and deploying web applications powered by Large Language Models (LLMs) and agentic systems. Passionate about Linux system optimization with CachyOS.",
  keywords: [
    "AI Engineer",
    "Software Developer & AI Engineer",
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
      "Software Developer & AI Engineer building web applications powered by LLMs and agentic systems. Based in Bengaluru, Karnataka, India.",
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
      "Software Developer & AI Engineer building web applications powered by LLMs and agentic systems.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the pre-paint theme script mutates the html
    // style attribute before React hydrates (standard next-themes pattern).
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the cached theme accent BEFORE first paint — kills the
            default-cyan flash on every page (incl. the admin login). */}
        <Script
          id="theme-accent-prepaint"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem("portfolio:settings")||"{}");var a=s.themeAccent;if(typeof a==="string"&&/^#[0-9a-fA-F]{3,8}$/.test(a)){var r=document.documentElement;r.style.setProperty("--theme-accent",a);var h=a.slice(1);if(h.length===3)h=h.split("").map(function(c){return c+c}).join("");var n=parseInt(h.slice(0,6),16);if(!isNaN(n))r.style.setProperty("--theme-accent-rgb",((n>>16)&255)+", "+((n>>8)&255)+", "+(n&255));}}catch(e){}`,
          }}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
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
            __html: JSON.stringify({
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeApplier />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

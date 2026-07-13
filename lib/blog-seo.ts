import type { Metadata } from "next";
import type { BlogPost, BlogPostMeta } from "@/lib/blog";
import {
  AUTHOR_URL,
  BLOG_CANONICAL,
  BLOG_DESCRIPTION,
  BLOG_RSS_URL,
  LOGO_URL,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  postOgImageUrl,
  readingTimeMinutes,
  toIsoDateTime,
} from "@/lib/seo-config";

export function buildBlogIndexMetadata(): Metadata {
  return {
    title: "Blog — Developer Notes & Engineering Essays",
    description: BLOG_DESCRIPTION,
    keywords: [
      "Srinivas RC Blog",
      "Software Developer Blog India",
      "Backend Engineering Blog",
      "System Design Blog",
      "WebRTC Developer Blog",
      "Open Source Security",
      "Supply Chain Attack",
      "Malware Awareness Developers",
      "AI Calling Engineering",
      "Developer Portfolio Blog",
    ],
    authors: [{ name: SITE_NAME, url: AUTHOR_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",
    alternates: {
      canonical: BLOG_CANONICAL,
      types: {
        "application/rss+xml": [{ url: BLOG_RSS_URL, title: `${SITE_NAME} Blog RSS` }],
      },
    },
    openGraph: {
      type: "website",
      url: BLOG_CANONICAL,
      title: `Blog | ${SITE_NAME}`,
      description: BLOG_DESCRIPTION,
      siteName: SITE_NAME,
      locale: "en_IN",
      images: [
        {
          url: LOGO_URL,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Developer Blog`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: `Blog | ${SITE_NAME}`,
      description: BLOG_DESCRIPTION,
      images: [LOGO_URL],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildPostMetadata(post: BlogPost): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const description = post.excerpt ?? post.title;
  const published = toIsoDateTime(post.date);
  const modified = toIsoDateTime(post.updated ?? post.date);
  const keywords = [
    ...(post.tags ?? []),
    ...(post.keywords ?? []),
    "Srinivas RC",
    "Developer Blog",
  ];
  const ogImage = postOgImageUrl(post.slug);

  return {
    title: post.title,
    description,
    keywords,
    authors: [{ name: SITE_NAME, url: AUTHOR_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: post.tags?.[0] ?? "technology",
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: SITE_NAME,
      locale: "en_IN",
      publishedTime: published,
      modifiedTime: modified,
      authors: [SITE_NAME],
      section: post.tags?.[0],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${post.title} — ${SITE_NAME}`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: post.title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildBlogIndexJsonLd(posts: BlogPostMeta[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: SITE_NAME,
        url: SITE_URL,
        image: LOGO_URL,
        sameAs: [
          "https://github.com/srinivas-rc0408",
        ],
      },
      {
        "@type": "Blog",
        "@id": `${BLOG_CANONICAL}#blog`,
        url: BLOG_CANONICAL,
        name: `${SITE_NAME} — Blog`,
        description: BLOG_DESCRIPTION,
        inLanguage: "en-IN",
        author: { "@id": `${SITE_URL}/#person` },
        publisher: { "@id": `${SITE_URL}/#person` },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          "@id": `${SITE_URL}/blog/${p.slug}#article`,
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: toIsoDateTime(p.date),
          description: p.excerpt ?? p.title,
          keywords: p.tags?.join(", "),
        })),
      },
      {
        "@type": "CollectionPage",
        "@id": `${BLOG_CANONICAL}#webpage`,
        url: BLOG_CANONICAL,
        name: `Blog | ${SITE_NAME}`,
        description: BLOG_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${BLOG_CANONICAL}#blog` },
        inLanguage: "en-IN",
        mainEntity: { "@id": `${BLOG_CANONICAL}#blog` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${BLOG_CANONICAL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_CANONICAL },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${BLOG_CANONICAL}#postlist`,
        name: "Blog posts",
        numberOfItems: posts.length,
        itemListElement: posts.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
        })),
      },
    ],
  };
}

export function buildPostJsonLd(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const published = toIsoDateTime(post.date);
  const modified = toIsoDateTime(post.updated ?? post.date);
  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = readingTimeMinutes(post.content);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
      },
      {
        "@type": "Blog",
        "@id": `${BLOG_CANONICAL}#blog`,
        url: BLOG_CANONICAL,
        name: `${SITE_NAME} — Blog`,
      },
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        name: post.title,
        description: post.excerpt ?? post.title,
        image: [postOgImageUrl(post.slug), LOGO_URL],
        datePublished: published,
        dateModified: modified,
        author: {
          "@type": "Person",
          name: SITE_NAME,
          url: AUTHOR_URL,
        },
        publisher: {
          "@type": "Person",
          name: SITE_NAME,
          url: AUTHOR_URL,
          logo: {
            "@type": "ImageObject",
            url: LOGO_URL,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        isPartOf: { "@id": `${BLOG_CANONICAL}#blog` },
        url,
        keywords: [...(post.tags ?? []), ...(post.keywords ?? [])].join(", "),
        articleSection: post.tags?.[0],
        inLanguage: "en-IN",
        wordCount,
        timeRequired: `PT${minutes}M`,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_CANONICAL },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}

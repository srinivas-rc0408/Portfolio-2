import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { postOgImageUrl } from "@/lib/seo-config";
import {
  BLOG_CANONICAL,
  BLOG_DESCRIPTION,
  BLOG_RSS_URL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo-config";

export const dynamic = "force-static";

const EMAIL = "srinivasrc0408@gmail.com";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  if (!dateStr) return new Date().toUTCString();
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export async function GET() {
  const posts = getAllPosts();
  const latest = posts[0]?.date ? toRfc822(posts[0].date) : new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const description = p.excerpt ?? p.title;
      const ogImage = postOgImageUrl(p.slug);
      const categories = (p.tags ?? [])
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");
      const keywordMeta = (p.keywords ?? [])
        .map((k) => `      <category domain="keyword">${escapeXml(k)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(p.date)}</pubDate>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${description}]]></content:encoded>
      <dc:creator>${escapeXml(SITE_NAME)}</dc:creator>
      <enclosure url="${escapeXml(ogImage)}" type="image/png" length="0"/>
${categories}
${keywordMeta}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Developer Blog</title>
    <link>${BLOG_CANONICAL}</link>
    <atom:link href="${BLOG_RSS_URL}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>en-IN</language>
    <copyright>Copyright ${new Date().getFullYear()} ${escapeXml(SITE_NAME)}</copyright>
    <managingEditor>${EMAIL} (${escapeXml(SITE_NAME)})</managingEditor>
    <webMaster>${EMAIL} (${escapeXml(SITE_NAME)})</webMaster>
    <lastBuildDate>${latest}</lastBuildDate>
    <generator>Next.js</generator>
    <image>
      <url>${escapeXml(`${SITE_URL}/images/logo.jpg`)}</url>
      <title>${escapeXml(SITE_NAME)} Blog</title>
      <link>${BLOG_CANONICAL}</link>
    </image>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

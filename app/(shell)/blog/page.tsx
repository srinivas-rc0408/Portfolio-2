import Script from "next/script";
import { jsonLd as jsonLdScript } from "@/lib/jsonld";
import BlogTerminalPage from "@/components/BlogTerminalPage";
import { getAllPosts } from "@/lib/blog";
import { buildBlogIndexJsonLd } from "@/lib/blog-seo";
import { BLOG_CANONICAL, SITE_URL } from "@/lib/seo-config";

import { buildBlogIndexMetadata } from "@/lib/blog-seo";

export const metadata = buildBlogIndexMetadata();

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const jsonLd = buildBlogIndexJsonLd(posts);

  return (
    <>
      <Script
        id="blog-index-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <nav className="sr-only" aria-label="Blog posts index for search engines">
        <h1>Srinivas RC — Developer Blog</h1>
        <p>
          Essays on backend engineering, system design, WebRTC/SIP, open-source
          security, and developer tooling.
        </p>
        <ul>
          {posts.map((p) => (
            <li key={p.slug}>
              <a href={`${SITE_URL}/blog/${p.slug}`}>{p.title}</a>
              {p.excerpt && <p>{p.excerpt}</p>}
              {p.date && <time dateTime={p.date}>{p.date}</time>}
            </li>
          ))}
        </ul>
        <a href={BLOG_CANONICAL}>All posts</a>
      </nav>
      <BlogTerminalPage slug={null} />
    </>
  );
}

import Script from "next/script";
import { jsonLd as jsonLdScript } from "@/lib/jsonld";
import { notFound } from "next/navigation";
import BlogTerminalPage from "@/components/BlogTerminalPage";
import BlogSeoArticle from "@/components/BlogSeoArticle";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { buildPostJsonLd, buildPostMetadata } from "@/lib/blog-seo";
import { renderPostHtml } from "@/lib/render-post";
import { BLOG_CANONICAL, SITE_URL } from "@/lib/seo-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  return buildPostMetadata(post);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await renderPostHtml(post.content);
  const url = `${SITE_URL}/blog/${slug}`;
  const jsonLd = buildPostJsonLd(post);

  const initialPost = {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    html,
  };

  return (
    <>
      <Script
        id={`article-jsonld-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <nav className="sr-only" aria-label="Article navigation">
        <a href={BLOG_CANONICAL}>← Blog index</a>
        <h1>{post.title}</h1>
        {post.excerpt && <p>{post.excerpt}</p>}
      </nav>
      <BlogSeoArticle
        slug={slug}
        title={post.title}
        date={post.date}
        excerpt={post.excerpt}
        html={html}
        url={url}
      />
      <BlogTerminalPage slug={slug} initialPost={initialPost} />
    </>
  );
}

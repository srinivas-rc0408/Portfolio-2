import { NextResponse } from "next/server";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { renderPostHtml } from "@/lib/render-post";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const html = await renderPostHtml(post.content);

  return NextResponse.json({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    html,
  });
}

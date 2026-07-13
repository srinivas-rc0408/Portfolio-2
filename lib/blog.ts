import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface BlogFrontmatter {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  /** Optional last-updated date (ISO) for dateModified in SEO */
  updated?: string;
  /** Extra SEO keywords beyond tags */
  keywords?: string[];
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  content: string;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function readPostFile(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    updated: data.updated ? String(data.updated) : undefined,
    keywords: Array.isArray(data.keywords)
      ? data.keywords.map(String)
      : undefined,
    content,
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllPosts(): BlogPostMeta[] {
  return getAllPostSlugs()
    .map((slug): BlogPostMeta | null => {
      const post = readPostFile(slug);
      if (!post) return null;
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        tags: post.tags,
        updated: post.updated,
        keywords: post.keywords,
      };
    })
    .filter((p): p is BlogPostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  return readPostFile(slug);
}

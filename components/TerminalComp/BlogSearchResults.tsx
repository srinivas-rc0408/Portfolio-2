"use client";

import Link from "next/link";
import {
  formatBlogPostLabel,
  type BlogSearchPost,
} from "@/lib/blog-search";

interface BlogSearchResultsProps {
  posts: BlogSearchPost[];
  query?: string;
}

export default function BlogSearchResults({
  posts,
  query,
}: BlogSearchResultsProps) {
  if (posts.length === 0) {
    return (
      <p className="text-gray-400 font-mono text-sm">
        No blog posts found{query ? ` for "${query}"` : ""}.
      </p>
    );
  }

  return (
    <div className="blog-search-results font-mono text-sm">
      <p className="text-white/90 mb-2">
        $ blog search{query ? ` "${query}"` : ""} — {posts.length} result
        {posts.length === 1 ? "" : "s"}
      </p>
      <ul className="space-y-2 list-none p-0 m-0">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="block border border-cyan-800/40 bg-gradient-to-br from-cyan-900/10 to-black/40 hover:border-[var(--accent)] rounded-lg p-3 transition-colors group"
            >
              <span className="text-white font-semibold group-hover:text-white">
                {formatBlogPostLabel(p.title)}
              </span>
              {p.excerpt && (
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {p.excerpt}
                </p>
              )}
              <span className="text-white/70 text-xs mt-2 inline-block">
                → /blog/{p.slug}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

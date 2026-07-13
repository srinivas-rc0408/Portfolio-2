export interface BlogSearchPost {
  slug: string;
  title: string;
  excerpt?: string;
  tags?: string[];
}

export function formatBlogPostLabel(title: string): string {
  return `${title} (blog)`;
}

export function searchBlogPosts(
  posts: BlogSearchPost[],
  query: string,
  limit = 8
): BlogSearchPost[] {
  const q = query.trim().toLowerCase();
  if (!q) return posts.slice(0, limit);

  return posts
    .map((post) => {
      const title = post.title.toLowerCase();
      const slug = post.slug.toLowerCase();
      const excerpt = (post.excerpt ?? "").toLowerCase();
      const tagStr = (post.tags ?? []).join(" ").toLowerCase();

      let score = 0;
      if (title === q || slug === q) score += 100;
      if (title.startsWith(q)) score += 40;
      if (slug.startsWith(q)) score += 35;
      if (title.includes(q)) score += 25;
      if (slug.includes(q)) score += 20;
      if (excerpt.includes(q)) score += 10;
      if (tagStr.includes(q)) score += 8;

      const words = q.split(/\s+/).filter(Boolean);
      for (const w of words) {
        if (title.includes(w)) score += 5;
        if (slug.includes(w)) score += 4;
      }

      return { post, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}

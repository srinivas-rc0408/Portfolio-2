import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { BLOG_CANONICAL, BLOG_RSS_URL, SITE_URL } from "@/lib/seo-config";

const now = new Date();

function postPriority(index: number): number {
  if (index === 0) return 0.85;
  if (index === 1) return 0.8;
  return 0.72;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPostDate = posts[0]?.date ? new Date(posts[0].date) : now;

  const blogPosts: MetadataRoute.Sitemap = posts.map((post, index) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated
      ? new Date(post.updated)
      : post.date
        ? new Date(post.date)
        : now,
    changeFrequency: index < 2 ? "weekly" : "monthly",
    priority: postPriority(index),
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/skills`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/experience`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: BLOG_CANONICAL,
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: BLOG_RSS_URL,
      lastModified: latestPostDate,
      changeFrequency: "daily",
      priority: 0.55,
    },
    ...blogPosts,
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: latestPostDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}

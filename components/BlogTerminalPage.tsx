"use client";

import TerminalComp from "@/components/TerminalComp";
import type { BlogInitialPost } from "@/components/BlogTerminalPage.types";

export type { BlogInitialPost } from "@/components/BlogTerminalPage.types";

interface BlogTerminalPageProps {
  slug?: string | null;
  initialPost?: BlogInitialPost | null;
}

export default function BlogTerminalPage({
  slug = null,
  initialPost = null,
}: BlogTerminalPageProps) {
  return (
    <TerminalComp
      blogRoute
      initialBlogSlug={slug}
      initialBlogPost={initialPost}
    />
  );
}

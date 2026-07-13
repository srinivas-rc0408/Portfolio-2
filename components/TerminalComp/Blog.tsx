"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatBlogPostLabel } from "@/lib/blog-search";
import type { BlogInitialPost } from "@/components/BlogTerminalPage.types";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
}

interface FullPost extends PostMeta {
  html: string;
}

type LoadState = "loading" | "ready" | "error";

function formatPostDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface BlogProps {
  slug?: string | null;
  initialPost?: BlogInitialPost | null;
  syncUrls?: boolean;
}

function rankRecommendations(
  current: PostMeta,
  pool: PostMeta[],
  limit = 3
): PostMeta[] {
  const currentTags = new Set(current.tags ?? []);
  return pool
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      const overlap = (p.tags ?? []).reduce(
        (acc, t) => acc + (currentTags.has(t) ? 1 : 0),
        0
      );
      return { post: p, overlap };
    })
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return a.post.date < b.post.date ? 1 : -1;
    })
    .slice(0, limit)
    .map((x) => x.post);
}

const WORD_REVEAL_MAX_WORDS = 400;

function applyWordReveal(root: HTMLElement): void {
  if (root.dataset.wordsWalked === "1") return;
  root.dataset.wordsWalked = "1";

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const parent = (n as Text).parentElement;
    if (!parent) continue;
    if (parent.closest("code, pre, a")) continue;
    if (n.textContent && n.textContent.trim()) textNodes.push(n as Text);
  }

  let totalWords = 0;
  const splitCache: string[][] = textNodes.map((tn) => {
    const parts = (tn.textContent || "").split(/(\s+)/);
    totalWords += parts.filter((p) => p && !/^\s+$/.test(p)).length;
    return parts;
  });

  if (totalWords > WORD_REVEAL_MAX_WORDS) {
    return;
  }

  const perWordMs = Math.min(28, Math.max(6, 3000 / Math.max(1, totalWords)));

  let wordIdx = 0;
  textNodes.forEach((tn, i) => {
    const parts = splitCache[i];
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement("span");
        span.className = "blog-word";
        span.style.setProperty("--d", `${Math.round(wordIdx * perWordMs)}ms`);
        span.textContent = part;
        frag.appendChild(span);
        wordIdx++;
      }
    });
    tn.parentNode?.replaceChild(frag, tn);
  });
}

interface RecommendationsProps {
  items: PostMeta[];
  syncUrls: boolean;
  onSelect: (slug: string) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  items,
  syncUrls,
  onSelect,
}) => {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="More posts to read"
      className="terminal-blog-read-next mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-cyan-800/40"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white font-mono text-sm sm:text-base">
          $ ls ./read-next/
        </span>
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
      </div>
      <p className="text-gray-500 font-mono text-xs sm:text-sm mb-3">
        Continue reading — pick another post:
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 list-none p-0 m-0">
        {items.map((p) => (
          <li key={p.slug}>
            {syncUrls ? (
              <Link
                href={`/blog/${p.slug}`}
                className="block w-full h-full text-left border border-cyan-800/40 bg-gradient-to-br from-cyan-900/10 to-black/40 hover:border-cyan-400/60 transition-colors rounded-lg p-3 cursor-pointer group"
              >
                <PostCardContent post={p} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onSelect(p.slug)}
                className="w-full h-full text-left border border-cyan-800/40 bg-gradient-to-br from-cyan-900/10 to-black/40 hover:border-cyan-400/60 transition-colors rounded-lg p-3 cursor-pointer group"
              >
                <PostCardContent post={p} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

function PostCardContent({
  post: p,
  showBlogLabel = false,
}: {
  post: PostMeta;
  showBlogLabel?: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm text-white font-semibold font-mono group-hover:text-white transition-colors break-words">
          {showBlogLabel ? formatBlogPostLabel(p.title) : p.title}
        </h4>
        {p.date && (
          <time
            dateTime={p.date}
            className="shrink-0 text-[11px] text-gray-500 font-mono"
          >
            {formatPostDate(p.date)}
          </time>
        )}
      </div>
      {p.excerpt && (
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
          {p.excerpt}
        </p>
      )}
      {p.tags && p.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {p.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-cyan-900/30 border border-cyan-800/50 rounded-full text-white text-[10px] font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-white/80 font-mono text-xs group-hover:text-white">
        → open post
      </p>
    </>
  );
}

const Blog: React.FC<BlogProps> = ({
  slug: slugProp = null,
  initialPost = null,
  syncUrls = false,
}) => {
  const router = useRouter();
  const [internalSlug, setInternalSlug] = useState<string | null>(null);
  const activeSlug = syncUrls ? slugProp : internalSlug;

  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [listState, setListState] = useState<LoadState>("loading");
  const [post, setPost] = useState<FullPost | null>(null);
  const [postState, setPostState] = useState<LoadState>("ready");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [notFound, setNotFound] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLDivElement | null>(null);

  const goToSlug = (next: string | null) => {
    if (syncUrls) {
      if (next) router.push(`/blog/${next}`);
      else router.push("/blog");
      return;
    }
    setInternalSlug(next);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blog");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { posts: PostMeta[] } = await res.json();
        if (!cancelled) {
          setPosts(data.posts);
          setListState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
          setListState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeSlug) {
      setPost(null);
      setPostState("ready");
      return;
    }

    if (initialPost && initialPost.slug === activeSlug) {
      setPost(initialPost);
      setPostState("ready");
      setNotFound(false);
      return;
    }

    let cancelled = false;
    setPostState("loading");
    setNotFound(false);
    (async () => {
      try {
        const res = await fetch(`/api/blog/${activeSlug}`);
        if (res.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setPostState("error");
          }
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: FullPost = await res.json();
        if (!cancelled) {
          setPost(data);
          setPostState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
          setPostState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSlug, initialPost]);

  useEffect(() => {
    if (postState !== "ready" || !post || !contentRef.current) return;
    applyWordReveal(contentRef.current);
    contentRef.current.querySelectorAll("a").forEach((anchor) => {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    });
    const scrollParent = articleRef.current?.closest(".terminal-body");
    const article = articleRef.current;
    if (scrollParent instanceof HTMLElement && article) {
      const parentRect = scrollParent.getBoundingClientRect();
      const articleRect = article.getBoundingClientRect();
      const top =
        scrollParent.scrollTop + (articleRect.top - parentRect.top) - 8;
      scrollParent.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [postState, post, activeSlug]);

  useEffect(() => {
    if (!activeSlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      goToSlug(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlug, syncUrls]);

  if (activeSlug) {
    return (
      <div className="terminal-blog" ref={articleRef}>
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          {syncUrls ? (
            <Link
              href="/blog"
              title="Press Esc to go back"
              className="text-xs sm:text-sm text-white/80 font-mono hover:text-white transition-colors py-1"
            >
              ← back to posts{" "}
              <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 text-[10px] border border-cyan-800/60 rounded bg-black/40 text-white/70">
                Esc
              </kbd>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => goToSlug(null)}
              title="Press Esc to go back"
              className="text-xs sm:text-sm text-white/80 font-mono hover:text-white transition-colors cursor-pointer py-1"
            >
              ← back to posts{" "}
              <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 text-[10px] border border-cyan-800/60 rounded bg-black/40 text-white/70">
                Esc
              </kbd>
            </button>
          )}
          {post && (
            <span className="text-xs sm:text-sm text-gray-500 font-mono truncate min-w-0">
              {post.slug}.mdx
            </span>
          )}
        </div>

        {postState === "loading" && (
          <p className="text-white/70 font-mono text-sm">Loading post…</p>
        )}
        {postState === "error" && notFound && (
          <p className="text-red-400 font-mono text-sm break-words">
            cat: {activeSlug}.mdx: No such file or directory
          </p>
        )}
        {postState === "error" && !notFound && (
          <p className="text-red-400 font-mono text-sm break-words">
            Failed to load post: {errorMsg}
          </p>
        )}
        {postState === "ready" && post && (
          <article className="space-y-3">
            <header className="border-b border-cyan-800/40 pb-3">
              <h2 className="text-base sm:text-lg text-white font-bold font-mono break-words">
                {post.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 font-mono mt-2">
                {post.date && (
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-cyan-900/30 border border-cyan-800/50 rounded-full text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            <div
              ref={contentRef}
              className="terminal-blog-content text-gray-300"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            <Recommendations
              items={rankRecommendations(post, posts)}
              syncUrls={syncUrls}
              onSelect={(s) => goToSlug(s)}
            />
          </article>
        )}
      </div>
    );
  }

  return (
    <div className="terminal-blog">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-white font-mono text-sm">BLOG.log</span>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
      </div>

      {listState === "loading" && (
        <p className="text-white/70 font-mono text-sm">Loading posts…</p>
      )}
      {listState === "error" && (
        <p className="text-red-400 font-mono text-sm break-words">
          Failed to load posts: {errorMsg}
        </p>
      )}
      {listState === "ready" && posts.length === 0 && (
        <p className="text-gray-400 text-sm font-mono">No posts yet.</p>
      )}
      {listState === "ready" && posts.length > 0 && (
        <>
          <p className="text-gray-500 font-mono text-xs sm:text-sm mb-3">
            {posts.length} post{posts.length === 1 ? "" : "s"} — tap to read
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 list-none p-0 m-0">
            {posts.map((p) => (
              <li key={p.slug} className="min-w-0">
                {syncUrls ? (
                  <Link
                    href={`/blog/${p.slug}`}
                    className="block h-full text-left border border-cyan-800/40 bg-gradient-to-br from-cyan-900/10 to-black/40 hover:border-cyan-400/60 transition-colors rounded-lg p-3 sm:p-4 cursor-pointer group"
                  >
                    <ListPostContent post={p} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => goToSlug(p.slug)}
                    className="w-full h-full text-left border border-cyan-800/40 bg-gradient-to-br from-cyan-900/10 to-black/40 hover:border-cyan-400/60 transition-colors rounded-lg p-3 sm:p-4 cursor-pointer group"
                  >
                    <ListPostContent post={p} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

function ListPostContent({
  post: p,
  showBlogLabel = false,
}: {
  post: PostMeta;
  showBlogLabel?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-1 mb-1">
        <div className="flex flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <h3 className="text-sm sm:text-base text-white font-semibold font-mono group-hover:text-white transition-colors break-words flex-1">
            {showBlogLabel ? formatBlogPostLabel(p.title) : p.title}
          </h3>
          {p.date && (
            <time
              dateTime={p.date}
              className="shrink-0 text-xs text-gray-500 font-mono whitespace-nowrap"
            >
              {formatPostDate(p.date)}
            </time>
          )}
        </div>
      </div>
      {p.excerpt && (
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
          {p.excerpt}
        </p>
      )}
      {p.tags && p.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-cyan-900/30 border border-cyan-800/50 rounded-full text-white text-xs font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-white/80 font-mono text-xs group-hover:text-white">
        → read post
      </p>
    </>
  );
}

export default Blog;

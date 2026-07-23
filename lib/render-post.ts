import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

/** Open in-article links in a new tab (post cards/nav use same-tab routing). */
export function withBlogLinkTargets(html: string): string {
  return html.replace(/<a\s+([^>]*?)href=/gi, (match, attrs) => {
    if (/\btarget\s*=/i.test(attrs)) return match;
    return `<a ${attrs}target="_blank" rel="noopener noreferrer" href=`;
  });
}

/**
 * Markdown → sanitized HTML. Runs through rehype-sanitize (GitHub-safe schema)
 * so even if a post source ever becomes user-editable, no script/iframe/on*
 * handler can survive — the security architecture is production-grade now, not
 * "safe because inputs happen to be trusted today". target/rel are added after
 * sanitization (we control that string injection, not the content).
 */
export async function renderPostHtml(markdown: string): Promise<string> {
  const raw = String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(markdown)
  );
  return withBlogLinkTargets(raw);
}

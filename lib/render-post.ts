import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

/** Open in-article links in a new tab (post cards/nav use same-tab routing). */
export function withBlogLinkTargets(html: string): string {
  return html.replace(/<a\s+([^>]*?)href=/gi, (match, attrs) => {
    if (/\btarget\s*=/i.test(attrs)) return match;
    return `<a ${attrs}target="_blank" rel="noopener noreferrer" href=`;
  });
}

export async function renderPostHtml(markdown: string): Promise<string> {
  const raw = String(
    await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(markdown)
  );
  return withBlogLinkTargets(raw);
}

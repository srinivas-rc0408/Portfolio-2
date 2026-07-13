import { BLOG_CANONICAL, SITE_NAME, toIsoDateTime } from "@/lib/seo-config";

interface BlogSeoArticleProps {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  html: string;
  url: string;
}

/** Crawlable article HTML for /blog/[slug] — complements the terminal UI. */
export default function BlogSeoArticle({
  slug,
  title,
  date,
  excerpt,
  html,
  url,
}: BlogSeoArticleProps) {
  const isoDate = toIsoDateTime(date);

  return (
    <article
      className="sr-only"
      itemScope
      itemType="https://schema.org/BlogPosting"
      itemID={`${url}#article`}
    >
      <header>
        <p>
          <a href={BLOG_CANONICAL} rel="up">
            Blog
          </a>
          {" / "}
          <span itemProp="name">{title}</span>
        </p>
        <h1 itemProp="headline">{title}</h1>
        {isoDate && (
          <time itemProp="datePublished" dateTime={isoDate}>
            {date}
          </time>
        )}
        <span itemProp="author" itemScope itemType="https://schema.org/Person">
          <meta itemProp="name" content={SITE_NAME} />
        </span>
        {excerpt && <p itemProp="description">{excerpt}</p>}
        <link itemProp="url" href={url} />
        <meta itemProp="mainEntityOfPage" content={url} />
        <meta itemProp="identifier" content={slug} />
      </header>
      <div itemProp="articleBody" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

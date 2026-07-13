import { BLOG_RSS_URL } from "@/lib/seo-config";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Srinivas RC — Blog RSS"
        href={BLOG_RSS_URL}
      />
      {children}
    </>
  );
}

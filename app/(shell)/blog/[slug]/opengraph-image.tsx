import { ImageResponse } from "next/og";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Srinivas RC — Blog post";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? "Blog post";
  const date = post?.date ?? "";
  const tags = (post?.tags ?? []).slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #000000 0%, #0a1f12 60%, #08160d 100%)",
          padding: "64px 72px",
          fontFamily: "monospace",
          color: "#e5e7eb",
        }}
      >
        {/* Terminal chrome */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "rgba(239,68,68,0.55)",
            }}
          />
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "rgba(234,179,8,0.55)",
            }}
          />
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "rgba(56,189,248,0.7)",
            }}
          />
          <div
            style={{
              display: "flex",
              marginLeft: 14,
              color: "#38bdf8",
              fontSize: 22,
              letterSpacing: 1,
            }}
          >
            {slug}.mdx
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#38bdf8",
              fontSize: 28,
              marginBottom: 18,
            }}
          >
            $ cat {slug}.mdx
          </div>
          <div
            style={{
              display: "flex",
              color: "#e5e7eb",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 28,
              }}
            >
              {tags.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "1px solid rgba(22,101,52,0.7)",
                    background: "rgba(20,83,45,0.35)",
                    color: "#86efac",
                    fontSize: 22,
                  }}
                >
                  #{t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#86efac",
            fontSize: 24,
            borderTop: "1px solid rgba(22,101,52,0.5)",
            paddingTop: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "#38bdf8",
              }}
            />
            <div style={{ display: "flex" }}>
              Srinivas RC
            </div>
          </div>
          <div style={{ display: "flex", color: "#9ca3af" }}>{date}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

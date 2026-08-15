import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Srinivas RC - Interactive OS Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "#09090b",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          boxSizing: "border-box",
        }}
      >
        {/* Grid mesh overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Radial glow — top right */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Radial glow — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Corner border accents */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            width: "32px",
            height: "32px",
            borderTop: "2px solid rgba(16,185,129,0.6)",
            borderLeft: "2px solid rgba(16,185,129,0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            width: "32px",
            height: "32px",
            borderTop: "2px solid rgba(16,185,129,0.6)",
            borderRight: "2px solid rgba(16,185,129,0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            width: "32px",
            height: "32px",
            borderBottom: "2px solid rgba(16,185,129,0.6)",
            borderLeft: "2px solid rgba(16,185,129,0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            width: "32px",
            height: "32px",
            borderBottom: "2px solid rgba(16,185,129,0.6)",
            borderRight: "2px solid rgba(16,185,129,0.6)",
          }}
        />

        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "60px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: "999px",
            padding: "8px 18px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              color: "#10b981",
              letterSpacing: "0.08em",
            }}
          >
            SYS: ONLINE · srinivas-rc.is-a.dev
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", zIndex: 1 }}>
          {/* Name */}
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "monospace",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              textShadow: "0 0 60px rgba(16,185,129,0.25)",
            }}
          >
            Srinivas RC
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "#10b981",
              fontFamily: "monospace",
              letterSpacing: "0.04em",
            }}
          >
            AI / ML Engineer
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "monospace",
              marginTop: "4px",
              maxWidth: "680px",
              lineHeight: 1.6,
            }}
          >
            Interactive Terminal OS Portfolio · LLM Pipelines · Agentic Systems
          </div>

          {/* Tech pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "12px",
            }}
          >
            {[
              "[ Next.js ]",
              "[ Neural Networks ]",
              "[ Autonomous Agents ]",
              "[ Jerry AI ]",
            ].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.35)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  color: "#10b981",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

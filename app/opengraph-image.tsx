import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Srinivas RC — AI / ML Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(circle at center, #18181b 0%, #000000 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid mesh — adds depth without clutter */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radial accent glow — top-left wash */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Bottom-right accent glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-60px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          }}
        />

        {/* ── Left Column: Typography ──────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
            zIndex: 1,
            maxWidth: "720px",
          }}
        >
          {/* Status pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#10b981",
              letterSpacing: "0.1em",
              fontSize: 24,
              fontFamily: "monospace",
            }}
          >
            ● SYS: ONLINE
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#ffffff",
              fontFamily: "monospace",
              letterSpacing: "-0.05em",
              lineHeight: 1,
            }}
          >
            Srinivas RC
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 500,
              color: "#a1a1aa",
              fontFamily: "monospace",
              lineHeight: 1.2,
            }}
          >
            AI / ML Engineer
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: 32,
              color: "#10b981",
              fontFamily: "monospace",
              marginTop: "12px",
              letterSpacing: "0.02em",
            }}
          >
            srinivas-rc.is-a.dev
          </div>
        </div>

        {/* ── Right Column: Lightning Bolt SVG ─────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            zIndex: 1,
            filter: "drop-shadow(0 0 40px rgba(16,185,129,0.6))",
          }}
        >
          <svg
            width="250"
            height="250"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon
              points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
              fill="#10b981"
              fillOpacity="0.2"
            />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Srinivas RC — AI / ML Engineer";
export const size = { width: 1200, height: 1200 };
export const contentType = "image/png";

/**
 * Pure-graphic OG card — 1200×1200 square with a razor-thin white lightning
 * bolt centered on pitch black. WhatsApp and Telegram prefer square crops for
 * icon-style cards; the metadata in layout.tsx carries the text.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <svg
          width="600"
          height="600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

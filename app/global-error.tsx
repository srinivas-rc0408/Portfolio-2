"use client";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces
 * the entire document (own <html>/<body>) and can't rely on globals.css/theme
 * vars, so everything is inline-styled — a dark terminal card with a retry.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#e5e5e5",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            border: "1px solid rgba(34,211,238,0.35)",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(10,10,10,0.9)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: "10px 16px",
              borderBottom: "1px solid rgba(34,211,238,0.25)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <span style={{ height: 12, width: 12, borderRadius: 999, background: "#e5231a", display: "inline-block" }} />
            <span style={{ height: 12, width: 12, borderRadius: 999, background: "#2fd84f", display: "inline-block" }} />
            <span style={{ height: 12, width: 12, borderRadius: 999, background: "#3b9dff", display: "inline-block" }} />
            <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              root@srinivas: ~/fatal
            </span>
          </div>
          <div style={{ padding: "24px 20px", fontSize: 14, lineHeight: 1.6 }}>
            <p style={{ margin: "0 0 8px", color: "#fbbf24" }}>
              ⚠ The session crashed unexpectedly.
            </p>
            <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.6)" }}>
              Reloading usually restores it.
            </p>
            {error?.digest && (
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                ref: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 16,
                cursor: "pointer",
                border: "1px solid rgba(34,211,238,0.6)",
                background: "rgba(34,211,238,0.12)",
                color: "#22d3ee",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              ↻ Reload session
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

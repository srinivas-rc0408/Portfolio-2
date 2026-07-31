"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders every page of a PDF to <canvas> with PDF.js.
 *
 * Why not an <iframe src="file.pdf">: that depends on the browser's native PDF
 * plugin, which iOS Safari lacks (renders blank) and some desktop configs
 * disable. Canvas rendering works the same everywhere — desktop, Android, iOS —
 * so the resume / CV / certificate popups look identical on every device.
 *
 * pdfjs-dist is dynamically imported so its ~1MB bundle only loads when a
 * viewer actually opens, never on first paint. The worker is served from
 * /public (version-pinned to the installed pdfjs-dist — see package.json).
 */
export default function PdfCanvas({
  url,
  onStatus,
}: {
  url: string;
  /** Bubbles load state up so the parent can show its own fallback UI. */
  onStatus?: (s: "loading" | "ready" | "error") => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pdfDoc: any = null;
    const host = hostRef.current;
    if (!host) return;

    const set = (s: "loading" | "ready" | "error") => {
      if (cancelled) return;
      setStatus(s);
      onStatus?.(s);
    };

    set("loading");
    host.replaceChildren();

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const task = pdfjs.getDocument(url);
        pdfDoc = await task.promise;
        if (cancelled) {
          pdfDoc.destroy();
          return;
        }

        // Render at the container's CSS width × devicePixelRatio (capped at 2 so
        // a multi-page doc doesn't blow up canvas memory), displayed at 100%.
        const cssWidth = Math.max(host.clientWidth || 600, 320);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let n = 1; n <= pdfDoc.numPages; n++) {
          if (cancelled) break;
          const page = await pdfDoc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.setAttribute("role", "img");
          canvas.setAttribute("aria-label", `Page ${n}`);
          canvas.className =
            "mx-auto block w-full rounded-md bg-white shadow-lg";
          host.appendChild(canvas);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
        }

        set("ready");
      } catch {
        if (!cancelled) set("error");
      }
    })();

    return () => {
      cancelled = true;
      try {
        pdfDoc?.destroy();
      } catch {
        /* already gone */
      }
    };
  }, [url, onStatus]);

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain px-3 py-4 sm:px-6">
      {status === "loading" && (
        <div
          className="flex h-full flex-col items-center justify-center gap-3"
          aria-live="polite"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(var(--theme-accent-rgb),0.25)] border-t-[var(--theme-accent)]" />
          <p className="text-xs text-white/50">Rendering…</p>
        </div>
      )}
      <div
        ref={hostRef}
        className={`mx-auto flex w-full max-w-2xl flex-col gap-4 ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

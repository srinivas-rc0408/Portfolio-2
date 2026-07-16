"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, FileText, X } from "lucide-react";

/**
 * Fullscreen document viewer — a transparent glass popup that previews a PDF
 * (or any embeddable doc) in-page with a fast loading state, and a branded
 * download button at the bottom ("Srinivas RC's <Label>.pdf").
 *
 * Opened from anywhere via:
 *   window.dispatchEvent(new CustomEvent("doc:view", { detail: { label, url } }))
 * (Tag quick actions, the `resume`/`cv` terminal commands, and Jerry all use
 * this.) It stacks above the Jerry chat (z-[60] vs z-50), so the chat stays
 * mounted underneath and the conversation continues after closing.
 */

export interface DocViewDetail {
  label: string; // e.g. "Resume", "CV", "Certificate"
  url: string;
}

export function openDoc(detail: DocViewDetail): void {
  window.dispatchEvent(new CustomEvent<DocViewDetail>("doc:view", { detail }));
}

export default function DocViewer() {
  const [doc, setDoc] = useState<DocViewDetail | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onView = (e: Event) => {
      const d = (e as CustomEvent<DocViewDetail>).detail;
      if (d?.url) {
        setLoaded(false);
        setDoc(d);
      }
    };
    window.addEventListener("doc:view", onView);
    return () => window.removeEventListener("doc:view", onView);
  }, []);

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDoc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc]);

  const download = useCallback(() => {
    if (!doc) return;
    const a = document.createElement("a");
    a.href = doc.url;
    // Branded filename: "Srinivas RC's Resume.pdf"
    a.download = `Srinivas RC's ${doc.label}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [doc]);

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-8"
          onClick={() => setDoc(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${doc.label} viewer`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/60 font-mono shadow-[0_0_60px_rgba(var(--theme-accent-rgb),0.2)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-accent-rgb),0.1)]"
                  style={{ color: "var(--theme-accent)" }}
                  aria-hidden
                >
                  <FileText size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-white">
                    Srinivas RC&apos;s {doc.label}
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">
                    PDF Document
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in new tab"
                  title="Open in new tab"
                  className="rounded-md p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ExternalLink size={15} strokeWidth={2.2} aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={() => setDoc(null)}
                  aria-label="Close viewer"
                  title="Close (Esc)"
                  className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={17} strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            </header>

            {/* Document */}
            <div className="relative flex-1 bg-white/[0.02]">
              {!loaded && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  aria-live="polite"
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(var(--theme-accent-rgb),0.25)] border-t-[var(--theme-accent)]" />
                  <p className="text-xs text-white/50">
                    Loading {doc.label.toLowerCase()}…
                  </p>
                </div>
              )}
              <iframe
                src={doc.url}
                title={`Srinivas RC's ${doc.label}`}
                onLoad={() => setLoaded(true)}
                className={`h-full w-full transition-opacity duration-300 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            {/* Footer — branded download */}
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-3">
              <span className="hidden text-[11px] text-white/40 sm:inline">
                Scroll to read · downloads as{" "}
                <span className="text-white/60">
                  Srinivas RC&apos;s {doc.label}.pdf
                </span>
              </span>
              <button
                type="button"
                onClick={download}
                className="flex items-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.12)] px-5 py-2 text-sm font-semibold text-[var(--theme-accent)] transition-all duration-200 hover:bg-[rgba(var(--theme-accent-rgb),0.22)] hover:shadow-[0_0_16px_rgba(var(--theme-accent-rgb),0.4)] active:scale-95"
                aria-label={`Download Srinivas RC's ${doc.label}`}
              >
                <Download size={15} strokeWidth={2.2} aria-hidden />
                Download {doc.label}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

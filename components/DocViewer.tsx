"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";
import PdfCanvas from "@/components/ui/PdfCanvas";
import { PRIVATE_RESOURCE } from "@/lib/cms";

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
 *
 * If `url` is the PRIVATE_RESOURCE sentinel, the viewer renders a premium
 * "Access Denied" lock screen instead of attempting to load a document.
 */

export interface DocViewDetail {
  label: string; // e.g. "Resume", "CV", "Certificate"
  url: string;
}

export function openDoc(detail: DocViewDetail): void {
  window.dispatchEvent(new CustomEvent<DocViewDetail>("doc:view", { detail }));
}

/** SVG Padlock icon — used in the Access Denied state. */
const PadlockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" />
    <line x1="12" y1="17" x2="12" y2="19" />
  </svg>
);

/**
 * Premium "Access Denied" state — rendered inside the modal frame when the
 * requested document is marked private by the admin.
 */
function LockedState({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className="flex h-full flex-col items-center justify-center gap-6 px-8 text-center"
    >
      {/* Glowing padlock icon */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 20, stiffness: 200 }}
        className="grid h-24 w-24 place-items-center rounded-2xl border border-amber-500/30 text-amber-500"
        style={{
          background: "radial-gradient(circle at center, rgba(245,158,11,0.12), transparent 70%)",
          boxShadow: "0 0 30px rgba(245,158,11,0.15), 0 0 60px rgba(245,158,11,0.06)",
        }}
      >
        <PadlockIcon />
      </motion.div>

      {/* System error message — typewriter/monospace styling */}
      <motion.div
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 200 }}
        className="max-w-sm space-y-3"
      >
        <p className="font-mono text-sm tracking-widest text-amber-500">
          [SYS ERROR] Access Denied
        </p>
        <p className="font-mono text-xs leading-relaxed text-white/60">
          The Admin has made this resource Private.
        </p>
        <p className="font-mono text-[11px] text-white/30">
          {label} is locked. Contact the site administrator to request access.
        </p>
      </motion.div>

      {/* Decorative scanline animation */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-px w-48 origin-left bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
        aria-hidden
      />

      {/* Status code badge */}
      <motion.div
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", damping: 20, stiffness: 200 }}
        className="flex items-center gap-2"
      >
        <span className="rounded border border-amber-500/25 bg-amber-500/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400">
          HTTP 403 · FORBIDDEN
        </span>
      </motion.div>

      {/* Dismiss button */}
      <motion.button
        type="button"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 rounded-lg border border-white/10 px-5 py-2 font-mono text-xs text-white/50 transition-all duration-150 hover:border-amber-500/30 hover:text-white active:scale-95"
      >
        Dismiss
      </motion.button>
    </motion.div>
  );
}

export default function DocViewer() {
  const [doc, setDoc] = useState<DocViewDetail | null>(null);
  // Lock background scrolling while this modal is open.
  useScrollLock(doc !== null);
  // PdfCanvas reports its own load state; "error" swaps in the open/download
  // fallback. Canvas rendering works on every device (incl. iOS), so there's
  // no per-platform branching anymore.
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const isLocked = doc?.url === PRIVATE_RESOURCE;

  useEffect(() => {
    const onView = (e: Event) => {
      const d = (e as CustomEvent<DocViewDetail>).detail;
      if (d?.url) {
        setStatus("loading");
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
    if (!doc || isLocked) return;
    // Analytics: which document a recruiter downloaded.
    track("document_downloaded", { document: doc.label });
    const a = document.createElement("a");
    a.href = doc.url;
    // Branded filename: "Srinivas RC's Resume.pdf"
    a.download = `Srinivas RC's ${doc.label}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [doc, isLocked]);

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setDoc(null)}
          role="dialog"
          aria-modal="true"
          aria-label={isLocked ? `${doc.label} — Access Denied` : `${doc.label} viewer`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`flex h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border font-mono backdrop-blur-xl ${
              isLocked
                ? "border-amber-500/25 bg-black/80"
                : "border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/60"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className={`flex shrink-0 items-center justify-between gap-3 border-b bg-white/[0.03] px-4 py-2.5 ${
              isLocked
                ? "border-amber-500/20"
                : "border-[rgba(var(--theme-accent-rgb),0.25)]"
            }`}>
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
                    isLocked
                      ? "border-amber-500/35 bg-amber-500/10 text-amber-500"
                      : "border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-accent-rgb),0.1)]"
                  }`}
                  style={isLocked ? undefined : { color: "var(--theme-accent)" }}
                  aria-hidden
                >
                  <FileText size={16} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-white">
                    Srinivas RC&apos;s {doc.label}
                  </h2>
                  <p className={`text-[10px] uppercase tracking-wider ${
                    isLocked ? "text-amber-500/60" : "text-white/40"
                  }`}>
                    {isLocked ? "🔒 Private Resource" : "PDF Document"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!isLocked && (
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
                )}
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

            {/* Content: either the PDF canvas or the Locked state */}
            {isLocked ? (
              <LockedState label={doc.label} onClose={() => setDoc(null)} />
            ) : (
              <>
                {/* Document — rendered to canvas (works on every device) */}
                <div className="relative flex-1 bg-white/[0.02]">
                  <PdfCanvas url={doc.url} onStatus={setStatus} />
                  {status === "error" && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 px-6 text-center backdrop-blur-sm"
                      aria-live="polite"
                    >
                      <span
                        className="grid h-16 w-16 place-items-center rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-accent-rgb),0.1)]"
                        style={{ color: "var(--theme-accent)" }}
                        aria-hidden
                      >
                        <FileText size={30} strokeWidth={1.8} />
                      </span>
                      <p className="max-w-xs text-sm leading-relaxed text-[var(--text)]">
                        Couldn&apos;t render {doc.label} here. Open it in a new tab or
                        download it instead.
                      </p>
                      <div className="flex flex-col items-stretch gap-2 sm:flex-row">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.6)] bg-[rgba(var(--theme-accent-rgb),0.14)] px-6 py-3 text-sm font-semibold text-[var(--theme-accent)] transition-colors duration-150 active:scale-95"
                        >
                          <ExternalLink size={15} strokeWidth={2.2} aria-hidden />
                          Open {doc.label}
                        </a>
                        <button
                          type="button"
                          onClick={download}
                          className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors duration-150 hover:text-white active:scale-95"
                        >
                          <Download size={15} strokeWidth={2.2} aria-hidden />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
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
                    className="flex items-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.12)] px-5 py-2 text-sm font-semibold text-[var(--theme-accent)] transition-all duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.22)] active:scale-95"
                    aria-label={`Download Srinivas RC's ${doc.label}`}
                  >
                    <Download size={15} strokeWidth={2.2} aria-hidden />
                    Download {doc.label}
                  </button>
                </footer>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

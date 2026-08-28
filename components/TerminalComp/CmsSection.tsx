"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  ExternalLink,
  FileText,
  GraduationCap,
  Link2,
  Trophy,
  X,
} from "lucide-react";
import {
  CMS_UPDATED_EVENT,
  type CmsItem,
  type CmsSection,
  getItems,
} from "@/lib/cms";
import { CERTIFICATES_PDF, fallbackFor } from "@/lib/section-fallbacks";
import { useScrollLock } from "@/lib/useScrollLock";
import { openDoc } from "@/components/DocViewer";

/** A section entry as rendered here — a CMS item plus an optional credential id. */
type Entry = CmsItem & { credentialId?: string };

// Per-section leading icon — gives each section a visual identity.
const SECTION_ICONS: Partial<Record<string, React.ReactNode>> = {
  education: <GraduationCap size={18} strokeWidth={2} aria-hidden />,
  certificates: <BadgeCheck size={18} strokeWidth={2} aria-hidden />,
  experience: <Briefcase size={18} strokeWidth={2} aria-hidden />,
  achievements: <Trophy size={18} strokeWidth={2} aria-hidden />,
  resume: <FileText size={18} strokeWidth={2} aria-hidden />,
  cv: <FileText size={18} strokeWidth={2} aria-hidden />,
  connect: <Link2 size={18} strokeWidth={2} aria-hidden />,
};

/**
 * CMS entries for a section, with a static fallback.
 *
 * The CMS copy is authoritative (admin edits, private filtering), but it only
 * exists once /api/bootstrap resolves. When that fails or is slow — a cold or
 * unreachable DB — these sections used to render "no public entries yet", which
 * looks broken. The fallback is the same content the DB seeds from, so it's
 * truthful and the section is never empty.
 */
function readSection(section: string): Entry[] {
  const fromCms = getItems(section);
  if (fromCms.length > 0) return fromCms;
  return fallbackFor(section).map((e, i) => ({
    id: `fallback-${section}-${i}`,
    section,
    title: e.title,
    description: e.description,
    date: e.date,
    link: e.link,
    credentialId: e.credentialId,
    private: false,
  }));
}

/** True when a URL points at an image we can preview inline. */
function isImage(url?: string): boolean {
  if (!url) return false;
  return url.startsWith("data:image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(url);
}

// --- Certificate viewer -------------------------------------------------------

function CertificateModal({
  entry,
  onClose,
}: {
  entry: Entry | null;
  onClose: () => void;
}) {
  useScrollLock(entry !== null);

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, onClose]);

  const preview = entry?.imageUrl ?? entry?.link;

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${entry.title} certificate`}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 font-mono shadow-2xl"
          >
            <header className="flex shrink-0 items-start gap-3 border-b border-zinc-800 bg-white/[0.02] p-4 pr-14">
              <span
                className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-accent-rgb),0.1)] text-[var(--theme-accent)]"
                aria-hidden
              >
                <BadgeCheck size={20} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-snug text-white">
                  {entry.title}
                </h3>
                {entry.description && (
                  <p className="mt-0.5 text-xs text-zinc-400">{entry.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close certificate"
                className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} strokeWidth={2.4} aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              {isImage(preview) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt={`${entry.title} certificate`}
                  className="w-full rounded-lg border border-zinc-800"
                />
              ) : (
                <dl className="space-y-3 text-xs">
                  {entry.date && (
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 uppercase tracking-wider text-zinc-400">
                        Issued
                      </dt>
                      <dd className="text-zinc-200">{entry.date}</dd>
                    </div>
                  )}
                  {entry.credentialId && (
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 uppercase tracking-wider text-zinc-400">
                        Credential
                      </dt>
                      <dd className="min-w-0 break-all text-zinc-200">
                        {entry.credentialId}
                      </dd>
                    </div>
                  )}
                  <p className="border-t border-zinc-800 pt-3 leading-relaxed text-zinc-400">
                    The signed scan of this certificate is included in the
                    verification pack below.
                  </p>
                </dl>
              )}
            </div>

            <footer className="shrink-0 border-t border-zinc-800 bg-white/[0.02] p-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openDoc({ label: "Certificates", url: CERTIFICATES_PDF });
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.1)] px-4 text-xs font-semibold text-[var(--theme-accent)] transition-all duration-200 hover:bg-[rgba(var(--theme-accent-rgb),0.18)] active:scale-[0.98]"
              >
                <FileText size={15} strokeWidth={2.2} aria-hidden />
                View verification pack
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Section ------------------------------------------------------------------

/**
 * Terminal output for a CMS-backed section (certificates, education, …),
 * rendered as a glassmorphism card grid. Certificate cards open a viewer;
 * the section ends with a link to the full verification PDF.
 */
const CmsSectionOutput: React.FC<{ section: CmsSection }> = ({ section }) => {
  const [items, setItems] = useState<Entry[] | null>(null);
  const [openCert, setOpenCert] = useState<Entry | null>(null);

  useEffect(() => {
    const read = () => setItems(readSection(section));
    read();
    window.addEventListener(CMS_UPDATED_EVENT, read);
    return () => window.removeEventListener(CMS_UPDATED_EVENT, read);
  }, [section]);

  if (items === null) return null; // first client paint

  if (items.length === 0) {
    return (
      <p className="font-mono text-sm text-gray-400">
        ~/{section}: no public entries yet.
      </p>
    );
  }

  const icon = SECTION_ICONS[section];
  const isCerts = section === "certificates";

  return (
    <div className="font-mono" role="region" aria-label={section}>
      <header className="mb-3 flex items-center gap-3">
        <p className="text-sm text-white">~/{section}</p>
        <span className="text-xs text-zinc-400">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </span>
        <div
          className="h-px flex-1 bg-gradient-to-r from-[rgba(var(--theme-accent-rgb),0.4)] to-transparent"
          aria-hidden
        />
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((item, i) => {
          const external = item.link && item.link !== "#" && !isCerts;
          const clickable = isCerts;

          const inner = (
            <>
              <span
                className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[rgba(var(--theme-accent-rgb),0.3)] bg-[rgba(var(--theme-accent-rgb),0.08)] text-[var(--theme-accent)] transition-transform duration-200 group-hover:scale-105"
                aria-hidden
              >
                {icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold leading-snug text-white">
                  {item.title}
                  {item.starred && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-[rgba(var(--theme-accent-rgb),0.4)] bg-[rgba(var(--theme-accent-rgb),0.12)] px-2 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-[var(--theme-accent)]">
                      ★ Featured
                    </span>
                  )}
                </span>
                {item.description && (
                  <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
                    {item.description}
                  </span>
                )}
                {item.date && (
                  <span className="mt-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
                    {item.date}
                  </span>
                )}
              </span>
              {(clickable || external) && (
                <span
                  className="mt-0.5 shrink-0 text-zinc-600 transition-colors duration-200 group-hover:text-[var(--theme-accent)]"
                  aria-hidden
                >
                  <ExternalLink size={14} strokeWidth={2} />
                </span>
              )}
            </>
          );

          const cardClass =
            "group flex w-full min-h-[44px] gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-left transition-all duration-200 hover:border-[rgba(var(--theme-accent-rgb),0.45)] hover:bg-zinc-800/50";

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(i * 0.045, 0.3),
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => setOpenCert(item)}
                  aria-label={`View ${item.title} certificate`}
                  className={`${cardClass} cursor-pointer active:scale-[0.99]`}
                >
                  {inner}
                </button>
              ) : external ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {inner}
                </a>
              ) : (
                <div className={cardClass}>{inner}</div>
              )}
            </motion.li>
          );
        })}
      </ul>

      {isCerts && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() =>
              openDoc({ label: "Certificates", url: CERTIFICATES_PDF })
            }
            className="group/pdf flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[rgba(var(--theme-accent-rgb),0.5)] bg-gradient-to-b from-[rgba(var(--theme-accent-rgb),0.14)] to-[rgba(var(--theme-accent-rgb),0.04)] px-5 text-xs font-semibold uppercase tracking-wider text-[var(--theme-accent)] transition-all duration-200 hover:border-[var(--theme-accent)] hover:shadow-[0_0_24px_-8px_rgba(var(--theme-accent-rgb),0.9)] active:scale-[0.99]"
          >
            <FileText size={15} strokeWidth={2.2} aria-hidden />
            View all certificates
            <ExternalLink
              size={13}
              strokeWidth={2.2}
              aria-hidden
              className="transition-transform duration-200 group-hover/pdf:translate-x-0.5"
            />
          </button>
          <p className="mt-2 text-center text-[11px] text-zinc-400">
            Opens an in-page viewer — verify any credential ID above.
          </p>
        </div>
      )}

      <CertificateModal entry={openCert} onClose={() => setOpenCert(null)} />
    </div>
  );
};

export default CmsSectionOutput;

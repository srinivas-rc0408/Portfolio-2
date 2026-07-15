"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  FileText,
  GraduationCap,
  Link2,
  Trophy,
} from "lucide-react";
import {
  CMS_UPDATED_EVENT,
  type CmsItem,
  type CmsSection,
  getItems,
} from "@/lib/cms";

// Per-section leading icon — gives education/certificates/etc. a visual
// identity (accent-colored badge) instead of plain bullet text.
const SECTION_ICONS: Partial<Record<string, React.ReactNode>> = {
  education: <GraduationCap size={15} strokeWidth={2} aria-hidden />,
  certificates: <Award size={15} strokeWidth={2} aria-hidden />,
  experience: <Briefcase size={15} strokeWidth={2} aria-hidden />,
  achievements: <Trophy size={15} strokeWidth={2} aria-hidden />,
  resume: <FileText size={15} strokeWidth={2} aria-hidden />,
  cv: <FileText size={15} strokeWidth={2} aria-hidden />,
  connect: <Link2 size={15} strokeWidth={2} aria-hidden />,
};

/**
 * Terminal output for a CMS-backed section (resume, cv, education, …).
 * Public view only: private entries are filtered out by getItems().
 * Re-reads live when the admin panel saves (cms:updated event).
 */
const CmsSectionOutput: React.FC<{ section: CmsSection }> = ({ section }) => {
  const [items, setItems] = useState<CmsItem[] | null>(null);

  useEffect(() => {
    const read = () => setItems(getItems(section));
    read();
    window.addEventListener(CMS_UPDATED_EVENT, read);
    return () => window.removeEventListener(CMS_UPDATED_EVENT, read);
  }, [section]);

  if (items === null) return null; // first client paint

  if (items.length === 0) {
    return (
      <p className="font-mono text-sm text-gray-500">
        ~/{section}: no public entries yet.
      </p>
    );
  }

  const icon = SECTION_ICONS[section];

  return (
    <div className="font-mono text-sm" role="region" aria-label={section}>
      <p className="text-white">~/{section}</p>
      <ul className="mt-2 space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 pl-1">
            {icon && (
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-accent-rgb),0.08)]"
                style={{ color: "var(--theme-accent)" }}
                aria-hidden
              >
                {icon}
              </span>
            )}
            <span className="min-w-0">
              <span className="font-semibold text-white">{item.title}</span>
              {item.date && (
                <span className="text-gray-500"> ({item.date})</span>
              )}
              {item.description && (
                <span className="text-gray-300"> — {item.description}</span>
              )}
              {item.link && item.link !== "#" && (
                <>
                  {" "}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-dotted hover:text-white"
                  >
                    ↗ open
                  </a>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CmsSectionOutput;

"use client";

import React, { useEffect, useState } from "react";
import {
  CMS_UPDATED_EVENT,
  type CmsItem,
  type CmsSection,
  getItems,
} from "@/lib/cms";

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

  return (
    <div className="font-mono text-sm" role="region" aria-label={section}>
      <p className="text-white">~/{section}</p>
      <ul className="mt-1 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="pl-2">
            <span className="text-white">• {item.title}</span>
            {item.date && <span className="text-gray-500"> ({item.date})</span>}
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CmsSectionOutput;

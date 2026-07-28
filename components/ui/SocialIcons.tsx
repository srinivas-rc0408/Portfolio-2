import React from "react";
import { Mail } from "lucide-react";

/**
 * Social glyphs, keyed by the `name` used in `footerLinks` (lib/portfolio-data).
 *
 * Hand-rolled because lucide-react dropped its brand icons — importing
 * `Github`/`Linkedin`/`Instagram` from it is a build error. Shared so the
 * identity pane's CONNECT panel and the global status bar can't drift apart.
 */
const svgIcon = (size: number, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export function socialIcons(size = 17): Record<string, React.ReactNode> {
  return {
    GitHub: svgIcon(
      size,
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    ),
    LinkedIn: svgIcon(
      size,
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
    Email: <Mail size={size} strokeWidth={2} aria-hidden />,
    Instagram: svgIcon(
      size,
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </>
    ),
    Steam: svgIcon(
      size,
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="15.5" cy="8.5" r="2.5" />
        <circle cx="8.5" cy="15" r="2" />
        <path d="m13.7 10.5-4 3.2" />
      </>
    ),
  };
}

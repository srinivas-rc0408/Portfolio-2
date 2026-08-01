"use client";

import { footerLinks } from "@/lib/portfolio-data";
import { socialIcons } from "@/components/ui/SocialIcons";
import LiveStatus from "@/components/LiveStatus";

/**
 * Global status bar — a slim, always-on "control panel" pinned to the bottom of
 * the viewport.
 *
 * Desktop-only by design: it occupies the space the identity pane already
 * reserves (`padding-bottom` at >=1025px). On phones and landscape the vertical
 * budget is far too tight, and the CONNECT panel in the identity pane already
 * carries the same links.
 *
 * Left  — live system status (emerald reads as "online" by convention).
 * Centre— social links, lit by the site accent on hover.
 * Right — Jerry's readiness, so the AI agent is legible as a live subsystem.
 */

const ICONS = socialIcons(15);

export default function StatusFooter() {
  return (
    <footer className="status-footer" aria-label="System status">
      {/* Left — live system status + per-second Bengaluru clock */}
      <LiveStatus className="sf-status" />

      {/* Centre — social links */}
      <nav className="sf-links" aria-label="Social links">
        {footerLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={link.name}
            title={link.name}
            className="sf-link"
          >
            {ICONS[link.name]}
          </a>
        ))}
      </nav>

      {/* Right — agent readiness */}
      <div className="sf-group sf-right">
        <span className="sf-agent">
          AI Agent (Jerry): <span className="sf-ready">Ready</span>
        </span>
      </div>
    </footer>
  );
}

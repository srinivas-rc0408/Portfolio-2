"use client";

import { useEffect, useState } from "react";
import { footerLinks } from "@/lib/portfolio-data";
import { socialIcons } from "@/components/ui/SocialIcons";

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
  // Rendered after mount only — a clock in SSR output would hydrate-mismatch.
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="status-footer" aria-label="System status">
      {/* Left — system status */}
      <div className="sf-group">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="sf-status">STATUS: ALL SYSTEMS ONLINE</span>
      </div>

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

      {/* Right — agent readiness + local clock */}
      <div className="sf-group sf-right">
        <span className="sf-agent">
          AI Agent (Jerry): <span className="sf-ready">Ready</span>
        </span>
        {time && (
          <span className="sf-time" aria-hidden>
            {time}
          </span>
        )}
      </div>
    </footer>
  );
}

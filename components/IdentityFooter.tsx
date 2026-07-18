"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import { footerLinks } from "@/lib/portfolio-data";

// lucide dropped its brand glyphs, so social marks are inline (18px, 2px stroke).
const svg = (children: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const GithubGlyph = () =>
  svg(<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />);
const LinkedinGlyph = () =>
  svg(<>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>);
const InstagramGlyph = () =>
  svg(<>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>);

/**
 * Desktop-only footer pinned to the bottom of the left identity pane.
 * Behaviour (per spec):
 *   · Hidden by default.
 *   · Reveals once the user has scrolled the left pane down and reached
 *     (near) the bottom — requires at least 2 downward scroll gestures so a
 *     single flick doesn't trigger it.
 *   · Auto-hides 10s after appearing — unless hovered (hover holds it open;
 *     the countdown restarts when the pointer leaves).
 * Icons glow in the admin theme accent (via CSS vars).
 */

const SteamGlyph = () =>
  svg(<>
    <circle cx="12" cy="12" r="10" />
    <circle cx="15.5" cy="8.5" r="2.5" />
    <circle cx="8.5" cy="15" r="2" />
    <path d="m13.7 10.5-4 3.2" />
  </>);

const ICONS: Record<string, React.ReactNode> = {
  GitHub: <GithubGlyph />,
  LinkedIn: <LinkedinGlyph />,
  Email: <Mail size={18} strokeWidth={2} aria-hidden />,
  Instagram: <InstagramGlyph />,
  Steam: <SteamGlyph />,
};

const HIDE_AFTER_MS = 60_000; // auto-hide 1 minute after it's revealed / last used
const SCROLL_GESTURES_REQUIRED = 2;

export default function IdentityFooter() {
  const [visible, setVisible] = useState(false);
  const gesturesRef = useRef(0);
  const hideTimerRef = useRef<number | undefined>(undefined);
  // Hovering the footer holds it open; leaving restarts the hide countdown.
  const hoverRef = useRef(false);
  const revealRef = useRef<() => void>(() => {});

  useEffect(() => {
    const pane = document.querySelector<HTMLElement>(".identity-pane");
    if (!pane) return;

    const atBottom = () =>
      pane.scrollHeight - pane.scrollTop - pane.clientHeight < 48;

    const reveal = () => {
      setVisible(true);
      window.clearTimeout(hideTimerRef.current);
      // Don't start the countdown while the pointer is on the footer.
      if (hoverRef.current) return;
      hideTimerRef.current = window.setTimeout(
        () => setVisible(false),
        HIDE_AFTER_MS
      );
    };
    revealRef.current = reveal;

    // Explicit reveal from the arrow handle in the identity panel (any device).
    const onExternalReveal = () => reveal();
    window.addEventListener("footer:reveal", onExternalReveal);

    const tryReveal = () => {
      if (atBottom() && gesturesRef.current >= SCROLL_GESTURES_REQUIRED) reveal();
    };

    // Count downward gestures. Checked on both wheel and scroll so it works
    // whether or not the pane actually overflows (a short pane is always
    // "at bottom", so 2 downward flicks reveal the footer).
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        gesturesRef.current += 1;
        tryReveal();
      } else if (e.deltaY < 0) {
        gesturesRef.current = 0;
      }
    };
    const onScroll = () => {
      if (!atBottom()) gesturesRef.current = 0;
      else tryReveal();
    };
    // Touch devices: reveal at the true scroll bottom.
    const onTouchMove = () => {
      if (atBottom()) {
        gesturesRef.current = SCROLL_GESTURES_REQUIRED;
        tryReveal();
      }
    };

    pane.addEventListener("wheel", onWheel, { passive: true });
    pane.addEventListener("scroll", onScroll, { passive: true });
    pane.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      pane.removeEventListener("wheel", onWheel);
      pane.removeEventListener("scroll", onScroll);
      pane.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("footer:reveal", onExternalReveal);
      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.footer
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          // Full-width on mobile; matches the 30% identity pane on desktop.
          className="pointer-events-none fixed bottom-0 left-0 z-40 w-full p-3 min-[1025px]:w-[30%]"
          style={{ willChange: "transform, opacity" }}
          aria-label="Quick links"
          onMouseEnter={() => {
            hoverRef.current = true;
            window.clearTimeout(hideTimerRef.current);
          }}
          onMouseLeave={() => {
            hoverRef.current = false;
            revealRef.current(); // restart the hide countdown
          }}
        >
          <div className="pointer-events-auto flex items-center justify-center gap-2.5 rounded-xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/70 px-3 py-2.5 backdrop-blur-xl">
            <nav className="flex items-center gap-2.5" aria-label="Social links">
              {footerLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  title={link.name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(var(--theme-accent-rgb),0.4)] text-[var(--theme-accent)] transition-all duration-150 hover:scale-110 hover:bg-[rgba(var(--theme-accent-rgb),0.14)] active:scale-95"
                >
                  {ICONS[link.name]}
                </a>
              ))}
            </nav>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}

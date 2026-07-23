"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X } from "lucide-react";

/**
 * WelcomePopup — a glassmorphism "toast" that slides in bottom-right 1.5s after
 * load to introduce Jerry (the AI agent), instead of an intrusive modal.
 *   · Home page only, once per session (dismissal persists in sessionStorage).
 *   · Spring entrance, slide-down exit; the Bot avatar pulses ("alive").
 *   · Accent follows the site theme so it stays cohesive in any color.
 *   · Carries data-welcome-popup so QuoteOfDay won't stack on top of it.
 */

const DISMISS_KEY = "portfolio:welcome-dismissed";
const APPEAR_MS = 1500;
const AUTO_HIDE_MS = 40_000; // if untouched, quietly retires so the quote can show

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — fine, it just shows again next load */
    }
  };

  const chatWithJerry = () => {
    window.dispatchEvent(new CustomEvent("terminal:exec", { detail: "jerry" }));
    dismiss();
  };

  useEffect(() => {
    // Only greet on the home page, and only once per session.
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const show = window.setTimeout(() => setVisible(true), APPEAR_MS);
    const hide = window.setTimeout(() => {
      setVisible(false); // auto-retire (does NOT persist — no forced dismiss)
    }, APPEAR_MS + AUTO_HIDE_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-welcome-popup=""
          role="status"
          aria-live="polite"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-20 left-1/2 z-[55] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0"
        >
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 border-l-4 border-l-[var(--theme-accent)] bg-zinc-950/80 p-4 shadow-[0_10px_45px_-8px_rgba(var(--theme-accent-rgb),0.25)] backdrop-blur-md">
            {/* Close */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss welcome message"
              className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-md text-zinc-500 transition-colors duration-150 hover:bg-white/10 hover:text-zinc-200"
            >
              <X size={15} strokeWidth={2.4} aria-hidden />
            </button>

            <div className="flex gap-3">
              {/* Pulsing Bot avatar */}
              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-accent-rgb),0.1)]">
                <span className="absolute inset-0 rounded-xl bg-[var(--theme-accent)] opacity-20 motion-safe:animate-ping" />
                <Bot
                  size={20}
                  strokeWidth={2}
                  className="relative text-[var(--theme-accent)]"
                  aria-hidden
                />
              </div>

              <div className="min-w-0 pr-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--theme-accent)]">
                  System Initialized
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-200">
                  Hi, I&apos;m Jerry — Srinivas&apos;s AI Agent. Ask me about his
                  ML models, projects, or resume. Want to chat?
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={chatWithJerry}
                    className="rounded-lg bg-[var(--theme-accent)] px-3 py-1.5 text-xs font-semibold text-black transition-transform duration-150 hover:scale-[1.03] active:scale-95"
                  >
                    Chat with Jerry
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-150 hover:text-zinc-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

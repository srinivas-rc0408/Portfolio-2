"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageSquare, Send, X } from "lucide-react";

/**
 * Floating Feedback button + popup form.
 *   · Fixed just right of the identity pane on desktop (bottom-right on
 *     mobile) — position never changes with scroll.
 *   · Auto-hides after 30s without a click; reappears the moment the pointer
 *     comes near its corner (or the user touches near it).
 *   · Popup: Name (required) · Email (optional) · Feedback (required), with
 *     clear inline error messages both ways. Saved via /api/feedback and
 *     shown in the admin panel's Feedback section.
 */

const IDLE_HIDE_MS = 30_000;
const NEAR_PX = 170; // pointer distance from the button corner that re-reveals

export default function FeedbackWidget() {
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const idleTimer = useRef<number | undefined>(undefined);
  const btnRef = useRef<HTMLButtonElement>(null);

  const armIdleTimer = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setVisible(false), IDLE_HIDE_MS);
  }, []);

  // Idle hide + proximity reveal.
  useEffect(() => {
    armIdleTimer();
    const onMove = (e: PointerEvent) => {
      const el = btnRef.current;
      // When hidden, measure against the button's home corner instead.
      const rect = el?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : 0;
      const y = rect ? rect.top + rect.height / 2 : window.innerHeight - 40;
      const dist = Math.hypot(e.clientX - x, e.clientY - y);
      if (dist < NEAR_PX) {
        setVisible(true);
        armIdleTimer();
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(idleTimer.current);
    };
  }, [armIdleTimer]);

  // Esc closes the popup.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Explicit both-ways validation with helpful messages.
    if (!name.trim() && !message.trim()) {
      setError("Please enter your name and your feedback.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name before sending.");
      return;
    }
    if (!message.trim()) {
      setError("You entered your name but no feedback — please write a message.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not send feedback.");
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      window.setTimeout(() => {
        setSent(false);
        setOpen(false);
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send feedback.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button — desktop: just right of the identity pane; mobile: bottom-right */}
      <AnimatePresence>
        {visible && !open && (
          <motion.button
            ref={btnRef}
            key="fb-btn"
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            type="button"
            onClick={() => {
              setOpen(true);
              setError(null);
              armIdleTimer();
            }}
            aria-label="Send feedback"
            className="fixed bottom-5 left-4 z-40 flex min-h-[44px] items-center gap-2 rounded-full border border-[rgba(var(--theme-accent-rgb),0.5)] bg-black/75 px-4 py-2.5 font-mono text-xs font-semibold text-[var(--theme-accent)] backdrop-blur-xl transition-all duration-150 hover:scale-105 hover:bg-[rgba(var(--theme-accent-rgb),0.15)] active:scale-95 min-[1025px]:left-[calc(30%+1rem)]"
          >
            <MessageSquare size={15} strokeWidth={2.2} aria-hidden />
            Feedback
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popup form */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fb-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={submit}
              className="w-full max-w-md rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/75 p-5 font-mono backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <MessageSquare
                    size={16}
                    style={{ color: "var(--theme-accent)" }}
                    aria-hidden
                  />
                  Feedback abt Terminal Portfolio
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close feedback form"
                  className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={16} strokeWidth={2.5} aria-hidden />
                </button>
              </div>

              {sent ? (
                <div
                  className="flex flex-col items-center gap-2 py-8 text-center"
                  role="status"
                >
                  <CheckCircle2
                    size={36}
                    style={{ color: "var(--theme-accent)" }}
                    aria-hidden
                  />
                  <p className="text-sm text-white">
                    Thank you! Your feedback has been sent.
                  </p>
                </div>
              ) : (
                <>
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
                    Name <span className="text-[var(--theme-accent)]">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    placeholder="Your name"
                    aria-label="Your name (required)"
                    className="mb-3 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-all [caret-color:var(--theme-accent)] focus:border-[rgba(var(--theme-accent-rgb),0.6)]"
                  />
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
                    Email <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                    type="email"
                    placeholder="you@example.com"
                    aria-label="Your email (optional)"
                    className="mb-3 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-all [caret-color:var(--theme-accent)] focus:border-[rgba(var(--theme-accent-rgb),0.6)]"
                  />
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500">
                    Feedback <span className="text-[var(--theme-accent)]">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    placeholder="What did you like? Any bugs or ideas?"
                    aria-label="Your feedback (required)"
                    className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-all [caret-color:var(--theme-accent)] focus:border-[rgba(var(--theme-accent-rgb),0.6)]"
                  />

                  {error && (
                    <p
                      role="alert"
                      className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                    >
                      <span aria-hidden>⚠</span>
                      <span>{error}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.12)] px-4 py-2.5 text-sm font-semibold text-[var(--theme-accent)] transition-all duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.22)] active:scale-[0.98] disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 size={15} className="animate-spin" aria-hidden />
                    ) : (
                      <Send size={15} strokeWidth={2.2} aria-hidden />
                    )}
                    {sending ? "Sending…" : "Send Feedback"}
                  </button>
                </>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

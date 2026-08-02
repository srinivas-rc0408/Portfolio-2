"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";

/**
 * Lightweight, bottom-right toast notification system.
 *
 * Dispatch from anywhere:
 *   window.dispatchEvent(new CustomEvent("toast:show", { detail: { message, type } }))
 *
 * Types: "error" (amber/lock icon), "success" (accent/check), "info" (neutral).
 * Auto-dismisses after 4s. Only one toast is shown at a time (latest wins).
 */

interface ToastData {
  message: string;
  type?: "error" | "success" | "info";
}

const TOAST_DURATION = 4000;

export function showToast(message: string, type: ToastData["type"] = "error"): void {
  window.dispatchEvent(
    new CustomEvent<ToastData>("toast:show", { detail: { message, type } })
  );
}

export default function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const onShow = (e: Event) => {
      const d = (e as CustomEvent<ToastData>).detail;
      if (d?.message) setToast(d);
    };
    window.addEventListener("toast:show", onShow);
    return () => window.removeEventListener("toast:show", onShow);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(t);
  }, [toast]);

  const isError = toast?.type === "error";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          role="alert"
          aria-live="assertive"
          className={`fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 font-mono text-sm backdrop-blur-xl ${
            isError
              ? "border-amber-500/30 bg-black/85 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
              : "border-[rgba(var(--theme-accent-rgb),0.3)] bg-black/85 text-white/90 shadow-[0_0_20px_rgba(var(--theme-accent-rgb),0.1)]"
          }`}
        >
          {isError && (
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-amber-500/25 bg-amber-500/10"
              aria-hidden
            >
              <Lock size={14} strokeWidth={2.2} />
            </span>
          )}
          <span className="min-w-0 flex-1 text-[13px] leading-snug">
            {toast.message}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded p-1 text-white/40 transition-colors hover:text-white"
          >
            <X size={14} strokeWidth={2.5} aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

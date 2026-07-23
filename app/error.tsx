"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. Catches render/data errors (e.g. a DB cold-start
 * before it wakes) and degrades to a terminal-styled recovery screen with a
 * one-click retry — never a raw white crash. Must be a client component.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for logs/monitoring; never shown to the visitor.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 font-mono">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/70 backdrop-blur-xl">
        {/* window header */}
        <div className="flex items-center gap-2 border-b border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, #ff6f61, #e5231a 52%, #9e0d06)" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, #8ff0af, #2fd84f 55%, #15a636)" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, #86bcff, #3b9dff 55%, #1667d6)" }} />
          <span className="ml-2 text-xs text-white/60">root@srinivas: ~/recover</span>
        </div>

        <div className="space-y-2 px-5 py-6 text-sm leading-relaxed">
          <p className="text-white/70">
            <span className="text-[var(--theme-accent)]">root@srinivas</span>:~# ./load
          </p>
          <p className="text-amber-400">⚠ Connection interrupted — a process failed to respond.</p>
          <p className="text-white/60">
            The server may be waking from sleep. Re-establishing the connection
            usually fixes it.
          </p>
          {error?.digest && (
            <p className="text-[11px] text-white/30">ref: {error.digest}</p>
          )}
          <p className="pt-1 text-white/40">
            <span className="text-[var(--theme-accent)]">$</span> retry{" "}
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[var(--theme-accent)] align-middle" />
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.6)] bg-[rgba(var(--theme-accent-rgb),0.12)] px-5 py-2.5 text-sm font-semibold text-[var(--theme-accent)] transition-all duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.22)] active:scale-95"
            >
              ↻ Re-establish connection
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/70 transition-all duration-150 hover:bg-white/5 hover:text-white active:scale-95"
            >
              ← Return to terminal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

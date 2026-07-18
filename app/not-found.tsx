import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Route not found",
  robots: { index: false, follow: false },
};

/**
 * Terminal-themed 404. Server component (no JS needed) — a faux shell session
 * that reports the missing route and offers a route back to root@srinivas.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 font-mono">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/70 backdrop-blur-xl">
        {/* window header */}
        <div className="flex items-center gap-2 border-b border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-2.5">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "radial-gradient(circle at 32% 28%, #ff6f61, #e5231a 52%, #9e0d06)" }}
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "radial-gradient(circle at 32% 28%, #8ff0af, #2fd84f 55%, #15a636)" }}
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "radial-gradient(circle at 32% 28%, #86bcff, #3b9dff 55%, #1667d6)" }}
          />
          <span className="ml-2 text-xs text-white/60">root@srinivas: ~/404</span>
        </div>

        <div className="space-y-2 px-5 py-6 text-sm leading-relaxed">
          <p className="text-white/70">
            <span className="text-[var(--theme-accent)]">root@srinivas</span>
            :~# open &lt;requested-route&gt;
          </p>
          <p className="text-red-400">
            Error 404: Route not found.
          </p>
          <p className="text-white/60">
            The page you&apos;re looking for doesn&apos;t exist or was moved.
            Rerouting to <span className="text-white">root@srinivas</span>…
          </p>
          <p className="pt-1 text-white/40">
            <span className="text-[var(--theme-accent)]">$</span> cd ~{" "}
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[var(--theme-accent)] align-middle" />
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.6)] bg-[rgba(var(--theme-accent-rgb),0.12)] px-5 py-2.5 text-sm font-semibold text-[var(--theme-accent)] transition-all duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.22)] active:scale-95"
            >
              ← Return to terminal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

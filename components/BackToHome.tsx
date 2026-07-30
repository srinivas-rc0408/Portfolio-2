import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Back-to-home affordance for the standalone SEO pages (/projects, /skills, …).
 * Those pages are indexable landing points, so a visitor arriving from search
 * needs a way back into the terminal home — the browser back button isn't one
 * when the page was the entry point. Fixed top-left, out of the content flow.
 */
export default function BackToHome() {
  return (
    <Link
      href="/"
      aria-label="Back to home"
      className="group fixed left-4 top-4 z-50 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/70 px-3 font-mono text-sm text-[var(--text)] backdrop-blur-md transition-all duration-150 ease-out hover:border-[var(--theme-accent)] hover:bg-black/85 active:scale-95"
    >
      <ArrowLeft
        size={16}
        aria-hidden
        className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
      />
      <span>home</span>
    </Link>
  );
}

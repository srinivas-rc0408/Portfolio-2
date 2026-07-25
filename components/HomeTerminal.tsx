"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TerminalComp from "@/components/TerminalComp";

/** Smooth-scroll helper that respects the OS "reduce motion" setting. */
function scrollTo(top: number): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}

function HomeTerminalInner() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  const cmd = searchParams.get("cmd");

  // On mobile the profile pane sits above the terminal. Running a command
  // scrolls the terminal into view instead of hiding the pane — so the profile
  // is always one scroll (or one tap) away, never lost.
  const revealTerminal = (): void => {
    const pane = document.querySelector(".terminal-pane");
    if (!pane) return;
    requestAnimationFrame(() =>
      scrollTo(window.scrollY + pane.getBoundingClientRect().top)
    );
  };

  const revealProfile = (): void => {
    requestAnimationFrame(() => scrollTo(0));
  };

  return (
    <TerminalComp
      onFirstCommand={revealTerminal}
      onClear={revealProfile}
      onShowIdentity={revealProfile}
      initialSection={section}
      initialCommand={cmd}
    />
  );
}

export default function HomeTerminal() {
  return (
    <Suspense fallback={null}>
      <HomeTerminalInner />
    </Suspense>
  );
}

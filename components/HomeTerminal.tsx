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

  // Going back to the profile scrolls to the very top. Revealing the terminal on
  // the first command is handled inside TerminalComp now (it scrolls the new
  // command's prompt into view), so there is no separate onFirstCommand scroll
  // here — two scroll authorities fought and dropped the reader at a section's
  // end.
  const revealProfile = (): void => {
    requestAnimationFrame(() => scrollTo(0));
  };

  return (
    <TerminalComp
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

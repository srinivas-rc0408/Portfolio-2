"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TerminalComp from "@/components/TerminalComp";
import { useShell } from "@/context/ShellContext";

function HomeTerminalInner() {
  const searchParams = useSearchParams();
  const { setHideIdentityOnMobile } = useShell();
  const section = searchParams.get("section");
  const cmd = searchParams.get("cmd");

  const handleFirstCommand = (): void => {
    setHideIdentityOnMobile(true);
  };

  // `clear` returns to the landing view — bring the profile pane back on mobile.
  const handleClear = (): void => {
    setHideIdentityOnMobile(false);
  };

  // "Back to profile" (mobile) — reveal the identity pane, keep the terminal
  // history intact, and smooth-scroll it into view at the top of the page.
  const handleShowIdentity = (): void => {
    setHideIdentityOnMobile(false);
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  };

  return (
    <TerminalComp
      onFirstCommand={handleFirstCommand}
      onClear={handleClear}
      onShowIdentity={handleShowIdentity}
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

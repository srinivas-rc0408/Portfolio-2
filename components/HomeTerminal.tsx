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

  return (
    <TerminalComp
      onFirstCommand={handleFirstCommand}
      onClear={handleClear}
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

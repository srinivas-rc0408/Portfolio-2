"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Tag from "@/components/Tag";
import QuoteOfDay from "@/components/QuoteOfDay";
import BootSequence from "@/components/boot/BootSequence";
import { ShellContext } from "@/context/ShellContext";

function isBlogPath(pathname: string): boolean {
  return pathname === "/blog" || pathname.startsWith("/blog/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isBlog = isBlogPath(pathname);
  const [hideIdentityOnMobile, setHideIdentityOnMobile] = useState(false);

  const hideIdentityOnMobileOnly =
    isBlog || (isHome && hideIdentityOnMobile);

  return (
    <ShellContext.Provider value={{ setHideIdentityOnMobile }}>
      <BootSequence />
      <main className="app-shell" role="main">
        <div className="main-content-area">
          <section
            className={`identity-pane ${
              hideIdentityOnMobileOnly ? "hide-on-mobile" : ""
            }`}
            aria-label="Developer identity — Srinivas RC"
          >
            <Tag />
          </section>
          <section className="terminal-pane">{children}</section>
        </div>
      </main>
      {/* Floating quote toast — overlays the site, never affects layout/scroll */}
      <QuoteOfDay />
    </ShellContext.Provider>
  );
}

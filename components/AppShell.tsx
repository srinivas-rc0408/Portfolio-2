"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Tag from "@/components/Tag";
import QuoteOfDay from "@/components/QuoteOfDay";
import IdentityFooter from "@/components/IdentityFooter";
import FeedbackWidget from "@/components/FeedbackWidget";
import GameModal from "@/components/GameModal";
import DocViewer from "@/components/DocViewer";
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

  // Reveal scrollbars only while the user is actively scrolling; hide 5s after
  // they stop. Capture phase catches every nested scroll container (terminal,
  // identity pane, chat, admin). Also keeps scrollbars invisible during boot.
  useEffect(() => {
    const root = document.documentElement;
    let hideTimer: number;
    const onScroll = () => {
      root.classList.add("scrolling");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(
        () => root.classList.remove("scrolling"),
        5000
      );
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.clearTimeout(hideTimer);
    };
  }, []);

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
      {/* Left-pane footer — reveals on scroll-to-bottom, desktop only */}
      {!isBlog && <IdentityFooter />}
      {/* Document viewer — resume/CV/certificates popup (view + download) */}
      <DocViewer />
      {/* Floating feedback button + popup (saved to the admin Feedback tab) */}
      <FeedbackWidget />
      {/* Arch-Man arcade popup (opened by `play archman` / the Games button) */}
      <GameModal />
    </ShellContext.Provider>
  );
}

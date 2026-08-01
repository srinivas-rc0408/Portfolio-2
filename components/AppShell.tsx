"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import Tag from "@/components/Tag";
import QuoteOfDay from "@/components/QuoteOfDay";
import WelcomePopup from "@/components/WelcomePopup";
import FeedbackWidget from "@/components/FeedbackWidget";
import GameModal from "@/components/GameModal";
import DocViewer from "@/components/DocViewer";
import BootSequence from "@/components/boot/BootSequence";
import StatusFooter from "@/components/StatusFooter";
import CommandPalette from "@/components/CommandPalette";

export default function AppShell({ children }: { children: React.ReactNode }) {

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


  return (
    <>
      {/* Honor the OS "reduce motion" setting across every framer animation. */}
      <MotionConfig reducedMotion="user">
      <BootSequence />
      <main className="app-shell" role="main" data-xray="<AppShell>">
        <div className="main-content-area">
          <section
            className="identity-pane"
            aria-label="Developer identity — Srinivas RC"
            data-xray="<IdentityPane>"
          >
            <Tag />
          </section>
          <section className="terminal-pane" data-xray="<TerminalPane>">
            {children}
          </section>
        </div>
      </main>
      {/* Global status bar — desktop-only control panel pinned to the bottom */}
      <StatusFooter />
      {/* Jerry welcome toast — slides in bottom-right 1.5s after load (home only) */}
      <WelcomePopup />
      {/* Floating quote toast — overlays the site, never affects layout/scroll */}
      <QuoteOfDay />
      {/* Document viewer — resume/CV/certificates popup (view + download) */}
      <DocViewer />
      {/* Floating feedback button + popup (saved to the admin Feedback tab) */}
      <FeedbackWidget />
      {/* Arch-Man arcade popup (opened by `play archman` / the Games button) */}
      <GameModal />
      {/* ⌘K / Ctrl+K spotlight command palette */}
      <CommandPalette />
      </MotionConfig>
    </>
  );
}

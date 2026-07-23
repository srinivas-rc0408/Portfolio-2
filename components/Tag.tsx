"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { ChevronUp, Download, Gamepad2, Mail, Sparkles } from "lucide-react";
import ProfileLightbox from "@/components/ProfileLightbox";
import { footerLinks } from "@/lib/portfolio-data";
import {
  AUTH_UPDATED_EVENT,
  SETTINGS_UPDATED_EVENT,
  type SessionUser,
  type SiteSettings,
  DEFAULT_SETTINGS,
  currentUser,
  docUrl,
  loadSettings,
  logout,
} from "@/lib/cms";
import { openDoc } from "@/components/DocViewer";

/** Direct download with a branded filename ("Srinivas RC's Resume.pdf"). */
function downloadDoc(url: string, label: string): void {
  track("document_downloaded", { document: label });
  const a = document.createElement("a");
  a.href = url;
  a.download = `Srinivas RC's ${label}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** "S.RC" brand mark — lightning-bolt S + initials, no gap, hover tooltip. */
const BrandMark: React.FC = () => (
  <div className="group/logo relative flex cursor-default items-center gap-0.5">
    {/* viewBox cropped to the bolt's visual bounds (x 6–32) so no dead space
        pads the right edge — the ".RC" sits snug against the bolt. */}
    <svg
      width="28"
      height="40"
      viewBox="5 0 28 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="S.RC"
      className="shrink-0 transition-transform duration-150 ease-out group-hover/logo:scale-105"
    >
      <title>S.RC</title>
      {/* Bolt stroke follows the admin theme accent (universal site color) */}
      <path
        d="M29 3 H14 L9 17 H19 L7 37 L31 15 H20 L29 3 Z"
        fill="black"
        stroke="var(--theme-accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
    <span
      aria-hidden="true"
      className="font-mono text-xl font-black tracking-tight text-[var(--text)] transition-colors duration-150 ease-out group-hover/logo:text-[var(--accent)]"
    >
      <span className="text-[var(--theme-accent)]">.</span>RC
    </span>

    {/* Tooltip: Srinivas RC's Portfolio */}
    <span
      role="tooltip"
      className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-max translate-y-1 rounded-md border border-[var(--border)] bg-black/85 px-3 py-1.5 font-mono text-xs text-[var(--text)] opacity-0 backdrop-blur-md transition-all duration-150 ease-out group-hover/logo:translate-y-0 group-hover/logo:opacity-100"
    >
      Srinivas RC&apos;s Portfolio
    </span>
  </div>
);

/** Sends a command to the terminal pane and scrolls it into view. */
function execInTerminal(command: string): void {
  window.dispatchEvent(
    new CustomEvent<string>("terminal:exec", { detail: command })
  );
  document
    .querySelector(".terminal-pane")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Direct file download via a transient anchor. */
const DownloadIcon: React.FC = () => (
  <Download
    size={14}
    aria-hidden="true"
    className="opacity-60 transition-opacity duration-150 ease-out group-hover/qa:opacity-100"
  />
);

const GamepadIcon: React.FC = () => (
  <Gamepad2
    size={14}
    aria-hidden="true"
    className="opacity-60 transition-opacity duration-150 ease-out group-hover/qa:opacity-100"
  />
);

interface QuickAction {
  label: string;
  run?: () => void;
  icon?: "download" | "game";
  /** Document row: clicking the label views it; the download icon downloads. */
  doc?: { label: "Resume" | "CV"; section: "resume" | "cv" };
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Projects", run: () => execInTerminal("cd projects") },
  { label: "Resume", doc: { label: "Resume", section: "resume" } },
  { label: "Skills", run: () => execInTerminal("cd skills") },
  { label: "Education", run: () => execInTerminal("education") },
  {
    label: "Certificates",
    run: () => execInTerminal("certificates"),
  },
  { label: "CV", doc: { label: "CV", section: "cv" } },
  { label: "Games", icon: "game", run: () => execInTerminal("play archman") },
];

// Shared row chrome (hover strip + sheen) so doc rows and plain rows match.
const ROW_CLASS =
  "group/qa relative w-full overflow-hidden rounded-md border border-transparent bg-white/[0.04] px-4 py-2.5 min-h-[44px] text-left font-mono text-sm text-[var(--text)] transition-colors duration-150 ease-out hover:border-[var(--border)] hover:bg-white/[0.07]";

/* Restrained hover mark: a `$` prompt symbol in the single accent. */
const RowDecor: React.FC = () => (
  <span
    aria-hidden="true"
    className="absolute left-0 top-0 h-full w-[2px] -translate-x-full bg-[var(--accent)] transition-transform duration-150 ease-out group-hover/qa:translate-x-0"
  />
);

/** Opens the fullscreen profile-picture viewer. */
function viewProfile(): void {
  window.dispatchEvent(new CustomEvent("profile:view"));
}

// Inline social icons (lucide dropped its brand glyphs, so these are hand-rolled).
const svgIcon = (children: React.ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  GitHub: svgIcon(<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />),
  LinkedIn: svgIcon(<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></>),
  Email: <Mail size={17} strokeWidth={2} aria-hidden />,
  Instagram: svgIcon(<><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></>),
  Steam: svgIcon(<><circle cx="12" cy="12" r="10" /><circle cx="15.5" cy="8.5" r="2.5" /><circle cx="8.5" cy="15" r="2" /><path d="m13.7 10.5-4 3.2" /></>),
};

export default function Tag() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Profile pic: desktop shows "I am Him" on hover; mobile shows it on a
  // >2s long-press (a quick tap opens the fullscreen image instead).
  const [greet, setGreet] = useState(false);
  const pressTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  // CONNECT toggles the inline social/contact panel (anchored to this pane).
  const [connectOpen, setConnectOpen] = useState(false);

  const onPicClick = () => {
    // A long-press already handled this interaction — don't also open the image.
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    viewProfile();
  };
  const onPicPressStart = () => {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setGreet(true);
      navigator.vibrate?.(15);
    }, 2000);
  };
  const onPicPressEnd = () => {
    window.clearTimeout(pressTimer.current);
    if (greet) window.setTimeout(() => setGreet(false), 1600);
  };

  useEffect(() => {
    const readAuth = () => setUser(currentUser());
    const readSettings = () => setSettings(loadSettings());
    readAuth();
    readSettings();
    window.addEventListener(AUTH_UPDATED_EVENT, readAuth);
    window.addEventListener(SETTINGS_UPDATED_EVENT, readSettings);
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, readAuth);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, readSettings);
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const profileSrc = settings.profileImage ?? "/profile.jpg";

  return (
    <div className="identity-container flex min-h-full w-full flex-col bg-black p-4 sm:p-6">
      {/* Top header bar */}
      <header className="flex w-full items-center justify-between">
        <BrandMark />

        {user ? (
          /* Authenticated: circular avatar badge with the first 3 letters */
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={`Account menu for ${user.name}`}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/[0.04] py-1 pl-1 pr-3 font-mono text-xs text-[var(--text)] transition-colors duration-150 ease-out hover:border-[var(--accent)]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(var(--theme-accent-rgb),0.2)] text-[11px]">
                👤
              </span>
              {user.name.slice(0, 3)}…
              {user.role === "admin" && (
                <span className="rounded bg-[rgba(var(--theme-accent-rgb),0.2)] px-1 text-[9px] uppercase tracking-wider">
                  admin
                </span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-lg border border-[rgba(var(--theme-accent-rgb),0.3)] bg-black/90 font-mono text-xs backdrop-blur-md">
                <p className="border-b border-white/10 px-3 py-2 text-white/60">
                  {user.email}
                </p>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-white transition-colors hover:bg-[rgba(var(--theme-accent-rgb),0.15)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    ⚙ Admin Panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-red-400 transition-colors hover:bg-red-900/20"
                >
                  ⏻ Logout
                </button>
              </div>
            )}
          </div>
        ) : null}
      </header>

      {/* Profile image — click to view fullscreen; hover shows greeting.
          Compact 144px square on mobile so the terminal peeks above the fold. */}
      <div className="mt-3 flex justify-center sm:mt-8">
        <button
          type="button"
          onClick={onPicClick}
          onTouchStart={onPicPressStart}
          onTouchEnd={onPicPressEnd}
          onTouchCancel={onPicPressEnd}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="View profile picture"
          className="group relative h-36 w-36 cursor-pointer select-none overflow-hidden rounded-xl border border-[var(--border)] shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-transform duration-150 ease-out active:scale-[0.98] sm:h-[290px] sm:w-[232px]"
        >
          <Image
            src={profileSrc}
            alt={settings.displayName}
            fill
            sizes="232px"
            priority
            unoptimized
            draggable={false}
            className="object-cover transition-transform duration-150 ease-out group-hover:scale-[1.03]"
          />
          {/* Greeting — "I am Him" on hover (desktop) or long-press (mobile).
              Terminal-style reveal: `> whoami` in the accent, then the answer
              with a blinking caret, over a bottom-up gradient so the face still
              reads through. */}
          <div
            className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-1.5 bg-gradient-to-t from-black/90 via-black/45 to-transparent pb-5 transition-opacity duration-300 ease-out ${
              greet ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--theme-accent)] transition-all duration-300 ease-out ${
                greet
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}
            >
              &gt; whoami
            </span>
            <span
              className={`flex items-center font-mono text-lg font-bold tracking-wide text-white transition-all delay-75 duration-300 ease-out sm:text-xl ${
                greet
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}
            >
              I am Him
              <span className="ml-1 inline-block h-4 w-[3px] animate-pulse bg-[var(--theme-accent)]" />
            </span>
            <span
              className={`mt-1 rounded-full border border-white/25 bg-black/40 px-3 py-1 font-mono text-[10px] text-white/80 backdrop-blur-sm transition-all delay-150 duration-300 ease-out ${
                greet
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}
            >
              tap to view ↗
            </span>
          </div>
        </button>
      </div>

      {/* Identity text — typewriter reveal (once, ~1s total; instant when
          prefers-reduced-motion). Block cursor blinks after the tagline. */}
      <div className="mt-4 text-center sm:mt-6">
        <h1 className="font-mono text-xl font-bold tracking-wide text-[var(--text)] sm:text-2xl">
          <span className="type-line">{settings.displayName}</span>
        </h1>
        <p className="mt-1 font-mono text-sm text-[var(--text-secondary)]">
          <span className="type-line delay">{settings.title}</span>
          <span className="block-cursor" aria-hidden="true" />
        </p>
      </div>

      {/* Quick action menu — flat rows, single accent on prompt + hover bar */}
      <nav
        className="mx-auto mt-4 flex w-full max-w-[280px] flex-col gap-2 sm:mt-8 sm:gap-2.5"
        aria-label="Quick actions"
      >
        {/* Ask Jerry — flagship AI action, sits above the resume and stands out */}
        <button
          type="button"
          onClick={() => execInTerminal("jerry")}
          aria-label="Ask Jerry, the AI assistant"
          className="group/jerry relative flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[rgba(var(--accent-rgb),0.5)] bg-[rgba(var(--accent-rgb),0.08)] px-4 py-2.5 font-mono text-sm font-semibold text-[var(--accent)] transition-colors duration-150 ease-out hover:border-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.14)]"
        >
          <Sparkles size={15} strokeWidth={2.2} className="relative" aria-hidden />
          <span className="relative">Ask Jerry</span>
          <span className="relative rounded-full border border-[rgba(var(--accent-rgb),0.5)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
            AI
          </span>
        </button>

        {QUICK_ACTIONS.map((action) => {
          const { label, run, icon, doc } = action;

          // Document rows: label click → view; download icon → direct download.
          if (doc) {
            const url = docUrl(doc.section);
            const view = () => openDoc({ label: doc.label, url });
            return (
              <div
                key={label}
                role="button"
                tabIndex={0}
                onClick={view}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    view();
                  }
                }}
                className={`${ROW_CLASS} cursor-pointer`}
                aria-label={`View ${doc.label}`}
              >
                <RowDecor />
                <span className="relative flex items-center justify-between text-[var(--text)]">
                  <span>
                    <span className="text-[var(--accent)]">$ </span>
                    {label.toLowerCase()}
                    <span className="ml-2 text-[10px] text-[var(--text-secondary)] transition-colors duration-150 ease-out group-hover/qa:text-[var(--accent)]">
                      view
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadDoc(url, doc.label);
                    }}
                    aria-label={`Download ${doc.label}`}
                    title={`Download ${doc.label}`}
                    className="-my-2 -mr-2 grid min-h-[44px] min-w-[44px] place-items-center rounded-md text-[var(--text-secondary)] transition-colors duration-150 ease-out hover:text-[var(--accent)]"
                  >
                    <DownloadIcon />
                  </button>
                </span>
              </div>
            );
          }

          return (
            <button
              key={label}
              type="button"
              onClick={run}
              className={ROW_CLASS}
            >
              <RowDecor />
              <span className="relative flex items-center justify-between text-[var(--text)]">
                <span>
                  <span className="text-[var(--accent)]">$ </span>
                  {label.toLowerCase()}
                </span>
                {icon === "game" && <GamepadIcon />}
              </span>
            </button>
          );
        })}
      </nav>

      {/* CONNECT — the identity pane's footer: a toggle that reveals a glass
          card of labeled social tiles + a sign-in entrance. Spring expand,
          staggered tiles, lift-on-hover. */}
      <div className="mx-auto mt-5 flex w-full max-w-[280px] flex-col items-center">
        <button
          type="button"
          onClick={() => setConnectOpen((o) => !o)}
          aria-expanded={connectOpen}
          aria-label={connectOpen ? "Hide contact & social links" : "Show contact & social links"}
          title="Contact & social links"
          className="group/handle flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-white/[0.03] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)] shadow-sm transition-all duration-200 ease-out hover:border-[rgba(var(--accent-rgb),0.6)] hover:bg-[rgba(var(--accent-rgb),0.05)] hover:text-[var(--accent)] hover:shadow-[0_0_22px_-8px_rgba(var(--accent-rgb),0.7)] aria-expanded:border-[rgba(var(--accent-rgb),0.6)] aria-expanded:text-[var(--accent)]"
        >
          <span className="relative flex h-2 w-2" aria-hidden>
            {!connectOpen && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-50" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          {connectOpen ? "close" : "let's connect"}
          <ChevronUp
            size={14}
            strokeWidth={2.5}
            aria-hidden
            className={`transition-transform duration-300 ease-out ${connectOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {connectOpen && (
            <motion.div
              key="socials"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { type: "spring", stiffness: 320, damping: 32 },
                opacity: { duration: 0.2 },
              }}
              className="w-full overflow-hidden"
            >
              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4 backdrop-blur-sm">
                <p className="mb-3 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  <span className="text-[var(--accent)]">{"//"}</span> find me on
                </p>
                <nav
                  className="grid grid-cols-4 gap-2"
                  aria-label="Social links"
                >
                  {footerLinks.map((link, i) => (
                    <motion.a
                      key={link.name}
                      initial={{ opacity: 0, y: 10, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.045 * i + 0.06,
                        type: "spring",
                        stiffness: 380,
                        damping: 24,
                      }}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      aria-label={link.name}
                      title={link.name}
                      className="group/soc flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-[var(--border)] py-2 text-[var(--text-secondary)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(var(--accent-rgb),0.7)] hover:bg-[rgba(var(--accent-rgb),0.1)] hover:text-[var(--accent)] active:scale-90"
                    >
                      {SOCIAL_ICONS[link.name]}
                      <span className="text-[8px] uppercase tracking-wider opacity-70 transition-opacity group-hover/soc:opacity-100">
                        {link.name}
                      </span>
                    </motion.a>
                  ))}
                </nav>

                {/* Owner entrance — sign in / register, shown when signed out. */}
                {!user && (
                  <div className="mt-4 border-t border-[var(--border)] pt-3">
                    <Link
                      href="/admin"
                      className="group/si flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-transparent bg-white/[0.02] font-mono text-[11px] text-[var(--text-secondary)] transition-all duration-150 ease-out hover:border-[var(--border)] hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
                    >
                      <span className="text-[var(--accent)]">$</span>
                      <span>sign in / register</span>
                      <span className="translate-x-0 opacity-0 transition-all duration-150 group-hover/si:translate-x-1 group-hover/si:opacity-100">
                        →
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen profile viewer (opens via avatar click or saffron dot) */}
      <ProfileLightbox />
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { ChevronUp, Download, Gamepad2, Sparkles } from "lucide-react";
import ProfileLightbox from "@/components/ProfileLightbox";
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

export default function Tag() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          onClick={viewProfile}
          aria-label="View profile picture"
          className="group relative h-36 w-36 cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-transform duration-150 ease-out active:scale-[0.98] sm:h-[290px] sm:w-[232px]"
        >
          <Image
            src={profileSrc}
            alt={settings.displayName}
            fill
            sizes="232px"
            priority
            unoptimized
            className="object-cover transition-transform duration-150 ease-out group-hover:scale-[1.02]"
          />
          {/* Overlay hint, fades in on hover */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/55 opacity-0 backdrop-blur-md transition-opacity duration-150 ease-out group-hover:opacity-100">
            <span className="rounded-full border border-white/40 px-3 py-1 font-mono text-[11px] text-white/80">
              click to view ↗
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

      {/* Footer-reveal handle — sits in the space below the actions. Tap to
          slide up the social/contact footer (buttery framer-motion). */}
      <div className="mx-auto mt-3 flex w-full max-w-[280px] justify-center">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("footer:reveal"))}
          aria-label="Show contact & social links"
          title="Contact & social links"
          className="group/handle flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] transition-colors duration-150 ease-out hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <ChevronUp size={13} strokeWidth={2.5} aria-hidden />
          connect
        </button>
      </div>

      {/* Fullscreen profile viewer (opens via avatar click or saffron dot) */}
      <ProfileLightbox />
    </div>
  );
}

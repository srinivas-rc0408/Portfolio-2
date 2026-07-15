"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Download, Gamepad2 } from "lucide-react";
import ProfileLightbox from "@/components/ProfileLightbox";
import {
  AUTH_UPDATED_EVENT,
  SETTINGS_UPDATED_EVENT,
  type SessionUser,
  type SiteSettings,
  DEFAULT_SETTINGS,
  currentUser,
  loadSettings,
  logout,
} from "@/lib/cms";

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
      className="shrink-0 transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:[filter:drop-shadow(0_0_6px_rgba(var(--theme-accent-rgb),0.8))]"
    >
      <title>S.RC</title>
      <path
        d="M29 3 H14 L9 17 H19 L7 37 L31 15 H20 L29 3 Z"
        fill="black"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
    <span
      aria-hidden="true"
      className="font-mono text-xl font-black tracking-tight text-white transition-all duration-300 group-hover/logo:[text-shadow:0_0_12px_rgba(var(--theme-accent-rgb),0.9)]"
    >
      <span className="text-[var(--theme-accent)]">.</span>RC
    </span>

    {/* Tooltip: Srinivas RC's Portfolio */}
    <span
      role="tooltip"
      className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-max translate-y-1 rounded-md border border-[rgba(var(--theme-accent-rgb),0.4)] bg-black/85 px-3 py-1.5 font-mono text-xs text-white opacity-0 shadow-[0_0_16px_rgba(var(--theme-accent-rgb),0.25)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/logo:translate-y-0 group-hover/logo:opacity-100"
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
function downloadFile(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const DownloadIcon: React.FC = () => (
  <Download
    size={14}
    aria-hidden="true"
    className="opacity-60 transition-all duration-300 group-hover/qa:translate-y-[1px] group-hover/qa:opacity-100"
  />
);

const GamepadIcon: React.FC = () => (
  <Gamepad2
    size={14}
    aria-hidden="true"
    className="opacity-60 transition-opacity duration-300 group-hover/qa:opacity-100"
  />
);

interface QuickAction {
  label: string;
  run: () => void;
  icon?: "download" | "game";
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Resume",
    icon: "download",
    run: () => downloadFile("/srinivas-rc-resume.pdf", "Srinivas-RC-Resume.pdf"),
  },
  {
    label: "CV",
    icon: "download",
    run: () => downloadFile("/srinivas-rc-resume.pdf", "Srinivas-RC-CV.pdf"),
  },
  {
    label: "Certificates",
    icon: "download",
    run: () => execInTerminal("certificates"),
  },
  { label: "Education", run: () => execInTerminal("education") },
  { label: "Skills", run: () => execInTerminal("cd skills") },
  { label: "Projects", run: () => execInTerminal("cd projects") },
  { label: "Games", icon: "game", run: () => execInTerminal("play archman") },
];

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
    <div className="identity-container flex h-full w-full flex-col bg-black p-4 sm:p-6">
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
              className="flex items-center gap-2 rounded-full border border-[rgba(var(--theme-accent-rgb),0.5)] bg-white/[0.04] py-1 pl-1 pr-3 font-mono text-xs text-white transition-all duration-300 hover:border-[var(--theme-accent)] hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.35)] active:scale-95"
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
        ) : (
          <Link
            href="/admin"
            className="rounded-md border border-[rgba(var(--theme-accent-rgb),0.5)] bg-transparent px-3 py-1.5 font-mono text-xs text-white/80 transition-all duration-300 hover:border-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.1)] hover:text-white hover:[text-shadow:0_0_10px_rgba(var(--theme-accent-rgb),0.9)] active:scale-95"
            aria-label="Sign up or open admin login"
          >
            Sign Up / Admin
          </Link>
        )}
      </header>

      {/* Profile image — click to view fullscreen; hover shows greeting.
          Compact 144px square on mobile so the terminal peeks above the fold. */}
      <div className="mt-3 flex justify-center sm:mt-8">
        <button
          type="button"
          onClick={viewProfile}
          aria-label="View profile picture"
          className="group relative h-36 w-36 cursor-pointer overflow-hidden rounded-xl shadow-[0_0_24px_rgba(var(--theme-accent-rgb),0.15),0_8px_30px_rgba(0,0,0,0.6)] transition-transform duration-300 active:scale-[0.98] sm:h-[290px] sm:w-[232px]"
        >
          <Image
            src={profileSrc}
            alt={settings.displayName}
            fill
            sizes="232px"
            priority
            unoptimized
            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
          {/* Frosted overlay + greeting, fades/slides in on hover */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/55 opacity-0 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100">
            <p className="translate-y-3 px-3 text-center font-mono text-base font-bold text-white opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [text-shadow:0_0_14px_rgba(var(--theme-accent-rgb),0.6)] group-hover:translate-y-0 group-hover:opacity-100 sm:text-lg">
              Yes, it&apos;s me —
              <br />
              <span className="text-[var(--theme-accent)]">
                believe it or not.
              </span>
            </p>
            <span className="mt-3 translate-y-3 rounded-full border border-white/40 px-3 py-1 font-mono text-[11px] text-white/80 opacity-0 transition-all delay-100 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
              click to view ↗
            </span>
          </div>
        </button>
      </div>

      {/* Identity text — dynamic from Global Settings */}
      <div className="mt-3 text-center sm:mt-6">
        <h1 className="font-mono text-xl font-bold tracking-wide text-white sm:text-2xl">
          {settings.displayName}
        </h1>
        <p className="mt-1 font-mono text-sm text-white/70">{settings.title}</p>
      </div>

      {/* Quick action menu — Indian-flag tricolor reveal on hover */}
      <nav
        className="mx-auto mt-4 flex w-full max-w-[280px] flex-col gap-2 sm:mt-8 sm:gap-2.5"
        aria-label="Quick actions"
      >
        {QUICK_ACTIONS.map(({ label, run, icon }) => (
          <button
            key={label}
            type="button"
            onClick={run}
            className="group/qa relative w-full overflow-hidden rounded-md bg-gradient-to-r from-white/[0.03] to-white/[0.06] px-4 py-2.5 text-left font-mono text-sm text-gray-300 transition-all duration-300 hover:text-white active:scale-95"
          >
            {/* tricolor left border strip, revealed on hover */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-full w-[3px] -translate-x-full bg-gradient-to-b from-[#FF9933] via-white to-[#138808] transition-transform duration-300 ease-out group-hover/qa:translate-x-0"
            />
            {/* left-to-right sheen fill on hover */}
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(var(--theme-accent-rgb),0.1)] to-transparent transition-transform duration-500 ease-out group-hover/qa:translate-x-full"
            />
            <span className="relative flex items-center justify-between text-white">
              <span>
                <span className="text-white/50">$ </span>
                {label.toLowerCase()}
              </span>
              {icon === "download" && <DownloadIcon />}
              {icon === "game" && <GamepadIcon />}
            </span>
          </button>
        ))}
      </nav>

      {/* Fullscreen profile viewer (opens via avatar click or saffron dot) */}
      <ProfileLightbox />
    </div>
  );
}

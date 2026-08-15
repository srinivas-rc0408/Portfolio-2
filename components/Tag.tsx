"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { track } from "@vercel/analytics";
import { ChevronUp, Download, Gamepad2, LogIn, Sparkles } from "lucide-react";
import ProfileLightbox from "@/components/ProfileLightbox";
import { footerLinks } from "@/lib/portfolio-data";
import {
  AUTH_UPDATED_EVENT,
  SETTINGS_UPDATED_EVENT,
  PRIVATE_RESOURCE,
  type SessionUser,
  type SiteSettings,
  DEFAULT_SETTINGS,
  currentUser,
  docUrl,
  loadSettings,
  logout,
} from "@/lib/cms";
import { openDoc } from "@/components/DocViewer";
import { socialIcons } from "@/components/ui/SocialIcons";
import { showToast } from "@/components/Toast";

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
// Micro-interaction on hover: a small lift + scale and a soft accent glow, so
// the rows feel tactile without competing with the accent bar (RowDecor).
const ROW_CLASS =
  "group/qa relative w-full overflow-hidden rounded-md border border-transparent bg-white/[0.04] px-4 py-2.5 min-h-[44px] text-left font-mono text-sm text-[var(--text)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out will-change-transform hover:-translate-y-px hover:scale-[1.02] hover:border-[var(--border)] hover:bg-white/[0.07] hover:shadow-[0_0_18px_-6px_rgba(var(--theme-accent-rgb),0.55)] active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none";

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

// Shared hand-rolled brand glyphs (lucide dropped its brand icons).
const SOCIAL_ICONS = socialIcons(17);

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

  // --- 3D parallax tilt + mouse-tracking glow for the profile card ---
  // px/py track the pointer (0..1) across the card; rotate* are spring-smoothed
  // so the card eases rather than snapping. Pointer-only: touch never fires
  // mouse events, and MotionConfig reducedMotion="user" (AppShell) neutralises
  // the transforms for users who ask for less motion.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), spring);
  // Separate source value so onMouseLeave can spring the glow back to 0 — a
  // spring must be driven through its source, not by setting its output.
  const glowRaw = useMotionValue(0);
  const glowOpacity = useSpring(glowRaw, { stiffness: 200, damping: 26 });
  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(var(--theme-accent-rgb),0.4), transparent 62%)`;

  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    glowRaw.set(1);
  };
  const onCardLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glowRaw.set(0);
  };

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
      <div
        className="mt-3 flex justify-center sm:mt-8"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="relative [transform-style:preserve-3d]"
          style={{ rotateX, rotateY }}
          onMouseMove={onCardMove}
          onMouseLeave={onCardLeave}
        >
          {/* Accent aura that tracks the pointer and fades in on hover. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] blur-2xl"
            style={{ background: glowBg, opacity: glowOpacity }}
          />
          <button
            type="button"
            onClick={onPicClick}
            onTouchStart={onPicPressStart}
          onTouchEnd={onPicPressEnd}
          onTouchCancel={onPicPressEnd}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="View profile picture"
          className="profile-frame group relative h-36 w-36 cursor-pointer select-none overflow-hidden rounded-xl border border-[var(--border)] shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-[transform,border-color,box-shadow] duration-300 ease-out active:scale-[0.98] [@media(hover:hover)]:group-hover:border-[rgba(var(--theme-accent-rgb),0.55)] [@media(hover:hover)]:group-hover:shadow-[0_10px_44px_rgba(var(--theme-accent-rgb),0.28)] sm:h-[290px] sm:w-[232px]"
        >
          <Image
            src={profileSrc}
            alt={settings.displayName}
            fill
            sizes="232px"
            priority
            unoptimized
            draggable={false}
            className="object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.05]"
          />

          {/* HUD corner brackets — "lock on" from slightly inset to the corners
              when the frame is focused. Shown on desktop hover or mobile
              long-press (greet). */}
          {(
            [
              "left-2 top-2 border-l-2 border-t-2 rounded-tl [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:translate-y-0 translate-x-1.5 translate-y-1.5",
              "right-2 top-2 border-r-2 border-t-2 rounded-tr [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:translate-y-0 -translate-x-1.5 translate-y-1.5",
              "bottom-2 left-2 border-b-2 border-l-2 rounded-bl [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:translate-y-0 translate-x-1.5 -translate-y-1.5",
              "bottom-2 right-2 border-b-2 border-r-2 rounded-br [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:translate-y-0 -translate-x-1.5 -translate-y-1.5",
            ] as const
          ).map((pos, i) => (
            <span
              key={i}
              aria-hidden
              className={`pointer-events-none absolute h-4 w-4 border-[var(--theme-accent)] transition-all duration-300 ease-out ${
                greet
                  ? "translate-x-0 translate-y-0 opacity-100"
                  : "opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
              } ${pos}`}
            />
          ))}

          {/* Scanline — sweeps down the frame while focused (hover / long-press).
              Opacity-0 at rest; the keyframe drives its position + fade. */}
          <span
            aria-hidden
            style={{ boxShadow: "0 0 12px 1px rgba(var(--theme-accent-rgb),0.7)" }}
            className={`pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-accent)] to-transparent opacity-0 motion-reduce:hidden ${
              greet
                ? "[animation:profileScan_2s_linear_infinite]"
                : "[@media(hover:hover)]:group-hover:[animation:profileScan_2s_linear_infinite]"
            }`}
          />
          {/* Greeting — "I am Him" on hover (desktop) or long-press (mobile).
              Terminal-style reveal: `> whoami` in the accent, then the answer
              with a blinking caret, over a bottom-up gradient so the face still
              reads through. */}
          <div
            className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-end overflow-hidden bg-gradient-to-t from-black/92 via-black/55 to-transparent pb-5 transition-opacity duration-300 ease-out ${
              greet ? "opacity-100" : "opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
            }`}
          >
            {/* Accent hairline that draws outward as the answer lands. */}
            <span
              aria-hidden
              className={`absolute inset-x-7 bottom-[4.6rem] h-px bg-gradient-to-r from-transparent via-[var(--theme-accent)] to-transparent transition-transform duration-500 ease-out ${
                greet ? "scale-x-100" : "scale-x-0 [@media(hover:hover)]:group-hover:scale-x-100"
              }`}
            />

            {/* The shell prompt asking the question. */}
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.32em] text-white/45 transition-all duration-300 ease-out ${
                greet
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
              }`}
            >
              <span className="text-[var(--theme-accent)]">$</span> whoami
            </span>

            {/* The answer. Quotes carry the accent; "Him" gets the glow. Not a
                flex row — `.block-cursor` relies on vertical-align to sit on
                the text baseline, same caret as the hero tagline. */}
            <span
              className={`mt-1.5 whitespace-nowrap font-mono text-lg font-bold tracking-tight text-white transition-all delay-75 duration-300 ease-out sm:text-xl ${
                greet
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
              }`}
            >
              I am{" "}
              <span className="text-[var(--theme-accent)]">&ldquo;</span>
              <span
                style={{
                  textShadow: "0 0 22px rgba(var(--theme-accent-rgb), 0.55)",
                }}
              >
                Him
              </span>
              <span className="text-[var(--theme-accent)]">&rdquo;</span>
              <span className="block-cursor" aria-hidden />
            </span>

            {/* Ghost-glass "tap to view" chip. It's a label inside the card
                button (the whole card is the tap target and carries the tilt/
                tap physics), so its responsive states ride the card's
                group-hover rather than its own pointer events. */}
            <span
              className={`mt-2.5 inline-flex w-auto max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-transparent px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/85 backdrop-blur-md transition-all delay-150 duration-300 ease-out [@media(hover:hover)]:group-hover:border-white/50 [@media(hover:hover)]:group-hover:bg-white/5 [@media(hover:hover)]:group-hover:text-white ${
                greet
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
              }`}
            >
              {/* One flex item, so the row's gap-1.5 sits between the label and
                  the arrow rather than between the words. */}
              <span>
                <span className="[@media(hover:hover)]:hidden">tap</span>
                <span className="hidden [@media(hover:hover)]:inline">click</span>{" "}
                to view
              </span>
              <span
                aria-hidden
                className="text-white/70 transition-transform duration-300 ease-out [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:-translate-y-0.5"
              >
                &#8599;
              </span>
            </span>
          </div>
        </button>
        </motion.div>
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

      {/* Current focus — the live “what I'm building now” signal. Opens the
          full board in the terminal. */}
      <motion.button
        type="button"
        onClick={() => execInTerminal("focus")}
        whileTap={{ scale: 0.98 }}
        aria-label="Current focus: Personal AI Agent — open the full board"
        title="What I'm building right now"
        className="group/focus mx-auto mt-4 flex w-full max-w-[280px] min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border border-[rgba(var(--accent-rgb),0.28)] bg-gradient-to-b from-[rgba(var(--accent-rgb),0.08)] to-transparent px-3 py-2 text-left transition-all duration-200 ease-out hover:border-white/20 hover:bg-zinc-800/60 active:scale-[0.98]"
      >
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            currently building
          </span>
          <span className="block truncate font-mono text-[13px] font-semibold text-[var(--text)]">
            Personal AI Agent
          </span>
        </span>
        <span
          className="shrink-0 font-mono text-xs text-[var(--accent)] opacity-0 transition-all duration-200 group-hover/focus:translate-x-0.5 group-hover/focus:opacity-100"
          aria-hidden
        >
          →
        </span>
      </motion.button>

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
            const locked = url === PRIVATE_RESOURCE;
            const view = () => {
              if (locked) {
                showToast("Authentication required. Resource is private.");
                return;
              }
              openDoc({ label: doc.label, url });
            };
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
                className={`${ROW_CLASS} ${locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                aria-label={locked ? `${doc.label} — locked` : `View ${doc.label}`}
              >
                <RowDecor />
                <span className="relative flex items-center justify-between text-[var(--text)]">
                  <span>
                    <span className="text-[var(--accent)]">$ </span>
                    {label.toLowerCase()}
                    {locked ? (
                      <span className="ml-2 text-[10px] text-amber-500 transition-colors duration-150 ease-out">
                        [ LOCKED ]
                      </span>
                    ) : (
                      <span className="ml-2 text-[10px] text-[var(--text-secondary)] transition-colors duration-150 ease-out group-hover/qa:text-[var(--accent)]">
                        view
                      </span>
                    )}
                  </span>
                  {!locked && (
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
                  )}
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
          staggered tiles, lift-on-hover.
          `mt-auto` pins it to the bottom of the pane so leftover vertical space
          never pools below it (the pane is fixed to the viewport height); `pt-6`
          guarantees breathing room above it when the pane is short and the auto
          margin collapses to zero. */}
      <div className="mx-auto mt-auto flex w-full max-w-[280px] flex-col items-center pt-6">
        <button
          type="button"
          onClick={() => setConnectOpen((o) => !o)}
          aria-expanded={connectOpen}
          aria-label={connectOpen ? "Hide contact & social links" : "Show contact & social links"}
          title="Contact & social links"
          className="group/handle relative flex min-h-[44px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-[rgba(var(--accent-rgb),0.3)] bg-gradient-to-b from-white/[0.06] to-white/[0.015] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)] shadow-sm transition-all duration-200 ease-out hover:border-[rgba(var(--accent-rgb),0.7)] hover:text-[var(--accent)] hover:shadow-[0_0_24px_-8px_rgba(var(--accent-rgb),0.85)] aria-expanded:border-[rgba(var(--accent-rgb),0.7)] aria-expanded:text-[var(--accent)]"
        >
          {/* sheen sweep on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[900ms] ease-out group-hover/handle:translate-x-full"
          />
          <span className="relative flex h-2 w-2" aria-hidden>
            {!connectOpen && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-50" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          <span className="relative">{connectOpen ? "close" : "let's connect"}</span>
          <ChevronUp
            size={14}
            strokeWidth={2.5}
            aria-hidden
            className={`relative transition-transform duration-300 ease-out ${connectOpen ? "rotate-180" : ""}`}
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
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-[rgba(var(--accent-rgb),0.25)] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-4 shadow-[0_0_44px_-18px_rgba(var(--accent-rgb),0.6)] backdrop-blur-md">
                {/* accent hairline across the top of the card */}
                <span
                  aria-hidden
                  className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60"
                />
                {/* availability signal — a recruiter-facing status line */}
                <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.26em] text-[var(--text-secondary)]">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  available for opportunities
                </div>
                <p className="mb-3 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  <span className="text-[var(--accent)]">{"//"}</span> find me on
                </p>
                <nav
                  className="grid grid-cols-5 gap-1.5"
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
                      className="group/soc flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-[var(--border)] py-2 text-[var(--text-secondary)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(var(--accent-rgb),0.7)] hover:bg-[rgba(var(--accent-rgb),0.1)] hover:text-[var(--accent)] hover:shadow-[0_0_16px_-6px_rgba(var(--accent-rgb),0.8)] active:scale-90"
                    >
                      {SOCIAL_ICONS[link.name]}
                      <span className="text-[8px] uppercase tracking-wider opacity-70 transition-opacity group-hover/soc:opacity-100">
                        {link.name}
                      </span>
                    </motion.a>
                  ))}
                </nav>

                {/* Owner entrance — sign in / register CTA, shown when signed out. */}
                {!user && (
                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <Link
                      href="/admin"
                      className="group/si relative flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-xl border border-[rgba(var(--accent-rgb),0.5)] bg-[rgba(var(--accent-rgb),0.08)] font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] transition-all duration-200 ease-out hover:border-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.16)] hover:shadow-[0_0_22px_-6px_rgba(var(--accent-rgb),0.8)] active:scale-[0.98]"
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[900ms] ease-out group-hover/si:translate-x-full"
                      />
                      <LogIn size={14} strokeWidth={2.4} className="relative" aria-hidden />
                      <span className="relative">Sign in / Register</span>
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

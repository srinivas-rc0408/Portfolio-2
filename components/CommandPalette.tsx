"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, type Variants } from "framer-motion";
import {
  Award,
  Badge,
  Briefcase,
  CornerDownLeft,
  Eraser,
  FileText,
  Gamepad2,
  GraduationCap,
  Mail,
  Search,
  Sparkles,
  SquareTerminal,
  Target,
  User2,
  Zap,
} from "lucide-react";
import { docUrl, PRIVATE_RESOURCE } from "@/lib/cms";
import { openDoc } from "@/components/DocViewer";
import { useScrollLock } from "@/lib/useScrollLock";
import { SoundEngine } from "@/lib/sound";
import { showToast } from "@/components/Toast";
import { BACKDROP, EASE_OUT, EXIT } from "@/lib/motion";

/** Fire a terminal command from anywhere and scroll the terminal into view. */
function execInTerminal(command: string): void {
  window.dispatchEvent(
    new CustomEvent<string>("terminal:exec", { detail: command })
  );
  document
    .querySelector(".terminal-pane")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface Command {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Documents" | "Actions";
  keywords: string;
  icon: React.ReactNode;
  run: () => void;
}

const IC = { size: 17, strokeWidth: 2 } as const;

const COMMANDS: Command[] = [
  { id: "about", label: "About", hint: "cd about", group: "Navigate", keywords: "whoami bio intro who", icon: <User2 {...IC} />, run: () => execInTerminal("cd about") },
  { id: "projects", label: "Projects", hint: "cd projects", group: "Navigate", keywords: "work repos aegis air-gapped sih archagent flappy duck build portfolio", icon: <SquareTerminal {...IC} />, run: () => execInTerminal("cd projects") },
  { id: "skills", label: "Skills", hint: "cd skills", group: "Navigate", keywords: "stack tech python ml llm tools", icon: <Zap {...IC} />, run: () => execInTerminal("cd skills") },
  { id: "experience", label: "Experience", hint: "experience", group: "Navigate", keywords: "work history yantra roles", icon: <Briefcase {...IC} />, run: () => execInTerminal("experience") },
  { id: "education", label: "Education", hint: "education", group: "Navigate", keywords: "degree btech reva school study", icon: <GraduationCap {...IC} />, run: () => execInTerminal("education") },
  { id: "certificates", label: "Certificates", hint: "certificates", group: "Navigate", keywords: "certs credentials copado nptel udemy", icon: <Badge {...IC} />, run: () => execInTerminal("certificates") },
  { id: "achievements", label: "Achievements", hint: "achievements", group: "Navigate", keywords: "awards wins deep learning", icon: <Award {...IC} />, run: () => execInTerminal("achievements") },
  { id: "focus", label: "Currently Building", hint: "focus", group: "Navigate", keywords: "now building hornet personal ai agent browser project glass status focus", icon: <Target {...IC} />, run: () => execInTerminal("focus") },
  { id: "contact", label: "Contact", hint: "contact", group: "Navigate", keywords: "email github linkedin connect reach socials", icon: <Mail {...IC} />, run: () => execInTerminal("contact") },

  { id: "resume", label: "View Resume", hint: "PDF", group: "Documents", keywords: "cv pdf download hire", icon: <FileText {...IC} />, run: () => { const u = docUrl("resume"); if (u === PRIVATE_RESOURCE) { showToast("Authentication required. Resource is private."); return; } openDoc({ label: "Resume", url: u }); } },
  { id: "cv", label: "View CV", hint: "PDF", group: "Documents", keywords: "resume pdf curriculum", icon: <FileText {...IC} />, run: () => { const u = docUrl("cv"); if (u === PRIVATE_RESOURCE) { showToast("Authentication required. Resource is private."); return; } openDoc({ label: "CV", url: u }); } },

  { id: "jerry", label: "Ask Jerry (AI Chat)", hint: "jerry", group: "Actions", keywords: "ai assistant chat bot question help", icon: <Sparkles {...IC} />, run: () => execInTerminal("jerry") },
  { id: "games", label: "Play Arch-Man", hint: "play archman", group: "Actions", keywords: "game arcade fun play", icon: <Gamepad2 {...IC} />, run: () => execInTerminal("play archman") },
  { id: "clear", label: "Clear Terminal", hint: "clear", group: "Actions", keywords: "reset wipe cls", icon: <Eraser {...IC} />, run: () => execInTerminal("clear") },
];

const GROUP_ORDER: Command["group"][] = ["Navigate", "Documents", "Actions"];

/* The palette's own entrance: it drops from above — it lives at the top of the
   screen, so it arrives from there — and pulls into focus out of a light blur,
   like a lens settling. The rows then cascade in behind it. filter ends on
   "none" rather than blur(0px): a resting filter keeps a compositing layer
   alive and re-rasterises the frosted panel on every scroll. */
const PANEL: Variants = {
  hidden: { opacity: 0, y: -14, scale: 0.975, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.34,
      ease: EASE_OUT,
      // Rows start once the panel is mostly settled, not on top of it.
      delayChildren: 0.06,
      staggerChildren: 0.016,
    },
    transitionEnd: { filter: "none" },
  },
  // Leaving is quicker and quieter than arriving — the user already decided.
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    filter: "blur(4px)",
    transition: EXIT,
  },
};

const ROW: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } },
};

/** Echo the typed query back inside the label, the way Spotlight does. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-[rgba(var(--theme-accent-rgb),0.22)] px-px text-[var(--theme-accent)]">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Bumped on every open. It namespaces the sliding highlight's layoutId, so
  // a fresh open never animates the pill in from wherever it sat last time.
  const [session, setSession] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Whatever had focus before the palette opened — it gets focus back on close,
  // so a keyboard user lands where they were instead of at the top of <body>.
  const openerRef = useRef<HTMLElement | null>(null);

  useScrollLock(open);

  const show = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setSession((n) => n + 1);
    setOpen(true);
    SoundEngine.whoosh();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    openerRef.current?.focus({ preventScroll: true });
    openerRef.current = null;
  }, []);

  // Flat, filtered list (selection indexes into this); grouping is presentational.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.keywords.includes(q)
    );
  }, [query]);

  // Global Cmd/Ctrl+K toggle. Capture phase + preventDefault beats the browser's
  // own find/search bar. Escape closes. Reset happens in close(), so opening
  // always starts fresh without any setState-in-effect.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      } else if (e.key === "Escape" && open) {
        // preventDefault alone doesn't stop the event: this listener runs in
        // the capture phase at window, so Jerry's bubble-phase Escape handler
        // still fired and one keypress closed BOTH popups. Stopping here ends
        // dispatch before the bubble phase — Esc closes only the top layer.
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, close, show]);

  // Open from elsewhere on the page — the terminal's green window dot uses
  // this. Same window-event pattern the profile lightbox uses for `profile:view`,
  // so nothing has to reach into this component's state. Guarded on `open` so a
  // second trigger while the palette is already up doesn't replay the sound.
  useEffect(() => {
    const onOpen = () => {
      if (!open) show();
    };
    window.addEventListener("palette:open", onOpen);
    return () => window.removeEventListener("palette:open", onOpen);
  }, [open, show]);

  // Focus the input once it opens (no state writes → no cascading renders).
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  const runAt = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    close();
    // Let the exit animation start before the command mutates the page.
    window.setTimeout(() => cmd.run(), 60);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    const n = results.length;
    if (n === 0) return;
    // Arrows wrap, as in Spotlight/Raycast. Tab steps the selection too, which
    // doubles as the focus trap: focus never leaves the search field (rows are
    // tabIndex -1), so Tab can't wander into the page behind the dialog.
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      setActive((a) => (a + 1) % n);
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      setActive((a) => (a - 1 + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(active);
    }
  };

  // Scroll the highlighted row into view during keyboard nav.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Only ever evaluated while open (client-side), so reading navigator is safe
  // and there's no server markup for it to mismatch against.
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={close}
          {...BACKDROP}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm sm:pt-[16vh]"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            variants={PANEL}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: "50% 0%" }}
            className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 font-mono shadow-[0_28px_80px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(var(--theme-accent-rgb),0.06)] backdrop-blur-2xl"
          >
            {/* Top light-catch — the same inset highlight the command chips
                carry, so the palette reads as one material with the terminal. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />

            {/* Search input. The row owns the focus state (accent underline),
                which is why the input itself opts out of the global ring. */}
            <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 transition-colors duration-200 focus-within:border-[rgba(var(--theme-accent-rgb),0.4)]">
              <Search size={18} className="shrink-0 text-zinc-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search or jump to…"
                aria-label="Search commands"
                aria-controls="palette-results"
                aria-activedescendant={results[active] ? `palette-opt-${results[active].id}` : undefined}
                className="min-w-0 flex-1 bg-transparent py-4 text-[15px] text-zinc-100 placeholder:text-zinc-400/80 outline-none [caret-color:var(--theme-accent)]"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden shrink-0 rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-400 sm:block">
                ESC
              </kbd>
            </div>

            {/* Results. layoutScroll lets the sliding highlight measure itself
                correctly while this list is scrolled. */}
            <motion.div
              ref={listRef}
              id="palette-results"
              role="listbox"
              layoutScroll
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
            >
              {results.length === 0 ? (
                <motion.div
                  variants={ROW}
                  className="flex flex-col items-center gap-1.5 px-3 py-10 text-center"
                >
                  <Search size={20} className="text-zinc-600" aria-hidden />
                  <p className="text-sm text-zinc-300">
                    No matches for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-zinc-400/80">
                    Try <span className="text-zinc-300">projects</span>,{" "}
                    <span className="text-zinc-300">resume</span> or{" "}
                    <span className="text-zinc-300">jerry</span>.
                  </p>
                </motion.div>
              ) : (
                <LayoutGroup id={`palette-${session}`}>
                  {GROUP_ORDER.map((group) => {
                    const items = results.filter((c) => c.group === group);
                    if (items.length === 0) return null;
                    return (
                      <div key={group} role="group" aria-label={group} className="mb-1">
                        <motion.p
                          variants={ROW}
                          className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400/80"
                        >
                          {group}
                        </motion.p>
                        {items.map((cmd) => {
                          const idx = results.indexOf(cmd);
                          const isActive = idx === active;
                          return (
                            <motion.button
                              key={cmd.id}
                              id={`palette-opt-${cmd.id}`}
                              role="option"
                              aria-selected={isActive}
                              type="button"
                              tabIndex={-1}
                              data-idx={idx}
                              variants={ROW}
                              onClick={() => runAt(idx)}
                              onMouseMove={() => setActive(idx)}
                              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                                isActive ? "text-white" : "text-zinc-300"
                              }`}
                            >
                              {/* One highlight that SLIDES between rows rather
                                  than blinking off one and on the next. Critically
                                  damped (no overshoot): it should feel quick and
                                  certain, not springy. */}
                              {isActive && (
                                <motion.span
                                  layoutId="palette-active"
                                  aria-hidden
                                  transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.8 }}
                                  className="absolute inset-0 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.22)] bg-[rgba(var(--theme-accent-rgb),0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                />
                              )}
                              <span
                                className={`relative shrink-0 transition-colors duration-150 ${
                                  isActive ? "text-[var(--theme-accent)]" : "text-zinc-400"
                                }`}
                                aria-hidden
                              >
                                {cmd.icon}
                              </span>
                              <span className="relative flex-1 truncate text-sm">
                                <Highlight text={cmd.label} query={query} />
                              </span>
                              <span
                                className={`relative shrink-0 text-[11px] transition-colors duration-150 ${
                                  isActive ? "text-zinc-300" : "text-zinc-400/80"
                                }`}
                              >
                                {cmd.hint}
                              </span>
                              {/* Always rendered, only faded: the old version
                                  mounted it on the active row alone, which shoved
                                  that row's hint 20px left of every other hint. */}
                              <CornerDownLeft
                                size={13}
                                aria-hidden
                                className={`relative shrink-0 text-[var(--theme-accent)] transition-[opacity,transform] duration-200 ${
                                  isActive ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                                }`}
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                    );
                  })}
                </LayoutGroup>
              )}
            </motion.div>

            {/* Footer hints — with the modifier key this platform actually has. */}
            <div className="flex shrink-0 items-center gap-4 border-t border-white/10 px-4 py-2 text-[10px] text-zinc-400/80">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1">↑</kbd>
                <kbd className="rounded border border-white/10 px-1">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1">↵</kbd>
                select
              </span>
              <span className="ml-auto flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1">{isMac ? "⌘" : "Ctrl"}</kbd>
                <kbd className="rounded border border-white/10 px-1">K</kbd>
                toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

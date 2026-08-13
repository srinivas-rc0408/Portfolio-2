"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Badge,
  Briefcase,
  CornerDownLeft,
  FileText,
  Gamepad2,
  GraduationCap,
  Mail,
  Search,
  Sparkles,
  SquareTerminal,
  Target,
  Trash2,
  User2,
  Zap,
} from "lucide-react";
import { docUrl, PRIVATE_RESOURCE } from "@/lib/cms";
import { openDoc } from "@/components/DocViewer";
import { useScrollLock } from "@/lib/useScrollLock";
import { SoundEngine } from "@/lib/sound";
import { showToast } from "@/components/Toast";

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
  { id: "about", label: "About", hint: "cd about", group: "Navigate", keywords: "whoami bio intro who", icon: <User2 {...IC} />, run: () => execInTerminal("about") },
  { id: "projects", label: "Projects", hint: "cd projects", group: "Navigate", keywords: "work repos archagent flappy duck build portfolio", icon: <SquareTerminal {...IC} />, run: () => execInTerminal("cd projects") },
  { id: "skills", label: "Skills", hint: "cd skills", group: "Navigate", keywords: "stack tech python ml llm tools", icon: <Zap {...IC} />, run: () => execInTerminal("cd skills") },
  { id: "experience", label: "Experience", hint: "experience", group: "Navigate", keywords: "work history yantra roles", icon: <Briefcase {...IC} />, run: () => execInTerminal("experience") },
  { id: "education", label: "Education", hint: "education", group: "Navigate", keywords: "degree btech reva school study", icon: <GraduationCap {...IC} />, run: () => execInTerminal("education") },
  { id: "certificates", label: "Certificates", hint: "certificates", group: "Navigate", keywords: "certs credentials copado nptel udemy", icon: <Badge {...IC} />, run: () => execInTerminal("certificates") },
  { id: "achievements", label: "Achievements", hint: "achievements", group: "Navigate", keywords: "awards wins deep learning", icon: <Award {...IC} />, run: () => execInTerminal("achievements") },
  { id: "focus", label: "Currently Building", hint: "focus", group: "Navigate", keywords: "now building aquasentinel status focus", icon: <Target {...IC} />, run: () => execInTerminal("focus") },
  { id: "contact", label: "Contact", hint: "contact", group: "Navigate", keywords: "email github linkedin connect reach socials", icon: <Mail {...IC} />, run: () => execInTerminal("contact") },

  { id: "resume", label: "View Resume", hint: "PDF", group: "Documents", keywords: "cv pdf download hire", icon: <FileText {...IC} />, run: () => { const u = docUrl("resume"); if (u === PRIVATE_RESOURCE) { showToast("Authentication required. Resource is private."); return; } openDoc({ label: "Resume", url: u }); } },
  { id: "cv", label: "View CV", hint: "PDF", group: "Documents", keywords: "resume pdf curriculum", icon: <FileText {...IC} />, run: () => { const u = docUrl("cv"); if (u === PRIVATE_RESOURCE) { showToast("Authentication required. Resource is private."); return; } openDoc({ label: "CV", url: u }); } },

  { id: "jerry", label: "Ask Jerry (AI Chat)", hint: "jerry", group: "Actions", keywords: "ai assistant chat bot question help", icon: <Sparkles {...IC} />, run: () => execInTerminal("jerry") },
  { id: "games", label: "Play Arch-Man", hint: "play archman", group: "Actions", keywords: "game arcade fun play", icon: <Gamepad2 {...IC} />, run: () => execInTerminal("play archman") },
  { id: "clear", label: "Clear Terminal", hint: "clear", group: "Actions", keywords: "reset wipe cls", icon: <Trash2 {...IC} />, run: () => execInTerminal("clear") },
];

const GROUP_ORDER: Command["group"][] = ["Navigate", "Documents", "Actions"];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
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
        else {
          setOpen(true);
          SoundEngine.whoosh();
        }
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, close]);

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
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm sm:pt-[16vh]"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", mass: 0.7, stiffness: 320, damping: 26 }}
            className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 font-mono shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            {/* Search input */}
            <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4">
              <Search size={18} className="shrink-0 text-zinc-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search sections, documents, actions…"
                aria-label="Search commands"
                className="min-w-0 flex-1 bg-transparent py-4 text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden shrink-0 rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-400 sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-zinc-400">
                  No matches for &ldquo;{query}&rdquo;
                </p>
              ) : (
                GROUP_ORDER.map((group) => {
                  const items = results.filter((c) => c.group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group} className="mb-1">
                      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                        {group}
                      </p>
                      {items.map((cmd) => {
                        const idx = results.indexOf(cmd);
                        const isActive = idx === active;
                        return (
                          <button
                            key={cmd.id}
                            type="button"
                            data-idx={idx}
                            onClick={() => runAt(idx)}
                            onMouseMove={() => setActive(idx)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? "bg-[rgba(var(--theme-accent-rgb),0.14)] text-white"
                                : "text-zinc-300 hover:bg-white/[0.04]"
                            }`}
                          >
                            <span
                              className={`shrink-0 ${
                                isActive ? "text-[var(--theme-accent)]" : "text-zinc-400"
                              }`}
                              aria-hidden
                            >
                              {cmd.icon}
                            </span>
                            <span className="flex-1 truncate text-sm">{cmd.label}</span>
                            <span className="shrink-0 text-[11px] text-zinc-600">
                              {cmd.hint}
                            </span>
                            {isActive && (
                              <CornerDownLeft
                                size={13}
                                className="shrink-0 text-[var(--theme-accent)]"
                                aria-hidden
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex shrink-0 items-center gap-4 border-t border-white/10 px-4 py-2 text-[10px] text-zinc-600">
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
                <kbd className="rounded border border-white/10 px-1">⌘</kbd>
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

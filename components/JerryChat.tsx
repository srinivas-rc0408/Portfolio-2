"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { Send, Trash2, X } from "lucide-react";
import { docUrl } from "@/lib/cms";

/**
 * Jerry — dedicated floating AI chat interface.
 *   · Opened by the `jerry` terminal command (or legacy `ai …`).
 *   · Glassmorphism panel, framer-motion fade/scale, accent-themed.
 *   · Chats persist across open/close (module cache) until cleared.
 *   · Quick-action chips: mandatory "Why choose Srinivas R C?" first,
 *     plus a random sample of common questions on every open.
 *   · Typing `exit` (or pressing Esc / ✕) closes the panel.
 */

interface Msg {
  role: "user" | "jerry";
  text: string;
}

interface JerryChatProps {
  open: boolean;
  onClose: () => void;
  /** Auto-sent once when opened via `ai <question>` (legacy path). */
  initialQuestion?: string | null;
}

const INTRO =
  "Hi! I am Jerry, Srinivas RC's personal AI assistant. How can I help you explore his portfolio today?";

const MANDATORY_CHIP = "Why choose Srinivas R C?";
const CHIP_POOL = [
  "What is his tech stack?",
  "Show me his projects",
  "What is Archagent?",
  "Tell me a fun fact",
  "What is his CGPA?",
  "How can I contact him?",
  "What certifications does he have?",
];

const OFFLINE_MSG =
  "Jerry (System): I couldn't reach the network. Please try again in a moment.";
const LIMIT_MSG =
  "Daily AI request limit reached (10/day). Come back tomorrow — or explore the terminal commands meanwhile!";

// --- Client-side daily usage cap (backs up the server's per-IP limit) ---
const MAX_PER_DAY = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function aiUsage(): { count: number; timestamp: number } {
  if (typeof window === "undefined") return { count: 0, timestamp: Date.now() };
  try {
    const raw = localStorage.getItem("ai_usage");
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupted → treat as fresh */
  }
  return { count: 0, timestamp: Date.now() };
}

/** Consumes one request if available; false when the daily cap is hit. */
function takeAIRequest(): boolean {
  const now = Date.now();
  const u = aiUsage();
  const fresh = now - u.timestamp > DAY_MS;
  if (!fresh && u.count >= MAX_PER_DAY) return false;
  localStorage.setItem(
    "ai_usage",
    JSON.stringify(
      fresh ? { count: 1, timestamp: now } : { count: u.count + 1, timestamp: u.timestamp }
    )
  );
  return true;
}

// Module-level cache: the conversation survives close/reopen (and terminal
// `clear`) until the user explicitly clears it from the chat header.
let chatCache: Msg[] = [];

function sampleChips(): string[] {
  const shuffled = [...CHIP_POOL].sort(() => Math.random() - 0.5);
  return [MANDATORY_CHIP, ...shuffled.slice(0, 3)];
}

export default function JerryChat({ open, onClose, initialQuestion }: JerryChatProps) {
  const [messages, setMessages] = useState<Msg[]>(chatCache);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sentInitialRef = useRef(false);

  const setAndCache = useCallback((updater: (prev: Msg[]) => Msg[]) => {
    setMessages((prev) => {
      chatCache = updater(prev);
      return chatCache;
    });
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q || busy) return;
      setInput("");
      if (q.toLowerCase() === "exit") {
        onClose();
        return;
      }
      // Resume/CV asks open the document viewer directly (instant, no API) —
      // the viewer stacks above this chat, so the conversation continues
      // exactly where it left off once the user closes it.
      const docAsk = /\b(cv|curriculum vitae)\b/i.test(q)
        ? ("CV" as const)
        : /\bresume\b/i.test(q)
          ? ("Resume" as const)
          : null;
      if (docAsk) {
        const section = docAsk === "CV" ? "cv" : "resume";
        const url = docUrl(section);
        window.dispatchEvent(
          new CustomEvent("doc:view", { detail: { label: docAsk, url } })
        );
        setAndCache((prev) => [
          ...prev,
          { role: "user", text: q },
          {
            role: "jerry",
            text: `Opening Srinivas's ${docAsk} for you — view it right here and grab the download button inside. Close it any time and we'll pick up where we left off!`,
          },
        ]);
        return;
      }
      if (!takeAIRequest()) {
        setAndCache((prev) => [
          ...prev,
          { role: "user", text: q },
          { role: "jerry", text: LIMIT_MSG },
        ]);
        return;
      }
      setBusy(true);
      // Push the user message and an empty Jerry message the stream fills in.
      setAndCache((prev) => [
        ...prev,
        { role: "user", text: q },
        { role: "jerry", text: "" },
      ]);
      const controller = new AbortController();
      abortRef.current = controller;
      const appendToken = (t: string) =>
        setAndCache((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, text: last.text + t };
          return next;
        });
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: q }),
          signal: controller.signal,
        });
        if (!res.body) throw new Error("no stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          appendToken(decoder.decode(value, { stream: true }));
        }
      } catch {
        if (!controller.signal.aborted) {
          setAndCache((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "jerry" && !last.text) {
              next[next.length - 1] = { ...last, text: OFFLINE_MSG };
            }
            return next;
          });
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, onClose, setAndCache]
  );

  // On open: fresh chip sample, focus, sync from cache; Esc closes.
  useEffect(() => {
    if (!open) return;
    track("jerry_opened"); // analytics: recruiter engaged the AI assistant
    setMessages(chatCache);
    setChips(sampleChips());
    const t = window.setTimeout(() => inputRef.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      abortRef.current?.abort();
    };
  }, [open, onClose]);

  // Legacy `ai <question>` → auto-send once per open.
  useEffect(() => {
    if (open && initialQuestion && !sentInitialRef.current) {
      sentInitialRef.current = true;
      void send(initialQuestion);
    }
    if (!open) sentInitialRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuestion]);

  // Keep the newest message in view while streaming.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="jerry-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Jerry AI chat interface"
        >
          <motion.div
            key="jerry-panel"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: "transform, opacity" }}
            className="flex h-[78vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/70 font-mono backdrop-blur-xl sm:h-[600px] sm:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--theme-accent)] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--theme-accent)]" />
                </span>
                <h2 className="text-sm font-bold text-white">
                  Jerry <span className="font-normal text-white/50">— AI Assistant</span>
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    chatCache = [];
                    setMessages([]);
                    setChips(sampleChips());
                  }}
                  aria-label="Clear conversation"
                  title="Clear conversation"
                  className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Trash2 size={15} strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close chat"
                  title="Close (Esc)"
                  className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={17} strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              aria-live="polite"
            >
              {/* Jerry's standing introduction */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-[88%] rounded-xl rounded-tl-sm border border-[rgba(var(--theme-accent-rgb),0.25)] bg-[rgba(var(--theme-accent-rgb),0.07)] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/90"
              >
                {INTRO}
              </motion.div>

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[88%] rounded-xl rounded-tr-sm bg-white/[0.08] px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
                      {m.text}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-[88%] whitespace-pre-wrap rounded-xl rounded-tl-sm border border-[rgba(var(--theme-accent-rgb),0.25)] bg-[rgba(var(--theme-accent-rgb),0.07)] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/90"
                  >
                    {!m.text && busy && i === messages.length - 1 ? (
                      /* Thinking indicator — shown until the first token lands */
                      <span
                        className="flex items-center gap-1.5 py-0.5"
                        aria-label="Jerry is thinking"
                      >
                        <span className="text-[11px] italic text-white/50">
                          Jerry is thinking
                        </span>
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            className="h-1.5 w-1.5 rounded-full bg-[var(--theme-accent)]"
                            animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
                            transition={{
                              duration: 0.9,
                              repeat: Infinity,
                              delay: d * 0.15,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </span>
                    ) : (
                      <>
                        {m.text}
                        {busy && i === messages.length - 1 && (
                          <span className="ml-0.5 inline-block h-3.5 w-[7px] animate-pulse bg-[var(--theme-accent)] align-middle" />
                        )}
                      </>
                    )}
                  </motion.div>
                )
              )}
            </div>

            {/* Quick-action chips */}
            <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(c)}
                  className="shrink-0 rounded-full border border-[rgba(var(--theme-accent-rgb),0.4)] bg-[rgba(var(--theme-accent-rgb),0.06)] px-3 py-1.5 text-[11px] text-white/90 transition-all duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.16)] active:scale-95 disabled:opacity-40"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              className="flex shrink-0 items-center gap-2 border-t border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Jerry anything… (type 'exit' to close)"
                aria-label="Message Jerry"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white placeholder-white/30 outline-none transition-all duration-150 [caret-color:var(--theme-accent)] focus:border-[rgba(var(--theme-accent-rgb),0.6)]"
              />
              <motion.button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                animate={{
                  scale: input.trim() && !busy ? 1 : 0.9,
                  opacity: input.trim() && !busy ? 1 : 0.45,
                }}
                whileHover={input.trim() && !busy ? { scale: 1.08 } : undefined}
                whileTap={{ scale: 0.82 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.12)] p-2 text-[var(--theme-accent)] transition-shadow duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.25)] disabled:hover:shadow-none"
              >
                <Send size={15} strokeWidth={2.2} aria-hidden />
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

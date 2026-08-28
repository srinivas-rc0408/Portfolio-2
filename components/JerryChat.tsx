"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { track } from "@vercel/analytics";
import { Send, Trash2, X, Zap } from "lucide-react";
import { docUrl, PRIVATE_RESOURCE } from "@/lib/cms";
import { useScrollLock } from "@/lib/useScrollLock";
import { SoundEngine } from "@/lib/sound";

// Sentinel prepended by /api/chat when Jerry's highlightBackend tool fires.
const TOOL_SENTINEL = "[TOOL:highlightBackend]";
const TOOL_SENTINEL_NL = TOOL_SENTINEL + "\n";

/**
 * Jerry's logo — a rounded accent badge with a chat bubble + spark (an AI
 * assistant mark), plus a live "online" pulse. Follows the site theme accent.
 */
function JerryLogo({ size = 30, live = true }: { size?: number; live?: boolean }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-xl border border-[rgba(var(--theme-accent-rgb),0.45)] bg-[rgba(var(--theme-accent-rgb),0.12)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--theme-accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 15.5A2.5 2.5 0 0 1 17.5 18H8l-4 3.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5z" />
        <path
          d="M12 7.4l.85 2.35L15.2 10.6l-2.35.85L12 13.8l-.85-2.35L8.8 10.6l2.35-.85z"
          fill="var(--theme-accent)"
          stroke="none"
        />
      </svg>
      {live && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--theme-accent)] opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--theme-accent)] ring-2 ring-black" />
        </span>
      )}
    </span>
  );
}

/**
 * Renders Jerry's replies as full markdown — **bold**, bullet + numbered lists,
 * `inline code`, fenced code blocks and links — via react-markdown + GFM, themed
 * to the terminal. Raw HTML is ignored (no rehype-raw plugin), so it stays
 * injection-safe. Only rendered on a completed message, never mid-stream, so
 * partial/unclosed markdown never flickers.
 */
function JerryMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-2 leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-white/90">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--theme-accent)] underline underline-offset-2 transition-opacity hover:opacity-75"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-1 list-disc space-y-1 pl-5 marker:text-[var(--theme-accent)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1 list-decimal space-y-1 pl-5 marker:text-[var(--theme-accent)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          h1: ({ children }) => <p className="font-bold text-white">{children}</p>,
          h2: ({ children }) => <p className="font-bold text-white">{children}</p>,
          h3: ({ children }) => <p className="font-semibold text-white">{children}</p>,
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 text-[12px] leading-relaxed [scrollbar-width:thin]">
              {children}
            </pre>
          ),
          code: ({ className, children }) => {
            // In a fenced block react-markdown sets a `language-*` class; inline
            // code has none. Block code inherits the <pre> styling above; inline
            // code gets the pill treatment.
            const isBlock = /language-/.test(className ?? "");
            return isBlock ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="rounded bg-white/10 px-1 py-0.5 text-[12px] text-[var(--theme-accent)]">
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Jerry — dedicated floating AI chat interface.
 *   · Opened by the `jerry` terminal command (or legacy `ai …`).
 *   · Glassmorphism panel, framer-motion fade/scale, accent-themed.
 *   · Chats persist across open/close (module cache) until cleared.
 *   · Quick-action chips: a pinned opener, the flagship "Why choose Srinivas
 *     R C?" second, plus a fresh sample of pro questions on every open.
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

// Three standout questions are always shown — a strong opener, the flagship
// "Why choose…", and his current IIT Ropar internship (a prestige signal) — then
// a fresh sample from a pro, recruiter-oriented pool. Every prompt maps to
// Jerry's knowledge base so answers stay accurate.
const LEAD_CHIP = "What makes him stand out?";
const WHY_CHIP = "Why choose Srinivas R C?";
const INTERN_CHIP = "Tell me about his IIT Ropar internship";
const CHIP_POOL = [
  "Walk me through ArchAgent",
  "What's he building right now?",
  "How deep is his LLM & agentic AI work?",
  "Show me his production-ready projects",
  "What's his strongest engineering skill?",
  "Is he ready for a full-time AI/ML role?",
  "What's his MLOps & deployment experience?",
  "How does he use AI in his workflow?",
  "What's his tech stack?",
  "What certifications back his skills?",
  "What is he studying, and where?",
  "What are his standout achievements?",
  "How can I get in touch with him?",
  "Tell me something fun about him",
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
  // 6 chips: pinned opener, flagship "Why choose…", the internship, then 3 fresh.
  return [LEAD_CHIP, WHY_CHIP, INTERN_CHIP, ...shuffled.slice(0, 3)];
}

export default function JerryChat({ open, onClose, initialQuestion }: JerryChatProps) {
  // Lock background scrolling while this modal is open.
  useScrollLock(open);
  const [messages, setMessages] = useState<Msg[]>(chatCache);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const [domOverride, setDomOverride] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-grow the textarea to fit its content, capped so it scrolls past ~5 rows.
  const autosize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, []);
  const abortRef = useRef<AbortController | null>(null);
  const sentInitialRef = useRef(false);

  const setAndCache = useCallback((updater: (prev: Msg[]) => Msg[]) => {
    setMessages((prev) => {
      chatCache = updater(prev);
      return chatCache;
    });
  }, []);

  // Overwrite the trailing (streaming) Jerry bubble's text.
  const setLastJerry = useCallback(
    (text: string) =>
      setAndCache((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "jerry") next[next.length - 1] = { ...last, text };
        return next;
      }),
    [setAndCache]
  );

  // Paint the vetted reply immediately.
  //
  // This previously ran a client-side "typewriter" that stepped through the
  // text on a 16ms timer — roughly 2.2s of purely cosmetic latency on a normal
  // answer. The API already buffers the full reply server-side so the output
  // guard can vet it, so that delay bought nothing but a slower agent. Rendering
  // in one commit is the fastest correct behaviour.
  const revealText = useCallback(
    (full: string) => {
      setLastJerry(full);
      return Promise.resolve();
    },
    [setLastJerry]
  );

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
        if (url === PRIVATE_RESOURCE) {
          // Document is private — do NOT open the viewer or leak any URL.
          setAndCache((prev) => [
            ...prev,
            { role: "user", text: q },
            {
              role: "jerry",
              text: `I'm sorry — Srinivas's ${docAsk} has been marked as **private** by the administrator. I can't open it right now. Please reach out to him directly if you need access!`,
            },
          ]);
          return;
        }
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
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: q }),
          signal: controller.signal,
        });
        // Graceful 429 handling — polished rate-limit message.
        if (res.status === 429) {
          const body = await res.text().catch(() => "");
          await revealText(
            body ||
              "[SYS] Network capacity reached. Please try again in a moment."
          );
          return;
        }
        if (!res.body) throw new Error("no stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
        }
        // Tool-call: detect and strip the highlightBackend sentinel.
        let displayText = full.trim();
        const hasTool =
          displayText.startsWith(TOOL_SENTINEL_NL) ||
          displayText.startsWith(TOOL_SENTINEL);
        if (hasTool) {
          displayText = displayText
            .replace(TOOL_SENTINEL_NL, "")
            .replace(TOOL_SENTINEL, "")
            .trimStart();
          // Show the DOM override pill, then fire the UI event after 600ms.
          // Wrapped in try/catch so a tool-call failure never breaks the stream.
          try {
            setDomOverride(true);
            window.setTimeout(() => {
              window.dispatchEvent(new CustomEvent("jerry:highlight-backend"));
            }, 600);
          } catch {
            /* tool-call failure — fail silently, text stream continues */
          }
        }
        // Reveal the vetted reply.
        await revealText(displayText || OFFLINE_MSG);
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
        setDomOverride(false);
      }
    },
    [busy, onClose, setAndCache, revealText]
  );

  // On open: fresh chip sample, focus, sync from cache; Esc closes.
  useEffect(() => {
    if (!open) return;
    track("jerry_opened"); // analytics: recruiter engaged the AI assistant
    setMessages(chatCache);
    setChips(sampleChips());
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      autosize(); // settle the textarea to its true single-row height from the start
    }, 350);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      abortRef.current?.abort();
    };
  }, [open, onClose, autosize]);

  // Legacy `ai <question>` → auto-send once per open.
  useEffect(() => {
    if (open && initialQuestion && !sentInitialRef.current) {
      sentInitialRef.current = true;
      void send(initialQuestion);
    }
    if (!open) sentInitialRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuestion]);

  // Keep the newest message in view while streaming. Smooth when a new message
  // arrives; instant during a burst of streamed tokens so it never lags behind.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: busy ? "auto" : "smooth" });
  }, [messages, open, busy]);

  // Collapse the textarea back to one row after it clears (e.g. after sending).
  useEffect(() => {
    if (!input) autosize();
  }, [input, autosize]);

  // Keyboard-safe sizing on mobile. The on-screen keyboard does NOT shrink the
  // layout viewport (so 100vh/100dvh would leave the input hidden behind it) —
  // but it DOES shrink window.visualViewport. Mirror the visual viewport's
  // height and top offset onto the overlay so the panel (and its bottom-pinned
  // input) always reflow to sit right above the keyboard. No-op where the API
  // is missing; the CSS 100dvh fallback covers those.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    const el = overlayRef.current;
    if (!vv || !el) return;
    const sync = () => {
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          key="jerry-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed left-0 right-0 top-0 z-[100] flex h-[100dvh] items-end justify-center bg-black/60 pt-[max(env(safe-area-inset-top),0.5rem)] backdrop-blur-sm sm:items-center sm:p-6 sm:pt-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Jerry AI chat interface"
        >
          <motion.div
            key="jerry-panel"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ willChange: "transform, opacity" }}
            className="flex h-full w-full flex-col overflow-hidden rounded-t-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/80 font-mono backdrop-blur-md sm:h-[600px] sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <JerryLogo size={32} />
                <div className="leading-tight">
                  <h2 className="text-sm font-bold text-white">Jerry</h2>
                  <p className="text-[10px] text-[var(--theme-accent)]">
                    Srinivas&apos;s AI Assistant · online
                  </p>
                </div>
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
                  className="rounded-md p-2.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Trash2 size={15} strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close chat"
                  title="Close (Esc)"
                  className="rounded-md p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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

              {/* Tool-call status pill — shown when Jerry overrides DOM state */}
              <AnimatePresence>
                {domOverride && (
                  <motion.div
                    key="dom-override-pill"
                    initial={{ opacity: 0, y: -8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="flex max-w-[88%] items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-[11px] font-mono text-emerald-400"
                    role="status"
                    aria-live="polite"
                  >
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.8 }}
                    >
                      <Zap size={13} fill="currentColor" aria-hidden />
                    </motion.span>
                    <span>Jerry is overriding DOM state&hellip;</span>
                    <motion.span
                      className="ml-1 flex gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="h-1 w-1 rounded-full bg-emerald-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.2 }}
                        />
                      ))}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[88%] break-words rounded-xl rounded-tr-sm bg-white/[0.08] px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
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
                    ) : busy && i === messages.length - 1 ? (
                      /* Still typing → plain text + caret (natural typewriter);
                         it snaps to formatted markdown the moment it finishes. */
                      <span className="whitespace-pre-wrap">
                        {m.text}
                        <span className="ml-0.5 inline-block h-3.5 w-[7px] animate-pulse bg-[var(--theme-accent)] align-middle" />
                      </span>
                    ) : (
                      <JerryMarkdown text={m.text} />
                    )}
                  </motion.div>
                )
              )}
            </div>

            {/* Quick-action chips — labeled + edge-faded horizontal rail */}
            <div className="shrink-0 px-4 pb-2">
              <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                <Zap size={9} strokeWidth={2.5} aria-hidden className="text-[var(--theme-accent)]" />
                suggested
              </div>
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {chips.map((c, i) => (
                    <button
                      key={c}
                      type="button"
                      disabled={busy}
                      onClick={() => void send(c)}
                      className={`inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] transition-all duration-150 active:scale-95 disabled:opacity-40 ${
                        i === 1
                          ? // the flagship "Why choose…" — subtly emphasised
                            "border-[rgba(var(--theme-accent-rgb),0.6)] bg-[rgba(var(--theme-accent-rgb),0.14)] font-medium text-white hover:bg-[rgba(var(--theme-accent-rgb),0.22)]"
                          : "border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-accent-rgb),0.06)] text-white/85 hover:border-[rgba(var(--theme-accent-rgb),0.55)] hover:bg-[rgba(var(--theme-accent-rgb),0.14)] hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {/* fade the right edge so the overflow reads as "scroll for more" */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/80 to-transparent"
                />
              </div>
            </div>

            {/* Input — auto-resizing textarea with premium focus-within glow */}
            <form
              className="flex shrink-0 items-end gap-2 border-t border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:pb-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <div className="flex min-w-0 flex-1 items-end rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 transition-all duration-300 ease-out focus-within:border-[rgba(var(--theme-accent-rgb),0.6)] focus-within:ring-1 focus-within:ring-[rgba(var(--theme-accent-rgb),0.35)] focus-within:shadow-[0_0_15px_rgba(var(--theme-accent-rgb),0.2)]">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autosize();
                    SoundEngine.tick();
                  }}
                  onKeyDown={(e) => {
                    // Enter sends; Shift+Enter inserts a newline.
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder="Ask Jerry anything…"
                  aria-label="Message Jerry"
                  autoComplete="off"
                  spellCheck={false}
                  className="max-h-[132px] min-h-[24px] w-full resize-none self-center border-none bg-transparent py-1 text-[16px] leading-relaxed text-zinc-200 placeholder:text-zinc-600 outline-none focus:outline-none focus:ring-0 [caret-color:var(--theme-accent)] [scrollbar-width:thin] sm:text-[13px]"
                />
              </div>
              <motion.button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                animate={{
                  scale: input.trim() && !busy ? 1 : 0.9,
                  opacity: input.trim() && !busy ? 1 : 0.45,
                }}
                whileHover={input.trim() && !busy ? { scale: 1.05 } : undefined}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.12)] text-[var(--theme-accent)] transition-colors duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.25)] hover:text-white text-zinc-400"
              >
                <Send size={16} strokeWidth={2.2} aria-hidden />
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

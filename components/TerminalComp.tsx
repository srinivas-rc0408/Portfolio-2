"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "@/public/css/TerminalComp.css";
import type { BlogInitialPost } from "@/components/BlogTerminalPage.types";

import About from "./TerminalComp/About";
import Projects from "./TerminalComp/Projects";
import Skills from "./TerminalComp/Skills";
import Contact from "./TerminalComp/Contact";
import Experience from "./TerminalComp/Experience";
import Blog from "./TerminalComp/Blog";
import ArchMan from "./TerminalComp/ArchMan";
import CmsSectionOutput from "./TerminalComp/CmsSection";
import JerryChat from "./JerryChat";
import type { CmsSection } from "@/lib/cms";
import { getItems } from "@/lib/cms";
import { RESUME_URL } from "@/lib/portfolio-data";
import {
  HOME_DIR,
  FILE_CONTENTS,
  formatLsLong,
  MAN_PAGES,
  getNeofetchData,
} from "./TerminalComp/commands/virtualFs";

// Type definitions
interface PromptProps {
  user: string;
  host: string;
}

interface OutputLineProps {
  children: React.ReactNode;
}

interface HistoryLine {
  type: "prompt" | "output";
  command?: string;
  content?: React.ReactNode | string;
}

interface HelpEntry {
  command: string;
  description: string;
}

interface HelpGroup {
  icon: string;
  title: string;
  /** Full Tailwind class so the JIT compiler sees it. */
  accent: string;
  entries: HelpEntry[];
}

interface TerminalProps {
  onFirstCommand?: () => void;
  /** When set, this terminal is mounted on /blog routes. */
  blogRoute?: boolean;
  initialBlogSlug?: string | null;
  initialBlogPost?: BlogInitialPost | null;
  /** Deep-link from /?section=about */
  initialSection?: string | null;
  /** Deep-link from /?cmd=help */
  initialCommand?: string | null;
}

const HOME_CD_SECTIONS = [
  "about",
  "projects",
  "skills",
  "experience",
  "education",
  "certificates",
  "contact",
  "welcome",
] as const;

// ============ Typewriter Text Component ============
const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ text, speed = 20, onComplete }) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-white">|</span>
      )}
    </>
  );
};

// Neofetch-style output: responsive two-column layout (logo left, info right)
const Neofetch: React.FC<{ user: string; host: string }> = ({ user, host }) => {
  const d = getNeofetchData(user, host);
  return (
    <div className="neofetch">
      <div className="neofetch-art">
        <pre className="neofetch-logo" aria-hidden="true">
{["  .--------------.",
  "  |  portfolio   |",
  "  |   terminal   |",
  "  '--------------'",
  "         |",
  "    .----+----.",
  "    |  ~ $     |",
  "    '----------'"].join("\n")}
        </pre>
      </div>
      <div className="neofetch-info">
        <div className="neofetch-user">{d.user}</div>
        <div className="neofetch-divider">───────────────</div>
        <dl className="neofetch-rows">
          <div className="neofetch-row">
            <dt>OS:</dt>
            <dd>{d.os}</dd>
          </div>
          <div className="neofetch-row">
            <dt>Host:</dt>
            <dd>{d.host}</dd>
          </div>
          <div className="neofetch-row">
            <dt>Kernel:</dt>
            <dd>{d.kernel}</dd>
          </div>
          <div className="neofetch-row">
            <dt>Uptime:</dt>
            <dd>{d.uptime}</dd>
          </div>
          <div className="neofetch-row">
            <dt>Shell:</dt>
            <dd>{d.shell}</dd>
          </div>
          <div className="neofetch-row">
            <dt>Theme:</dt>
            <dd>{d.theme}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

// Rendered once per history line, so memoized to skip re-rendering unchanged
// lines whenever the terminal re-renders (e.g. on every keystroke).
const Prompt: React.FC<PromptProps & { cwd?: string }> = React.memo(({ user, host, cwd = "~" }) => (
  <span
    className="terminal-prompt"
    aria-label={`Command prompt for ${user} at ${host}`}
  >
    <span className="prompt-user">
      {user}@{host}
    </span>
    <span className="prompt-separator">:</span>
    <span className="prompt-directory">{cwd === "~" ? "~" : cwd}</span>
    <span className="prompt-symbol"># </span>
  </span>
));
Prompt.displayName = "Prompt";

const OutputLine: React.FC<OutputLineProps> = React.memo(({ children }) => (
  <div className="output-line">{children}</div>
));
OutputLine.displayName = "OutputLine";

// Static data moved outside components to avoid dependency issues
const HELP_GROUPS: HelpGroup[] = [
  {
    icon: "\u{1F4C1}",
    title: "PORTFOLIO",
    accent: "text-white",
    entries: [
      { command: "about", description: "About me — plus this portfolio's build info." },
      { command: "projects", description: "View my recent AI and Web projects." },
      { command: "skills", description: "See my technical stack." },
      { command: "experience", description: "View my professional experience." },
      { command: "education", description: "View my academic background." },
      { command: "certificates", description: "View my certifications." },
      { command: "contact", description: "Get my contact information." },
      { command: "resume", description: "View or download my resume." },
    ],
  },
  {
    icon: "\u{1F9E0}",
    title: "AI & INTERACTIVE",
    accent: "text-white",
    entries: [
      { command: "jerry", description: "Open the interactive AI chat interface." },
      { command: "play archman", description: "Play the terminal-based Arch-Man game." },
    ],
  },
  {
    icon: "\u2699\uFE0F",
    title: "SYSTEM",
    accent: "text-white",
    entries: [
      { command: "help", description: "Display this help message." },
      { command: "clear", description: "Clear the terminal screen." },
      { command: "history", description: "List recent commands." },
      { command: "neofetch", description: "Display system info and my ASCII logo." },
      { command: "whoami", description: "Print current user." },
      { command: "admin", description: "Access the secure admin panel." },
    ],
  },
];


const WELCOME_LINES: string[] = [
  "Hi, I'm Srinivas RC, an AI / ML Engineer.",
  "Welcome to my interactive portfolio terminal!",
  "Type 'help' or 'ls' for commands. Use 'cd <name>' to open sections (e.g. cd about, cd projects, cd education).",
];

// Final welcome line — `jerry` in Cyber Blue, bolded to fix his identity.
const JerryHint: React.FC = () => (
  <span>
    &gt; Type <span className="font-bold text-cyan-400">&apos;jerry&apos;</span>{" "}
    to open the interactive AI Chat Interface and speak with my personal
    assistant.
  </span>
);

// Tab completion: full-line completions (for backward compatibility)
const TAB_COMPLETIONS: string[] = [
  "help",
  "about",
  "about-portfolio",
  "projects",
  "skills",
  "experience",
  "education",
  "certificates",
  "contact",
  "resume",
  "cv",
  "connect",
  "achievements",
  "jerry",
  "play archman",
  "admin",
  "clear",
  "history",
  "neofetch",
  "whoami",
  "ls",
  "ls -la",
  "cd about",
  "cd projects",
  "cd skills",
  "cd experience",
  "cd education",
  "cd certificates",
  "cd contact",
  "cd welcome",
  "cat README",
  "man",
  "date",
  "exit",
];


// CMS-backed section commands: content managed in /admin, private entries hidden here.
const CMS_COMMANDS: readonly CmsSection[] = [
  "cv",
  "connect",
  "achievements",
];

// Command names for first-word completion and man
const COMMAND_NAMES = [
  "help",
  "about",
  "projects",
  "skills",
  "experience",
  "education",
  "certificates",
  "contact",
  "resume",
  "cv",
  "connect",
  "achievements",
  "ai",
  "play",
  "admin",
  "clear",
  "history",
  "neofetch",
  "whoami",
  "ls",
  "cd",
  "cat",
  "echo",
  "man",
  "date",
  "hostname",
  "id",
  "uname",
  "exit",
  "sudo",
];


const CD_SECTIONS = [
  "welcome",
  "about",
  "projects",
  "skills",
  "experience",
  "education",
  "certificates",
  "contact",
];


function getCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return "";
  let i = 0;
  while (i < strings[0].length) {
    const c = strings[0][i];
    if (strings.every((s) => s[i] === c)) i++;
    else break;
  }
  return strings[0].slice(0, i);
}

/** Context-aware tab completion: returns matches and the line to set (single match or common prefix). */
function getTabCompletion(
  input: string
): { matches: string[]; setLine: string; isPartial: boolean } {
  const raw = input.trimEnd();
  const endsWithSpace = /\s$/.test(input);
  const parts = raw.split(/\s+/).filter(Boolean);
  const command = parts[0]?.toLowerCase() ?? "";
  const isCompletingArg = endsWithSpace || parts.length > 1;
  const prefix = isCompletingArg && parts.length > 0
    ? (endsWithSpace ? "" : (parts[parts.length - 1] ?? ""))
    : raw;
  const argPrefix = prefix.toLowerCase();
  const baseForArg = endsWithSpace ? raw + " " : parts.slice(0, -1).join(" ") + (parts.length > 1 ? " " : "");

  if (isCompletingArg && (command === "cd" || command === "cat" || command === "man")) {
    const list =
      command === "cd" ? CD_SECTIONS
      : command === "cat" ? [...HOME_DIR]
      : COMMAND_NAMES;
    const matches = list.filter((s) => String(s).toLowerCase().startsWith(argPrefix));
    if (matches.length === 0) return { matches: [], setLine: input, isPartial: false };
    const common = getCommonPrefix(matches);
    const setLine = matches.length === 1 ? baseForArg + matches[0] : baseForArg + common;
    return {
      matches,
      setLine,
      isPartial: matches.length > 1 && common.length === prefix.length,
    };
  }

  if (parts.length === 1 && !endsWithSpace) {
    const matches = COMMAND_NAMES.filter((c) => c.startsWith(argPrefix));
    if (matches.length === 0) return { matches: [], setLine: input, isPartial: false };
    const common = getCommonPrefix(matches);
    return {
      matches,
      setLine: matches.length === 1 ? matches[0] : common,
      isPartial: matches.length > 1 && common.length === prefix.length,
    };
  }

  const matches = TAB_COMPLETIONS.filter((c) => c.startsWith(raw));
  if (matches.length === 0) return { matches: [], setLine: input, isPartial: false };
  const common = getCommonPrefix(matches);
  return {
    matches,
    setLine: matches.length === 1 ? matches[0] : (common.length > raw.length ? common : raw),
    isPartial: matches.length > 1 && common.length === raw.length,
  };
}

const Help: React.FC = () => (
  <div className="help-command font-mono text-sm" role="region" aria-label="Help menu">
    <p className="text-gray-300">Available commands:</p>
    {HELP_GROUPS.map((group) => (
      <div key={group.title} className="mt-3">
        <p className={`font-bold tracking-wider ${group.accent}`}>
          {group.icon} {group.title}
        </p>
        <ul className="mt-1 space-y-0.5">
          {group.entries.map((entry) => (
            <li key={entry.command} className="pl-3">
              <span className={`inline-block min-w-[9.5rem] ${group.accent}`}>
                {entry.command}
              </span>
              <span className="text-gray-500">- </span>
              <span className="text-gray-300">{entry.description}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const Welcome: React.FC = () => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentLine < WELCOME_LINES.length) {
        setDisplayedLines((prev) => [...prev, WELCOME_LINES[currentLine]]);
        setCurrentLine(currentLine + 1);
      } else if (!showHint) {
        setShowHint(true); // styled Jerry hint follows the plain intro lines
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [currentLine, showHint]);

  return (
    <div role="region" aria-label="Welcome message">
      {displayedLines.map((line, i) => (
        <OutputLine key={i}>
          <TypewriterText text={line} speed={20} />
        </OutputLine>
      ))}
      {showHint && (
        <OutputLine>
          <JerryHint />
        </OutputLine>
      )}
    </div>
  );
};

// Section renderers shared by `cd <section>` and the bare section commands.
// Stylized system-info card for the "About Portfolio" nav button / command.
const AboutPortfolio: React.FC = () => (
  <div
    role="region"
    aria-label="Portfolio system info"
    className="font-mono text-sm leading-relaxed text-cyan-300"
  >
    <div className="mb-1 font-bold tracking-[0.2em] text-cyan-400">
      [ SYSTEM PORTFOLIO INFO ]
    </div>
    <div>
      <span className="text-cyan-500">Version:</span> v2.0.0
    </div>
    <div>
      <span className="text-cyan-500">Developer &amp; Sole Architect:</span>{" "}
      <span className="font-bold text-cyan-200">Srinivas R C</span>
    </div>
    <div>
      <span className="text-cyan-500">Tech Stack:</span> Next.js, TypeScript,
      Tailwind CSS, Framer Motion
    </div>
    <div>
      <span className="text-cyan-500">AI Integration:</span>{" "}
      Custom Edge-Runtime LLM Agent (&quot;Jerry&quot;)
    </div>
    <div className="mt-3 border-l-2 border-cyan-500/60 pl-3 italic text-cyan-300/90">
      &quot;This interactive terminal interface was architected and developed to
      showcase advanced full-stack engineering, prompt architecture, and
      ultra-smooth UI/UX motion design.&quot;
    </div>
  </div>
);

const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
  welcome: <Welcome />,
  // `about` = personal bio + the portfolio build card, one professional page.
  about: (
    <>
      <About />
      <div className="mt-4">
        <AboutPortfolio />
      </div>
    </>
  ),
  "about-portfolio": <AboutPortfolio />,
  projects: <Projects />,
  skills: <Skills />,
  experience: <Experience />,
  contact: <Contact />,
  education: <CmsSectionOutput section="education" />,
  certificates: <CmsSectionOutput section="certificates" />,
};

const MAX_COMMAND_HISTORY = 50;

export default function Terminal({
  onFirstCommand,
  blogRoute = false,
  initialBlogSlug = null,
  initialBlogPost = null,
  initialSection = null,
  initialCommand = null,
}: TerminalProps) {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [input, setInput] = useState<string>("");
  const [cwd, setCwd] = useState<string>("~");
  const [tabSuggestions, setTabSuggestions] = useState<string[] | null>(null);
  const [isFirstUserCommand, setIsFirstUserCommand] = useState<boolean>(true);
  const [jerryOpen, setJerryOpen] = useState<boolean>(false);
  const [jerryInitialQ, setJerryInitialQ] = useState<string | null>(null);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const savedInputRef = useRef<string>("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const user = "root";
  const host = "srinivas";


  const redirectFromBlogRoute = (trimmedCmd: string): boolean => {
    if (!blogRoute) return false;

    const parts = trimmedCmd.split(/\s+/);
    const commandName = parts[0]?.toLowerCase() ?? "";
    const args = parts.slice(1);

    if (commandName === "blog") {
      const q = args.join(" ").trim();
      if (q) {
        router.push(`/?cmd=${encodeURIComponent(`blog ${q}`)}`);
      } else {
        router.push("/blog");
      }
      return true;
    }

    if (commandName === "cd" && args[0]?.toLowerCase() === "blog") {
      router.push("/blog");
      return true;
    }

    if (
      commandName === "cd" &&
      args[0] &&
      HOME_CD_SECTIONS.includes(
        args[0].toLowerCase() as (typeof HOME_CD_SECTIONS)[number]
      )
    ) {
      const dir = args[0].toLowerCase();
      router.push(dir === "welcome" ? "/" : `/?section=${dir}`);
      return true;
    }

    router.push(`/?cmd=${encodeURIComponent(trimmedCmd)}`);
    return true;
  };

  const processCommand = async (
    cmd: string,
    isAuto: boolean = false
  ): Promise<void> => {
    const trimmedCmd = cmd.trim();

    if (!isAuto && blogRoute && trimmedCmd) {
      redirectFromBlogRoute(trimmedCmd);
      return;
    }

    const newHist: HistoryLine[] = [
      ...history,
      { type: "prompt", command: cmd },
    ];

    if (isFirstUserCommand && !isAuto && onFirstCommand) {
      onFirstCommand();
      setIsFirstUserCommand(false);
    }

    // Command history: store every successfully run command (newest first), skip empty and auto
    if (!isAuto && trimmedCmd) {
      setCommandHistory((prev) => {
        if (prev[0] === trimmedCmd) return prev;
        return [trimmedCmd, ...prev].slice(0, MAX_COMMAND_HISTORY);
      });
      setHistoryIndex(-1);
    }

    // ============ jerry: open the dedicated AI chat interface ============
    // Chat messages live in the JerryChat panel, never in terminal history.
    // Legacy `ai [question]` still works — it opens the chat (and auto-sends).
    const lower = trimmedCmd.toLowerCase();
    if (lower === "jerry" || lower === "ai" || lower.startsWith("ai ")) {
      const question = lower.startsWith("ai ") ? trimmedCmd.slice(3).trim() : null;
      newHist.push({
        type: "output",
        content: (
          <span className="text-cyan-300">
            Launching Jerry — interactive AI chat interface…
          </span>
        ),
      });
      setHistory(newHist);
      setJerryInitialQ(question);
      setJerryOpen(true);
      return;
    }

    // echo: repeat what the user typed (flavor command)
    if (trimmedCmd.toLowerCase().startsWith("echo ")) {
      newHist.push({
        type: "output",
        content: trimmedCmd.slice(5).trim() || " ",
      });
      setHistory(newHist);
      return;
    }
    if (trimmedCmd.toLowerCase() === "echo") {
      newHist.push({ type: "output", content: " " });
      setHistory(newHist);
      return;
    }

    const parts = trimmedCmd.split(/\s+/);
    const commandName = parts[0]?.toLowerCase() ?? "";
    const args = parts.slice(1);

    // cd [dir] — changes the working "directory" and may navigate (side effects)
    if (commandName === "cd") {
      if (args.length === 0) {
        setCwd("~");
        newHist.push({ type: "output", content: "" });
        setHistory(newHist);
        return;
      }
      const dir = args[0].toLowerCase();
      if (SECTION_COMPONENTS[dir] !== undefined) {
        setCwd("~");
        newHist.push({ type: "output", content: SECTION_COMPONENTS[dir] });
        setHistory(newHist);
        return;
      }
      newHist.push({
        type: "output",
        content: (
          <span className="terminal-stderr">
            cd: {args[0]}: No such file or directory
          </span>
        ),
      });
      setHistory(newHist);
      return;
    }

    // clear — wipe the screen, no output line
    if (commandName === "clear") {
      setHistory([]);
      return;
    }

    // play <game> — mounts the game inside the terminal buffer (side effects:
    // arrow keys are captured by the game and the input is disabled until quit)
    if (commandName === "play") {
      const game = (args[0] ?? "").toLowerCase();
      if (game === "archman") {
        setIsGameActive(true);
        newHist.push({
          type: "output",
          content: (
            <ArchMan
              onExit={() => {
                setIsGameActive(false);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            />
          ),
        });
        setHistory(newHist);
        return;
      }
      newHist.push({
        type: "output",
        content:
          game.length === 0
            ? "usage: play archman"
            : (
              <span className="terminal-stderr">
                play: unknown game &apos;{game}&apos;. Available: archman
              </span>
            ),
      });
      setHistory(newHist);
      return;
    }

    // admin / sudo login — open the Admin Login Gate
    if (
      commandName === "admin" ||
      (commandName === "sudo" && args[0]?.toLowerCase() === "login")
    ) {
      newHist.push({ type: "output", content: "Opening secure admin gate…" });
      setHistory(newHist);
      router.push("/admin");
      return;
    }

    // resume — open the resume PDF in a new tab (CMS link first, static fallback)
    if (commandName === "resume") {
      const cmsLink = getItems("resume").find(
        (i) => i.link && i.link !== "#"
      )?.link;
      const fallback: string = RESUME_URL;
      const url = cmsLink ?? (fallback !== "#" ? fallback : null);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        newHist.push({
          type: "output",
          content: (
            <span>
              Opening resume ↗{" "}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline decoration-dotted"
              >
                {url}
              </a>
            </span>
          ),
        });
      } else {
        newHist.push({
          type: "output",
          content:
            "resume: no PDF configured yet. Add an entry with a link in /admin → Resume.",
        });
      }
      setHistory(newHist);
      return;
    }

    // Bare section commands (about, projects, …) behave like their cd twins
    if (SECTION_COMPONENTS[commandName] !== undefined) {
      newHist.push({ type: "output", content: SECTION_COMPONENTS[commandName] });
      setHistory(newHist);
      return;
    }

    // CMS-backed sections: dynamic content managed in /admin (private entries hidden)
    if (CMS_COMMANDS.includes(commandName as CmsSection)) {
      newHist.push({
        type: "output",
        content: <CmsSectionOutput section={commandName as CmsSection} />,
      });
      setHistory(newHist);
      return;
    }

    // Helpers for the pure-command map below.
    const stderr = (s: string) => <span className="terminal-stderr">{s}</span>;
    // This is a read-only, in-browser filesystem — mutating commands always fail.
    const readOnlyFs = (cmd: string) => (a: string[]) =>
      stderr(`${cmd}: cannot operate on '${a[0] ?? ""}': Read-only file system`);
    // Privileged commands are politely refused.
    const notPermitted = (cmd: string) => () =>
      stderr(`${cmd}: Operation not permitted — this is a portfolio, not your server. Nice try 😄`);
    // Editors can't run in here; nudge toward cat.
    const editorJoke = (cmd: string) => (a: string[]) =>
      `${cmd}: cannot open a real editor here. Use 'cat ${a[0] ?? "<file>"}' to read files instead.`;
    // Package managers need a real machine.
    const pkgManager = (cmd: string) => () =>
      stderr(`E: Could not open lock file — are you root? '${cmd}' isn't available on this read-only terminal. Try 'cd skills' instead.`);

    // Pure commands: each maps args to output content with no side effects.
    const outputCommands: Record<string, (args: string[]) => React.ReactNode> = {
      ls: (a) => {
        const long = a.includes("-l") || a.includes("-la");
        const list = [...HOME_DIR];
        const out = long ? formatLsLong(list) : list.join("  ");
        return <pre className="pre-output">{out}</pre>;
      },
      cat: (a) => {
        const name = a[0];
        if (!name) return "cat: missing operand";
        const key = HOME_DIR.find((e) => e.toLowerCase() === name.toLowerCase());
        if (key && FILE_CONTENTS[key]) return FILE_CONTENTS[key];
        return (
          <span className="terminal-stderr">
            cat: {name}: No such file or directory
          </span>
        );
      },
      hostname: () => host,
      id: () => `uid=1000(${user}) gid=1000(${user}) groups=1000(${user})`,
      uname: (a) =>
        a.includes("-a")
          ? `Linux ${host} 6.x portfolio-terminal #1 Next.js`
          : "Linux",
      history: () => {
        const list = commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join("\n");
        return <pre className="pre-output">{list || " (empty)"}</pre>;
      },
      man: (a) => {
        const topic = a[0]?.toLowerCase();
        const page = topic ? MAN_PAGES[topic] : null;
        if (page) return page;
        return (
          <span className="terminal-stderr">
            No manual entry for {topic ?? ""}
          </span>
        );
      },
      neofetch: () => <Neofetch user={user} host={host} />,
      help: () => <Help />,
      whoami: () => user,
      date: () => new Date().toString(),
      exit: () => "Close this tab to exit.",

      // --- Privileged / mutating commands: refused on a read-only terminal ---
      sudo: () => stderr(`${user} is not in the sudoers file. This incident will be reported.`),
      touch: readOnlyFs("touch"),
      mkdir: readOnlyFs("mkdir"),
      rm: readOnlyFs("rm"),
      rmdir: readOnlyFs("rmdir"),
      mv: readOnlyFs("mv"),
      cp: readOnlyFs("cp"),
      reboot: notPermitted("reboot"),
      shutdown: notPermitted("shutdown"),
      poweroff: notPermitted("poweroff"),
      halt: notPermitted("halt"),
      vim: editorJoke("vim"),
      vi: editorJoke("vi"),
      nano: editorJoke("nano"),
      emacs: editorJoke("emacs"),
      apt: pkgManager("apt"),
      "apt-get": pkgManager("apt-get"),
      pacman: pkgManager("pacman"),
      yum: pkgManager("yum"),
    };

    const handler = outputCommands[commandName];
    if (handler) {
      newHist.push({ type: "output", content: handler(args) });
      setHistory(newHist);
      return;
    }

    newHist.push({
      type: "output",
      content: (
        <span className="terminal-stderr">
          bash: command not found: {parts[0] ?? commandName}
        </span>
      ),
    });
    setHistory(newHist);
  };

  // Latest processCommand in a ref so external dispatchers always hit fresh state.
  const processRef = useRef(processCommand);
  processRef.current = processCommand;

  // Programmatic execution: left-panel quick actions dispatch "terminal:exec".
  useEffect(() => {
    const onExec = (e: Event) => {
      const cmd = (e as CustomEvent<string>).detail;
      if (typeof cmd === "string" && cmd.trim()) void processRef.current(cmd);
    };
    window.addEventListener("terminal:exec", onExec);
    return () => window.removeEventListener("terminal:exec", onExec);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (isGameActive) return;
    setTabSuggestions(null);
    processCommand(input);
    setInput("");
  };

  const handleNav = async (cmd: string): Promise<void> => {
    if (blogRoute) {
      if (cmd === "blog") {
        router.push("/blog");
        return;
      }
      const cdSections = ["about", "projects", "skills", "experience", "education", "certificates", "contact"];
      if (cdSections.includes(cmd)) {
        router.push(`/?section=${cmd}`);
        return;
      }
      router.push(`/?cmd=${encodeURIComponent(cmd)}`);
      return;
    }

    await processCommand(cmd);
  };

  const focusInput = (): void => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (inputRef.current && !isTouchDevice) {
      inputRef.current.focus();
    }

    setTimeout(() => {
      terminalRef.current?.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setHistory([]);
      setHistoryIndex(-1);
      return;
    }
    if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      if (input) {
        setHistory((prev) => [
          ...prev,
          { type: "prompt", command: input },
          { type: "output", content: "^C" },
        ]);
      }
      setInput("");
      setHistoryIndex(-1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) {
        savedInputRef.current = input;
        setHistoryIndex(0);
        setInput(commandHistory[0]);
      } else if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex((i) => i + 1);
        setInput(commandHistory[historyIndex + 1]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput(savedInputRef.current);
      } else {
        setHistoryIndex((i) => i - 1);
        setInput(commandHistory[historyIndex - 1]);
      }
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const { matches, setLine } = getTabCompletion(input);
      if (matches.length === 1) {
        setInput(setLine);
        setTabSuggestions(null);
      } else if (matches.length > 1) {
        setInput(setLine);
        setTabSuggestions(matches);
      }
    }
  };

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      inputRef.current?.focus();
    }
    setTimeout(() => {
      if (blogRoute) {
        setHistory([
          { type: "prompt", command: "cd welcome" },
          { type: "output", content: <Welcome /> },
          { type: "prompt", command: "blog" },
          {
            type: "output",
            content: (
              <Blog
                slug={initialBlogSlug}
                initialPost={initialBlogPost}
                syncUrls
              />
            ),
          },
        ]);
        setIsFirstUserCommand(false);
        return;
      }

      const boot = async () => {
        if (initialSection) {
          if (initialSection === "blog") {
            router.replace("/blog", { scroll: false });
            return;
          }
          await processCommand(`cd ${initialSection}`, true);
          router.replace("/", { scroll: false });
        } else if (initialCommand) {
          await processCommand(initialCommand, true);
          router.replace("/", { scroll: false });
        } else {
          await processCommand("cd welcome", true);
        }
      };
      void boot();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const blogEl = el.querySelector(".terminal-blog");
      if (blogEl && blogRoute) {
        const top = (blogEl as HTMLElement).offsetTop - 8;
        el.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        return;
      }
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [history, blogRoute]);

  return (
    <div
      className="terminal-container"
      onClick={focusInput}
      role="application"
      aria-label="Interactive terminal"
    >
      <header className="terminal-header">
        <div className="window-dots">
          {/* Red — view profile picture */}
          <button
            type="button"
            className="dot dot-red"
            title="View profile picture"
            aria-label="View profile picture"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent("profile:view"));
            }}
          />
          {/* Blue — clear the terminal */}
          <button
            type="button"
            className="dot dot-blue"
            title="Clear terminal"
            aria-label="Clear terminal"
            onClick={(e) => {
              e.stopPropagation();
              void processCommand("clear");
            }}
          />
          {/* Green — show help */}
          <button
            type="button"
            className="dot dot-green"
            title="Show help"
            aria-label="Show help"
            onClick={(e) => {
              e.stopPropagation();
              void processCommand("help");
            }}
          />
        </div>
        <nav className="terminal-nav" aria-label="Terminal navigation">
          {[
            "help",
            "about",
            "projects",
            "skills",
            "experience",
            "education",
            "certificates",
            "contact",
            "clear",
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleNav(cmd)}
              className="nav-button"
              type="button"
              aria-label={`Navigate to ${cmd}`}
            >
              {cmd}
            </button>
          ))}
        </nav>
      </header>
      <main
        ref={terminalRef}
        className="terminal-body"
        aria-live="polite"
        aria-atomic="false"
      >
        {history.map((line, i) => (
          <div key={i} className="history-line">
            {line.type === "prompt" ? (
              <div>
                <Prompt user={user} host={host} cwd={cwd} />
                <span className="command-text">{line.command}</span>
              </div>
            ) : (
              line.content
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="input-form">
          <label htmlFor="terminal-input" className="sr-only">
            Terminal command input
          </label>
          <Prompt user={user} host={host} cwd={cwd} />
          <div className="input-area">
            <span className="input-value" aria-hidden="true">
              {input}
            </span>
            <span className="cursor-block" aria-hidden="true" />
            <input
              id="terminal-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setHistoryIndex(-1);
                setTabSuggestions(null);
              }}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              onFocus={focusInput}
              autoComplete="off"
              spellCheck="false"
              aria-label="Terminal command input"
              disabled={isGameActive}
            />
          </div>
        </form>
        {tabSuggestions && tabSuggestions.length > 0 && (
          <div className="tab-suggestions" role="listbox" aria-label="Tab completion suggestions">
            <div className="tab-suggestions-label">Suggestions (Tab to complete):</div>
            <ul className="tab-suggestions-list">
              {tabSuggestions.map((s, i) => (
                <li key={i} className="tab-suggestions-item">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Jerry — dedicated AI chat panel. Chats live here, not in history. */}
      <JerryChat
        open={jerryOpen}
        initialQuestion={jerryInitialQ}
        onClose={() => {
          setJerryOpen(false);
          setJerryInitialQ(null);
          focusInput();
        }}
      />
    </div>
  );
}

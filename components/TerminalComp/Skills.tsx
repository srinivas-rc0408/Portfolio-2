"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * TechStack — an interactive, accordion-style "terminal cards" grid.
 * Click a card to expand it (one open at a time → zero layout jitter). Accents
 * follow the site theme (var(--theme-accent)) so it stays consistent with
 * whatever color the admin has picked; falls back to emerald green.
 */

interface StackCategory {
  id: string;
  title: string;
  command: string;
  skills: string[];
}

const stackData: StackCategory[] = [
  {
    id: "languages",
    title: "Languages",
    command: "$ ls -la /skills/languages/",
    skills: ["Python", "JavaScript", "TypeScript", "Java", "HTML/CSS", "SQL"],
  },
  {
    id: "aiml",
    title: "AI / ML",
    command: "$ python -m pip list | grep ai",
    skills: [
      "Prompt Engineering",
      "LLM Integration",
      "Gemini API",
      "NLP",
      "TensorFlow",
      "MLflow",
      "Machine Learning",
    ],
  },
  {
    id: "agentic",
    title: "Frameworks / Agentic",
    command: "$ cat /skills/frameworks/stack.txt",
    skills: [
      "React 19",
      "Next.js",
      "Tailwind CSS",
      "Vite",
      "FastAPI",
      "Framer Motion",
      "Zustand",
      "Multi-Agent Systems",
    ],
  },
  {
    id: "linux",
    title: "Linux / OS",
    command: "$ cat /etc/os-release && lsblk",
    skills: [
      "CachyOS",
      "Pop!_OS",
      "Arch Linux",
      "Ubuntu",
      "Debian",
      "Linux Mint",
    ],
  },
  {
    id: "tools",
    title: "Dev Tools",
    command: "$ which --all tools",
    skills: [
      "Git",
      "GitHub",
      "Docker",
      "MongoDB",
      "Supabase",
      "Firebase",
      "Prisma",
      "Vercel",
      "VS Code",
    ],
  },
];

/** Classic macOS window controls (kept as their iconic colors). */
function WindowDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

function TerminalCard({
  data,
  active,
  onToggle,
}: {
  data: StackCategory;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onToggle}
      aria-expanded={active}
      aria-label={`${data.title} skills — ${active ? "collapse" : "expand"}`}
      transition={{ layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className={`group relative w-full overflow-hidden rounded-xl border text-left backdrop-blur-md transition-colors duration-200 ${
        active
          ? "border-[rgba(var(--theme-accent-rgb),0.55)] bg-zinc-900/70 shadow-[0_0_28px_-8px_rgba(var(--theme-accent-rgb),0.55)]"
          : "border-zinc-800 bg-zinc-900/50 hover:border-[rgba(var(--theme-accent-rgb),0.4)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <WindowDots />
          <span className="font-mono text-sm text-zinc-100">
            ~ {data.title}
          </span>
        </div>
        <span className="relative flex h-2 w-2" aria-hidden="true">
          {active && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--theme-accent)] opacity-60" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full bg-[var(--theme-accent)] ${
              active ? "" : "opacity-50"
            }`}
          />
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2 font-mono text-[13px]">
          <span className="text-zinc-100">{data.command}</span>
          {active && (
            <span className="inline-block h-3.5 w-[7px] animate-pulse bg-[var(--theme-accent)] align-middle" />
          )}
        </div>

        <AnimatePresence initial={false}>
          {active && (
            <motion.div
              key="skills"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-3 font-mono text-[11px] text-zinc-500">
                &gt; {data.skills.length} entries · press again to close
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.03 * i + 0.05,
                      duration: 0.22,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-md border border-[rgba(var(--theme-accent-rgb),0.3)] bg-[rgba(var(--theme-accent-rgb),0.1)] px-2.5 py-1 font-mono text-xs text-[var(--theme-accent)]"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

const Skills: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <section
      className="relative overflow-hidden p-5 sm:p-8"
      aria-label="Technical skills"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
      }}
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="font-mono text-3xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
            <span className="text-[var(--theme-accent)]">&lt;</span> TECH STACK{" "}
            <span className="text-[var(--theme-accent)]">/&gt;</span>
          </h1>
          <p className="mt-3 font-mono text-xs text-zinc-500 sm:text-sm">
            $ ./skills --interactive --display-all
          </p>
        </header>

        {/* Cards grid — 1 col mobile, 2 col desktop */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {stackData.map((cat) => (
            <TerminalCard
              key={cat.id}
              data={cat}
              active={activeCard === cat.id}
              onToggle={() =>
                setActiveCard((cur) => (cur === cat.id ? null : cat.id))
              }
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center font-mono text-xs text-zinc-500 sm:mt-10">
          └─$ Click on any terminal to explore skills
        </footer>
      </div>
    </section>
  );
};

export default Skills;

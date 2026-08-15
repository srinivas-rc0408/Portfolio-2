"use client";

import React from "react";
import { motion } from "framer-motion";
import WindowDots from "@/components/WindowDots";

/**
 * ~/current-focus — what Srinivas is building right now.
 *
 * Deliberately separate from `projects` (shipped work): this is the live
 * work-in-progress board, so each entry leads with a status and a build stage
 * rather than a demo link. Rendered by the `focus` terminal command.
 */

interface FocusItem {
  name: string;
  codename?: string;
  status: string;
  /** 0–100 — how far along the build is. */
  progress: number;
  tagline: string;
  /** Rich overview paragraphs — rendered as text-zinc-200 prose. */
  overview: React.ReactNode;
  /** Labelled "Technical Highlights" — font-mono text-emerald-400/90 text-sm */
  highlights?: React.ReactNode;
  stack?: string[];
  /** Where the work stands right now. */
  stage?: string;
}

/* ── Inline code helper — subtle mono chip for technical identifiers ──────── */
const C: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-zinc-300">
    {children}
  </code>
);

const FOCUS: FocusItem[] = [
  {
    name: "Project Hornet & comb-llm",
    codename: "Hornet",
    status: "In development",
    progress: 42,
    tagline: "Autonomous Terminal Orchestration Harness",
    overview: (
      <>
        Designed and built an autonomous developer workspace and terminal
        automation harness to orchestrate complex software engineering workflows
        natively within a Linux environment.
      </>
    ),
    highlights: (
      <>
        <p>
          <strong className="text-zinc-200">Architecture &amp; Design:</strong>{" "}
          Engineered <C>jcode</C>, a lightweight terminal wrapper that dispatches
          concurrent sub-agents to manage multi-session git workflows, code
          generation, and repository management. The system architecture
          prioritises a bounded Recursive Self-Improvement (RSI) loop, where an
          automated critic evaluates execution failures and generates corrected
          training data without manual intervention.
        </p>
        <p>
          <strong className="text-zinc-200">AI Integration:</strong> Fine-tuned
          Microsoft&apos;s 3.8-billion parameter phi-4-mini model into a custom logic
          coordinator (<C>comb-llm</C>) using Unsloth and QLoRA. Optimised the
          model&apos;s vocabulary and tokenisation (specifically managing{" "}
          <C>&lt;｜PAD▁TOKEN｜&gt;</C> integration) to ensure raw, perfectly
          structured JSON output for tool orchestration while enforcing strict
          confirmation gates for destructive terminal operations.
        </p>
      </>
    ),
    stack: [
      "Python",
      "Unsloth",
      "QLoRA",
      "phi-4-mini",
      "Linux",
      "Git",
      "JSON Tooling",
    ],
    stage:
      "RSI loop functional; comb-llm fine-tune converging. Next: multi-repo orchestration stress test.",
  },
  {
    name: "MiniTranslator",
    status: "Active build",
    progress: 55,
    tagline: "Visual Layout Reconstruction Engine",
    overview: (
      <>
        Developed a client-side visual engine designed to perform seamless canvas
        inpainting and precise typography matching on images.
      </>
    ),
    highlights: (
      <>
        Architected the engine to actively bypass generic OCR frameworks,
        resolving traditional structural limitations in optical character
        recognition by utilising advanced, custom layout reconstruction
        algorithms.
      </>
    ),
    stack: ["TypeScript", "Canvas API", "NLP", "Custom OCR"],
  },
  {
    name: "ArchAgent",
    codename: "Arch",
    status: "In development",
    progress: 60,
    tagline: "Autonomous AI Agent for Software Architecture",
    overview: (
      <>
        Built a specialised, autonomous AI agent dedicated entirely to software
        architecture and design.
      </>
    ),
    highlights: (
      <>
        Engineered the agent&apos;s core prompt logic and decision trees to strictly
        focus on building and designing robust application structures rather than
        generic system operations, enforcing YAGNI (You Aren&apos;t Gonna Need It)
        principles for minimal, highly optimised codebases.
      </>
    ),
    stack: ["Python", "LLM Orchestration", "Prompt Engineering", "YAGNI"],
  },
  {
    name: "Language Detector",
    status: "Shipped · iterating",
    progress: 85,
    tagline: "Real-Time Multilingual Text Analysis",
    overview: (
      <>
        Engineered a highly responsive web application tailored for real-time
        multilingual text analysis.
      </>
    ),
    highlights: (
      <>
        Implemented intelligence classification models suitable for
        industrial-scale text analysis, optimising the data flow for rapid
        client-side feedback.
      </>
    ),
    stack: ["Python", "Scikit-learn", "NLP", "Streaming"],
  },
  {
    name: "AI-Enhanced Flappy Bird Engine",
    codename: "Flappy Duck",
    status: "Shipped",
    progress: 100,
    tagline: "Modular Game Engine with Self-Playing AI Agent",
    overview: (
      <>
        Designed a modular, class-based game engine featuring a self-playing AI
        agent.
      </>
    ),
    highlights: (
      <>
        Integrated a PID-controlled autoplay module to maintain precise in-game
        physics. Enhanced the visual architecture by designing custom procedural
        particle effects.
      </>
    ),
    stack: ["JavaScript (ES6)", "Canvas", "Game AI", "PID Control"],
  },
  {
    name: "bangalore-toll-system",
    status: "Shipped",
    progress: 100,
    tagline: "Local Infrastructure Management Application",
    overview: (
      <>
        Created a local infrastructure management application focused on
        structured data flow and optimised UI rendering.
      </>
    ),
    highlights: (
      <>
        Designed the application configuration and component hierarchy using a
        modern React and Vite stack, ensuring lightweight, rapid deployment
        capabilities.
      </>
    ),
    stack: ["React", "TypeScript", "Express", "MongoDB Atlas", "Vite"],
  },
];

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-gray-300 transition-colors duration-150 hover:border-[rgba(var(--theme-accent-rgb),0.45)] hover:text-white">
    {children}
  </span>
);

const Focus: React.FC = () => (
  <section
    className="mx-auto max-w-5xl space-y-8 p-1 text-white sm:p-2"
    aria-label="Current focus"
  >
    <header className="flex items-center gap-3">
      <h2 className="font-mono text-lg font-bold tracking-wider text-white sm:text-2xl">
        <span className="text-[var(--theme-accent)]">&lt;</span> CURRENT FOCUS{" "}
        <span className="text-[var(--theme-accent)]">/&gt;</span>
      </h2>
      <div
        className="h-px flex-1 bg-gradient-to-r from-[rgba(var(--theme-accent-rgb),0.5)] to-transparent"
        aria-hidden
      />
    </header>

    {FOCUS.map((item, i) => (
      <motion.article
        key={item.name}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm transition-colors duration-200 hover:border-[rgba(var(--theme-accent-rgb),0.35)]"
      >
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-3 py-2">
          <WindowDots />
          <span className="truncate font-mono text-[11px] text-gray-400">
            {item.codename ? `${item.codename} — ` : ""}
            {item.name}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--theme-accent)]">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--theme-accent)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--theme-accent)]" />
            </span>
            {item.status}
          </span>
        </div>

        <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
          <div>
            <h3 className="font-mono text-base font-semibold text-white sm:text-lg">
              {item.name}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-[var(--theme-accent)]">
              {item.tagline}
            </p>
          </div>

          {/* build progress */}
          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-gray-400">
              <span>build progress</span>
              <span className="text-gray-400">{item.progress}%</span>
            </div>
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={item.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.name} build progress`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-[var(--theme-accent)]"
              />
            </div>
          </div>

          {/* Overview — zinc-200 prose */}
          <div className="text-sm leading-relaxed text-zinc-200">
            {item.overview}
          </div>

          {/* Technical Highlights — emerald mono */}
          {item.highlights && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                technical highlights
              </p>
              <div className="space-y-2.5 font-mono text-sm leading-relaxed text-emerald-400/90">
                {item.highlights}
              </div>
            </div>
          )}

          {item.stack && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.stack.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            </div>
          )}

          {item.stage && (
            <p className="border-l-2 border-[rgba(var(--theme-accent-rgb),0.5)] pl-3 text-xs leading-relaxed text-gray-400">
              {item.stage}
            </p>
          )}
        </div>
      </motion.article>
    ))}

    <p className="text-center font-mono text-xs text-gray-400">
      └─$ these are live builds — ask{" "}
      <span className="text-[var(--theme-accent)]">jerry</span> about them, or run{" "}
      <span className="text-[var(--theme-accent)]">projects</span> for shipped work
    </p>
  </section>
);

export default Focus;

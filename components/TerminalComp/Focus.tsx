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
  summary: string;
  features?: string[];
  stack?: string[];
  /** Where the work stands right now. */
  stage?: string;
}

const FOCUS: FocusItem[] = [
  {
    name: "AquaSentinel AI",
    codename: "Project Aqua",
    status: "In development",
    progress: 35,
    tagline: "Autonomous underwater inspection, driven by computer vision.",
    summary:
      "A software platform for an autonomous underwater inspection robot. It follows a planned path across a water body, streams live sensor data (pH, temperature, turbidity, depth), and runs every camera frame through a YOLOv8 vision model to spot pollutants like plastic bottles — all controlled and reviewed from a web dashboard. Scope is software only (backend, frontend, AI pipeline, database, reporting); a simulated robot script stands in for hardware, so the whole system builds and demos with zero hardware.",
    features: [
      "Mission planning — define an area; the backend generates a lawnmower coverage path",
      "Live dashboard — 5s polling drives the grid map, telemetry cards, depth chart, gallery and alerts",
      "AI inspection — every frame runs through YOLOv8; detections stored with bounding boxes",
      "Burst Alert Mode — a pollutant at ≥85% confidence pauses the robot and triggers rapid evidence capture",
      "Mission history & replay — every mission archived and re-viewable with a time scrubber",
      "One-click PDF reports — stats, charts and detection evidence compiled into a document",
    ],
    stack: [
      "FastAPI",
      "SQLAlchemy",
      "SQLite",
      "React",
      "Vite",
      "TanStack Query",
      "Tailwind",
      "YOLOv8n / Ultralytics",
      "JWT (rotating refresh)",
      "ReportLab",
    ],
    stage:
      "Specification locked — 11 documents (PRD, architecture, API contract, DB schema, frontend, AI, security, tickets, tests, design, reconciliation). Build is structured as 4 phases and ~45 tickets, each with tests and acceptance criteria. Roles: admin, operator, viewer.",
  },
  {
    name: "A browser of my own",
    status: "Early build",
    progress: 10,
    tagline: "Building a browser — with every exception feature I've wanted.",
    summary:
      "A from-scratch browser project loaded with the features other browsers leave out. Still early, and deliberately quiet for now.",
    stage: "Stay tuned.",
  },
];

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-gray-300 transition-colors duration-150 hover:border-[rgba(var(--theme-accent-rgb),0.45)] hover:text-white">
    {children}
  </span>
);

const Focus: React.FC = () => (
  <section
    className="mx-auto max-w-5xl space-y-5 p-1 text-white sm:space-y-6 sm:p-2"
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
        transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

        <div className="space-y-3.5 p-4 sm:p-5">
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
                transition={{ delay: 0.25 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-[var(--theme-accent)]"
              />
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-300">{item.summary}</p>

          {item.features && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                core features
              </p>
              <ul className="space-y-1.5">
                {item.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm leading-relaxed text-gray-300">
                    <span className="mt-[3px] shrink-0 text-[var(--theme-accent)]" aria-hidden>
                      ▹
                    </span>
                    <span className="min-w-0">{f}</span>
                  </li>
                ))}
              </ul>
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

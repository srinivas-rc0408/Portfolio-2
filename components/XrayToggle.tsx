"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";

/**
 * X-Ray developer mode — a physical-looking toggle that flips a global
 * `xray-mode` class on <body>. All the visual skeleton work (green wireframe
 * outlines + floating component labels) is pure CSS keyed off that class
 * (see globals.css), so no shared JS state / store is needed: the body class
 * IS the single source of truth.
 */
export default function XrayToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("xray-mode", on);
    return () => document.body.classList.remove("xray-mode");
  }, [on]);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      title="Toggle X-Ray developer wireframe view"
      className={`group flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
        on ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <ScanLine size={12} strokeWidth={2} aria-hidden />
      <span className="hidden sm:inline">X-Ray Dev</span>
      <span
        className={`relative flex h-4 w-7 shrink-0 items-center rounded-full border px-0.5 transition-colors ${
          on
            ? "border-emerald-500/70 bg-emerald-500/20"
            : "border-white/15 bg-white/5"
        }`}
      >
        <motion.span
          className={`h-3 w-3 rounded-full ${
            on
              ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.85)]"
              : "bg-zinc-500"
          }`}
          animate={{ x: on ? 12 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}

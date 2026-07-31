"use client";

import { motion } from "framer-motion";

/**
 * A ~1.5s "access granted" flourish shown after a successful admin login,
 * before the dashboard mounts. The ".RC" lightning bolt draws itself in
 * (Framer `pathLength`, which maps to strokeDasharray/offset under the hood),
 * fills, and pulses a glow in the theme accent. The parent unmounts it on a
 * 1.5s timer, so this component only animates — it owns no timing itself.
 */
const BOLT = "M29 3 H14 L9 17 H19 L7 37 L31 15 H20 L29 3 Z";

export default function AdminLoginReveal() {
  return (
    <motion.div
      role="status"
      aria-label="Access granted"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.5, times: [0, 0.12, 0.82, 1], ease: "easeInOut" }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-black"
    >
      {/* Accent bloom behind the bolt. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.5, 0.3], scale: [0.6, 1.1, 1] }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(var(--theme-accent-rgb),0.35),transparent_65%)] blur-2xl"
      />

      <svg
        width="112"
        height="160"
        viewBox="5 0 28 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ filter: "drop-shadow(0 0 10px rgba(var(--theme-accent-rgb),0.85))" }}
      >
        {/* Stroke draws first. */}
        <motion.path
          d={BOLT}
          stroke="var(--theme-accent)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.9 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        {/* Fill fades in once the outline is mostly drawn. */}
        <motion.path
          d={BOLT}
          fill="var(--theme-accent)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.95] }}
          transition={{ duration: 1.15, times: [0, 0.7, 1], ease: "easeOut" }}
        />
      </svg>

      <motion.p
        initial={{ opacity: 0, y: 8, letterSpacing: "0.1em" }}
        animate={{ opacity: [0, 1, 1], y: 0, letterSpacing: "0.42em" }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="font-mono text-[11px] font-semibold uppercase text-[var(--theme-accent)]"
      >
        Access Granted
      </motion.p>
    </motion.div>
  );
}

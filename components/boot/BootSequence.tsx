"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientTracing } from "@/components/ui/gradient-tracing";
import { TerminalLoader } from "./TerminalLoader";
import { loadSettings } from "@/lib/cms";

type Stage = "gradient" | "terminal" | "done";

// Stage 1: 0–1.5s logo · Stage 2: 1.5–3.0s terminal · total 3.0s exactly.
const BOOT_STAGE1_MS = 1500;
const BOOT_TOTAL_MS = 3000;

// Lightning "S" bolt path (exact). x spans 50–125 → optically centered in a
// 175-wide viewBox; y spans the full 0–200.
const BOLT_PATH = "M100,0 L75,75 L125,75 L50,200 L100,100 L50,100 L100,0";
const BOLT_W = 175;
const BOLT_H = 200;

/** Relative luminance (0–1) of a #rgb/#rrggbb hex color. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n) || full.length < 6) return 0.5;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Stable "am I on the client?" signal — false during SSR, true after hydration.
const emptySubscribe = () => () => {};

/**
 * Two-stage, 3-second boot overlay — runs on every mount/reload.
 *   0.0–1.5s → GradientTracing (Lightning S, traced in the admin theme accent)
 *   1.5–3.0s → TerminalLoader (accent-bound text/cursor/glow)
 *   3.0s+    → fade out, unmount → reveal the site underneath.
 * The accent comes from the last-known admin settings (localStorage-cached in
 * lib/cms), so the boot paints in the chosen color with no default flash.
 * Near-black accents flip the backdrop light so the bolt stays visible.
 * Renders as a fixed overlay (zero CLS — the page mounts beneath it).
 */
export default function BootSequence() {
  const [stage, setStage] = useState<Stage>("gradient");
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage("terminal"), BOOT_STAGE1_MS);
    const t2 = window.setTimeout(() => setStage("done"), BOOT_TOTAL_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // SSR + first client paint: a plain black cover that hydrates identically
  // (no useId / framer-motion / localStorage), so there's zero hydration
  // mismatch. The animated boot mounts client-only right after.
  if (!mounted) {
    return <div className="fixed inset-0 z-[999] bg-black" aria-hidden />;
  }

  const accentRaw = loadSettings().themeAccent;
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(accentRaw) ? accentRaw : "#22d3ee";
  const darkAccent = luminance(accent) < 0.09; // near-black → light backdrop
  const backdrop = darkAccent ? "#ececec" : "#000000";
  const baseOutline = darkAccent ? "#64748b" : "#94a3b8";

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex items-center justify-center"
          style={
            {
              willChange: "opacity",
              backgroundColor: backdrop,
              // Stage-2 loader inherits the (guarded) boot accent from this var.
              "--boot-accent": darkAccent ? "#e2e8f0" : accent,
            } as React.CSSProperties
          }
        >
          <AnimatePresence mode="wait">
            {stage === "gradient" ? (
              <motion.div
                key="gradient"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex w-1/2 max-w-[190px] items-center justify-center sm:max-w-[220px]"
              >
                <GradientTracing
                  width={BOLT_W}
                  height={BOLT_H}
                  path={BOLT_PATH}
                  strokeWidth={3}
                  baseColor={baseOutline}
                  gradientColors={[accent, accent, accent]}
                  animationDuration={1.5}
                />
              </motion.div>
            ) : (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex w-full items-center justify-center"
              >
                <TerminalLoader />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

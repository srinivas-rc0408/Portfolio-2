"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientTracing } from "@/components/ui/gradient-tracing";
import { TerminalLoader } from "./TerminalLoader";

type Stage = "gradient" | "terminal" | "done";

// Stage 1: 0–1.5s logo · Stage 2: 1.5–3.0s terminal · total 3.0s exactly.
const BOOT_STAGE1_MS = 1500;
const BOOT_TOTAL_MS = 3000;

// Lightning "S" bolt path (exact) + traced ".RC" text (no gap), Cyber Blue gradient.
const BOLT_PATH = "M100,0 L75,75 L125,75 L50,200 L100,100 L50,100 L100,0";

/**
 * Two-stage, 3-second boot overlay — runs on every mount/reload.
 *   0.0–1.5s → GradientTracing (Lightning S.RC, Cyber Blue trace on black)
 *   1.5–3.0s → TerminalLoader
 *   3.0s+    → fade out, unmount → reveal the site underneath.
 * Renders as a fixed overlay (zero CLS — the page mounts beneath it).
 */
// Stable "am I on the client?" signal — false during SSR, true after hydration.
const emptySubscribe = () => () => {};

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
  // (no useId / framer-motion), so there's zero hydration mismatch. The
  // animated boot mounts client-only right after.
  if (!mounted) {
    return <div className="fixed inset-0 z-[999] bg-black" aria-hidden />;
  }

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
          style={{ willChange: "opacity" }}
        >
          <AnimatePresence mode="wait">
            {stage === "gradient" ? (
              <motion.div
                key="gradient"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex w-3/4 max-w-md items-center justify-center"
              >
                <GradientTracing
                  width={440}
                  height={210}
                  path={BOLT_PATH}
                  text=".RC"
                  textX={132}
                  textY={135}
                  fontSize={130}
                  strokeWidth={3}
                  baseColor="#94a3b8"
                  gradientColors={["#00f2fe", "#00f2fe", "#4facfe"]}
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

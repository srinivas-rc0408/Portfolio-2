"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientTracing } from "./GradientTracing";
import { TerminalLoader } from "./TerminalLoader";

type Stage = "gradient" | "terminal" | "done";

// Stage 1: 0–1.5s gradient · Stage 2: 1.5–3.0s terminal · total 3s.
const BOOT_STAGE1_MS = 1500;
const BOOT_TOTAL_MS = 3000;

/**
 * Two-stage, 3-second boot overlay shown once per session.
 *   0.0–1.5s → GradientTracing "S.RC"
 *   1.5–3.0s → TerminalLoader
 *   3.0s+    → fade out, unmount → reveal the site underneath.
 * Renders as a fixed overlay (zero CLS — the page mounts beneath it).
 */
export default function BootSequence() {
  const [stage, setStage] = useState<Stage>("gradient");

  useEffect(() => {
    if (sessionStorage.getItem("booted") === "1") {
      setStage("done");
      return;
    }
    const t1 = window.setTimeout(() => setStage("terminal"), BOOT_STAGE1_MS);
    const t2 = window.setTimeout(() => {
      sessionStorage.setItem("booted", "1");
      setStage("done");
    }, BOOT_TOTAL_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

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
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex w-full items-center justify-center"
              >
                <GradientTracing animationDuration={1.5} />
              </motion.div>
            ) : (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
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

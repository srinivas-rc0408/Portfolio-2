"use client";

import { useEffect } from "react";
import { SETTINGS_UPDATED_EVENT, hydrate, loadSettings } from "@/lib/cms";

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return "34, 211, 238";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * Binds the admin-chosen accent color to global CSS variables so glowing
 * borders, highlights, and hover states restyle instantly, site-wide.
 */
export default function ThemeApplier() {
  useEffect(() => {
    const apply = () => {
      const { themeAccent } = loadSettings();
      const root = document.documentElement;
      root.style.setProperty("--theme-accent", themeAccent);
      root.style.setProperty("--theme-accent-rgb", hexToRgb(themeAccent));
    };
    apply();
    window.addEventListener(SETTINGS_UPDATED_EVENT, apply);
    // Load live settings + content from the server, then re-apply.
    void hydrate();
    // Keep open sessions fresh: admin edits reach every visitor within ~10s
    // (poll only while the tab is visible; also refresh on focus).
    const POLL_MS = 10_000;
    const tick = () => {
      if (document.visibilityState === "visible") void hydrate();
    };
    const interval = window.setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, apply);
      window.clearInterval(interval);
      window.removeEventListener("focus", tick);
    };
  }, []);

  return null;
}

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
      const rgb = hexToRgb(themeAccent);
      // Set BOTH the primary (--accent, used by the redesigned components) and
      // its legacy alias (--theme-accent) so the WHOLE site follows the admin
      // color — otherwise --accent stays the default green.
      root.style.setProperty("--accent", themeAccent);
      root.style.setProperty("--accent-rgb", rgb);
      root.style.setProperty("--theme-accent", themeAccent);
      root.style.setProperty("--theme-accent-rgb", rgb);
    };
    // Do NOT apply on mount: the accent is already correct on <html> from the
    // server (SSR from the DB). Applying the possibly-stale localStorage value
    // here would flash the wrong color over the SSR one. We only re-apply once
    // hydrate() has fetched fresh settings (which fires SETTINGS_UPDATED_EVENT).
    window.addEventListener(SETTINGS_UPDATED_EVENT, apply);
    // Load live settings + content from the server, then apply.
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

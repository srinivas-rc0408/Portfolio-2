"use client";

import { useEffect } from "react";

/**
 * Lock background scrolling while a modal is open.
 *
 * Reference-counted on purpose: modals here can legitimately stack (the doc
 * viewer opens on top of Jerry's chat), and a naive per-modal lock would
 * restore scrolling as soon as the FIRST one closed. Only the last unlock
 * actually restores the page.
 *
 * Also compensates for the scrollbar's width so locking doesn't shift the
 * layout sideways on desktop.
 */

let locks = 0;
let restore: { overflow: string; paddingRight: string } | null = null;

function lock(): void {
  if (typeof document === "undefined") return;
  locks += 1;
  if (locks > 1) return; // already locked by an outer modal

  const { body } = document;
  restore = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };

  // Reserve the space the scrollbar occupied, so content doesn't jump.
  const gap = window.innerWidth - document.documentElement.clientWidth;
  if (gap > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + gap}px`;
  }
  body.style.overflow = "hidden";
  // Signal that a modal owns the screen — lets always-on floating chrome
  // (e.g. the feedback FAB) hide itself via CSS so it never overlaps a modal.
  document.documentElement.setAttribute("data-modal-open", "");
}

function unlock(): void {
  if (typeof document === "undefined") return;
  locks = Math.max(0, locks - 1);
  if (locks > 0 || !restore) return; // an outer modal is still open

  document.body.style.overflow = restore.overflow;
  document.body.style.paddingRight = restore.paddingRight;
  restore = null;
  document.documentElement.removeAttribute("data-modal-open");
}

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}

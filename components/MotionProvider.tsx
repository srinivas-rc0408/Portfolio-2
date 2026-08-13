"use client";

import { MotionConfig } from "framer-motion";

/**
 * Applies `reducedMotion="user"` to every framer-motion animation beneath it,
 * so they follow the OS "reduce motion" setting without each component having
 * to call useReducedMotion itself.
 *
 * Exists as a client wrapper because layouts that export `metadata` must stay
 * server components and so cannot render MotionConfig directly. AppShell wraps
 * the (shell) route group inline; this covers the trees that sit outside it.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A referentially stable wrapper around a callback prop that always invokes the
 * LATEST version of it. Use when a callback has to sit in an effect's dependency
 * array without re-running that effect every time the parent re-renders.
 *
 * `useCallback(fn, [])` looks like it does this, but it captures the FIRST `fn`
 * and keeps it forever — a stale closure the moment a parent passes a fresh
 * arrow (`onDead={() => setDead(true)}`). It also trips the react-hooks rule
 * that the first argument be an inline function expression.
 *
 * The ref is updated in an effect rather than during render, because the
 * react-compiler lint rules in this repo forbid writing refs while rendering.
 */
export function useEventCallback<A extends unknown[], R>(
  fn: (...args: A) => R
): (...args: A) => R {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: A) => ref.current(...args), []);
}

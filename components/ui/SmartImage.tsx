"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper that shows a pulsing, theme-tinted skeleton until the
 * image is fully decoded, then cross-fades the real image in. Prevents the
 * "empty box → pop" flash and any CLS (the parent reserves the space via
 * `fill` + a sized container). Data-URL sources (admin uploads) are served
 * unoptimized automatically.
 *
 * The parent element must be `position: relative` (all callers here already
 * are), since both the skeleton and the `fill` image are absolutely placed.
 */
export default function SmartImage({
  className = "",
  onLoad,
  src,
  alt,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const isDataUrl = typeof src === "string" && src.startsWith("data:");

  return (
    <>
      {!loaded && (
        <span
          aria-hidden
          className="absolute inset-0 z-[1] animate-pulse bg-[rgba(var(--theme-accent-rgb),0.08)]"
        />
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        unoptimized={props.unoptimized ?? isDataUrl}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={`${className} transition-opacity duration-150 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

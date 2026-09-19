import React from "react";

/**
 * Window-control dots. Styled as miniature command chips so they read as the
 * same material as the `.nav-button` keycaps in the terminal header — quiet
 * white glass with a top light-catch, no macOS traffic-light colors.
 * Single source of truth: every window header in the portfolio renders this.
 * `size` is the diameter in Tailwind units (w-/h-).
 */
export const DOT_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.022))",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
};

export default function WindowDots({
  size = "h-3 w-3",
  gap = "gap-1.5",
  className = "",
}: {
  size?: string;
  gap?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center ${gap} ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${size} shrink-0 rounded-full`}
          style={DOT_STYLE}
        />
      ))}
    </div>
  );
}

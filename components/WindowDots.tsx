import React from "react";

/**
 * Window-control dots — red · green · blue beads built on the same chip
 * formula as the `.nav-button` command keycaps in the terminal header (a
 * 180deg two-stop gradient, a 1px border and a top light-catch), tinted per
 * dot and given a small specular highlight so a 12px circle still reads as a
 * raised control rather than a flat sticker.
 *
 * Single source of truth: every window header in the portfolio renders this,
 * so a colour change happens once, here. Keep in sync with `.dot-1/2/3` in
 * public/css/TerminalComp.css, which applies the same formula to the terminal
 * header's three *interactive* dots.
 *
 * `size` is the diameter in Tailwind units (w-/h-).
 */
const DOT_RGB = ["229, 55, 46", "47, 200, 84", "59, 150, 255"];

export const dotStyle = (rgb: string): React.CSSProperties => ({
  background: `radial-gradient(circle at 34% 26%, rgba(255,255,255,0.5), rgba(255,255,255,0) 48%), linear-gradient(180deg, rgba(${rgb},1), rgba(${rgb},0.62))`,
  border: `1px solid rgba(${rgb},0.85)`,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 4px -1px rgba(0,0,0,0.7)",
});

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
      {DOT_RGB.map((rgb) => (
        <span
          key={rgb}
          className={`${size} shrink-0 rounded-full`}
          style={dotStyle(rgb)}
        />
      ))}
    </div>
  );
}

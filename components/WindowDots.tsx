import React from "react";

/**
 * Glossy R·G·B window-control dots (red · green · blue), matching the main
 * terminal header. Single source of truth so every "traffic light" across the
 * portfolio stays identical. `size` is the diameter in Tailwind units (w-/h-).
 */
const DOTS = [
  "radial-gradient(circle at 32% 28%, #ff6f61, #e5231a 52%, #9e0d06)", // red
  "radial-gradient(circle at 32% 28%, #8ff0af, #2fd84f 55%, #15a636)", // green
  "radial-gradient(circle at 32% 28%, #86bcff, #3b9dff 55%, #1667d6)", // blue
];

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
    <div className={`flex ${gap} ${className}`} aria-hidden="true">
      {DOTS.map((bg, i) => (
        <span
          key={i}
          className={`${size} shrink-0 rounded-full`}
          style={{
            background: bg,
            boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.45)",
          }}
        />
      ))}
    </div>
  );
}

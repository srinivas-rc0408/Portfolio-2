"use client";

import React, { useState, useEffect } from "react";

// Typewriter effect — reveals `text` one character at a time, with a blinking
// caret until the text is fully typed. Shared by the About and Experience panes.
interface TypewriterTextProps {
  text: string;
  delay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 50,
}) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-white">|</span>
      )}
    </span>
  );
};

// Decorative falling-binary backdrop. Column count is reduced on narrow
// viewports; per-column animation delays are randomized once on mount so the
// rain doesn't reshuffle on every re-render.
export const MatrixRain: React.FC = () => {
  const chars = "01";
  const columns =
    typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 50;

  const [columnDelays] = useState(() =>
    Array.from({ length: columns }, () => Math.random() * 5)
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="absolute text-white text-xs font-mono"
          style={{
            left: `${(i * 100) / columns}%`,
            animation: `matrix-fall 10s linear infinite ${columnDelays[i]}s`,
          }}
        >
          {Array.from({ length: 20 }).map((_, j) => (
            <div key={j} className="opacity-20">
              {chars[Math.floor(Math.random() * chars.length)]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

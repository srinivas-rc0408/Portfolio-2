"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface GradientTracingProps {
  text?: string;
  gradientColors?: [string, string, string];
  animationDuration?: number;
  strokeWidth?: number;
}

/**
 * Traces "S.RC" with an animated Cyber-Blue gradient stroke (no fill).
 * A faint static outline keeps the letters legible between sweeps.
 * Responsive via viewBox — scales cleanly on mobile → desktop.
 */
export const GradientTracing: React.FC<GradientTracingProps> = ({
  text = "S.RC",
  gradientColors = ["#00f2fe", "#4facfe", "#00f2fe"],
  animationDuration = 1.5,
  strokeWidth = 2,
}) => {
  const gradientId = useId();
  const width = 600;
  const height = 220;

  const textProps = {
    x: "50%",
    y: "52%",
    dominantBaseline: "middle" as const,
    textAnchor: "middle" as const,
    fontSize: 150,
    fontWeight: 900,
    fontStyle: "italic" as const,
    fontFamily: "system-ui, -apple-system, sans-serif",
    letterSpacing: "-0.02em",
  };

  return (
    <div className="flex w-3/4 max-w-md items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        fill="none"
        role="img"
        aria-label="S.RC"
      >
        {/* Faint base outline */}
        <text
          {...textProps}
          fill="transparent"
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeWidth={strokeWidth}
        >
          {text}
        </text>
        {/* Animated gradient tracing stroke */}
        <text
          {...textProps}
          fill="transparent"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {text}
        </text>
        <defs>
          <motion.linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            animate={{ x1: [-width, width * 2], x2: [0, width * 3] }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <stop stopColor={gradientColors[0]} stopOpacity="0" />
            <stop stopColor={gradientColors[1]} />
            <stop offset="1" stopColor={gradientColors[2]} stopOpacity="0" />
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  );
};

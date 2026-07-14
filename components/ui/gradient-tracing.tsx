"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface GradientTracingProps {
  width: number;
  height: number;
  baseColor?: string;
  gradientColors?: [string, string, string];
  animationDuration?: number;
  strokeWidth?: number;
  path?: string;
  className?: string;
}

/**
 * Traces an SVG path with an animated gradient stroke and no fill.
 * Responsive via viewBox; scales on all screens.
 * (Uses framer-motion, already installed; API-compatible with the `motion` pkg.)
 */
export const GradientTracing: React.FC<GradientTracingProps> = ({
  width,
  height,
  baseColor = "black",
  gradientColors = ["#2EB9DF", "#2EB9DF", "#9E00FF"],
  animationDuration = 2,
  strokeWidth = 2,
  path = `M0,${height / 2} L${width},${height / 2}`,
  className = "",
}) => {
  const gradientId = useId();

  return (
    <div className={`relative ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        className="h-auto w-full"
        role="img"
        aria-label="Lightning S logo"
      >
        {/* Faint base outline */}
        <path d={path} stroke={baseColor} strokeOpacity="0.2" strokeWidth={strokeWidth} />
        {/* Animated gradient tracing */}
        <path
          d={path}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
        <defs>
          <motion.linearGradient
            animate={{ x1: [0, width * 2], x2: [0, width] }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: "linear",
            }}
            id={gradientId}
            gradientUnits="userSpaceOnUse"
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

import WindowDots from "@/components/WindowDots";

interface TerminalLoaderProps {
  text?: string;
  className?: string;
}

/**
 * Stage-2 boot loader — a system-init terminal box with window dots and
 * a `ch`-precise typing animation (see .boot-type in globals.css). Text and
 * blinking cursor follow --boot-accent (set by BootSequence from the admin
 * theme accent, contrast-guarded). Flat chrome — no glow.
 */
export const TerminalLoader: React.FC<TerminalLoaderProps> = ({
  text = "Compiling Profile: Srinivas RC...",
  className = "",
}) => {
  return (
    <div
      className={`terminal-loader relative w-[92%] max-w-[440px] overflow-hidden rounded border border-[#262626] bg-[#0f0f0f] p-6 pt-8 font-mono text-[15px] sm:text-base ${className}`}
    >
      <div className="absolute inset-x-0 top-0 flex h-6 items-center justify-between rounded-t bg-gray-800 px-3">
        <span className="text-sm leading-6 text-gray-200">
          System Initializing
        </span>
        {/* Window dots — matches the main terminal header */}
        <WindowDots size="h-2.5 w-2.5" gap="gap-2" />
      </div>
      <div
        className="boot-type mt-2 inline-block whitespace-nowrap border-r-2 font-bold"
        style={{ color: "var(--boot-accent, var(--accent))" }}
      >
        {text}
      </div>
    </div>
  );
};

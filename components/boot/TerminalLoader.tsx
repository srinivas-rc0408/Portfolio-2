interface TerminalLoaderProps {
  text?: string;
  className?: string;
}

/**
 * Stage-2 boot loader — a system-init terminal box with Indian-flag window
 * dots and a `ch`-precise typing animation (see .boot-type in globals.css).
 * Text, blinking cursor, and glow all follow --boot-accent (set by
 * BootSequence from the admin theme accent, contrast-guarded).
 */
export const TerminalLoader: React.FC<TerminalLoaderProps> = ({
  text = "Loading Srinivas R C Pro Portfolio...",
  className = "",
}) => {
  return (
    <div
      className={`terminal-loader relative w-[92%] max-w-[440px] overflow-hidden rounded border border-gray-700 bg-gray-950 p-6 pt-8 font-mono text-[15px] sm:text-base ${className}`}
      style={{
        boxShadow:
          "0 0 45px color-mix(in srgb, var(--boot-accent, #38bdf8) 30%, transparent)",
      }}
    >
      <div className="absolute inset-x-0 top-0 flex h-6 items-center justify-between rounded-t bg-gray-800 px-3">
        <span className="text-sm leading-6 text-gray-200">
          System Initializing
        </span>
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF9933]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFFFFF]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#138808]" />
        </div>
      </div>
      <div
        className="boot-type mt-2 inline-block whitespace-nowrap border-r-2 font-bold"
        style={{ color: "var(--boot-accent, #38bdf8)" }}
      >
        {text}
      </div>
    </div>
  );
};

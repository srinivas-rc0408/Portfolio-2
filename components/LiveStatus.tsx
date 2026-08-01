"use client";

import { useEffect, useState } from "react";

/**
 * Live "presence" indicator: a pulsing emerald dot, a SYS: ONLINE label, and a
 * per-second clock in Bengaluru time (Asia/Kolkata), e.g. `BLR: 05:30:45 PM`.
 *
 * Hydration-safe: the clock only renders after mount (the `time` state starts
 * null), so the server never emits a timestamp that could mismatch the client.
 * The timezone is pinned via Intl, so it reads Bengaluru time on any machine.
 */
const BLR_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

export default function LiveStatus({
  className = "",
  compact = false,
}: {
  className?: string;
  /** Header/mobile variant: drops the SYS: ONLINE label, keeps dot + clock. */
  compact?: boolean;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    // Normalise any narrow no-break space before AM/PM to a plain space.
    const tick = () =>
      setTime(BLR_TIME.format(new Date()).replace(/\s+/g, " ").toUpperCase());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-400 sm:text-xs ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      </span>
      {!compact && <span className="ml-0.5 text-zinc-300">SYS: ONLINE</span>}
      {/* Renders only after mount → guaranteed no hydration mismatch. */}
      {time && (
        <span className="tabular-nums text-zinc-500">
          {!compact && <span className="text-zinc-600">· </span>}BLR: {time}
        </span>
      )}
    </div>
  );
}

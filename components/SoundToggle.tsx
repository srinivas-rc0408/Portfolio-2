"use client";

import { useState } from "react";
import { Volume2, VolumeOff } from "lucide-react";
import { SoundEngine } from "@/lib/sound";

/**
 * Compact sound on/off toggle — mirrors the XrayToggle aesthetic (pill switch
 * with a spring-animated knob). Reads the initial state from `SoundEngine` and
 * persists the user's preference to localStorage on toggle.
 */
export default function SoundToggle() {
  const [off, setOff] = useState(() => SoundEngine.isMuted());

  const toggle = () => {
    const nowMuted = SoundEngine.toggleMute();
    setOff(nowMuted);
  };

  const Icon = off ? VolumeOff : Volume2;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!off}
      title={off ? "Unmute UI sounds" : "Mute UI sounds"}
      className={`group flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
        off ? "text-zinc-500 hover:text-zinc-300" : "text-emerald-400"
      }`}
    >
      <Icon size={12} strokeWidth={2} aria-hidden />
      <span className="hidden sm:inline">Sound</span>
      <span
        className={`relative flex h-4 w-7 shrink-0 items-center rounded-full border px-0.5 transition-colors ${
          off
            ? "border-white/15 bg-white/5"
            : "border-emerald-500/70 bg-emerald-500/20"
        }`}
      >
        <span
          className={`h-3 w-3 rounded-full transition-transform duration-200 ${
            off
              ? "translate-x-0 bg-zinc-500"
              : "translate-x-3 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.85)]"
          }`}
        />
      </span>
    </button>
  );
}

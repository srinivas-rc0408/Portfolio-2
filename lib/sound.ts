/**
 * Global Sound Engine — ultra-lightweight Web Audio API utility.
 *
 * Generates two synthetic sounds procedurally (no external audio files):
 * - `tick`: crisp 3ms mechanical keyboard click (2200Hz → 800Hz sweep)
 * - `whoosh`: soft 120ms low-frequency whoosh (120Hz → 60Hz with fade)
 *
 * CRITICAL BROWSER COMPLIANCE:
 * The AudioContext is lazily created on the first user interaction (click or
 * keypress) to comply with Chrome/Safari autoplay policies. Before that,
 * play() is a silent no-op.
 *
 * The user's mute preference is stored in localStorage under `sound_muted`.
 */

let ctx: AudioContext | null = null;
let initialized = false;
let muted = false;

// Hydration-safe: only read localStorage on the client.
if (typeof window !== "undefined") {
  try {
    muted = localStorage.getItem("sound_muted") === "true";
  } catch {
    /* localStorage blocked */
  }
}

/** Called once from the first user interaction to unlock the AudioContext. */
function initAudio(): void {
  if (initialized) return;
  initialized = true;
  try {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  } catch {
    ctx = null;
  }
}

// Auto-initialize on first user gesture (click, keydown, touchstart).
if (typeof window !== "undefined") {
  const unlock = () => {
    initAudio();
    window.removeEventListener("click", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    window.removeEventListener("touchstart", unlock, true);
  };
  window.addEventListener("click", unlock, true);
  window.addEventListener("keydown", unlock, true);
  window.addEventListener("touchstart", unlock, true);
}

/** Synthesize a crisp mechanical keyboard tick (no external files). */
function playTick(): void {
  if (muted || !ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(2200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.003);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    /* graceful: audio failures are never visible to the user */
  }
}

/** Synthesize a soft low-frequency whoosh (modal open/close). */
function playWhoosh(): void {
  if (muted || !ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    /* graceful */
  }
}

/** Toggle mute state; persists to localStorage. */
function toggleMute(): boolean {
  muted = !muted;
  try {
    localStorage.setItem("sound_muted", String(muted));
  } catch {
    /* localStorage blocked */
  }
  return muted;
}

function isMuted(): boolean {
  return muted;
}

export const SoundEngine = {
  tick: playTick,
  whoosh: playWhoosh,
  toggleMute,
  isMuted,
} as const;

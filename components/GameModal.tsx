"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Heart, Play, X, Bot } from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";
import { useEventCallback } from "@/lib/useEventCallback";

// ── Flappy Duck PID Game ─────────────────────────────────────────────────────
// A canvas-based endless-runner where the bird is steered by an autonomous
// PID controller. P-term: vertical offset to gap centre. D-term: velocity.
const FD_W = 400;
const FD_H = 320;
const FD_GRAVITY = 0.38;
const FD_FLAP = -6.5;
const FD_PIPE_W = 52;
const FD_GAP = 110;
const FD_PIPE_SPEED = 2.4;
const FD_PIPE_INTERVAL = 1500; // ms

interface FDPipe { x: number; gapTop: number; scored: boolean; }

const FlappyDuckCanvas: React.FC<{ onScore: (s: number) => void; onDead: () => void; running: boolean }> = ({ onScore, onDead, running }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    y: FD_H / 2,
    vy: 0,
    pipes: [] as FDPipe[],
    score: 0,
    lastPipe: 0,
    dead: false,
  });
  // Stable identities for the game-loop effect's dep array. Must forward to the
  // latest prop: the parent passes `onDead={() => setFdDead(true)}`, a fresh
  // arrow every render, which a `useCallback(fn, [])` would freeze forever.
  const stableScore = useEventCallback(onScore);
  const stableDead = useEventCallback(onDead);

  // Manual flap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.key === " ") && !stateRef.current.dead) {
        stateRef.current.vy = FD_FLAP;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    s.y = FD_H / 2; s.vy = 0; s.pipes = []; s.score = 0; s.lastPipe = 0; s.dead = false;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      if (s.dead) return;

      // Spawn pipes
      if (s.lastPipe === 0 || now - s.lastPipe > FD_PIPE_INTERVAL) {
        const gapTop = 60 + Math.random() * (FD_H - FD_GAP - 80);
        s.pipes.push({ x: FD_W, gapTop, scored: false });
        s.lastPipe = now;
      }

      // PID controller — target: centre of the nearest incoming pipe gap
      const nextPipe = s.pipes.find(p => p.x + FD_PIPE_W > 60);
      const target = nextPipe ? nextPipe.gapTop + FD_GAP / 2 : FD_H / 2;
      const error = target - s.y;
      const kP = 0.045, kD = 1.2;
      const pidOutput = kP * error - kD * s.vy;
      if (pidOutput > 0.55 && s.vy > -3) s.vy = FD_FLAP * 0.82;

      // Physics
      s.vy += FD_GRAVITY * (dt / 16);
      s.y += s.vy * (dt / 16);

      // Move pipes
      for (const p of s.pipes) p.x -= FD_PIPE_SPEED * (dt / 16);
      s.pipes = s.pipes.filter(p => p.x + FD_PIPE_W > 0);

      // Score
      for (const p of s.pipes) {
        if (!p.scored && p.x + FD_PIPE_W < 60) {
          p.scored = true; s.score++;
          stableScore(s.score);
        }
      }

      // Collision
      const bx = 60, by = s.y, bR = 12;
      if (by - bR < 0 || by + bR > FD_H) { s.dead = true; stableDead(); return; }
      for (const p of s.pipes) {
        const inX = bx + bR > p.x && bx - bR < p.x + FD_PIPE_W;
        const inGap = by - bR > p.gapTop && by + bR < p.gapTop + FD_GAP;
        if (inX && !inGap) { s.dead = true; stableDead(); return; }
      }

      // Draw
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(0, 0, FD_W, FD_H);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < FD_W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, FD_H); ctx.stroke(); }
      for (let gy = 0; gy < FD_H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(FD_W, gy); ctx.stroke(); }

      // Pipes
      for (const p of s.pipes) {
        ctx.fillStyle = "#1a2e1a";
        ctx.strokeStyle = "rgba(34,197,94,0.5)";
        ctx.lineWidth = 1;
        // top
        ctx.fillRect(p.x, 0, FD_PIPE_W, p.gapTop);
        ctx.strokeRect(p.x, 0, FD_PIPE_W, p.gapTop);
        // bottom
        ctx.fillRect(p.x, p.gapTop + FD_GAP, FD_PIPE_W, FD_H - p.gapTop - FD_GAP);
        ctx.strokeRect(p.x, p.gapTop + FD_GAP, FD_PIPE_W, FD_H - p.gapTop - FD_GAP);
        // gap line
        ctx.strokeStyle = "rgba(34,197,94,0.15)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(p.x + FD_PIPE_W / 2, p.gapTop); ctx.lineTo(p.x + FD_PIPE_W / 2, p.gapTop + FD_GAP); ctx.stroke();
        ctx.setLineDash([]);
      }

      // PID trajectory arc
      if (nextPipe) {
        ctx.strokeStyle = "rgba(34,197,94,0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(nextPipe.x, nextPipe.gapTop + FD_GAP / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Bird body
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.max(-0.5, Math.min(0.6, s.vy * 0.07)));
      ctx.fillStyle = "#facc15";
      ctx.shadowBlur = 12; ctx.shadowColor = "#fbbf24";
      ctx.beginPath(); ctx.arc(0, 0, bR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // eye
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(5, -3, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(5.5, -3.5, 1, 0, Math.PI * 2); ctx.fill();
      // wing pulse
      const wingY = Math.sin(now / 120) * 3;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath(); ctx.ellipse(-4, wingY, 7, 4, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // PID HUD overlay
      ctx.fillStyle = "rgba(34,197,94,0.7)";
      ctx.font = "9px monospace";
      ctx.fillText(`P=${(error * 0.045).toFixed(2)} D=${(-s.vy * 1.2).toFixed(2)}`, 6, 12);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, stableScore, stableDead]);

  return (
    <canvas
      ref={canvasRef}
      width={FD_W}
      height={FD_H}
      className="block w-full rounded-lg"
      style={{ imageRendering: "pixelated", maxHeight: FD_H }}
      onPointerDown={(e) => { e.preventDefault(); if (!stateRef.current.dead) stateRef.current.vy = FD_FLAP; }}
      aria-label="Flappy Duck game canvas"
    />
  );
};


/**
 * ARCH-MAN — popup arcade game (opened via the `play archman` command or the
 * Games button, which dispatch a "game:open" window event).
 *   · Home screen: Play, difficulty select (Easy/Normal/Hard), Exit, ✕.
 *   · Colored grid rendering (accent walls, gold player, colored ghosts).
 *   · Arrows / WASD to move · Esc returns to the menu · lives + score + win.
 * Fully client-side; the interval loop mutates refs and commits one frame
 * counter per tick, so renders stay cheap and 60fps-smooth.
 */

// '#' wall · '.' dot · ' ' empty. 21×15 — same maze as the classic version.
const MAZE = [
  "#####################",
  "#.........#.........#",
  "#.###.###.#.###.###.#",
  "#...................#",
  "#.###.#.#####.#.###.#",
  "#.....#...#...#.....#",
  "#####.###.#.###.#####",
  "#.....#.......#.....#",
  "#.###.#.#####.#.###.#",
  "#...................#",
  "#.###.###.#.###.###.#",
  "#...#.....#.....#...#",
  "#.#.#.#########.#.#.#",
  "#...................#",
  "#####################",
] as const;

const ROWS = MAZE.length;
const COLS = MAZE[0].length;
const PLAYER_START = { r: 13, c: 10 };
const GHOST_STARTS = [
  { r: 1, c: 1 },
  { r: 1, c: 19 },
  { r: 7, c: 10 },
  { r: 11, c: 5 },
];
const GHOST_COLORS = ["#ff5f57", "#f472b6", "#3b9dff", "#2fd84f"];

type Mode = "easy" | "normal" | "hard";
const MODES: Record<Mode, { label: string; tick: number; ghosts: number; chase: number }> = {
  easy: { label: "Easy", tick: 230, ghosts: 2, chase: 0.35 },
  normal: { label: "Normal", tick: 175, ghosts: 3, chase: 0.55 },
  hard: { label: "Hard", tick: 130, ghosts: 4, chase: 0.75 },
};

type Screen = "menu" | "playing" | "won" | "lost";
interface Pos {
  r: number;
  c: number;
}

const wall = (r: number, c: number) =>
  r < 0 || c < 0 || r >= ROWS || c >= COLS || MAZE[r][c] === "#";

const DIRS = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
];

export default function GameModal() {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState<"archman" | "flappy">("archman");
  // Lock background scrolling while this modal is open.
  useScrollLock(open);
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("easy");
  // HUD mirror of the ref state — a fresh object per tick re-renders the grid.
  const [hud, setHud] = useState({ score: 0, lives: 3 });

  // Flappy Duck state
  const [fdScore, setFdScore] = useState(0);
  const [fdRunning, setFdRunning] = useState(false);
  const [fdDead, setFdDead] = useState(false);

  // Mutable game state (refs: the loop never re-creates the interval mid-game).
  const player = useRef<Pos>({ ...PLAYER_START });
  const dir = useRef<Pos>({ r: 0, c: 0 });
  const nextDir = useRef<Pos>({ r: 0, c: 0 });
  const ghosts = useRef<Pos[]>([]);
  const dots = useRef<Set<string>>(new Set());
  const score = useRef(0);
  const lives = useRef(3);

  const resetPositions = useCallback((ghostCount: number) => {
    player.current = { ...PLAYER_START };
    dir.current = { r: 0, c: 0 };
    nextDir.current = { r: 0, c: 0 };
    ghosts.current = GHOST_STARTS.slice(0, ghostCount).map((g) => ({ ...g }));
  }, []);

  const startGame = useCallback(
    (m: Mode) => {
      setMode(m);
      dots.current = new Set();
      MAZE.forEach((row, r) =>
        [...row].forEach((ch, c) => {
          if (ch === ".") dots.current.add(`${r},${c}`);
        })
      );
      score.current = 0;
      lives.current = 3;
      setHud({ score: 0, lives: 3 });
      resetPositions(MODES[m].ghosts);
      setScreen("playing");
    },
    [resetPositions]
  );

  // Open via the global events.
  useEffect(() => {
    const onOpen = () => {
      setGame("archman");
      setScreen("menu");
      setOpen(true);
    };
    const onOpenFlappy = () => {
      setGame("flappy");
      setFdScore(0);
      setFdRunning(true);
      setFdDead(false);
      setOpen(true);
    };
    window.addEventListener("game:open", onOpen);
    window.addEventListener("game:open-flappy", onOpenFlappy);
    return () => {
      window.removeEventListener("game:open", onOpen);
      window.removeEventListener("game:open-flappy", onOpenFlappy);
    };
  }, []);

  // Keyboard: arrows/WASD steer; Esc → menu (or closes from the menu).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setScreen((s) => (s === "playing" ? "menu" : s));
        if (screen === "menu") setOpen(false);
        return;
      }
      const map: Record<string, Pos> = {
        ArrowUp: { r: -1, c: 0 },
        ArrowDown: { r: 1, c: 0 },
        ArrowLeft: { r: 0, c: -1 },
        ArrowRight: { r: 0, c: 1 },
        w: { r: -1, c: 0 },
        s: { r: 1, c: 0 },
        a: { r: 0, c: -1 },
        d: { r: 0, c: 1 },
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        nextDir.current = d;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, screen]);

  // Game loop.
  useEffect(() => {
    if (!open || screen !== "playing") return;
    const cfg = MODES[mode];

    const tick = () => {
      // Turn if possible, else keep going.
      const p = player.current;
      const want = nextDir.current;
      if (!wall(p.r + want.r, p.c + want.c)) dir.current = want;
      const d = dir.current;
      if (!wall(p.r + d.r, p.c + d.c)) {
        p.r += d.r;
        p.c += d.c;
      }
      // Eat dot.
      const key = `${p.r},${p.c}`;
      if (dots.current.delete(key)) score.current += 10;

      // Move ghosts: chase (bias by difficulty) or wander.
      for (const g of ghosts.current) {
        const options = DIRS.filter((o) => !wall(g.r + o.r, g.c + o.c));
        if (options.length === 0) continue;
        let choice;
        if (Math.random() < cfg.chase) {
          choice = options.reduce((best, o) => {
            const dist = (x: Pos) =>
              Math.abs(g.r + x.r - p.r) + Math.abs(g.c + x.c - p.c);
            return dist(o) < dist(best) ? o : best;
          }, options[0]);
        } else {
          choice = options[Math.floor(Math.random() * options.length)];
        }
        g.r += choice.r;
        g.c += choice.c;
      }

      // Collisions.
      if (ghosts.current.some((g) => g.r === p.r && g.c === p.c)) {
        lives.current -= 1;
        if (lives.current <= 0) {
          setHud({ score: score.current, lives: 0 });
          setScreen("lost");
          return;
        }
        resetPositions(cfg.ghosts);
      }
      if (dots.current.size === 0) {
        setHud({ score: score.current, lives: lives.current });
        setScreen("won");
        return;
      }
      setHud({ score: score.current, lives: lives.current });
    };

    const id = window.setInterval(tick, cfg.tick);
    return () => window.clearInterval(id);
  }, [open, screen, mode, resetPositions]);

  const close = () => {
    setOpen(false);
    setFdRunning(false);
  };

  // --- Cell rendering ---
  const cell = (r: number, c: number) => {
    const p = player.current;
    if (screen === "playing" || screen === "won" || screen === "lost") {
      if (p.r === r && p.c === c) {
        return (
          <span className="absolute inset-[12%] rounded-full bg-yellow-400" />
        );
      }
      const gi = ghosts.current.findIndex((g) => g.r === r && g.c === c);
      if (gi >= 0) {
        return (
          <span
            className="absolute inset-[14%] rounded-t-full"
            style={{
              background: GHOST_COLORS[gi % GHOST_COLORS.length],
              boxShadow: `0 0 8px ${GHOST_COLORS[gi % GHOST_COLORS.length]}aa`,
            }}
          />
        );
      }
    }
    if (MAZE[r][c] === "#") {
      return (
        <span className="absolute inset-[6%] rounded-[3px] bg-[rgba(var(--theme-accent-rgb),0.28)] shadow-[inset_0_0_4px_rgba(var(--theme-accent-rgb),0.5)]" />
      );
    }
    if (dots.current.has(`${r},${c}`)) {
      return <span className="absolute inset-[40%] rounded-full bg-white/70" />;
    }
    return null;
  };

  const menuButton =
    "w-full rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.1)] px-4 py-2.5 font-mono text-sm font-semibold text-white transition-all duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.22)] active:scale-95";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Arch-Man game"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/80 font-mono backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-2.5">
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-white">
                {game === "flappy" ? (
                  <><Bot size={16} style={{ color: "var(--theme-accent)" }} aria-hidden /> FLAPPY DUCK</>
                ) : (
                  <><Gamepad2 size={16} style={{ color: "var(--theme-accent)" }} aria-hidden /> ARCH-MAN</>
                )}
              </h2>
              <div className="flex items-center gap-3">
                {game === "flappy" ? (
                  <span className="text-xs text-white/70">
                    score{" "}
                    <span className="font-bold" style={{ color: "var(--theme-accent)" }}>{fdScore}</span>
                  </span>
                ) : (
                  screen !== "menu" && (
                    <span className="flex items-center gap-3 text-xs text-white/70">
                      <span>
                        score{" "}
                        <span className="font-bold text-[var(--theme-accent)]">
                          {hud.score}
                        </span>
                      </span>
                      <span className="flex items-center gap-1" aria-label={`${hud.lives} lives`}>
                        {Array.from({ length: hud.lives }).map((_, i) => (
                          <Heart key={i} size={11} className="fill-red-500 text-red-500" aria-hidden />
                        ))}
                      </span>
                    </span>
                  )
                )}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close game"
                  title="Close"
                  className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={17} strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            </header>

            {/* Flappy Duck sub-screen */}
            {game === "flappy" && (
              <div className="relative px-4 pb-4 pt-3">
                <p className="mb-2 text-center text-[10px] tracking-widest text-white/40">
                  AUTONOMOUS PID AGENT ACTIVE · Space/Tap to override
                </p>
                <FlappyDuckCanvas
                  running={fdRunning && !fdDead}
                  onScore={setFdScore}
                  onDead={() => setFdDead(true)}
                />
                {fdDead && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/75 backdrop-blur-sm">
                    <p className="text-2xl" aria-hidden>💀</p>
                    <p className="font-bold tracking-widest text-red-400">PID AGENT TERMINATED</p>
                    <p className="text-sm text-white/60">Score: {fdScore}</p>
                    <button
                      type="button"
                      onClick={() => { setFdScore(0); setFdDead(false); setFdRunning(true); }}
                      className="mt-1 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.1)] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[rgba(var(--theme-accent-rgb),0.22)] active:scale-95"
                    >
                      <span className="flex items-center gap-2"><Play size={13} aria-hidden /> Restart Agent</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Menu screen */}
            {screen === "menu" && (
              <div className="flex flex-col items-center gap-5 px-8 py-10">
                <p className="text-center text-4xl" aria-hidden>
                  👾
                </p>
                <h3 className="text-lg font-bold tracking-[0.3em] text-[var(--theme-accent)]">
                  ARCH-MAN
                </h3>
                <p className="-mt-3 text-center text-xs text-white/50">
                  Eat every dot. Dodge the ghosts. Arrow keys / WASD to move.
                </p>
                <div className="w-full max-w-[240px] space-y-2.5">
                  <button type="button" onClick={() => startGame(mode)} className={menuButton}>
                    <span className="flex items-center justify-center gap-2">
                      <Play size={14} aria-hidden /> Play
                    </span>
                  </button>
                  <div className="flex gap-1.5" role="radiogroup" aria-label="Difficulty">
                    {(Object.keys(MODES) as Mode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={mode === m}
                        onClick={() => setMode(m)}
                        className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition-all ${
                          mode === m
                            ? "border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.18)] text-white"
                            : "border-white/15 text-white/50 hover:border-[rgba(var(--theme-accent-rgb),0.4)] hover:text-white"
                        }`}
                      >
                        {MODES[m].label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="w-full rounded-lg border border-white/15 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Exit
                  </button>
                </div>
              </div>
            )}

            {/* Game / end screens */}
            {screen !== "menu" && (
              <div className="relative px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                <div
                  className="mx-auto grid w-full max-w-[440px] select-none"
                  style={{
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    aspectRatio: `${COLS} / ${ROWS}`,
                  }}
                  aria-label="Game board"
                >
                  {/* eslint-disable-next-line react-hooks/refs -- cell() reads
                      game refs that are only mutated in the interval tick; each
                      tick commits setHud() so every render sees fresh values. */}
                  {Array.from({ length: ROWS * COLS }).map((_, i) => {
                    const r = Math.floor(i / COLS);
                    const c = i % COLS;
                    return (
                      <span key={i} className="relative">
                        {cell(r, c)}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-2 hidden text-center text-[10px] text-white/40 sm:block">
                  [arrows / WASD] move · [Esc] menu
                </p>

                {/* Touch D-pad — the only way to play without a keyboard.
                    Gated on pointer capability, NOT width: a landscape phone is
                    >=640px wide, so the old `sm:hidden` hid the only controls
                    there and left the game unplayable. */}
                {screen === "playing" && (
                  <div className="mx-auto mt-3 grid w-[150px] grid-cols-3 grid-rows-3 gap-1.5 [@media(hover:hover)]:hidden">
                    {(
                      [
                        [null, { r: -1, c: 0, k: "↑", a: "Up" }, null],
                        [
                          { r: 0, c: -1, k: "←", a: "Left" },
                          null,
                          { r: 0, c: 1, k: "→", a: "Right" },
                        ],
                        [null, { r: 1, c: 0, k: "↓", a: "Down" }, null],
                      ] as ({ r: number; c: number; k: string; a: string } | null)[][]
                    )
                      .flat()
                      .map((d, i) =>
                        d ? (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Move ${d.a}`}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              nextDir.current = { r: d.r, c: d.c };
                            }}
                            className="grid h-11 select-none place-items-center rounded-lg border border-[rgba(var(--theme-accent-rgb),0.4)] bg-[rgba(var(--theme-accent-rgb),0.1)] text-lg text-[var(--theme-accent)] active:scale-90 active:bg-[rgba(var(--theme-accent-rgb),0.25)]"
                          >
                            {d.k}
                          </button>
                        ) : (
                          <span key={i} aria-hidden />
                        )
                      )}
                  </div>
                )}

                {/* Win / lose overlay */}
                {(screen === "won" || screen === "lost") && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-[2px]">
                    <p className="text-2xl" aria-hidden>
                      {screen === "won" ? "🏆" : "💀"}
                    </p>
                    <p
                      className="text-lg font-bold tracking-widest"
                      style={{ color: screen === "won" ? "var(--theme-accent)" : "#ff5f57" }}
                      role="status"
                    >
                      {screen === "won" ? "MAZE CLEARED!" : "GAME OVER"}
                    </p>
                    <p className="text-sm text-white/70">final score: {hud.score}</p>
                    <div className="mt-1 flex gap-2">
                      <button type="button" onClick={() => startGame(mode)} className={`${menuButton} !w-auto px-5`}>
                        Play again
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreen("menu")}
                        className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        Menu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

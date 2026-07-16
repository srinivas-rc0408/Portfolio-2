"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Heart, Play, X } from "lucide-react";

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
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("easy");
  // HUD mirror of the ref state — a fresh object per tick re-renders the grid.
  const [hud, setHud] = useState({ score: 0, lives: 3 });

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

  // Open via the global event.
  useEffect(() => {
    const onOpen = () => {
      setScreen("menu");
      setOpen(true);
    };
    window.addEventListener("game:open", onOpen);
    return () => window.removeEventListener("game:open", onOpen);
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

  const close = () => setOpen(false);

  // --- Cell rendering ---
  const cell = (r: number, c: number) => {
    const p = player.current;
    if (screen === "playing" || screen === "won" || screen === "lost") {
      if (p.r === r && p.c === c) {
        return (
          <span className="absolute inset-[12%] rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.9)]" />
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
    "w-full rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.1)] px-4 py-2.5 font-mono text-sm font-semibold text-white transition-all duration-200 hover:bg-[rgba(var(--theme-accent-rgb),0.22)] hover:shadow-[0_0_16px_rgba(var(--theme-accent-rgb),0.4)] active:scale-95";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Arch-Man game"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/80 font-mono shadow-[0_0_60px_rgba(var(--theme-accent-rgb),0.22)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-[rgba(var(--theme-accent-rgb),0.25)] bg-white/[0.03] px-4 py-2.5">
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-white">
                <Gamepad2 size={16} style={{ color: "var(--theme-accent)" }} aria-hidden />
                ARCH-MAN
              </h2>
              <div className="flex items-center gap-3">
                {screen !== "menu" && (
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
                <p className="mt-2 text-center text-[10px] text-white/40">
                  [arrows / WASD] move · [Esc] menu
                </p>

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

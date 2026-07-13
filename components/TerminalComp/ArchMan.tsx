"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * ARCH-MAN — an ASCII maze-muncher played entirely inside the terminal buffer.
 *
 * All mutable game state lives in refs; each tick updates a single string
 * state in THIS component only, so the surrounding terminal (history array,
 * input) never re-renders during play.
 */

const TICK_MS = 160;
const DOT_SCORE = 10;
const START_LIVES = 3;

// '#' wall · '.' dot · ' ' walkable empty. All rows exactly 21 chars.
const MAZE: readonly string[] = [
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
];

type Pos = { r: number; c: number };
type Dir = { r: number; c: number };

const PLAYER_START: Pos = { r: 13, c: 10 };
const GHOST_STARTS: Pos[] = [
  { r: 3, c: 5 },
  { r: 3, c: 15 },
  { r: 7, c: 10 },
];

const DIRS: Dir[] = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
];

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: { r: -1, c: 0 },
  ArrowDown: { r: 1, c: 0 },
  ArrowLeft: { r: 0, c: -1 },
  ArrowRight: { r: 0, c: 1 },
};

function isWall(p: Pos): boolean {
  return MAZE[p.r]?.[p.c] !== undefined ? MAZE[p.r][p.c] === "#" : true;
}

function keyOf(p: Pos): string {
  return `${p.r},${p.c}`;
}

function initialDots(): Set<string> {
  const dots = new Set<string>();
  MAZE.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === ".") dots.add(`${r},${c}`);
    }
  });
  dots.delete(keyOf(PLAYER_START));
  return dots;
}

interface GameState {
  player: Pos;
  dir: Dir;
  ghosts: { pos: Pos; lastDir: Dir }[];
  dots: Set<string>;
  score: number;
  lives: number;
  status: "playing" | "won" | "lost";
}

function freshPositions(s: GameState): void {
  s.player = { ...PLAYER_START };
  s.dir = { r: 0, c: 0 };
  s.ghosts = GHOST_STARTS.map((p) => ({ pos: { ...p }, lastDir: { r: 0, c: 0 } }));
}

function newGame(): GameState {
  const s: GameState = {
    player: { ...PLAYER_START },
    dir: { r: 0, c: 0 },
    ghosts: [],
    dots: initialDots(),
    score: 0,
    lives: START_LIVES,
    status: "playing",
  };
  freshPositions(s);
  return s;
}

/** Ghost step: mostly chase (min manhattan distance), sometimes random; avoids reversing. */
function ghostStep(g: { pos: Pos; lastDir: Dir }, player: Pos): void {
  const options = DIRS.map((d) => ({
    d,
    p: { r: g.pos.r + d.r, c: g.pos.c + d.c },
  })).filter((o) => !isWall(o.p));
  if (options.length === 0) return;

  const nonReversing = options.filter(
    (o) => !(o.d.r === -g.lastDir.r && o.d.c === -g.lastDir.c && (o.d.r || o.d.c))
  );
  const pool = nonReversing.length > 0 ? nonReversing : options;

  let pick;
  if (Math.random() < 0.7) {
    pick = pool.reduce((best, o) => {
      const dist = Math.abs(o.p.r - player.r) + Math.abs(o.p.c - player.c);
      const bestDist = Math.abs(best.p.r - player.r) + Math.abs(best.p.c - player.c);
      return dist < bestDist ? o : best;
    });
  } else {
    pick = pool[Math.floor(Math.random() * pool.length)];
  }
  g.pos = pick.p;
  g.lastDir = pick.d;
}

function renderFrame(s: GameState): string {
  const hearts = "<3 ".repeat(s.lives).trim() || "--";
  const header = ` ARCH-MAN   score: ${String(s.score).padEnd(5)} lives: ${hearts}`;
  const controls = " [arrows] move   [q] quit   [r] restart";

  if (s.status === "won") {
    return `${header}\n\n   *** YOU WIN — maze cleared! ***\n\n   final score: ${s.score}\n${controls}`;
  }
  if (s.status === "lost") {
    return `${header}\n\n   *** GAME OVER ***\n\n   final score: ${s.score}\n${controls}`;
  }

  const grid = MAZE.map((row, r) => {
    let line = "";
    for (let c = 0; c < row.length; c++) {
      const k = `${r},${c}`;
      if (s.player.r === r && s.player.c === c) line += "C";
      else if (s.ghosts.some((g) => g.pos.r === r && g.pos.c === c)) line += "M";
      else if (row[c] === "#") line += "#";
      else if (s.dots.has(k)) line += ".";
      else line += " ";
    }
    return " " + line;
  }).join("\n");

  return `${header}\n${grid}\n${controls}`;
}

interface ArchManProps {
  onExit: () => void;
}

const ArchMan: React.FC<ArchManProps> = ({ onExit }) => {
  const stateRef = useRef<GameState>(newGame());
  const exitedRef = useRef(false);
  const [frame, setFrame] = useState<string>(() => renderFrame(stateRef.current));
  const [exited, setExited] = useState(false);

  useEffect(() => {
    const s = () => stateRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (exitedRef.current) return;
      if (KEY_DIRS[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        s().dir = KEY_DIRS[e.key];
        return;
      }
      if (e.key === "q" || e.key === "Q" || e.key === "Escape") {
        e.preventDefault();
        exitedRef.current = true;
        setExited(true);
        onExit();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        stateRef.current = newGame();
        setFrame(renderFrame(stateRef.current));
      }
    };

    const tick = () => {
      const st = s();
      if (st.status !== "playing") return;

      // Player move
      const next = { r: st.player.r + st.dir.r, c: st.player.c + st.dir.c };
      if (!isWall(next)) st.player = next;

      const k = keyOf(st.player);
      if (st.dots.has(k)) {
        st.dots.delete(k);
        st.score += DOT_SCORE;
        if (st.dots.size === 0) st.status = "won";
      }

      // Ghost moves + collision (checked after each move so pass-through counts)
      for (const g of st.ghosts) {
        ghostStep(g, st.player);
        if (g.pos.r === st.player.r && g.pos.c === st.player.c) {
          st.lives -= 1;
          if (st.lives <= 0) {
            st.status = "lost";
          } else {
            freshPositions(st);
          }
          break;
        }
      }

      setFrame(renderFrame(st));
    };

    // Interval-driven loop: cheap at ~6fps, never blocks the main thread.
    const interval = window.setInterval(tick, TICK_MS);
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("keydown", onKey, { capture: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div role="application" aria-label="Arch-Man terminal game">
      <pre className="pre-output" style={{ lineHeight: 1.15 }}>
        {frame}
      </pre>
      {exited && (
        <p className="text-gray-500 font-mono text-sm">
          archman exited — final score {stateRef.current.score}
        </p>
      )}
    </div>
  );
};

export default ArchMan;

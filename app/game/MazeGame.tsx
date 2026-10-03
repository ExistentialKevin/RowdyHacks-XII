"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 0 = wall, 1 = open path, 2 = exit
const MAZE: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const START = { x: 1, y: 1 };
const CELL_SIZE = 40;
const MAX_STEPS = 400;
const STEP_DELAY_MS = 110;

type Pos = { x: number; y: number };
type Step = Pos & { moved: boolean };

const DEFAULT_CODE = `# Move the player to the green exit using Python!
#
# Available functions:
#   move("up" | "down" | "left" | "right") -> True if the move succeeded
#   can_move(direction)                    -> True if that direction is open
#   at_exit()                              -> True once you're on the exit
#
# Example: keep moving right, then down, until you reach the exit.
while not at_exit():
    if can_move("right"):
        move("right")
    elif can_move("down"):
        move("down")
    else:
        move("up")
`;

function isOpen(x: number, y: number) {
  const row = MAZE[y];
  if (!row) return false;
  const cell = row[x];
  return cell === 1 || cell === 2;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  globals: { set: (name: string, value: unknown) => void };
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
}

type LoadState = "loading" | "ready" | "error";

export default function MazeGame() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [player, setPlayer] = useState<Pos>(START);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pyodideRef = useRef<PyodideInterface | null>(null);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/pyodide/pyodide.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide script."));
            document.body.appendChild(script);
          });
        }

        if (cancelled || !window.loadPyodide) return;

        const pyodide = await window.loadPyodide({ indexURL: "/pyodide/" });
        pyodide.setStdout({
          batched: (msg) => {
            logRef.current = [...logRef.current, msg];
            setLog(logRef.current);
          },
        });
        pyodide.setStderr({
          batched: (msg) => {
            logRef.current = [...logRef.current, msg];
            setLog(logRef.current);
          },
        });

        if (!cancelled) {
          pyodideRef.current = pyodide;
          setLoadState("ready");
        }
      } catch {
        if (!cancelled) setLoadState("error");
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const playSteps = useCallback((steps: Step[]) => {
    stopAnimation();

    if (steps.length === 0) {
      setRunning(false);
      return;
    }

    let i = 0;
    animationRef.current = setInterval(() => {
      const step = steps[i];
      setPlayer({ x: step.x, y: step.y });
      if (step.moved) setMoves((m) => m + 1);
      i += 1;

      if (MAZE[step.y][step.x] === 2) {
        setWon(true);
        stopAnimation();
        setRunning(false);
        return;
      }

      if (i >= steps.length) {
        stopAnimation();
        setRunning(false);
      }
    }, STEP_DELAY_MS);
  }, [stopAnimation]);

  const runCode = useCallback(async () => {
    const pyodide = pyodideRef.current;
    if (!pyodide || running) return;

    stopAnimation();
    setPlayer(START);
    setMoves(0);
    setWon(false);
    setError(null);
    logRef.current = [];
    setLog([]);
    setRunning(true);

    const sim: Pos = { ...START };
    const steps: Step[] = [];
    const deltas: Record<string, [number, number]> = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };

    pyodide.globals.set("move", (direction: string) => {
      if (steps.length >= MAX_STEPS) {
        throw new Error(
          `Move limit of ${MAX_STEPS} exceeded — check your code for an infinite loop.`,
        );
      }
      const delta = deltas[direction];
      if (!delta) {
        throw new Error(
          `Unknown direction "${direction}". Use "up", "down", "left", or "right".`,
        );
      }
      const nx = sim.x + delta[0];
      const ny = sim.y + delta[1];
      const moved = isOpen(nx, ny);
      if (moved) {
        sim.x = nx;
        sim.y = ny;
      }
      steps.push({ x: sim.x, y: sim.y, moved });
      return moved;
    });

    pyodide.globals.set("can_move", (direction: string) => {
      const delta = deltas[direction];
      if (!delta) return false;
      return isOpen(sim.x + delta[0], sim.y + delta[1]);
    });

    pyodide.globals.set("at_exit", () => MAZE[sim.y][sim.x] === 2);

    try {
      await pyodide.runPythonAsync(code);
      playSteps(steps);
    } catch (err) {
      playSteps(steps);
      setError(err instanceof Error ? err.message : String(err));
      setRunning(false);
    }
  }, [code, playSteps, running, stopAnimation]);

  const reset = useCallback(() => {
    stopAnimation();
    setPlayer(START);
    setMoves(0);
    setWon(false);
    setError(null);
    setLog([]);
    logRef.current = [];
    setRunning(false);
  }, [stopAnimation]);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
      <div className="flex flex-col gap-3 lg:w-[480px]">
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {loadState === "loading" && "Loading Python runtime…"}
            {loadState === "ready" && "Python ready"}
            {loadState === "error" && "Failed to load Python runtime"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={runCode}
              disabled={loadState !== "ready" || running}
              className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-40 dark:hover:bg-[#ccc]"
            >
              {running ? "Running…" : "Run code"}
            </button>
            <button
              onClick={reset}
              disabled={running}
              className="rounded-full border border-black/[.08] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-40 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Reset
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const target = e.currentTarget;
              const { selectionStart, selectionEnd } = target;
              const next =
                code.slice(0, selectionStart) + "    " + code.slice(selectionEnd);
              setCode(next);
              requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = selectionStart + 4;
              });
            }
          }}
          spellCheck={false}
          className="h-80 w-full resize-none rounded-lg border border-black/[.08] bg-zinc-900 p-3 font-mono text-sm text-zinc-100 outline-none dark:border-white/[.145]"
        />

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {log.length > 0 && (
          <pre className="max-h-32 overflow-auto rounded-md bg-zinc-100 p-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {log.join("\n")}
          </pre>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Moves: {moves}</span>
        </div>

        <div
          className="relative border border-black/[.08] bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-900"
          style={{
            width: MAZE[0].length * CELL_SIZE,
            height: MAZE.length * CELL_SIZE,
          }}
        >
          {MAZE.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={
                  cell === 0
                    ? "bg-zinc-800 dark:bg-black"
                    : cell === 2
                      ? "bg-emerald-400 dark:bg-emerald-500"
                      : "bg-zinc-100 dark:bg-zinc-900"
                }
                style={{
                  position: "absolute",
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  boxSizing: "border-box",
                  borderRight: "1px solid rgba(0,0,0,0.05)",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              />
            )),
          )}

          <div
            className="rounded-full bg-sky-500 shadow-md transition-[left,top] duration-100 ease-linear dark:bg-sky-400"
            style={{
              position: "absolute",
              left: player.x * CELL_SIZE + CELL_SIZE * 0.15,
              top: player.y * CELL_SIZE + CELL_SIZE * 0.15,
              width: CELL_SIZE * 0.7,
              height: CELL_SIZE * 0.7,
            }}
          />
        </div>

        {won && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              Your code solved the maze in {moves} moves!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

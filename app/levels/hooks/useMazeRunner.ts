"use client";

import { useCallback, useRef, useState } from "react";
import { isExit, isOpen, START, type Pos } from "../lib/security";
import { DIRECTION_DELTAS, isDirection } from "../lib/directions";
import { MAX_STEPS, STEP_DELAY_MS } from "../lib/constants";
import type { PyodideInterface } from "./usePyodideRuntime";

type Step = Pos & { moved: boolean };

/**
 * Owns the maze playthrough state (player position, moves, win/error) and
 * exposes the move/can_move/at_exit functions the player's Python code calls.
 */
export function useMazeRunner() {
  const [player, setPlayer] = useState<Pos>(START);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<string[]>([]);

  const appendLog = useCallback((msg: string) => {
    logRef.current = [...logRef.current, msg];
    setLog(logRef.current);
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const playSteps = useCallback(
    (steps: Step[]) => {
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

        if (isExit(step.x, step.y)) {
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
    },
    [stopAnimation],
  );

  const run = useCallback(
    async (pyodide: PyodideInterface, code: string) => {
      if (running) return;

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

      pyodide.globals.set("move", (direction: string) => {
        if (steps.length >= MAX_STEPS) {
          throw new Error(
            `Move limit of ${MAX_STEPS} exceeded — check your code for an infinite loop.`,
          );
        }
        if (!isDirection(direction)) {
          throw new Error(
            `Unknown direction "${direction}". Use "up", "down", "left", or "right".`,
          );
        }
        const [dx, dy] = DIRECTION_DELTAS[direction];
        const nx = sim.x + dx;
        const ny = sim.y + dy;
        const moved = isOpen(nx, ny);
        if (moved) {
          sim.x = nx;
          sim.y = ny;
        }
        steps.push({ x: sim.x, y: sim.y, moved });
        return moved;
      });

      pyodide.globals.set("can_move", (direction: string) => {
        if (!isDirection(direction)) return false;
        const [dx, dy] = DIRECTION_DELTAS[direction];
        return isOpen(sim.x + dx, sim.y + dy);
      });

      pyodide.globals.set("at_exit", () => isExit(sim.x, sim.y));

      try {
        await pyodide.runPythonAsync(code);
        playSteps(steps);
      } catch (err) {
        playSteps(steps);
        setError(err instanceof Error ? err.message : String(err));
        setRunning(false);
      }
    },
    [playSteps, running, stopAnimation],
  );

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

  return { player, moves, won, running, error, log, appendLog, run, reset };
}

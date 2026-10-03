"use client";

import { useEffect, useState } from "react";
import { CodeEditor } from "./components/CodeEditor";
import { ConsolePanel } from "./components/ConsolePanel";
import { MazeBoard } from "./components/MazeBoard";
import { usePyodideRuntime } from "./hooks/usePyodideRuntime";
import { useMazeRunner } from "./hooks/useMazeRunner";
import { STARTER_CODE_URL } from "./lib/constants";

export default function MazeGame() {
  const [code, setCode] = useState("");

  const { player, moves, won, running, error, log, appendLog, run, reset } = useMazeRunner();
  const { pyodide, status } = usePyodideRuntime(appendLog);

  useEffect(() => {
    fetch(STARTER_CODE_URL)
      .then((res) => res.text())
      .then(setCode)
      .catch(() => {});
  }, []);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
      <div className="flex flex-col gap-3 lg:w-[480px]">
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {status === "loading" && "Loading Python runtime…"}
            {status === "ready" && "Python ready"}
            {status === "error" && "Failed to load Python runtime"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => pyodide.current && run(pyodide.current, code)}
              disabled={status !== "ready" || running}
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

        <CodeEditor value={code} onChange={setCode} />
        <ConsolePanel error={error} log={log} />
      </div>

      <div className="flex flex-1 flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Moves: {moves}</span>
        </div>

        <MazeBoard player={player} />

        {won && (
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            Your code solved the maze in {moves} moves!
          </p>
        )}
      </div>
    </div>
  );
}

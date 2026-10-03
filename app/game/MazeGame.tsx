"user client";

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
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {status === "loading" && "Loading Python runtime…"}
            {status === "ready" && "Python ready"}
            {status === "error" && "Failed to load Python runtime"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => pyodide.current && run(pyodide.current, code)}
              disabled={status !== "ready" || running}
              className="rounded-xl bg-accent-primary px-4 py-1.5 text-sm font-semibold text-accent-primary-foreground shadow-md shadow-accent-primary/20 transition-all hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              {running ? "Running…" : "Run code"}
            </button>
            <button
              onClick={reset}
              disabled={running}
              className="rounded-xl border border-panel-border bg-panel-elevated px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent-primary/40 disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        </div>

        <CodeEditor value={code} onChange={setCode} />
        <ConsolePanel error={error} log={log} />
      </div>

      <div className="flex flex-1 flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono">
          <span>Moves: <span className="text-accent-primary font-bold">{moves}</span></span>
        </div>

        <MazeBoard player={player} />

        {won && (
          <p className="text-lg font-semibold text-accent-primary">
            🎉 Infiltration successful! Solved the maze in {moves} moves!
          </p>
        )}
      </div>
    </div>
  );
}

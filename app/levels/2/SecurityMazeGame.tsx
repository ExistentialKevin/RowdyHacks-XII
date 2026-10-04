"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import TutorialOverlay, { TutorialStep } from "../components/TutorialOverlay";
// Board theme + player character live in ./boards — see boards/index.ts (theme switch)
// and boards/PlayerAvatar.tsx (character model).
import {
  BOARD_THEME,
  BOARD_THEMES,
  SHOW_THEME_PICKER,
  type BoardTheme,
} from "./boards";
import HintMascot from "../components/HintMascot";

const TUTORIAL_STORAGE_KEY = "tutorial-level2-seen";

// ==========================================
// TYPES & INTERFACES
// ==========================================
export type Cell = 0 | 1 | 2;
export type Pos = { x: number; y: number };
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface Camera {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  range: number;
  sprite: string;
}

export interface Item {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  sprite: string;
}

// ==========================================
// MAZE CONFIGURATION & CONSTANTS
// ==========================================
export const grid: Cell[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
];

export const START: Pos = { x: 1, y: 1 };

export const INITIAL_ITEMS: Item[] = [
  {
    id: 1,
    x: 5,
    y: 1,
    collected: false,
    sprite: "https://placehold.co/32x32/f59e0b/ffffff?text=💎",
  },
  {
    id: 2,
    x: 7,
    y: 7,
    collected: false,
    sprite: "https://placehold.co/32x32/f59e0b/ffffff?text=💎",
  },
  {
    id: 3,
    x: 1,
    y: 9,
    collected: false,
    sprite: "https://placehold.co/32x32/f59e0b/ffffff?text=💎",
  },
];

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: "cam1",
    x: 3,
    y: 1,
    direction: "DOWN",
    range: 3,
    sprite: "https://placehold.co/32x32/ef4444/ffffff?text=📷",
  },
  {
    id: "cam2",
    x: 9,
    y: 5,
    direction: "LEFT",
    range: 3,
    sprite: "https://placehold.co/32x32/ef4444/ffffff?text=📷",
  },
  {
    id: "cam3",
    x: 7,
    y: 3,
    direction: "RIGHT",
    range: 3,
    sprite: "https://placehold.co/32x32/ef4444/ffffff?text=📷",
  },
];

// Lil's hints, in order. He says "psst** try <hint>" and gives up after these.
const LEVEL_HINTS = [
  "tracing a route on the board before you code. Find a path from P to each yellow ? tile, then to EXIT, and write it down as moves.",
  "treating red tiles like lava. Cameras only see in a straight line, and walls block their view, so look for a way around their sightline.",
  'a loop instead of copy-pasting moves: for _ in range(4): move("DOWN") walks four tiles in one line.',
];

const STARTER_PYTHON_CODE = `# Navigate the grid. Avoid camera sightlines.
# Available: move("UP"), move("DOWN"),
# move("LEFT"), move("RIGHT")

print("initiating route...")
move("RIGHT")
move("RIGHT")
move("DOWN")
`;

// ==========================================
// MAIN SECURITY MAZE GAME COMPONENT
// ==========================================
export default function SecurityMazeGame() {
  const [code, setCode] = useState(STARTER_PYTHON_CODE);
  const [player, setPlayer] = useState<Pos>(START);
  const [items, setItems] = useState<Item[]>(
    JSON.parse(JSON.stringify(INITIAL_ITEMS)),
  );
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [caught, setCaught] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [pyodideStatus, setPyodideStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const [boardTheme, setBoardTheme] = useState<BoardTheme>(BOARD_THEME);

  const pyodideRef = useRef<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Tutorial spotlight targets
  const [tutorialActive, setTutorialActive] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const mazeRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
      setTutorialActive(true);
    }
  }, []);

  const finishTutorial = useCallback(() => {
    setTutorialActive(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
  }, []);

  const tutorialSteps: TutorialStep[] = [
    {
      target: editorRef,
      title: "Write your navigation code",
      body: 'This is your Python editor. Call move("UP"/"DOWN"/"LEFT"/"RIGHT") to plan a path through the maze before running it.',
      placement: "right",
    },
    {
      target: runButtonRef,
      title: "Run your code",
      body: "Once the Python runtime shows ready, click here to execute your script and watch the player move step by step.",
      placement: "bottom",
    },
    {
      target: consoleRef,
      title: "Watch the console",
      body: "Collisions, diamond pickups, and alarms are all logged here, along with anything your script prints.",
      placement: "right",
    },
    {
      target: mazeRef,
      title: "The maze board",
      body: "Red areas are where security is looking — step into one and you're caught. Grab all 3 items, then reach the EXIT.",
      placement: "left",
    },
    {
      target: apiRef,
      title: "Available APIs",
      body: "This reference lists every function your Python code can call in this level, plus what it does.",
      placement: "top",
    },
  ];

  // Append log helper
  const appendLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, []);

  // Initialize Pyodide runtime on mount
  useEffect(() => {
    let isMounted = true;
    let injectedScript: HTMLScriptElement | null = null;
    async function loadPyodideRuntime() {
      try {
        appendLog("loading python wasm runtime...");
        appendLog("mounting maze environment [sector_02]");
        // Load pyodide script dynamically if not present
        if (!(window as any).loadPyodide) {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
          script.async = true;
          injectedScript = script;
          document.body.appendChild(script);
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }

        const pyodideInstance = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });

        if (isMounted) {
          pyodideRef.current = pyodideInstance;
          setPyodideStatus("ready");
          appendLog("runtime ready. awaiting input");
        }
      } catch (err) {
        if (isMounted) {
          setPyodideStatus("error");
          appendLog("Failed to load Python runtime.");
        }
      }
    }
    loadPyodideRuntime();
    return () => {
      isMounted = false;
      if (injectedScript && injectedScript.parentNode) {
        injectedScript.parentNode.removeChild(injectedScript);
      }
    };
  }, [appendLog]);

  // Check if position is open
  const isOpen = (x: number, y: number): boolean => {
    const cell = grid[y]?.[x];
    return cell === 1 || cell === 2;
  };

  // Calculate all cells illuminated by camera vision cones
  const getCameraVisionCells = useCallback(() => {
    const visionSet = new Set<string>();
    cameras.forEach((cam) => {
      const dx =
        cam.direction === "RIGHT" ? 1 : cam.direction === "LEFT" ? -1 : 0;
      const dy = cam.direction === "DOWN" ? 1 : cam.direction === "UP" ? -1 : 0;

      for (let i = 1; i <= cam.range; i++) {
        const cx = cam.x + dx * i;
        const cy = cam.y + dy * i;
        // Vision blocked by walls
        if (grid[cy]?.[cx] === 0) break;
        visionSet.add(`${cx},${cy}`);
      }
    });
    return visionSet;
  }, [cameras]);

  // Check if player is caught in camera sight
  const checkCameraDetection = useCallback(
    (currPlayer: Pos, currentCameras: Camera[]) => {
      for (const cam of currentCameras) {
        const dx =
          cam.direction === "RIGHT" ? 1 : cam.direction === "LEFT" ? -1 : 0;
        const dy =
          cam.direction === "DOWN" ? 1 : cam.direction === "UP" ? -1 : 0;

        for (let i = 1; i <= cam.range; i++) {
          const cx = cam.x + dx * i;
          const cy = cam.y + dy * i;
          if (grid[cy]?.[cx] === 0) break;
          if (cx === currPlayer.x && cy === currPlayer.y) {
            return true;
          }
        }
      }
      return false;
    },
    [],
  );

  // Reset game state
  const resetGame = useCallback(() => {
    setPlayer(START);
    setItems(JSON.parse(JSON.stringify(INITIAL_ITEMS)));
    setCameras(INITIAL_CAMERAS);
    setMoves(0);
    setWon(false);
    setCaught(false);
    setRunning(false);
    appendLog("Back in the van. Nobody saw that.");
  }, [appendLog]);

  // Move player with collision, item collection, and security checks
  const movePlayer = useCallback(
    (directionStr: string) => {
      setPlayer((prev) => {
        if (won || caught) return prev;

        let dx = 0;
        let dy = 0;
        const dir = directionStr.toUpperCase();
        if (dir === "UP") dy = -1;
        else if (dir === "DOWN") dy = 1;
        else if (dir === "LEFT") dx = -1;
        else if (dir === "RIGHT") dx = 1;

        const nextX = prev.x + dx;
        const nextY = prev.y + dy;

        if (!isOpen(nextX, nextY)) {
          appendLog(`Bonk. That's a wall, genius. (${nextX}, ${nextY})`);
          return prev;
        }

        const nextPos = { x: nextX, y: nextY };
        setM((m) => m + 1);

        // Check item collection
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (!item.collected && item.x === nextX && item.y === nextY) {
              appendLog(`◆ Diamond #${item.id} bagged. Lil guy is screaming.`);
              return { ...item, collected: true };
            }
            return item;
          }),
        );

        // Check camera spot
        if (checkCameraDetection(nextPos, cameras)) {
          setCaught(true);
          appendLog("ALARM! You were spotted by a security camera!");
        }

        // Check win condition (All items collected and on exit cell 2)
        const updatedItems = items.map((item) =>
          item.x === nextX && item.y === nextY
            ? { ...item, collected: true }
            : item,
        );
        const allCollected = updatedItems.every((i) => i.collected);
        if (grid[nextY]?.[nextX] === 2) {
          if (allCollected) {
            setWon(true);
            appendLog("Success! All diamonds collected and reached the exit!");
          } else {
            appendLog("The van's here but your pockets are light.");
          }
        }

        return nextPos;
      });
    },
    [won, caught, cameras, items, appendLog],
  );

  // Helper setter for move count inside callback
  const setM = setMoves;

  // Run Python Code
  const runPythonCode = async () => {
    if (!pyodideRef.current || running) return;
    setRunning(true);
    appendLog("--- Executing Python Code ---");

    try {
      // Expose python move helper function
      pyodideRef.current.globals.set("move", (direction: string) => {
        movePlayer(direction);
      });
      pyodideRef.current.globals.set("print_log", (msg: string) => {
        appendLog(`[Python] ${msg}`);
      });

      // Redirect python stdout
      await pyodideRef.current.runPythonAsync(`
                import sys
                import io
                sys.stdout = io.StringIO()
            `);

      await pyodideRef.current.runPythonAsync(code);

      const stdout = await pyodideRef.current.runPythonAsync(
        "sys.stdout.getvalue()",
      );
      if (stdout) {
        appendLog(stdout.trim());
      }
      appendLog("--- Execution Completed ---");
    } catch (err: any) {
      appendLog(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // Keyboard manual controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        movePlayer("UP");
      }
      if (["ArrowDown", "KeyS"].includes(e.code)) {
        e.preventDefault();
        movePlayer("DOWN");
      }
      if (["ArrowLeft", "KeyA"].includes(e.code)) {
        e.preventDefault();
        movePlayer("LEFT");
      }
      if (["ArrowRight", "KeyD"].includes(e.code)) {
        e.preventDefault();
        movePlayer("RIGHT");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  const visionCells = getCameraVisionCells();
  const collectedCount = items.filter((i) => i.collected).length;
  const ActiveBoard = BOARD_THEMES[boardTheme].Board;

  // ==========================================
  // RENDER COMPONENT UI
  // ==========================================
  const codeLines = code.split("\n").length;
  const statusLabel =
    pyodideStatus === "loading"
      ? "py.runtime loading"
      : pyodideStatus === "ready"
        ? "py.runtime ready"
        : "py.runtime error";
  const statusColor =
    pyodideStatus === "loading"
      ? "text-slate-yellow"
      : pyodideStatus === "ready"
        ? "text-accent-primary"
        : "text-slate-red";
  const statusDot =
    pyodideStatus === "loading"
      ? "bg-slate-yellow"
      : pyodideStatus === "ready"
        ? "bg-accent-primary"
        : "bg-slate-red";

  return (
    <>
      <div className="w-full">
        <Link
          href="/"
          className="text-xs text-dim transition hover:text-accent-primary"
        >
          &lt; ../missions
        </Link>

        <header className="mt-5 flex flex-col justify-between gap-5 border-b border-line pb-6 md:flex-row md:items-start">
          <div>
            <div className="text-[13px] text-dim">
              root@heistschool:~${" "}
              <span className="text-foreground">
                ./run laser_grid_maze --level=02
              </span>
            </div>
            <h1 className="mb-3 mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-[38px]">
              The Camera Gauntlet
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Navigate past surveillance, collect all 3 diamonds, and reach the
              exit.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                ref={runButtonRef}
                onClick={runPythonCode}
                disabled={pyodideStatus !== "ready" || running || won || caught}
                className="border border-accent-primary bg-accent-primary px-3.5 py-2 font-semibold text-accent-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {running ? "[ sneaking... ]" : "[ execute_plan ]"}
              </button>
              <button
                onClick={resetGame}
                className="border border-line bg-panel-muted px-3.5 py-2 text-foreground transition hover:border-accent-primary/50 hover:text-accent-primary"
              >
                [ abort_mission ]
              </button>
              <button
                onClick={() => setTutorialActive(true)}
                title="Replay tutorial"
                className="border border-line bg-panel-muted px-3.5 py-2 text-foreground transition hover:border-accent-primary/50 hover:text-accent-primary"
              >
                [ call_lil_guy ]
              </button>
            </div>
            <span
              className={`flex items-center gap-2 text-[11px] ${statusColor}`}
            >
              <span
                className={`h-[7px] w-[7px] ${statusDot} ${pyodideStatus === "loading" ? "animate-pulse" : ""}`}
              />
              {statusLabel}
            </span>
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          {/* Left Column: Code Editor & Console */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div
              ref={editorRef}
              className="flex flex-col border border-line bg-panel-muted"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[11px] tracking-wide">
                <span className="text-foreground">THE_PLAN</span>
                <span className="text-dim">heist.py</span>
              </div>
              <div className="flex max-h-[340px] min-h-[240px] overflow-auto bg-background">
                <div
                  aria-hidden
                  className="select-none py-4 pl-4 pr-3 text-right text-xs leading-6 text-faint"
                >
                  {Array.from({ length: Math.max(codeLines, 10) }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  rows={Math.max(codeLines, 10)}
                  aria-label="Python navigation code"
                  className="flex-1 resize-none overflow-hidden whitespace-pre bg-transparent py-4 pr-4 text-xs leading-6 text-foreground caret-accent-primary outline-none"
                  placeholder="# type your python script here..."
                />
              </div>
              <div className="border-t border-line px-4 py-2.5 text-[10px] text-dim">
                apis:{" "}
                <span className="text-accent-primary">move(direction)</span> ·{" "}
                <span className="text-accent-primary">print(value)</span>
              </div>
            </div>

            <div
              ref={consoleRef}
              className="flex flex-1 flex-col border border-line bg-panel-muted"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[11px] tracking-wide">
                <span className="text-foreground">SYSTEM_CONSOLE</span>
                <span className="text-dim">stdout</span>
              </div>
              <div
                ref={logContainerRef}
                className="max-h-[200px] min-h-[140px] flex-1 space-y-1 overflow-y-auto bg-background p-4 text-[11px] leading-5 text-muted-foreground"
              >
                {logs.length === 0 && (
                  <span className="text-faint">&gt; no output yet</span>
                )}
                {logs.map((log, idx) => (
                  <div key={idx} className={logColor(log)}>
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Maze Board & Status */}
          <div className="flex flex-col gap-3 lg:col-span-7">
            {/* Optional theme picker — toggle SHOW_THEME_PICKER in boards/index.ts */}
            {SHOW_THEME_PICKER && (
              <div className="flex flex-wrap gap-2 text-xs">
                {(Object.keys(BOARD_THEMES) as BoardTheme[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setBoardTheme(id)}
                    className={`border px-3 py-1.5 transition ${
                      boardTheme === id
                        ? "border-accent-primary bg-accent-primary text-accent-primary-foreground"
                        : "border-line bg-panel-muted text-dim hover:text-accent-primary"
                    }`}
                  >
                    [ {BOARD_THEMES[id].label.toLowerCase()} ]
                  </button>
                ))}
              </div>
            )}

            {/* Maze Board — rendered by the theme selected in boards/index.ts */}
            <div ref={mazeRef} className="w-full overflow-x-auto">
              <ActiveBoard
                grid={grid}
                player={player}
                items={items}
                cameras={cameras}
                visionCells={visionCells}
                moves={moves}
                collected={collectedCount}
                total={items.length}
                caught={caught}
                won={won}
              />
            </div>

            {/* Status Banners */}
            {caught && (
              <div className="border border-slate-red/60 bg-slate-red/10 p-4 text-center">
                <h3 className="text-sm font-bold tracking-wider text-slate-red">
                  !! BUSTED
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Smile, you're on camera.
                </p>
                <button
                  onClick={resetGame}
                  className="mt-3 bg-slate-red px-4 py-1.5 text-xs font-semibold text-accent-primary-foreground hover:brightness-110"
                >
                  [ post_bail ]
                </button>
              </div>
            )}

            {won && (
              <div className="border border-accent-primary/60 bg-accent-secondary/40 p-4 text-center">
                <h3 className="text-sm font-bold tracking-wider text-accent-primary">
                  CLEAN_GETAWAY
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All diamonds bagged in {moves} footsteps.
                </p>
                <button
                  onClick={resetGame}
                  className="mt-3 bg-accent-primary px-4 py-1.5 text-xs font-semibold text-accent-primary-foreground hover:brightness-110"
                >
                  [ do_it_again ]
                </button>
              </div>
            )}

            <div className="text-center text-[10px] text-faint">
              pro tip: standing in front of the camera is bad, actually
            </div>
          </div>
        </div>

        {/* Available APIs Reference */}
        <div ref={apiRef} className="mt-6 border border-line bg-panel-muted">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[11px] tracking-wide">
            <span className="text-foreground">AVAILABLE_APIS</span>
            <span className="text-dim">2 functions</span>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            <div className="border border-line bg-background p-3.5">
              <code className="text-xs font-semibold text-accent-primary">
                move(direction: str)
              </code>
              <p className="mt-1.5 text-[11px] leading-5 text-dim">
                Moves one tile. Valid:{" "}
                <span className="text-slate-yellow">&quot;UP&quot;</span>,{" "}
                <span className="text-slate-yellow">&quot;DOWN&quot;</span>,{" "}
                <span className="text-slate-yellow">&quot;LEFT&quot;</span>,{" "}
                <span className="text-slate-yellow">&quot;RIGHT&quot;</span>.
                Blocked by walls; collects diamonds automatically; triggers the
                alarm if a camera sees the tile.
              </p>
            </div>
            <div className="border border-line bg-background p-3.5">
              <code className="text-xs font-semibold text-accent-primary">
                print(value)
              </code>
              <p className="mt-1.5 text-[11px] leading-5 text-dim">
                Outputs any value to SYSTEM_CONSOLE after your script finishes
                running.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TutorialOverlay
        steps={tutorialSteps}
        active={tutorialActive}
        onFinish={finishTutorial}
        mascot
      />
      <HintMascot hints={LEVEL_HINTS} hidden={tutorialActive} />
    </>
  );
}

function logColor(log: string) {
  if (/alarm|error|failed/i.test(log)) return "text-slate-red";
  if (/collision/i.test(log)) return "text-slate-orange";
  if (/success|ready|collected/i.test(log)) return "text-accent-primary";
  if (/^---/.test(log)) return "text-dim";
  return "";
}

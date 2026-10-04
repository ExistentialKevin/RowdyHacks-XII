"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

// ==========================================
// TYPES & INTERFACES
// ==========================================
export type Cell = 0 | 1 | 2;
export type Pos = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

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
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
  [0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const START: Pos = { x: 1, y: 1 };

export const INITIAL_ITEMS: Item[] = [
  { id: 1, x: 5, y: 1, collected: false, sprite: 'https://placehold.co/32x32/f59e0b/ffffff?text=💎' },
  { id: 2, x: 7, y: 7, collected: false, sprite: 'https://placehold.co/32x32/f59e0b/ffffff?text=💎' },
  { id: 3, x: 1, y: 9, collected: false, sprite: 'https://placehold.co/32x32/f59e0b/ffffff?text=💎' },
];

export const INITIAL_CAMERAS: Camera[] = [
  { id: 'cam1', x: 3, y: 1, direction: 'DOWN', range: 3, sprite: 'https://placehold.co/32x32/ef4444/ffffff?text=📷' },
  { id: 'cam2', x: 9, y: 5, direction: 'DOWN', range: 3, sprite: 'https://placehold.co/32x32/ef4444/ffffff?text=📷' },
  { id: 'cam3', x: 7, y: 3, direction: 'RIGHT', range: 3, sprite: 'https://placehold.co/32x32/ef4444/ffffff?text=📷' },
];

const STARTER_PYTHON_CODE = `# Write your maze navigation code here!
# Available helper functions: move("UP"), move("DOWN"), move("LEFT"), move("RIGHT")
# Collect all 3 items and reach the exit tile (2) without being spotted by cameras!

print("Starting security maze navigation...")
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
  const [items, setItems] = useState<Item[]>(JSON.parse(JSON.stringify(INITIAL_ITEMS)));
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [caught, setCaught] = useState(false);
  const [failedIncomplete, setFailedIncomplete] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [pyodideStatus, setPyodideStatus] = useState<"loading" | "ready" | "error">("loading");

  const pyodideRef = useRef<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const moveQueueRef = useRef<string[]>([]);

  // Refs to prevent stale closure issues during asynchronous movement loops
  const playerRef = useRef<Pos>(START);
  const itemsRef = useRef<Item[]>(INITIAL_ITEMS);

  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // Append log helper
  const appendLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg]);
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, []);

  // Initialize Pyodide runtime on mount
  useEffect(() => {
    let isMounted = true;
    async function loadPyodideRuntime() {
      try {
        appendLog("Loading Python WebAssembly runtime...");
        if (!(window as any).loadPyodide) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }

        const pyodideInstance = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
        });

        if (isMounted) {
          pyodideRef.current = pyodideInstance;
          setPyodideStatus("ready");
          appendLog("Python runtime ready successfully!");
        }
      } catch (err) {
        if (isMounted) {
          setPyodideStatus("error");
          appendLog("Failed to load Python runtime.");
        }
      }
    }
    loadPyodideRuntime();
    return () => { isMounted = false; };
  }, [appendLog]);

  // Check if position is open
  const isOpen = (x: number, y: number): boolean => {
    const cell = grid[y]?.[x];
    return cell === 1 || cell === 2;
  };

  // Calculate all cells illuminated by camera vision cones
  const getCameraVisionCells = useCallback(() => {
    const visionSet = new Set<string>();
    cameras.forEach(cam => {
      const dx = cam.direction === 'RIGHT' ? 1 : cam.direction === 'LEFT' ? -1 : 0;
      const dy = cam.direction === 'DOWN' ? 1 : cam.direction === 'UP' ? -1 : 0;

      for (let i = 1; i <= cam.range; i++) {
        const cx = cam.x + dx * i;
        const cy = cam.y + dy * i;
        if (grid[cy]?.[cx] === 0) break;
        visionSet.add(`${cx},${cy}`);
      }
    });
    return visionSet;
  }, [cameras]);

  // Check if player is caught in camera sight
  const checkCameraDetection = useCallback((currPlayer: Pos, currentCameras: Camera[]) => {
    for (const cam of currentCameras) {
      const dx = cam.direction === 'RIGHT' ? 1 : cam.direction === 'LEFT' ? -1 : 0;
      const dy = cam.direction === 'DOWN' ? 1 : cam.direction === 'UP' ? -1 : 0;

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
  }, []);

  // Helper reset function
  const resetMazeState = useCallback(() => {
    const initialPos = START;
    const initialItemsCopy = JSON.parse(JSON.stringify(INITIAL_ITEMS));
    setPlayer(initialPos);
    playerRef.current = initialPos;
    setItems(initialItemsCopy);
    itemsRef.current = initialItemsCopy;
    setCameras(INITIAL_CAMERAS);
    setMoves(0);
    setWon(false);
    setCaught(false);
    setFailedIncomplete(false);
    moveQueueRef.current = [];
  }, []);

  // Execute a single step movement using current refs to guarantee absolute positioning accuracy
  const processNextMove = useCallback(() => {
    if (moveQueueRef.current.length === 0) {
      setRunning(false);
      appendLog("--- Execution Completed ---");

      const allCollected = itemsRef.current.every(i => i.collected);
      const atExit = grid[playerRef.current.y]?.[playerRef.current.x] === 2;
      if (!atExit || !allCollected) {
        setFailedIncomplete(true);
        appendLog("Finished code execution, but you did not reach the exit with all items!");
      }
      return;
    }

    const directionStr = moveQueueRef.current.shift()!;

    let dx = 0;
    let dy = 0;
    const dir = directionStr.toUpperCase();
    if (dir === 'UP') dy = -1;
    else if (dir === 'DOWN') dy = 1;
    else if (dir === 'LEFT') dx = -1;
    else if (dir === 'RIGHT') dx = 1;

    const currentPos = playerRef.current;
    const nextX = currentPos.x + dx;
    const nextY = currentPos.y + dy;

    // 1. Wall Collision Check
    if (!isOpen(nextX, nextY)) {
      appendLog(`Collision! Cannot move into wall at (${nextX}, ${nextY})`);
      setRunning(false);
      moveQueueRef.current = [];
      return;
    }

    const nextPos = { x: nextX, y: nextY };
    playerRef.current = nextPos;
    setPlayer(nextPos);
    setMoves(m => m + 1);

    // 2. Camera Detection Check
    if (checkCameraDetection(nextPos, cameras)) {
      setCaught(true);
      appendLog("ALARM! You were spotted by a security camera!");
      moveQueueRef.current = [];
      setRunning(false);
      return;
    }

    // 3. Item Collection Check
    let itemCollectedThisStep = false;
    const updatedItems = itemsRef.current.map(item => {
      if (!item.collected && item.x === nextX && item.y === nextY) {
        itemCollectedThisStep = true;
        return { ...item, collected: true };
      }
      return item;
    });

    if (itemCollectedThisStep) {
      itemsRef.current = updatedItems;
      setItems(updatedItems);
      appendLog(`Collected Item!`);
    }

    // 4. Win Condition Check
    const allItemsCollected = updatedItems.every(i => i.collected);
    if (grid[nextY]?.[nextX] === 2) {
      if (allItemsCollected) {
        setWon(true);
        appendLog("Success! All items collected and reached the exit!");
        moveQueueRef.current = [];
        setRunning(false);
        return;
      } else {
        appendLog("Reached exit, but you still need to collect all 3 items!");
      }
    }

    // Schedule next step smoothly
    setTimeout(() => {
      processNextMove();
    }, 300);
  }, [cameras, appendLog, checkCameraDetection]);

  // Run Python Code
  const runPythonCode = async () => {
    if (!pyodideRef.current || running) return;

    const currentCell = grid[playerRef.current.y]?.[playerRef.current.x];
    if (currentCell !== 2 || !won) {
      resetMazeState();
      appendLog("Maze automatically reset for new run.");
    }

    setRunning(true);
    moveQueueRef.current = [];
    setFailedIncomplete(false);
    appendLog("--- Executing Python Code ---");

    try {
      pyodideRef.current.globals.set("move", (direction: string) => {
        moveQueueRef.current.push(direction);
      });
      pyodideRef.current.globals.set("print_log", (msg: string) => {
        appendLog(`[Python] ${msg}`);
      });

      await pyodideRef.current.runPythonAsync(`
        import sys
        import io
        sys.stdout = io.StringIO()
      `);

      await pyodideRef.current.runPythonAsync(code);

      const stdout = await pyodideRef.current.runPythonAsync("sys.stdout.getvalue()");
      if (stdout) {
        appendLog(stdout.trim());
      }

      processNextMove();
    } catch (err: any) {
      appendLog(`Error: ${err.message}`);
      setRunning(false);
    }
  };

  const visionCells = getCameraVisionCells();
  const collectedCount = items.filter(i => i.collected).length;

  // ==========================================
  // RENDER COMPONENT UI
  // ==========================================
  return (
      <div className="flex min-h-screen w-full flex-col bg-zinc-950 p-4 text-zinc-100 md:p-8">
        <header className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800 pb-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Security Maze Infiltration</h1>
            <p className="text-sm text-zinc-400">Navigate past camera vision cones, collect all 3 items, and reach the exit!</p>
          </div>
          <div className="flex items-center gap-3">
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300 border border-zinc-800">
            {pyodideStatus === "loading" && "Loading Python runtime..."}
            {pyodideStatus === "ready" && "🟢 Python Runtime Ready"}
            {pyodideStatus === "error" && "🔴 Python Runtime Error"}
          </span>
            <button
                onClick={runPythonCode}
                disabled={pyodideStatus !== "ready" || running || won}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-50"
            >
              {running ? "Running..." : "Run Code"}
            </button>
          </div>
        </header>

        <div className="grid flex-1 grid-gap-6 lg:grid-cols-12 gap-6">
          {/* Left Column: Code Editor & Console */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl">
              <label className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Python Navigation Code</label>
              <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={12}
                  className="font-mono w-full rounded-lg bg-zinc-950 p-3 text-sm text-zinc-200 border border-zinc-800 focus:border-emerald-500 focus:outline-none resize-none"
                  placeholder="Type your python script here..."
              />
              <div className="mt-2 text-xs text-zinc-500">
                Commands: <code className="text-emerald-400">move("UP")</code>, <code className="text-emerald-400">move("DOWN")</code>, <code className="text-emerald-400">move("LEFT")</code>, <code className="text-emerald-400">move("RIGHT")</code>
              </div>
            </div>

            <div className="flex flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl min-h-[160px]">
              <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">System Console / Logs</span>
              <div ref={logContainerRef} className="flex-1 overflow-y-auto font-mono text-xs text-zinc-300 space-y-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800 max-h-[180px]">
                {logs.length === 0 && <span className="text-zinc-600">No logs yet...</span>}
                {logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Maze Board & Status */}
          <div className="flex flex-col items-center justify-start lg:col-span-7 gap-4">
            <div className="flex w-full max-w-lg items-center justify-between rounded-xl bg-zinc-900/50 border border-zinc-800 px-6 py-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-zinc-400 font-bold">Moves:</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{moves}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-zinc-400 font-bold">Items:</span>
                <span className="text-lg font-mono font-bold text-amber-400">{collectedCount} / 3</span>
              </div>
            </div>

            {/* Maze Grid Display */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl overflow-x-auto">
              <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
              >
                {grid.map((row, y) =>
                    row.map((cellType, x) => {
                      const isPlayerHere = player.x === x && player.y === y;
                      const cameraHere = cameras.find(c => c.x === x && c.y === y);
                      const itemHere = items.find(i => !i.collected && i.x === x && i.y === y);
                      const isVision = visionCells.has(`${x},${y}`);

                      let bgClass = "bg-zinc-800/80"; // Wall
                      if (cellType === 1) bgClass = "bg-zinc-900/90"; // Open path
                      if (cellType === 2) bgClass = "bg-emerald-950/60 border border-emerald-500/40"; // Exit

                      if (isVision && cellType !== 0) {
                        bgClass = "bg-red-950/40 border border-red-500/30"; // Camera vision cone
                      }

                      return (
                          <div
                              key={`${x}-${y}`}
                              className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg transition-all ${bgClass}`}
                          >
                            {/* Cell Type Marker */}
                            {cellType === 2 && !isPlayerHere && (
                                <span className="text-xs font-bold text-emerald-400">EXIT</span>
                            )}

                            {/* Item Sprite */}
                            {itemHere && (
                                <img
                                    src={itemHere.sprite}
                                    alt="Item"
                                    className="h-6 w-6 object-contain animate-bounce"
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                            )}

                            {/* Camera Sprite */}
                            {cameraHere && (
                                <div className="relative flex items-center justify-center">
                                  <img
                                      src={cameraHere.sprite}
                                      alt="Camera"
                                      className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                  <span className="absolute -bottom-2 text-[9px] font-mono font-bold text-red-400 uppercase">
                            {cameraHere.direction[0]}
                          </span>
                                </div>
                            )}

                            {/* Player Character (.jpg image) */}
                            {isPlayerHere && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] z-10 animate-pulse overflow-hidden">
                                  <img
                                      src="/my-character.jpg"
                                      alt="Player"
                                      className="h-full w-full object-cover"
                                  />
                                </div>
                            )}
                          </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Status Banners */}
            {caught && (
                <div className="w-full max-w-lg rounded-xl bg-red-950/80 border border-red-600 p-4 text-center text-red-200 shadow-xl">
                  <h3 className="text-lg font-bold">🚨 CAUGHT BY SECURITY CAMERA! 🚨</h3>
                  <p className="text-sm mt-1">Avoid camera vision cones or time your movements carefully. Modify your code and click Run Code to try again!</p>
                </div>
            )}

            {failedIncomplete && !won && !caught && (
                <div className="w-full max-w-lg rounded-xl bg-amber-950/80 border border-amber-600 p-4 text-center text-amber-200 shadow-xl">
                  <h3 className="text-lg font-bold">⚠ MAZE INCOMPLETE ⚠️</h3>
                  <p className="text-sm mt-1">You ran out of movements before reaching the exit tile with all 3 items! Modify your code and try again.</p>
                </div>
            )}

            {won && (
                <div className="w-full max-w-lg rounded-xl bg-emerald-950/80 border border-emerald-500 p-4 text-center text-emerald-200 shadow-xl">
                  <h3 className="text-lg font-bold">🎉 MISSION ACCOMPLISHED! 🎉</h3>
                  <p className="text-sm mt-1">Successfully collected all items and escaped in {moves} moves!</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
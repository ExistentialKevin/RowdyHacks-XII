"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import TutorialOverlay, { TutorialStep } from "../components/TutorialOverlay";

const STEP_DELAY_MS = 300; // time between each visible move
const AUTO_RESET_DELAY_MS = 2000; // how long the failure message stays before auto reset

export type Cell = 0 | 1 | 2;
export type Pos = { x: number; y: number };
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface Item {
    id: number;
    x: number;
    y: number;
    collected: boolean;
}

type Outcome =
    | { type: "won" }
    | { type: "incomplete"; reason: string }
    | null;

export const grid: Cell[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const START: Pos = { x: 1, y: 1 };

export const INITIAL_ITEMS: Item[] = [
    { id: 1, x: 4, y: 1, collected: false },
    { id: 2, x: 5, y: 1, collected: false },
    { id: 3, x: 6, y: 1, collected: false },
];

const STARTER_PYTHON_CODE = `# Write your navigation code here!
# Available helper functions: move("LEFT"), move("RIGHT")
# Collect all 3 items and reach the exit tile (2) to complete the tutorial!

print("Starting security maze navigation...")
move("RIGHT")
`;

const isOpen = (x: number, y: number): boolean => {
    const cell = grid[y]?.[x];
    return cell === 1 || cell === 2;
};

const freshItems = (): Item[] => INITIAL_ITEMS.map(i => ({ ...i }));

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function ChickThiefSprite() {
    return (
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-label="Baby chick wearing a black thief mask">
            {/* Feet */}
            <path d="M14 34 L13 38 M14 34 L16 38 M26 34 L24 38 M26 34 L27 38" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" />
            {/* Fluffy round body */}
            <ellipse cx="20" cy="25" rx="13" ry="11" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            {/* Little wings */}
            <ellipse cx="8.5" cy="26" rx="3.2" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" transform="rotate(12 8.5 26)" />
            <ellipse cx="31.5" cy="26" rx="3.2" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" transform="rotate(-12 31.5 26)" />
            {/* Black balaclava over the head */}
            <path d="M9.5 17 C9.5 7 14 3.5 20 3.5 C26 3.5 30.5 7 30.5 17 L30.5 22 L9.5 22 Z" fill="#18181b" />
            <path d="M14 6 L14.5 12 M20 4.5 L20 11 M26 6 L25.5 12" stroke="#3f3f46" strokeWidth="0.8" strokeLinecap="round" />
            {/* Rolled brim */}
            <rect x="8.5" y="20.5" width="23" height="4.5" rx="2.2" fill="#27272a" stroke="#52525b" strokeWidth="0.6" />
            {/* Eye opening */}
            <rect x="11.5" y="11" width="17" height="6.5" rx="3.2" fill="#fde047" />
            {/* Sneaky eyes */}
            <circle cx="16" cy="14.2" r="2.1" fill="#fff" />
            <circle cx="24" cy="14.2" r="2.1" fill="#fff" />
            <circle cx="16.6" cy="14.4" r="1.2" fill="#18181b" />
            <circle cx="24.6" cy="14.4" r="1.2" fill="#18181b" />
            {/* Beak pokes out of the mask */}
            <path d="M17.6 18.2 L22.4 18.2 L20 21.4 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="0.6" strokeLinejoin="round" />
        </svg>
    );
}

function MoneyBagSprite({ delay = 0 }: { delay?: number }) {
    return (
        <svg
            viewBox="0 0 32 32"
            className="bag-shake h-8 w-8 overflow-visible drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
            style={{ animationDelay: `${delay}s` }}
            aria-label="Money bag"
        >
            {/* Gathered top */}
            <path d="M10 8 L8.5 3.5 L13.5 6 L16 2.5 L18.5 6 L23.5 3.5 L22 8 Z" fill="#d97706" stroke="#78350f" strokeWidth="1" strokeLinejoin="round" />
            {/* Bag body */}
            <path d="M11 8.5 Q16 11.5 21 8.5 L24.5 14 Q30 20.5 26.5 26 Q24 30 16 30 Q8 30 5.5 26 Q2 20.5 7.5 14 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1.2" strokeLinejoin="round" />
            {/* Tie */}
            <path d="M10.5 9.5 Q16 12.5 21.5 9.5" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            {/* Highlight */}
            <path d="M9 17 Q8 21 10 24" fill="none" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            {/* Dollar sign */}
            <text x="16" y="25" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="#78350f">$</text>
        </svg>
    );
}

export default function SecurityMazeGame() {
    const [code, setCode] = useState(STARTER_PYTHON_CODE);
    const [player, setPlayer] = useState<Pos>(START);
    const [items, setItems] = useState<Item[]>(freshItems());
    const [moves, setMoves] = useState(0);
    const [outcome, setOutcome] = useState<Outcome>(null);
    const [running, setRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [pyodideStatus, setPyodideStatus] = useState<"loading" | "ready" | "error">("loading");

    const pyodideRef = useRef<any>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const mountedRef = useRef(true);
    const runningRef = useRef(false);
    const runIdRef = useRef(0); // lets us cancel an in-flight run
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [tutorialActive, setTutorialActive] = useState(false);
    const [tutorialDone, setTutorialDone] = useState(false); // game stays locked until this is true
    const editorRef = useRef<HTMLDivElement>(null);
    const runButtonRef = useRef<HTMLButtonElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<HTMLDivElement>(null);

    // Start the tutorial as soon as the page mounts (refs are attached by now)
    useEffect(() => {
        setTutorialActive(true);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            runIdRef.current++; // cancel any in-flight run
            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        };
    }, []);

    const finishTutorial = useCallback(() => {
        setTutorialActive(false);
        setTutorialDone(true);
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
            body: "Collisions, item pickups, and alarms are all logged here, along with anything your script prints.",
            placement: "right",
        },
        {
            target: pathRef,
            title: "The path",
            body: "Grab all 3 items, then reach the green EXIT tile.",
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
        if (!mountedRef.current) return;
        setLogs(prev => [...prev, msg]);
    }, []);

    // Keep the console scrolled to the newest line (runs after the DOM updates)
    useEffect(() => {
        const el = logContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [logs]);

    // Initialize Pyodide runtime on mount
    useEffect(() => {
        let cancelled = false;

        async function loadPyodideRuntime() {
            try {
                appendLog("Loading Python WebAssembly runtime...");

                if (!(window as any).loadPyodide) {
                    const SCRIPT_ID = "pyodide-script";
                    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
                    if (!script) {
                        script = document.createElement("script");
                        script.id = SCRIPT_ID;
                        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
                        script.async = true;
                        document.body.appendChild(script);
                    }
                    const s = script;
                    await new Promise<void>((resolve, reject) => {
                        if ((window as any).loadPyodide) return resolve();
                        s.addEventListener("load", () => resolve());
                        s.addEventListener("error", () => reject(new Error("script failed")));
                    });
                }

                const pyodideInstance = await (window as any).loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
                });

                if (!cancelled) {
                    pyodideRef.current = pyodideInstance;
                    setPyodideStatus("ready");
                    appendLog("Python runtime ready successfully!");
                }
            } catch (err) {
                if (!cancelled) {
                    setPyodideStatus("error");
                    appendLog("Failed to load Python runtime.");
                }
            }
        }

        loadPyodideRuntime();
        return () => {
            cancelled = true;
        };
    }, [appendLog]);

    // Put the board back to its starting state (logs are kept so the player can review them)
    const resetBoard = useCallback(() => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
        runIdRef.current++; // cancel any in-flight run
        runningRef.current = false;
        setPlayer(START);
        setItems(freshItems());
        setMoves(0);
        setOutcome(null);
        setRunning(false);
    }, []);

    const resetGame = useCallback(() => {
        resetBoard();
        appendLog("Game reset to starting position.");
    }, [resetBoard, appendLog]);

    // Show a failure message, then automatically send the player back to the start
    const scheduleAutoReset = useCallback(
        (result: Outcome) => {
            setOutcome(result);
            resetTimerRef.current = setTimeout(() => {
                if (!mountedRef.current) return;
                resetBoard();
                appendLog("Player returned to the starting position. Try again!");
            }, AUTO_RESET_DELAY_MS);
        },
        [resetBoard, appendLog]
    );

    // Run Python Code
    const runPythonCode = async () => {
        if (!tutorialDone || !pyodideRef.current || runningRef.current) return;

        // Always start a run from a clean board
        resetBoard();
        runningRef.current = true;
        setRunning(true);
        const runId = ++runIdRef.current;
        const cancelled = () => runIdRef.current !== runId || !mountedRef.current;

        appendLog("--- Executing Python Code ---");

        // 1) Run the Python script and collect the requested moves
        const queue: string[] = [];
        try {
            pyodideRef.current.globals.set("move", (direction: string) => {
                queue.push(String(direction));
            });

            await pyodideRef.current.runPythonAsync(`
            import sys, io
            sys.stdout = io.StringIO()
            `);

            try {
                await pyodideRef.current.runPythonAsync(code);
            } finally {
                const stdout = await pyodideRef.current.runPythonAsync("sys.stdout.getvalue()");
                if (stdout && String(stdout).trim()) appendLog(String(stdout).trim());
            }
        } catch (err: any) {
            appendLog(`Error: ${err?.message ?? err}`);
            runningRef.current = false;
            setRunning(false);
            return;
        }

        if (queue.length === 0) {
            appendLog("Your code didn't call move(). Nothing to do!");
            scheduleAutoReset({ type: "incomplete", reason: "Your code never moved the player." });
            runningRef.current = false;
            setRunning(false);
            return;
        }

        // 2) Play the moves back one at a time. All game state lives in local variables
        //    here (the single source of truth), then gets pushed to React state.
        let pos: Pos = { ...START };
        let localItems = freshItems();
        let moveCount = 0;
        let finished: "won" | "caught" | null = null;

        for (const raw of queue) {
            await sleep(STEP_DELAY_MS);
            if (cancelled()) return;

            const dir = raw.toUpperCase();
            let dx = 0;
            let dy = 0;
            if (dir === "UP") dy = -1;
            else if (dir === "DOWN") dy = 1;
            else if (dir === "LEFT") dx = -1;
            else if (dir === "RIGHT") dx = 1;
            else {
                appendLog(`Unknown direction "${raw}" - use "UP", "DOWN", "LEFT" or "RIGHT".`);
                continue;
            }

            const nextX = pos.x + dx;
            const nextY = pos.y + dy;

            if (!isOpen(nextX, nextY)) {
                appendLog(`Collision! Cannot move into wall at (${nextX}, ${nextY})`);
                continue; // blocked moves don't count
            }

            // A successful tile move counts as exactly one move
            pos = { x: nextX, y: nextY };
            moveCount += 1;
            setPlayer(pos);
            setMoves(moveCount);

            // Item pickup
            const hit = localItems.find(i => !i.collected && i.x === nextX && i.y === nextY);
            if (hit) {
                localItems = localItems.map(i => (i.id === hit.id ? { ...i, collected: true } : i));
                setItems(localItems);
                appendLog(`Collected Item #${hit.id}!`);
            }

            // Exit check
            if (grid[nextY]?.[nextX] === 2) {
                if (localItems.every(i => i.collected)) {
                    appendLog("Success! All items collected and reached the exit!");
                    finished = "won";
                    break;
                } else {
                    appendLog("Reached exit, but you still need to collect all 3 items!");
                }
            }
        }

        if (cancelled()) return;

        runningRef.current = false;
        setRunning(false);

        if (finished === "won") {
            setOutcome({ type: "won" });
        } else {
            const atExit = grid[pos.y]?.[pos.x] === 2;
            const collected = localItems.filter(i => i.collected).length;
            const reason = atExit
                ? `You reached the exit with only ${collected} of 3 items.`
                : "Your code finished before the player reached the exit.";
            appendLog(`--- Execution Completed: ${reason} ---`);
            scheduleAutoReset({ type: "incomplete", reason });
        }
    };

    const collectedCount = items.filter(i => i.collected).length;
    const locked = !tutorialDone || running || !outcome == null;

    // ==========================================
    // RENDER COMPONENT UI
    // ==========================================
    return (
        <>
            <style>{`
        @keyframes cam-sweep { 0%, 100% { transform: rotate(-16deg); } 50% { transform: rotate(16deg); } }
        @keyframes cam-lens { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes cam-led { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0.1; } 100% { opacity: 1; } }
        @keyframes laser-pulse { 0%, 100% { box-shadow: inset 0 0 6px rgba(239,68,68,0.25); } 50% { box-shadow: inset 0 0 16px rgba(239,68,68,0.7), 0 0 8px rgba(239,68,68,0.35); } }
        @keyframes laser-scan { 0% { top: 6%; opacity: 0; } 15%, 85% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
        @keyframes player-hop { 0% { transform: translateY(-6px) scale(0.85); } 60% { transform: translateY(1px) scale(1.05); } 100% { transform: translateY(0) scale(1); } }
        .cam-sweep { transform-box: fill-box; transform-origin: 50% 0%; animation: cam-sweep 2.4s ease-in-out infinite; }
        .cam-lens { animation: cam-lens 1.2s ease-in-out infinite; }
        .cam-led { animation: cam-led 1s steps(1) infinite; }
        .laser-cell { animation: laser-pulse 1.4s ease-in-out infinite; overflow: hidden; }
        .laser-cell::after { content: ""; position: absolute; left: 8%; right: 8%; height: 2px; border-radius: 2px; background: #f87171; box-shadow: 0 0 6px 1px rgba(248,113,113,0.9); animation: laser-scan 1.4s linear infinite; }
        @keyframes bag-shake { 0%, 55%, 100% { transform: rotate(0deg) translateX(0); } 6% { transform: rotate(-14deg) translateX(-1px); } 14% { transform: rotate(14deg) translateX(1px); } 22% { transform: rotate(-11deg) translateX(-1px); } 30% { transform: rotate(11deg) translateX(1px); } 38% { transform: rotate(-6deg); } 46% { transform: rotate(5deg); } }
        .bag-shake { transform-box: fill-box; transform-origin: 50% 90%; animation: bag-shake 1.4s ease-in-out infinite; }
        .player-hop { animation: player-hop ${STEP_DELAY_MS}ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .cam-sweep, .cam-lens, .cam-led, .bag-shake, .laser-cell, .laser-cell::after, .player-hop { animation: none; }
        }
      `}</style>
            <div className="flex min-h-screen w-full flex-col bg-zinc-950 p-4 text-zinc-100 md:p-8">
                <header className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800 pb-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Security Maze Infiltration</h1>
                        <p className="text-sm text-zinc-400">Navigate past camera vision cones, collect all 3 items, and reach the exit!</p>
                    </div>
                    <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
              {pyodideStatus === "loading" && "Loading Python runtime..."}
                {pyodideStatus === "ready" && "🟢 Python Runtime Ready"}
                {pyodideStatus === "error" && "🔴 Python Runtime Error"}
            </span>
                        <button
                            ref={runButtonRef}
                            onClick={runPythonCode}
                            disabled={pyodideStatus !== "ready" || locked}
                            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-50"
                        >
                            {running ? "Running..." : "Run Code"}
                        </button>
                        <button
                            onClick={resetGame}
                            disabled={running || !tutorialDone}
                            className="rounded-full border border-zinc-700 bg-zinc-800 px-5 py-2 text-sm font-semibold text-zinc-200 transition-all hover:bg-zinc-700 disabled:opacity-50"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setTutorialActive(true)}
                            className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 transition-all hover:bg-zinc-700"
                            title="Replay tutorial"
                        >
                            ? Help
                        </button>
                    </div>
                </header>

                <div className="grid flex-1 gap-6 lg:grid-cols-12">
                    {/* Left Column: Code Editor & Console */}
                    <div className="flex flex-col gap-4 lg:col-span-5">
                        <div ref={editorRef} className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl">
                            <label className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Python Navigation Code</label>
                            <textarea
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                rows={12}
                                spellCheck={false}
                                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                                placeholder="Type your python script here..."
                            />
                            <div className="mt-2 text-xs text-zinc-500">
                                Commands: <code className="text-emerald-400">move("UP")</code>, <code className="text-emerald-400">move("DOWN")</code>, <code className="text-emerald-400">move("LEFT")</code>, <code className="text-emerald-400">move("RIGHT")</code>
                            </div>
                        </div>

                        <div ref={consoleRef} className="flex min-h-[160px] flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl">
                            <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">System Console / Logs</span>
                            <div ref={logContainerRef} className="max-h-[180px] flex-1 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
                                {logs.length === 0 && <span className="text-zinc-600">No logs yet...</span>}
                                {logs.map((log, idx) => (
                                    <div key={idx}>{log}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Maze Board & Status */}
                    <div className="flex flex-col items-center justify-start gap-4 lg:col-span-7">
                        <div className="flex w-full max-w-lg items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-3 shadow-md">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-zinc-400">Moves:</span>
                                <span className="font-mono text-lg font-bold text-emerald-400">{moves}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-zinc-400">Items:</span>
                                <span className="font-mono text-lg font-bold text-amber-400">{collectedCount} / 3</span>
                            </div>
                        </div>

                        {/* Maze Grid Display */}
                        <div ref={pathRef} className="relative overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}>
                                {grid.map((row, y) =>
                                    row.map((cellType, x) => {
                                        const isPlayerHere = player.x === x && player.y === y;
                                        const itemHere = items.find(i => !i.collected && i.x === x && i.y === y);


                                        let bgClass = "bg-zinc-800/80"; // Wall
                                        if (cellType === 1) bgClass = "bg-zinc-900/90"; // Open path
                                        if (cellType === 2) bgClass = "bg-emerald-950/60 border border-emerald-500/40"; // Exit


                                        return (
                                            <div
                                                key={`${x}-${y}`}
                                                className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all sm:h-12 sm:w-12 ${bgClass}`}
                                            >
                                                {/* Exit marker */}
                                                {cellType === 2 && !isPlayerHere && (
                                                    <span className="text-xs font-bold text-emerald-400">EXIT</span>
                                                )}

                                                {/* Item Sprite */}
                                                {itemHere && (
                                                    <div className="z-10 flex items-center justify-center">
                                                        <MoneyBagSprite delay={(itemHere.id - 1) * 0.25} />
                                                    </div>
                                                )}

                                                {/* Player: baby chick thief (hops into each new tile) */}
                                                {isPlayerHere && (
                                                    <div className="player-hop z-10 flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]">
                                                        <ChickThiefSprite />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Status Banners */}

                        {outcome?.type === "incomplete" && (
                            <div className="w-full max-w-lg rounded-xl border border-amber-600 bg-amber-950/80 p-4 text-center text-amber-200 shadow-xl">
                                <h3 className="text-lg font-bold">⚠️ Exit not reached</h3>
                                <p className="mt-1 text-sm">{outcome.reason} Resetting to the start...</p>
                            </div>
                        )}

                        {outcome?.type === "won" && (
                            <div className="w-full max-w-lg rounded-xl border border-emerald-500 bg-emerald-950/80 p-4 text-center text-emerald-200 shadow-xl">
                                <h3 className="text-lg font-bold">🎉 MISSION ACCOMPLISHED! 🎉</h3>
                                <p className="mt-1 text-sm">Successfully collected all items and escaped in {moves} moves!</p>
                                <button
                                    onClick={resetGame}
                                    className="mt-3 rounded-full bg-emerald-600 px-6 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500"
                                >
                                    Play Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available APIs Reference */}
                <div ref={apiRef} className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl">
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-400">Available APIs</h2>
                    <p className="mb-4 text-xs text-zinc-500">Functions your Python code can call in this level.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                            <code className="font-mono text-sm font-semibold text-emerald-400">move(direction: str)</code>
                            <p className="mt-1 text-xs text-zinc-400">
                                Moves the player one tile. <code className="text-zinc-300">direction</code> is one of{" "}
                                <code className="text-zinc-300">"UP"</code>, <code className="text-zinc-300">"DOWN"</code>,{" "}
                                <code className="text-zinc-300">"LEFT"</code>, <code className="text-zinc-300">"RIGHT"</code>.
                                Blocked by walls, collects items automatically, and triggers the alarm if a camera sees the tile.
                            </p>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                            <code className="font-mono text-sm font-semibold text-emerald-400">print(value)</code>
                            <p className="mt-1 text-xs text-zinc-400">
                                Standard Python <code className="text-zinc-300">print()</code>. Output is captured and shown in the
                                System Console after your script finishes running.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <TutorialOverlay steps={tutorialSteps} active={tutorialActive} onFinish={finishTutorial} />
        </>
    );
}

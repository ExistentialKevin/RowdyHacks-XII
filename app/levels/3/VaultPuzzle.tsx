"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import TutorialOverlay, { TutorialStep } from "../components/TutorialOverlay";

// ==========================================
// CONSTANTS
// ==========================================
const DIALS = 4; // number of digits in the code
const TICK_MS = 1000; // keypad scrambles once per second
const MAX_TICKS = 20; // seconds you get to crack the vault
const MAX_STRIKES = 3; // wrong lock() calls before the alarm trips
const AUTO_RESET_DELAY_MS = 2500; // how long a failure message stays before auto reset
const DIAL_STEPS = [1, 3, 7, 9]; // step sizes that are coprime with 10 so every digit shows up within 10 seconds

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface Round {
  code: number[]; // the code you are given (and must match)
  offsets: number[]; // where each dial starts
  steps: number[]; // how far each dial jumps every second
}

type Outcome =
    | { type: "won" }
    | { type: "alarm" }
    | { type: "timeout"; lockedCount: number }
    | null;

// ==========================================
// ROUND GENERATION
// ==========================================
const DEFAULT_ROUND: Round = {
  code: [4, 7, 2, 9],
  offsets: [0, 3, 5, 8],
  steps: [1, 3, 7, 9],
};

const rand = (n: number) => Math.floor(Math.random() * n);

function makeRound(): Round {
  return {
    code: Array.from({ length: DIALS }, () => rand(10)),
    offsets: Array.from({ length: DIALS }, () => rand(10)),
    steps: Array.from({ length: DIALS }, () => DIAL_STEPS[rand(DIAL_STEPS.length)]),
  };
}

/** The digits showing on the keypad at a given second. Locked dials freeze on the code digit. */
function keysAt(round: Round, tick: number, locked: boolean[]): number[] {
  return round.code.map((c, i) => (locked[i] ? c : (round.offsets[i] + round.steps[i] * tick) % 10));
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const STARTER_PYTHON_CODE = `# keys   -> the 4 digits on the keypad RIGHT NOW (they change every second)
# code   -> the 4 digits you must match
# locked -> which dials are already locked (True / False)
# lock(i) -> locks dial i (0 to 3). Only call it when keys[i] matches code[i]!
#
# Your script runs again every second with a fresh keypad.

if keys[0] == code[0]:
    lock(0)

# TODO: add a check for dial 1
# TODO: add a check for dial 2
# TODO: add a check for dial 3
`;

// ==========================================
// PLAYER: BABY CHICK THIEF (inline SVG)
// ==========================================
function ChickThiefSprite() {
  return (
      <svg viewBox="0 0 40 40" className="h-full w-full" aria-label="Baby chick wearing a black thief mask">
        <path d="M14 34 L13 38 M14 34 L16 38 M26 34 L24 38 M26 34 L27 38" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="20" cy="25" rx="13" ry="11" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
        <ellipse cx="8.5" cy="26" rx="3.2" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" transform="rotate(12 8.5 26)" />
        <ellipse cx="31.5" cy="26" rx="3.2" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" transform="rotate(-12 31.5 26)" />
        <path d="M9.5 17 C9.5 7 14 3.5 20 3.5 C26 3.5 30.5 7 30.5 17 L30.5 22 L9.5 22 Z" fill="#18181b" />
        <path d="M14 6 L14.5 12 M20 4.5 L20 11 M26 6 L25.5 12" stroke="#3f3f46" strokeWidth="0.8" strokeLinecap="round" />
        <rect x="8.5" y="20.5" width="23" height="4.5" rx="2.2" fill="#27272a" stroke="#52525b" strokeWidth="0.6" />
        <rect x="11.5" y="11" width="17" height="6.5" rx="3.2" fill="#fde047" />
        <circle cx="16" cy="14.2" r="2.1" fill="#fff" />
        <circle cx="24" cy="14.2" r="2.1" fill="#fff" />
        <circle cx="16.6" cy="14.4" r="1.2" fill="#18181b" />
        <circle cx="24.6" cy="14.4" r="1.2" fill="#18181b" />
        <path d="M17.6 18.2 L22.4 18.2 L20 21.4 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="0.6" strokeLinejoin="round" />
      </svg>
  );
}

// ==========================================
// VAULT DOOR WITH LIVE KEYPAD (inline SVG)
// ==========================================
const RIVETS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  return { x: (160 + 111 * Math.cos(a)).toFixed(1), y: (170 + 111 * Math.sin(a)).toFixed(1) };
});

const SPOKES = Array.from({ length: 6 }, (_, i) => i * 60);

interface VaultDoorProps {
  keys: number[];
  code: number[];
  locked: boolean[];
  open: boolean;
  alarm: boolean;
  running: boolean;
}

function VaultDoor({ keys, code, locked, open, alarm, running }: VaultDoorProps) {
  const lightFill = open ? "#4ade80" : alarm ? "#ef4444" : running ? "#fbbf24" : "#78716c";

  return (
      <svg
          viewBox="0 0 320 320"
          className={`w-full max-w-sm ${alarm ? "vault-shake" : ""}`}
          aria-label="Bank vault door with a four digit keypad"
      >
        {/* Steel frame */}
        <rect x="10" y="10" width="300" height="300" rx="24" fill="#27272a" stroke="#52525b" strokeWidth="4" />

        {/* Alarm lights */}
        <circle cx="34" cy="34" r="9" fill={lightFill} className={alarm ? "light-flash" : ""} />
        <circle cx="286" cy="34" r="9" fill={lightFill} className={alarm ? "light-flash" : ""} />

        {/* Interior, revealed when the door swings open */}
        <circle cx="160" cy="170" r="118" fill="#0c0a09" />
        {[
          [95, 214],
          [150, 214],
          [205, 214],
          [122, 188],
          [178, 188],
        ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width="50" height="24" rx="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
              <rect x={x + 5} y={y + 4} width="22" height="5" rx="2" fill="#fde68a" />
            </g>
        ))}
        {[
          [140, 170],
          [160, 166],
          [180, 170],
          [150, 160],
          [170, 158],
        ].map(([x, y]) => (
            <circle key={`c-${x}-${y}`} cx={x} cy={y} r="7" fill="#fcd34d" stroke="#b45309" strokeWidth="1.2" />
        ))}

        {/* Locking bolts retract when open */}
        <g className={`bolts ${open ? "bolts-open" : ""}`}>
          {[110, 150, 190, 230].map(y => (
              <rect key={y} x="268" y={y} width="34" height="12" rx="3" fill="#a1a1aa" stroke="#52525b" strokeWidth="1.5" />
          ))}
        </g>

        {/* Door (hinged on the left) */}
        <g className={`vault-door ${open ? "vault-door-open" : ""}`}>
          <circle cx="160" cy="170" r="118" fill="#52525b" stroke="#a1a1aa" strokeWidth="6" />
          <circle cx="160" cy="170" r="104" fill="none" stroke="#3f3f46" strokeWidth="3" />
          {RIVETS.map((r, i) => (
              <circle key={i} cx={r.x} cy={r.y} r="3.5" fill="#a1a1aa" stroke="#3f3f46" strokeWidth="1" />
          ))}

          {/* Spin wheel */}
          <g className={`wheel ${open ? "wheel-spin" : ""}`}>
            <circle cx="160" cy="122" r="30" fill="#3f3f46" stroke="#d4d4d8" strokeWidth="3" />
            {SPOKES.map(deg => (
                <g key={deg} transform={`rotate(${deg} 160 122)`}>
                  <line x1="160" y1="122" x2="160" y2="96" stroke="#d4d4d8" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="160" cy="94" r="4" fill="#e4e4e7" />
                </g>
            ))}
            <circle cx="160" cy="122" r="9" fill="#71717a" stroke="#e4e4e7" strokeWidth="2" />
          </g>

          {/* Keypad display */}
          <rect x="92" y="190" width="136" height="60" rx="8" fill="#09090b" stroke="#71717a" strokeWidth="2" />
          {keys.map((k, i) => {
            const x = 96 + i * 34;
            const isLocked = locked[i];
            const isMatch = !isLocked && k === code[i];
            const stroke = isLocked ? "#4ade80" : isMatch ? "#fbbf24" : "#52525b";
            return (
                <g key={i}>
                  <rect x={x} y="196" width="30" height="38" rx="5" fill={isLocked ? "#052e16" : "#1c1917"} stroke={stroke} strokeWidth={isLocked || isMatch ? 2.5 : 1.5} />
                  <text
                      key={`${i}-${k}-${isLocked}`}
                      x={x + 15}
                      y="223"
                      textAnchor="middle"
                      fontSize="26"
                      fontWeight="700"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fill={isLocked ? "#4ade80" : "#fbbf24"}
                      className="digit-flip"
                  >
                    {k}
                  </text>
                  <text x={x + 15} y="245" textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="#a1a1aa">
                    {i}
                  </text>
                </g>
            );
          })}
        </g>
      </svg>
  );
}

// ==========================================
// MAIN VAULT CODE GAME COMPONENT
// ==========================================
export default function VaultCodeGame() {
  const [script, setScript] = useState(STARTER_PYTHON_CODE);
  const [round, setRound] = useState<Round>(DEFAULT_ROUND);
  const [locked, setLocked] = useState<boolean[]>(Array(DIALS).fill(false));
  const [tick, setTick] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [pyodideStatus, setPyodideStatus] = useState<"loading" | "ready" | "error">("loading");

  const pyodideRef = useRef<any>(null);
  const roundRef = useRef<Round>(DEFAULT_ROUND);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const runningRef = useRef(false);
  const runIdRef = useRef(0); // lets us cancel an in-flight run
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tutorial spotlight targets
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false); // game stays locked until this is true
  const editorRef = useRef<HTMLDivElement>(null);
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const codePanelRef = useRef<HTMLDivElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
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
      target: codePanelRef,
      title: "Your target code",
      body: "These are the four digits you have to match. In your script this is the list code, so code[0] is the first digit.",
      placement: "left",
    },
    {
      target: vaultRef,
      title: "The scrambling keypad",
      body: "Every dial on the vault changes every second. A dial glows amber when its key matches the code, and turns green once it is locked.",
      placement: "left",
    },
    {
      target: editorRef,
      title: "Write your if-statements",
      body: "For each dial, check if keys[i] == code[i] and call lock(i) when they match. Four dials means four checks.",
      placement: "right",
    },
    {
      target: runButtonRef,
      title: "Crack the safe",
      body: "Run your script once the Python runtime is ready. It re-runs every second against the new keypad for 20 seconds.",
      placement: "bottom",
    },
    {
      target: consoleRef,
      title: "Watch the console",
      body: "Locks, misfires, and anything your script prints show up here. Three misfires trips the alarm!",
      placement: "right",
    },
    {
      target: apiRef,
      title: "Available APIs",
      body: "This reference lists every variable and function your Python code can use in this level.",
      placement: "top",
    },
  ];

  // Append log helper
  const appendLog = useCallback((msg: string) => {
    if (!mountedRef.current) return;
    setLogs(prev => [...prev, msg]);
  }, []);

  // Keep the console scrolled to the newest line
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
          let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
          if (!scriptEl) {
            scriptEl = document.createElement("script");
            scriptEl.id = SCRIPT_ID;
            scriptEl.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
            scriptEl.async = true;
            document.body.appendChild(scriptEl);
          }
          const s = scriptEl;
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

  // When idle, the keypad still scrambles every second so the vault feels alive.
  // While a run is in progress the run loop drives the clock instead.
  useEffect(() => {
    if (running) return;
    const id = setInterval(() => setTick(t => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  // Put the vault back to its starting state (logs are kept so the player can review them)
  const resetBoard = useCallback((newRound: boolean) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    runIdRef.current++; // cancel any in-flight run
    runningRef.current = false;
    if (newRound) {
      const r = makeRound();
      roundRef.current = r;
      setRound(r);
    }
    setLocked(Array(DIALS).fill(false));
    setStrikes(0);
    setOutcome(null);
    setRunning(false);
    setElapsed(0);
    setTick(0);
  }, []);

  const resetGame = useCallback(() => {
    resetBoard(true);
    appendLog("New vault, new code. Good luck!");
  }, [resetBoard, appendLog]);

  // Show a failure message, then automatically reset with a fresh vault
  const scheduleAutoReset = useCallback(
      (result: Outcome) => {
        setOutcome(result);
        resetTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          resetBoard(true);
          appendLog("Vault reset with a new code. Try again!");
        }, AUTO_RESET_DELAY_MS);
      },
      [resetBoard, appendLog]
  );

  // Run the user's script once against the current keypad; returns the dials it asked to lock
  const runScriptTick = async (keys: number[], r: Round, lockedNow: boolean[], t: number): Promise<number[]> => {
    const py = pyodideRef.current;
    const requests: number[] = [];
    py.globals.set("lock", (i: any) => {
      requests.push(Number(i));
    });

    await py.runPythonAsync(`
import sys, io
sys.stdout = io.StringIO()
keys = ${JSON.stringify(keys)}
code = ${JSON.stringify(r.code)}
locked = [${lockedNow.map(b => (b ? "True" : "False")).join(", ")}]
tick = ${t}
`);

    try {
      await py.runPythonAsync(script);
    } finally {
      const stdout = await py.runPythonAsync("sys.stdout.getvalue()");
      if (stdout && String(stdout).trim()) appendLog(`[t=${t}] ${String(stdout).trim()}`);
    }
    return requests;
  };

  // Run Python Code
  const runPythonCode = async () => {
    if (!tutorialDone || !pyodideRef.current || runningRef.current) return;

    // Always start a run from a clean vault (same code, so you can retry what you just read)
    resetBoard(false);
    runningRef.current = true;
    setRunning(true);
    const runId = ++runIdRef.current;
    const cancelled = () => runIdRef.current !== runId || !mountedRef.current;
    const endRun = () => {
      runningRef.current = false;
      setRunning(false);
    };

    const r = roundRef.current;
    let lockedNow: boolean[] = Array(DIALS).fill(false);
    let strikesNow = 0;

    appendLog("--- Cracking the vault ---");

    for (let t = 0; t < MAX_TICKS; t++) {
      if (cancelled()) return;
      setTick(t);
      setElapsed(t);

      const keys = keysAt(r, t, lockedNow);

      let requests: number[];
      try {
        requests = await runScriptTick(keys, r, lockedNow, t);
      } catch (err: any) {
        if (cancelled()) return;
        const lastLine = String(err?.message ?? err).split("\n").filter(Boolean).slice(-1)[0];
        appendLog(`Error: ${lastLine}`);
        resetBoard(false);
        return;
      }
      if (cancelled()) return;

      let alarm = false;
      for (const i of requests) {
        if (!Number.isInteger(i) || i < 0 || i >= DIALS) {
          appendLog(`lock(${i}) ignored - dial must be 0 to ${DIALS - 1}.`);
          continue;
        }
        if (lockedNow[i]) continue; // already locked, nothing to do

        if (keys[i] === r.code[i]) {
          lockedNow = lockedNow.map((v, j) => (j === i ? true : v));
          appendLog(`Dial ${i} locked on ${keys[i]}.`);
        } else {
          strikesNow += 1;
          appendLog(`Misfire! Dial ${i} shows ${keys[i]} but the code needs ${r.code[i]}. (${strikesNow}/${MAX_STRIKES})`);
          if (strikesNow >= MAX_STRIKES) {
            alarm = true;
            break;
          }
        }
      }

      setLocked(lockedNow);
      setStrikes(strikesNow);

      if (alarm) {
        appendLog("ALARM! Too many misfires - security is on the way!");
        endRun();
        scheduleAutoReset({ type: "alarm" });
        return;
      }

      if (lockedNow.every(Boolean)) {
        appendLog("Click! All dials locked - the vault is open!");
        endRun();
        setOutcome({ type: "won" });
        return;
      }

      await sleep(TICK_MS);
    }

    if (cancelled()) return;

    setElapsed(MAX_TICKS);
    endRun();
    const lockedCount = lockedNow.filter(Boolean).length;
    appendLog(`--- Time's up: ${lockedCount} of ${DIALS} dials locked ---`);
    scheduleAutoReset({ type: "timeout", lockedCount });
  };

  // Derived display values
  const keys = keysAt(round, tick, locked);
  const lockedCount = locked.filter(Boolean).length;
  const timeLeft = running || outcome ? Math.max(0, MAX_TICKS - elapsed) : MAX_TICKS;
  const isWon = outcome?.type === "won";
  const isAlarm = outcome?.type === "alarm";
  const controlsLocked = !tutorialDone || running || outcome !== null;

  // ==========================================
  // RENDER COMPONENT UI
  // ==========================================
  return (
      <>
        <style>{`
        @keyframes digit-flip { 0% { opacity: 0; transform: translateY(-6px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes light-flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
        @keyframes door-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        @keyframes wheel-spin { from { transform: rotate(0deg); } to { transform: rotate(540deg); } }
        @keyframes chick-cheer { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes chick-shiver { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        @keyframes match-pulse { 0%, 100% { box-shadow: 0 0 0 rgba(251,191,36,0); } 50% { box-shadow: 0 0 14px rgba(251,191,36,0.7); } }
        .digit-flip { animation: digit-flip 0.25s ease-out; }
        .light-flash { animation: light-flash 0.4s steps(1) infinite; }
        .vault-shake { animation: door-shake 0.12s linear infinite; }
        .bolts { transition: transform 0.5s ease-out; }
        .bolts-open { transform: translateX(-28px); }
        .vault-door { transform-box: fill-box; transform-origin: 0% 50%; transition: transform 0.9s ease-in-out 0.6s; }
        .vault-door-open { transform: scaleX(0.14); }
        .wheel { transform-box: fill-box; transform-origin: center; }
        .wheel-spin { animation: wheel-spin 0.8s ease-in-out forwards; }
        .chick-cheer { animation: chick-cheer 0.5s ease-in-out infinite; }
        .chick-shiver { animation: chick-shiver 0.1s linear infinite; }
        .match-pulse { animation: match-pulse 0.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .digit-flip, .light-flash, .vault-shake, .wheel-spin, .chick-cheer, .chick-shiver, .match-pulse { animation: none; }
          .bolts, .vault-door { transition: none; }
        }
      `}</style>

        <div className="flex min-h-screen w-full flex-col bg-zinc-950 p-4 text-zinc-100 md:p-8">
          <header className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800 pb-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-amber-400">Vault Code Heist</h1>
              <p className="text-sm text-zinc-400">
                The keypad scrambles every second. Write if-statements that lock each dial only when its key matches the code.
              </p>
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
                  disabled={pyodideStatus !== "ready" || controlsLocked}
                  className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-lg transition-all hover:bg-amber-400 disabled:opacity-50"
              >
                {running ? "Cracking..." : "Run Code"}
              </button>
              <button
                  onClick={resetGame}
                  disabled={running || !tutorialDone}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-5 py-2 text-sm font-semibold text-zinc-200 transition-all hover:bg-zinc-700 disabled:opacity-50"
              >
                New Vault
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
                <label className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Python Safecracking Code</label>
                <textarea
                    value={script}
                    onChange={e => setScript(e.target.value)}
                    rows={14}
                    spellCheck={false}
                    className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-200 focus:border-amber-500 focus:outline-none"
                    placeholder="Type your python script here..."
                />
                <div className="mt-2 text-xs text-zinc-500">
                  Use <code className="text-amber-400">keys[i]</code>, <code className="text-amber-400">code[i]</code> and{" "}
                  <code className="text-amber-400">lock(i)</code> with an <code className="text-amber-400">if</code> statement for each dial.
                </div>
              </div>

              <div ref={consoleRef} className="flex min-h-[160px] flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl">
                <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">System Console / Logs</span>
                <div ref={logContainerRef} className="max-h-[200px] flex-1 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
                  {logs.length === 0 && <span className="text-zinc-600">No logs yet...</span>}
                  {logs.map((log, idx) => (
                      <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Vault & Status */}
            <div className="flex flex-col items-center justify-start gap-4 lg:col-span-7">
              {/* Status bar */}
              <div className="flex w-full max-w-lg items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3 shadow-md">
                <div className={`h-11 w-11 shrink-0 ${isWon ? "chick-cheer" : isAlarm ? "chick-shiver" : ""}`}>
                  <ChickThiefSprite />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-zinc-400">Time:</span>
                  <span className={`font-mono text-lg font-bold ${timeLeft <= 5 && running ? "text-red-400" : "text-amber-400"}`}>{timeLeft}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-zinc-400">Locked:</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">
                  {lockedCount} / {DIALS}
                </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-zinc-400">Strikes:</span>
                  <span className="flex gap-1" aria-label={`${strikes} of ${MAX_STRIKES} strikes`}>
                  {Array.from({ length: MAX_STRIKES }, (_, i) => (
                      <span key={i} className={`h-3 w-3 rounded-full border ${i < strikes ? "border-red-500 bg-red-500" : "border-zinc-600 bg-zinc-900"}`} />
                  ))}
                </span>
                </div>
              </div>

              {/* Given code */}
              <div ref={codePanelRef} className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3 shadow-md">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Target code</span>
                  <span className="text-xs text-zinc-500">
                  <code className="text-amber-400">code</code> in your script
                </span>
                </div>
                <div className="flex justify-center gap-3">
                  {round.code.map((digit, i) => {
                    const isLocked = locked[i];
                    const isMatch = !isLocked && keys[i] === digit;
                    return (
                        <div
                            key={i}
                            className={`flex h-14 w-12 flex-col items-center justify-center rounded-lg border-2 font-mono transition-colors ${
                                isLocked
                                    ? "border-emerald-500 bg-emerald-950/60 text-emerald-300"
                                    : isMatch
                                        ? "match-pulse border-amber-400 bg-amber-950/40 text-amber-300"
                                        : "border-zinc-700 bg-zinc-950 text-zinc-200"
                            }`}
                        >
                          <span className="text-2xl font-bold leading-none">{digit}</span>
                          <span className="mt-1 text-[10px] text-zinc-500">code[{i}]</span>
                        </div>
                    );
                  })}
                </div>
              </div>

              {/* Vault */}
              <div ref={vaultRef} className="flex w-full max-w-lg justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
                <VaultDoor keys={keys} code={round.code} locked={locked} open={isWon} alarm={isAlarm} running={running} />
              </div>

              {/* Status Banners */}
              {outcome?.type === "alarm" && (
                  <div className="w-full max-w-lg rounded-xl border border-red-600 bg-red-950/80 p-4 text-center text-red-200 shadow-xl">
                    <h3 className="text-lg font-bold">🚨 ALARM TRIPPED! 🚨</h3>
                    <p className="mt-1 text-sm">
                      {MAX_STRIKES} misfires. Only call lock(i) when keys[i] equals code[i]. Resetting the vault...
                    </p>
                  </div>
              )}

              {outcome?.type === "timeout" && (
                  <div className="w-full max-w-lg rounded-xl border border-amber-600 bg-amber-950/80 p-4 text-center text-amber-200 shadow-xl">
                    <h3 className="text-lg font-bold">⏱️ Time's up!</h3>
                    <p className="mt-1 text-sm">
                      You locked {outcome.lockedCount} of {DIALS} dials. Make sure every dial has its own check. Resetting the vault...
                    </p>
                  </div>
              )}

              {outcome?.type === "won" && (
                  <div className="w-full max-w-lg rounded-xl border border-emerald-500 bg-emerald-950/80 p-4 text-center text-emerald-200 shadow-xl">
                    <h3 className="text-lg font-bold">💰 VAULT CRACKED! 💰</h3>
                    <p className="mt-1 text-sm">
                      All {DIALS} dials locked with {strikes} misfire{strikes === 1 ? "" : "s"}. The loot is yours!
                    </p>
                    <button
                        onClick={resetGame}
                        className="mt-3 rounded-full bg-emerald-600 px-6 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                      Crack Another Vault
                    </button>
                  </div>
              )}
            </div>
          </div>

          {/* Available APIs Reference */}
          <div ref={apiRef} className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-amber-400">Available APIs</h2>
            <p className="mb-4 text-xs text-zinc-500">Variables and functions your Python code can use in this level.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <code className="font-mono text-sm font-semibold text-amber-400">keys</code>
                <p className="mt-1 text-xs text-zinc-400">
                  List of the 4 digits on the keypad right now. It changes every second, so <code className="text-zinc-300">keys[0]</code> is the first dial.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <code className="font-mono text-sm font-semibold text-amber-400">code</code>
                <p className="mt-1 text-xs text-zinc-400">
                  List of the 4 digits you must match. Compare it to <code className="text-zinc-300">keys</code> with <code className="text-zinc-300">==</code>.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <code className="font-mono text-sm font-semibold text-amber-400">lock(i: int)</code>
                <p className="mt-1 text-xs text-zinc-400">
                  Locks dial <code className="text-zinc-300">i</code> (0 to 3). If the key doesn't match the code, it's a misfire. {MAX_STRIKES} misfires trips the alarm.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <code className="font-mono text-sm font-semibold text-amber-400">locked, tick, print()</code>
                <p className="mt-1 text-xs text-zinc-400">
                  <code className="text-zinc-300">locked[i]</code> is True once a dial is locked. <code className="text-zinc-300">tick</code> is the current second. Printed output appears in the console.
                </p>
              </div>
            </div>
          </div>
        </div>

        <TutorialOverlay steps={tutorialSteps} active={tutorialActive} onFinish={finishTutorial} />
      </>
  );
}
import Link from "next/link";

export default function RightColumn() {
  return (
    <aside className="space-y-6 lg:col-span-3">
      {/* Live Telemetry / Terminal Widget */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Telemetry Feed
          </h3>
          <span className="font-mono text-[10px] text-zinc-500">LIVE</span>
        </div>

        <div className="mt-3 space-y-2 font-mono text-[11px]">
          <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/60 text-zinc-400">
            <div className="text-emerald-400">$ pyodide.ready()</div>
            <div className="text-zinc-400 mt-1">Python 3.11 environment loaded in WebWorker</div>
          </div>
          <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/60 text-zinc-400">
            <div className="text-cyan-400">$ level_check(0x01)</div>
            <div className="text-zinc-400 mt-1">Terminal Breach: 5/5 subroutines verified</div>
          </div>
          <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/60 text-zinc-400">
            <div className="text-amber-400">! sync_warning</div>
            <div className="text-zinc-400 mt-1">Laser Grid Maze awaiting code run</div>
          </div>
        </div>
      </div>

      {/* Level Quick Launch Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/30 to-zinc-900/60 p-5 backdrop-blur-md">
        <h4 className="font-semibold text-sm text-cyan-300">Resume Infiltration</h4>
        <p className="mt-1 text-xs text-zinc-400">
          Continue the Laser Grid challenge right where you left off.
        </p>
        <Link
          href="/game/1"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs py-2.5 px-4 transition active:scale-95 shadow-md shadow-cyan-500/20"
        >
          <span>Enter Game</span>
          <span>→</span>
        </Link>
      </div>
    </aside>
  );
}

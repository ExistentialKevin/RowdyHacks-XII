import Link from "next/link";

export default function RightColumn() {
  return (
    <aside className="space-y-6 lg:col-span-3">
      {/* Live Telemetry / Terminal Widget */}
      <div className="rounded-2xl border border-panel-border bg-panel p-5 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Telemetry Feed
          </h3>
          <span className="font-mono text-[10px] text-accent-primary">LIVE</span>
        </div>

        <div className="mt-3 space-y-2 font-mono text-[11px]">
          <div className="rounded-lg bg-panel-muted p-2.5 border border-panel-border text-muted-foreground">
            <div className="text-accent-primary font-semibold">$ pyodide.ready()</div>
            <div className="text-muted-foreground mt-1">Python 3.11 environment loaded in WebWorker</div>
          </div>
          <div className="rounded-lg bg-panel-muted p-2.5 border border-panel-border text-muted-foreground">
            <div className="text-accent-primary font-semibold">$ level_check(0x01)</div>
            <div className="text-muted-foreground mt-1">Terminal Breach: 5/5 subroutines verified</div>
          </div>
          <div className="rounded-lg bg-panel-muted p-2.5 border border-panel-border text-muted-foreground">
            <div className="text-amber-300 font-semibold">! sync_warning</div>
            <div className="text-muted-foreground mt-1">Laser Grid Maze awaiting code run</div>
          </div>
        </div>
      </div>

      {/* Level Quick Launch Banner */}
      <div className="rounded-2xl border border-panel-border bg-gradient-to-b from-accent-secondary/40 to-panel p-5 backdrop-blur-md shadow-lg shadow-black/20">
        <h4 className="font-semibold text-sm text-accent-primary">Resume Infiltration</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Continue the Laser Grid challenge right where you left off.
        </p>
        <Link
          href="/game/1"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary hover:brightness-105 text-accent-primary-foreground font-bold text-xs py-2.5 px-4 transition active:scale-95 shadow-md shadow-accent-primary/20"
        >
          <span>Enter Game</span>
          <span>→</span>
        </Link>
      </div>
    </aside>
  );
}

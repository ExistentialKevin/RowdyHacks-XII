export default function LeftColumn() {
  return (
    <aside className="space-y-6 lg:col-span-3">
      {/* Operative Profile Widget */}
      <div className="rounded-2xl border border-panel-border bg-panel p-5 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl bg-accent-secondary border border-panel-border p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-panel font-mono text-base font-bold text-accent-primary">
              OP1
            </div>
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-panel bg-accent-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Operative Zero</h4>
            <p className="text-xs font-mono text-accent-primary">Rank: Code Infiltrator</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-panel-border pt-4 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Overall Mastery</span>
            <span className="font-semibold text-foreground">9 / 29 Items</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-accent-secondary/50 overflow-hidden">
            <div className="h-full w-[31%] rounded-full bg-accent-primary" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-center font-mono">
            <div className="rounded-lg bg-panel-muted p-2 border border-panel-border">
              <div className="text-[10px] text-muted-foreground">CLEARED</div>
              <div className="text-base font-bold text-accent-primary">1 / 4</div>
            </div>
            <div className="rounded-lg bg-panel-muted p-2 border border-panel-border">
              <div className="text-[10px] text-muted-foreground">XP EARNED</div>
              <div className="text-base font-bold text-accent-primary">1,240</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Mission Filters */}
      <div className="rounded-2xl border border-panel-border bg-panel p-5 backdrop-blur-md shadow-lg shadow-black/20">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Navigation & Filters
        </h3>
        <ul className="mt-3 space-y-1.5 text-xs font-medium">
          <li>
            <button className="flex w-full items-center justify-between rounded-xl bg-accent-secondary/60 px-3 py-2 text-accent-primary font-semibold border border-panel-border-hover">
              <span>All Missions</span>
              <span className="rounded-full bg-accent-secondary px-2 py-0.5 text-[10px] text-accent-primary">4</span>
            </button>
          </li>
          <li>
            <button className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-muted-foreground hover:bg-panel-elevated hover:text-foreground transition">
              <span>In Progress</span>
              <span className="rounded-full bg-panel-muted border border-panel-border px-2 py-0.5 text-[10px]">2</span>
            </button>
          </li>
          <li>
            <button className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-muted-foreground hover:bg-panel-elevated hover:text-foreground transition">
              <span>Completed</span>
              <span className="rounded-full bg-panel-muted border border-panel-border px-2 py-0.5 text-[10px]">1</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Infiltration Protocol Box */}
      <div className="rounded-2xl border border-dashed border-panel-border bg-accent-secondary/20 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-accent-primary">💡 Tactical Tip:</span>
        <p className="mt-1 leading-relaxed">
          Use Pyodide in-browser runtime to test scripts before triggering physical alarms in the maze sector.
        </p>
      </div>
    </aside>
  );
}

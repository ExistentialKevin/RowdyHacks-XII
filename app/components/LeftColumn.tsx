export default function LeftColumn() {
  return (
    <aside className="space-y-6 lg:col-span-3">
      {/* Operative Profile Widget */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950 font-mono text-base font-bold text-cyan-400">
              OP1
            </div>
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">Operative Zero</h4>
            <p className="text-xs font-mono text-cyan-400">Rank: Code Infiltrator</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-zinc-800/80 pt-4 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Overall Mastery</span>
            <span className="font-semibold text-zinc-200">9 / 29 Items</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full w-[31%] rounded-full bg-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-center font-mono">
            <div className="rounded-lg bg-zinc-950/60 p-2 border border-zinc-800/50">
              <div className="text-[10px] text-zinc-400">CLEARED</div>
              <div className="text-base font-bold text-emerald-400">1 / 4</div>
            </div>
            <div className="rounded-lg bg-zinc-950/60 p-2 border border-zinc-800/50">
              <div className="text-[10px] text-zinc-400">XP EARNED</div>
              <div className="text-base font-bold text-cyan-300">1,240</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Mission Filters */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Navigation & Filters
        </h3>
        <ul className="mt-3 space-y-1.5 text-xs font-medium">
          <li>
            <button className="flex w-full items-center justify-between rounded-xl bg-cyan-500/10 px-3 py-2 text-cyan-400 font-semibold border border-cyan-500/20">
              <span>All Missions</span>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px]">4</span>
            </button>
          </li>
          <li>
            <button className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition">
              <span>In Progress</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px]">2</span>
            </button>
          </li>
          <li>
            <button className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition">
              <span>Completed</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px]">1</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Infiltration Protocol Box */}
      <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-xs text-zinc-400">
        <span className="font-semibold text-zinc-300">💡 Tactical Tip:</span>
        <p className="mt-1 leading-relaxed">
          Use Pyodide in-browser runtime to test scripts before triggering physical alarms in the maze sector.
        </p>
      </div>
    </aside>
  );
}

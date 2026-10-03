import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <span className="font-mono text-lg font-black text-white">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-tight text-white">
                HEIST<span className="text-cyan-400">_OS</span>
              </span>
              <span className="rounded bg-cyan-950/80 border border-cyan-800/50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-400">
                v0.1
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">RowdyHacks Infiltration Academy</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-400">
          <Link
            href="/"
            className="rounded-lg bg-zinc-800/80 px-3.5 py-2 text-white font-semibold transition hover:bg-zinc-800"
          >
            Operations
          </Link>
          <Link
            href="/game/1"
            className="rounded-lg px-3.5 py-2 hover:bg-zinc-900 hover:text-zinc-200 transition"
          >
            Play Maze
          </Link>
        </nav>

        {/* Right utility buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM ONLINE
          </div>
          <Link
            href="/game/1"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition active:scale-95"
          >
            Launch Game →
          </Link>
        </div>
      </div>
    </header>
  );
}

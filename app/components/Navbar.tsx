import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-panel-border bg-panel/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-secondary border border-panel-border shadow-lg shadow-accent-primary/10">
            <span className="font-mono text-lg font-black text-accent-primary">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-tight text-foreground">
                HEIST<span className="text-accent-primary">_OS</span>
              </span>
              <span className="rounded bg-accent-secondary/60 border border-panel-border px-1.5 py-0.5 text-[10px] font-mono font-medium text-accent-primary">
                v0.1
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">RowdyHacks Infiltration Academy</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Link
            href="/"
            className="rounded-lg bg-panel-elevated border border-panel-border px-3.5 py-2 text-foreground font-semibold transition hover:border-accent-primary/30"
          >
            Operations
          </Link>
          <Link
            href="/game/1"
            className="rounded-lg px-3.5 py-2 hover:bg-panel-elevated hover:text-accent-primary transition"
          >
            Play Maze
          </Link>
        </nav>

        {/* Right utility buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-panel-border bg-accent-secondary/40 px-3 py-1 text-xs font-mono text-accent-primary">
            <span className="h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
            SYSTEM ONLINE
          </div>
          <Link
            href="/game/1"
            className="inline-flex items-center justify-center rounded-xl bg-accent-primary text-accent-primary-foreground font-semibold px-4 py-2 text-xs shadow-md shadow-accent-primary/20 hover:brightness-105 active:scale-95 transition"
          >
            Launch Game →
          </Link>
        </div>
      </div>
    </header>
  );
}

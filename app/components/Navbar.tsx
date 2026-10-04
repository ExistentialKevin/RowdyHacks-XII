"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MascotMuteToggle from "./mascot/MascotMuteToggle";
import { initialLevels, type LevelData } from "../data/levels";

const STORAGE_KEY = "heistschool:lastLevel";
const LEVEL_PATH = /^\/levels\/(\d+)/;

const ACTIVE_LINK =
    "rounded-lg bg-panel-elevated border border-panel-border px-3.5 py-2 text-foreground font-semibold transition hover:border-accent-primary/30";
const IDLE_LINK =
    "rounded-lg px-3.5 py-2 hover:bg-panel-elevated hover:text-accent-primary transition";

const isPlayable = (l: LevelData) => !l.locked && !!l.href;
const firstLevel = initialLevels.find(isPlayable) ?? initialLevels[0];

// Last played level if it's still playable, otherwise the first level.
function heistMapHref(lastLevel: number | null): string {
  const target =
      initialLevels.find((l) => l.levelNumber === lastLevel && isPlayable(l)) ??
      firstLevel;
  return target.href ?? "/";
}

export default function Navbar() {
  const pathname = usePathname();
  // null on first render so server and client markup match; filled in after mount.
  const [lastLevel, setLastLevel] = useState<number | null>(null);

  useEffect(() => {
    const match = pathname.match(LEVEL_PATH);
    try {
      if (match) {
        // Visiting a level (from the menu or directly) records it as last played.
        const n = Number(match[1]);
        setLastLevel(n);
        localStorage.setItem(STORAGE_KEY, String(n));
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setLastLevel(Number(saved));
      }
    } catch {
      // localStorage unavailable (private mode, etc.): fall back to first level
    }
  }, [pathname]);

  const onOperations = pathname === "/";
  const onHeistMap = pathname.startsWith("/levels");
  const onWorkspace = pathname.startsWith("/workspace");

  return (
      <header className="sticky top-0 z-50 border-b border-line bg-panel-muted/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand (unchanged) */}
          <Link href="/" className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-primary" aria-hidden>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span className="hidden text-sm font-bold tracking-[0.14em] text-foreground min-[420px]:inline">HEISTSCHOOL</span>
            <span className="hidden text-[11px] text-dim sm:inline">v0.1 // rowdyhacks</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Link href="/" aria-current={onOperations ? "page" : undefined} className={onOperations ? ACTIVE_LINK : IDLE_LINK}>
              Operations
            </Link>
            <Link href={heistMapHref(lastLevel)} aria-current={onHeistMap ? "page" : undefined} className={onHeistMap ? ACTIVE_LINK : IDLE_LINK}>
              Heist Map
            </Link>
            <Link href="/workspace" aria-current={onWorkspace ? "page" : undefined} className={onWorkspace ? ACTIVE_LINK : IDLE_LINK}>
              Planning Room
            </Link>
          </nav>

          <div className="flex items-center gap-4 text-xs">
            <MascotMuteToggle />
            <div className="hidden items-center gap-2 text-accent-primary sm:flex">
              <span className="h-[7px] w-[7px] bg-accent-primary" />
              sys.online
            </div>
          </div>
        </div>
      </header>
  );
}
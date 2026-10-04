"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MascotMuteToggle from "./mascot/MascotMuteToggle";

const LINKS = [
  { href: "/", label: "operations", match: (p: string) => p === "/" },
  {
    href: "/levels/2",
    label: "Heist Map",
    match: (p: string) => p.startsWith("/levels"),
  },
];

type NavKey = "operations" | "workspace";

const ACTIVE_LINK =
  "rounded-lg bg-panel-elevated border border-panel-border px-3.5 py-2 text-foreground font-semibold transition hover:border-accent-primary/30";
const IDLE_LINK =
  "rounded-lg px-3.5 py-2 hover:bg-panel-elevated hover:text-accent-primary transition";

export default function Navbar({ active = "operations" }: { active?: NavKey }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-panel-muted/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent-primary"
            aria-hidden
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span className="hidden text-sm font-bold tracking-[0.14em] text-foreground min-[420px]:inline">
            HEISTSCHOOL
          </span>
          <span className="hidden text-[11px] text-dim sm:inline">
            v0.1 // rowdyhacks
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Link
            href="/"
            aria-current={active === "operations" ? "page" : undefined}
            className={active === "operations" ? ACTIVE_LINK : IDLE_LINK}
          >
            Operations
          </Link>
          <Link
            href="/game/1"
            className="rounded-lg px-3.5 py-2 hover:bg-panel-elevated hover:text-accent-primary transition"
          >
            Heist Map
          </Link>
          <Link
            href="/workspace"
            aria-current={active === "workspace" ? "page" : undefined}
            className={active === "workspace" ? ACTIVE_LINK : IDLE_LINK}
          >
            Planning Room
          </Link>
        </nav>

        {/* Status + lil guy mute */}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "operations", match: (p: string) => p === "/" },
  { href: "/levels/2", label: "play_maze", match: (p: string) => p.startsWith("/levels") },
];

export default function Navbar() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-panel-muted/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-primary" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span className="hidden text-sm font-bold tracking-[0.14em] text-foreground min-[420px]:inline">HEISTSCHOOL</span>
          <span className="hidden text-[11px] text-dim sm:inline">v0.1 // rowdyhacks</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 text-[11px] sm:text-[13px]">
          {LINKS.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  active
                    ? "whitespace-nowrap bg-accent-primary px-2 py-1.5 font-medium text-accent-primary-foreground sm:px-3.5"
                    : "whitespace-nowrap px-2 py-1.5 text-muted-foreground transition hover:text-accent-primary sm:px-3.5"
                }
              >
                [ {l.label} ]
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="hidden items-center gap-2 text-xs text-accent-primary sm:flex">
          <span className="h-[7px] w-[7px] bg-accent-primary" />
          sys.online
        </div>
      </div>
    </header>
  );
}

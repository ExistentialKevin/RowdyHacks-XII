import LevelList from "./LevelList";
import { type LevelData } from "../data/levels";

interface MiddleColumnProps {
  levels?: LevelData[];
}

export default function MiddleColumn({ levels }: MiddleColumnProps) {
  return (
    <section className="space-y-6 w-full">
      {/* Hero / Sector Briefing Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-panel-border bg-gradient-to-br from-panel via-panel-muted to-panel p-6 sm:p-8 shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-accent-secondary/50 px-3 py-1 text-xs font-semibold text-accent-primary">
          <span>🎯</span> Mission Directory
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Available Infiltration Levels
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Select a protocol below to load the interactive maze environment. Each level features objectives, progressive challenges, and automated telemetry.
        </p>
      </div>

      {/* LevelCards Grid */}
      <LevelList levels={levels} />
    </section>
  );
}

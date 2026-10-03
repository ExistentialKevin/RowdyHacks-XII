import LevelList from "./LevelList";
import { type LevelData } from "../data/levels";

interface MiddleColumnProps {
  levels?: LevelData[];
}

export default function MiddleColumn({ levels }: MiddleColumnProps) {
  return (
    <section className="space-y-6 lg:col-span-6">
      {/* Hero / Sector Briefing Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          <span>🎯</span> Mission Directory
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Available Infiltration Levels
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Select a protocol below to load the interactive maze environment. Each level features objectives, progressive challenges, and automated telemetry.
        </p>
      </div>

      {/* LevelCards Grid */}
      <LevelList levels={levels} />
    </section>
  );
}

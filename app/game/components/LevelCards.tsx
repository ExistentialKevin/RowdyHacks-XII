import React from "react";
import Link from "next/link";

export interface LevelCardProps {
  name: string;
  description: string;
  current: number;
  total: number;
  levelNumber?: number | string;
  category?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  href?: string;
  isLocked?: boolean;
}

export default function LevelCard({
  name,
  description,
  current,
  total,
  levelNumber,
  category = "Mission",
  difficulty = "Beginner",
  href,
  isLocked = false,
}: LevelCardProps) {
  const safeTotal = Math.max(1, total);
  const clampedCurrent = Math.max(0, Math.min(current, safeTotal));
  const percent = Math.round((clampedCurrent / safeTotal) * 100);
  const isCompleted = clampedCurrent >= safeTotal;

  const difficultyBadgeColor = {
    Beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    Intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    Advanced: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    Expert: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  }[difficulty] || "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";

  const cardContent = (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-5 shadow-lg backdrop-blur-md transition-all duration-300 ${
        isLocked
          ? "border-zinc-800/60 opacity-60 grayscale-[40%]"
          : "border-zinc-800/90 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-2xl cursor-pointer"
      }`}
    >
      {/* Top accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/20" />

      {/* Header section */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {levelNumber && (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-xs font-bold text-zinc-300">
                {levelNumber}
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {category}
            </span>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${difficultyBadgeColor}`}
          >
            {difficulty}
          </span>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-cyan-300">
          {name}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>

      {/* Bottom Progress Bar Section */}
      <div className="mt-6 pt-4 border-t border-zinc-800/70">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-400">
            {isCompleted ? (
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Completed
              </span>
            ) : isLocked ? (
              "Locked"
            ) : (
              "Progress"
            )}
          </span>
          <span className="font-semibold text-zinc-200">
            <span className="text-cyan-400">{clampedCurrent}</span>
            <span className="text-zinc-500"> / </span>
            <span>{safeTotal} items</span>
          </span>
        </div>

        {/* Progress track & bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (href && !isLocked) {
    return (
      <Link href={href} className="block no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// Export named as well for flexible imports
export { LevelCard };
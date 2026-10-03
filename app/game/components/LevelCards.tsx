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
    Beginner: "border-accent-primary/40 bg-accent-secondary/50 text-accent-primary",
    Intermediate: "border-amber-400/40 bg-amber-950/30 text-amber-300",
    Advanced: "border-orange-400/40 bg-orange-950/30 text-orange-300",
    Expert: "border-rose-400/40 bg-rose-950/30 text-rose-300",
  }[difficulty] || "border-accent-primary/40 bg-accent-secondary/50 text-accent-primary";

  const cardContent = (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-panel p-5 shadow-lg backdrop-blur-md transition-all duration-300 ${
        isLocked
          ? "border-panel-border/60 opacity-60 grayscale-[40%]"
          : "border-panel-border hover:-translate-y-1 hover:border-panel-border-hover hover:shadow-accent-primary/5 hover:shadow-2xl cursor-pointer"
      }`}
    >
      {/* Top accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-accent-primary/10 blur-2xl transition-all duration-500 group-hover:bg-accent-primary/20" />

      {/* Header section */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {levelNumber && (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-secondary text-xs font-bold text-accent-primary border border-panel-border">
                {levelNumber}
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </span>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${difficultyBadgeColor}`}
          >
            {difficulty}
          </span>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-accent-primary">
          {name}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Bottom Progress Bar Section */}
      <div className="mt-6 pt-4 border-t border-panel-border">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            {isCompleted ? (
              <span className="flex items-center gap-1 font-semibold text-accent-primary">
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
          <span className="font-semibold text-foreground">
            <span className="text-accent-primary">{clampedCurrent}</span>
            <span className="text-muted-foreground"> / </span>
            <span>{safeTotal} items</span>
          </span>
        </div>

        {/* Progress track & bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-accent-secondary/50 border border-panel-border">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-accent-primary"
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
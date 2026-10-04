import type { LevelData } from "../data/levels";

/** Clearance text color + progress-bar fill per difficulty (c-slate palette). */
export const CLEARANCE: Record<LevelData["difficulty"], { label: string; text: string; fill: string }> = {
  Beginner: { label: "pickpocket", text: "text-accent-primary", fill: "bg-accent-primary" },
  Intermediate: { label: "burglar", text: "text-slate-yellow", fill: "bg-slate-yellow" },
  Advanced: { label: "safecracker", text: "text-slate-orange", fill: "bg-slate-orange" },
  Expert: { label: "mastermind", text: "text-slate-purple", fill: "bg-slate-purple" },
};

export function levelFill(level: LevelData) {
  return level.current >= level.total ? "bg-accent-primary" : CLEARANCE[level.difficulty].fill;
}

export const hexId = (n: number) => `0x${n.toString(16).padStart(2, "0")}`;

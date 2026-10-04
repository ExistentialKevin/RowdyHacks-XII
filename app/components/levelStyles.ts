import type { LevelData } from "../data/levels";

/** Clearance text color + progress-bar fill per difficulty (c-slate palette). */
export const CLEARANCE: Record<LevelData["difficulty"], { label: string; text: string; fill: string }> = {
  Beginner: { label: "lvl.beginner", text: "text-accent-primary", fill: "bg-accent-primary" },
  Intermediate: { label: "lvl.intermediate", text: "text-slate-yellow", fill: "bg-slate-yellow" },
  Advanced: { label: "lvl.advanced", text: "text-slate-orange", fill: "bg-slate-orange" },
  Expert: { label: "lvl.expert", text: "text-slate-purple", fill: "bg-slate-purple" },
};

export function levelFill(level: LevelData) {
  return level.current >= level.total ? "bg-accent-primary" : CLEARANCE[level.difficulty].fill;
}

export const hexId = (n: number) => `0x${n.toString(16).padStart(2, "0")}`;

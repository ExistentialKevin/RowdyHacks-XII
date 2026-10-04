import Link from "next/link";
import ProgressBar from "./ProgressBar";
import { CLEARANCE, hexId, levelFill } from "./levelStyles";
import type { LevelData } from "../data/levels";

const COLS = "grid grid-cols-[56px_1fr_96px] md:grid-cols-[72px_120px_1fr_140px_140px_88px] items-center gap-3";

function Action({ level }: { level: LevelData }) {
  if (level.locked) return <span className="text-dim">locked</span>;
  const label = level.current >= level.total ? "> replay" : "> resume";
  if (!level.href) {
    return (
      <span className="font-semibold text-accent-primary/50" title="Level page coming soon">
        {label}
      </span>
    );
  }
  return (
    <Link href={level.href} className="font-semibold text-accent-primary hover:underline">
      {label}
    </Link>
  );
}

export default function LevelTable({ levels }: { levels: LevelData[] }) {
  return (
    <section className="border border-line bg-panel-muted">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5 text-xs">
        <span className="text-foreground">JOB_BOARD ({levels.length})</span>
        <span className="text-dim">sort: id ↑</span>
      </div>

      <div className={`${COLS} border-b border-line px-4 py-3 text-[11px] tracking-wider text-dim`}>
        <span>ID</span>
        <span className="hidden md:block">SECTOR</span>
        <span>MISSION</span>
        <span className="hidden md:block">CLEARANCE</span>
        <span className="hidden md:block">PROGRESS</span>
        <span className="text-right">ACTION</span>
      </div>

      {levels.map((lvl) => {
        const clr = CLEARANCE[lvl.difficulty];
        return (
          <div
            key={lvl.levelNumber}
            className={`${COLS} border-b border-line px-4 py-4 text-[13px] last:border-b-0 ${
              lvl.locked ? "opacity-40" : "transition-colors hover:bg-panel"
            }`}
          >
            <span className="text-dim">{hexId(lvl.levelNumber)}</span>
            <span className="hidden text-foreground md:block">{lvl.category.toLowerCase()}</span>
            <div>
              <div className="mb-1 font-bold text-foreground">{lvl.name}</div>
              <div className="text-[11px] leading-relaxed text-dim">{lvl.description}</div>
            </div>
            <span className={`hidden text-xs md:block ${clr.text}`}>{clr.label}</span>
            <div className="hidden md:block">
              <ProgressBar
                current={lvl.current}
                total={lvl.total}
                fillClass={levelFill(lvl)}
                label={lvl.locked ? "vault sealed" : undefined}
              />
            </div>
            <span className="text-right text-xs">
              <Action level={lvl} />
            </span>
          </div>
        );
      })}
    </section>
  );
}

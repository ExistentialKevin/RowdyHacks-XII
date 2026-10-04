import Link from "next/link";
import ProgressBar from "./ProgressBar";
import { levelFill } from "./levelStyles";
import type { LevelData } from "../data/levels";

export default function ContinueSession({ level }: { level: LevelData }) {
  return (
    <aside className="w-full border border-panel-border bg-panel-muted p-5 lg:w-[320px] lg:shrink-0">
      <div className="text-[11px] font-bold tracking-[0.12em] text-accent-primary">BACK TO THE JOB</div>
      <div className="mb-2 mt-3 text-[11px] text-dim">
        level {String(level.levelNumber).padStart(2, "0")} · {level.category.toLowerCase()}
      </div>
      <div className="mb-3 text-[17px] font-bold text-foreground">{level.name}</div>
      <ProgressBar current={level.current} total={level.total} fillClass={levelFill(level)} />
      {level.href && (
        <Link
          href={level.href}
          className="mt-5 block bg-accent-primary py-2.5 text-center text-[13px] font-semibold text-accent-primary-foreground transition hover:brightness-110"
        >
          &gt; get_back_in
        </Link>
      )}
    </aside>
  );
}

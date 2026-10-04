import ContinueSession from "./ContinueSession";
import LevelTable from "./LevelTable";
import GuideGreeting from "./GuideGreeting";
import { initialLevels, type LevelData } from "../data/levels";

interface MiddleColumnProps {
  levels?: LevelData[];
}

export default function MiddleColumn({ levels = initialLevels }: MiddleColumnProps) {
  // Most recent unfinished, unlocked level with a playable page.
  const active = levels.find((l) => !l.locked && l.href && l.current < l.total) ?? levels[0];

  return (
    <section className="w-full space-y-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="text-[13px] text-dim">
            root@heistschool:~$ <span className="text-foreground">ls ./missions --available</span>
          </div>
          <h1 className="mb-4 mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-[38px] sm:leading-tight">
            Available infiltration levels<span className="cursor-blink text-accent-primary">_</span>
          </h1>
          <p className="text-[13px] leading-7 text-muted-foreground">
            Select a protocol to load the interactive maze environment. Each level has objectives,
            progressive challenges and automated telemetry.
          </p>
          <GuideGreeting levels={levels} active={active} />
        </div>
        <ContinueSession level={active} />
      </div>

      <div>
        <LevelTable levels={levels} />
        <div className="mt-3.5 flex items-center justify-between text-[11px] text-dim">
          <div className="flex gap-5">
            <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] bg-accent-primary" />complete</span>
            <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] bg-slate-yellow" />active</span>
            <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] bg-faint" />locked</span>
          </div>
          <span>[ crt: off ]</span>
        </div>
      </div>
    </section>
  );
}

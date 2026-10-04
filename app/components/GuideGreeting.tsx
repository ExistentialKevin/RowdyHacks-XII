"use client";

import { useState } from "react";
import SpeakingMascot from "./mascot/SpeakingMascot";
import type { LevelData } from "../data/levels";

/**
 * Lil guy, the player's handler — follows you through the heist and briefs you
 * on where you left off. Click "next" to hear the rest of the briefing.
 */
export default function GuideGreeting({ levels, active }: { levels: LevelData[]; active: LevelData }) {
  const cleared = levels.filter((l) => l.current >= l.total).length;
  const remaining = active.total - active.current;
  const locked = levels.find((l) => l.locked);

  const lines = [
    `Psst, recruit. It's me, lil guy. I'll be on comms for the whole job. You've cleared ${cleared} of ${levels.length} sectors so far.`,
    `${active.name} is still hot: ${remaining} item${remaining === 1 ? "" : "s"} left to grab. Stay out of the red camera sightlines and you'll be fine.`,
    locked
      ? `Finish the open sectors and I'll crack the door to ${locked.name}. That's where the real score is.`
      : "Every sector is open. Go get 'em.",
  ];

  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const last = i === lines.length - 1;

  return (
    <SpeakingMascot
      text={lines[i]}
      size={72}
      header={<div className="mb-1 text-[11px] tracking-[0.12em] text-accent-primary">HANDLER // lil_guy</div>}
      onDone={() => setDone(true)}
      className="mt-6 max-w-xl"
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-dim">
          msg {i + 1}/{lines.length}
        </span>
        <button
          type="button"
          disabled={!done}
          onClick={() => {
            setDone(false);
            setI(last ? 0 : i + 1);
          }}
          className="text-accent-primary transition hover:underline disabled:opacity-40"
        >
          {last ? "> replay_briefing" : "> next"}
        </button>
      </div>
    </SpeakingMascot>
  );
}

"use client";

import React, { useState } from "react";
import SpeakingMascot from "@/app/components/mascot/SpeakingMascot";
import { MASCOT_IMAGES } from "@/app/components/mascot/mascotConfig";

const GIVE_UP_LINE = "figure it out yourself genius";

interface HintMascotProps {
  /** Hints in order. Lil says "psst** try <hint>" for each, then gives up on you. */
  hints: string[];
  /** Hide the whole widget (e.g. while the tutorial overlay is up). */
  hidden?: boolean;
}

/**
 * Lil sits in the corner. Click him for a hint: he whispers the next one,
 * and once you've burned through them all he stops being helpful.
 */
export default function HintMascot({ hints, hidden = false }: HintMascotProps) {
  // How many times the player has asked. Never resets, Lil remembers.
  const [asked, setAsked] = useState(0);
  const [open, setOpen] = useState(false);

  if (hidden) return null;

  const outOfHints = asked > hints.length;
  const line = asked === 0 ? "" : outOfHints ? GIVE_UP_LINE : `psst** try ${hints[asked - 1]}`;
  const hintsLeft = Math.max(0, hints.length - asked);

  const askForHint = () => {
    setAsked((n) => n + 1);
    setOpen(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex max-w-[calc(100vw-2rem)] items-end gap-3">
      {open && line && (
        <SpeakingMascot
          // key forces a fresh "speech" each time, even if the line repeats
          key={asked}
          text={line}
          size={72}
          bubbleSide="left"
          className="w-[min(440px,calc(100vw-2rem))]"
          header={
            <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider">
              <span className={outOfHints ? "text-slate-red" : "text-accent-primary"}>
                {outOfHints ? "hint_limit_reached" : `hint ${asked} of ${hints.length}`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                aria-label="Close hint"
                className="text-dim hover:text-foreground"
              >
                [ x ]
              </button>
            </div>
          }
        >
          {!outOfHints && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                askForHint();
              }}
              className="border border-line bg-panel px-3 py-1 text-[11px] text-foreground transition hover:border-accent-primary/50 hover:text-accent-primary"
            >
              {hintsLeft > 0 ? "[ another_hint ]" : "[ i still need help ]"}
            </button>
          )}
        </SpeakingMascot>
      )}

      {/* Lil himself, napping in the corner until you click him */}
      {!(open && line) && (
        <button
          onClick={askForHint}
          title="Ask Lil for a hint"
          aria-label="Ask Lil for a hint"
          className="group relative shrink-0 border border-line bg-panel-muted p-1.5 shadow-2xl transition hover:-translate-y-0.5 hover:border-accent-primary/60"
        >
          <img
            src={MASCOT_IMAGES.closed}
            alt=""
            draggable={false}
            className="h-[72px] w-[72px] select-none"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="absolute -top-2 -left-2 border border-accent-primary bg-background px-1.5 text-[9px] font-semibold tracking-wider text-accent-primary">
            {outOfHints ? "!?" : "hint"}
          </span>
        </button>
      )}
    </div>
  );
}

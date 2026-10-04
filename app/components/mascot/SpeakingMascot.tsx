"use client";

import React, { useEffect, useRef, useState } from "react";
import { MASCOT_IMAGES, MASCOT_PEEP_SRC, MASCOT_PEEP_VOLUME } from "./mascotConfig";
import { usePeep } from "./usePeep";

export interface SpeakingMascotProps {
  /** What the mascot says. Changing it restarts the speech animation. */
  text: string;
  /** Optional small content shown at the very top of the bubble (e.g. "Step 1 of 5"). */
  header?: React.ReactNode;
  /** Optional bold heading shown above the text in the bubble. */
  title?: string;
  /** Extra content rendered under the text inside the bubble (e.g. buttons). */
  children?: React.ReactNode;
  /** Mascot image size in px. Default 96. */
  size?: number;
  /** Milliseconds per character for the typewriter. Default 28. */
  charDelay?: number;
  /** Milliseconds between mouth open/close flaps. Default 110. */
  mouthInterval?: number;
  /** Which side of the mascot the speech bubble sits on. Default "right". */
  bubbleSide?: "left" | "right";
  /** Override the peep sound for this instance (null = silent). */
  peepSrc?: string | null;
  /** Mute the peep without changing the source. */
  muted?: boolean;
  /** Called once the full text has been typed out. */
  onDone?: () => void;
  className?: string;
  bubbleClassName?: string;
}

/**
 * Lil the mascot, "talking": types out `text` in a speech bubble while
 * flapping between the open/closed mouth sprites and peeping on every open.
 * Click the bubble to skip to the end of the line.
 */
export default function SpeakingMascot({
  text,
  header,
  title,
  children,
  size = 96,
  charDelay = 28,
  mouthInterval = 110,
  bubbleSide = "right",
  peepSrc = MASCOT_PEEP_SRC,
  muted = false,
  onDone,
  className = "",
  bubbleClassName = "",
}: SpeakingMascotProps) {
  const [shown, setShown] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(false);
  const peep = usePeep(peepSrc, MASCOT_PEEP_VOLUME, muted);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const speaking = shown < text.length;

  // Restart when the line changes (reset during render so the old count never
  // flashes against the new text).
  const [prevText, setPrevText] = useState(text);
  if (prevText !== text) {
    setPrevText(text);
    setShown(0);
  }

  // Typewriter.
  useEffect(() => {
    if (!speaking) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), charDelay);
    return () => window.clearTimeout(id);
  }, [shown, speaking, charDelay]);

  // Mouth flapping while speaking; peep on each open.
  useEffect(() => {
    if (!speaking) {
      setMouthOpen(false);
      return;
    }
    const id = window.setInterval(() => {
      setMouthOpen((open) => {
        if (!open) peep();
        return !open;
      });
    }, mouthInterval);
    return () => window.clearInterval(id);
  }, [speaking, mouthInterval, peep]);

  // Fire onDone once per line.
  useEffect(() => {
    if (text.length > 0 && shown >= text.length) onDoneRef.current?.();
  }, [shown, text]);

  const skip = () => setShown(text.length);

  const mascot = (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {/* Both sprites stay mounted so swapping never flickers while loading. */}
      <img
        src={MASCOT_IMAGES.closed}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full select-none"
        style={{ imageRendering: "pixelated", opacity: mouthOpen ? 0 : 1 }}
      />
      <img
        src={MASCOT_IMAGES.open}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full select-none"
        style={{ imageRendering: "pixelated", opacity: mouthOpen ? 1 : 0 }}
      />
    </div>
  );

  const tailSide = bubbleSide === "right" ? "-left-2 border-l border-b" : "-right-2 border-r border-t";

  const bubble = (
    <div
      onClick={speaking ? skip : undefined}
      className={`relative min-w-0 flex-1 border border-panel-border-hover bg-panel-muted p-4 shadow-2xl ${
        speaking ? "cursor-pointer" : ""
      } ${bubbleClassName}`}
    >
      <span
        className={`absolute top-6 h-4 w-4 rotate-45 border-panel-border-hover bg-panel-muted ${tailSide}`}
        aria-hidden="true"
      />
      {header}
      {title && <h3 className="mb-2 text-base font-bold text-foreground">{title}</h3>}
      {/* Full text for screen readers; animated text is visual only. */}
      <p className="sr-only">{text}</p>
      <p className="text-[13px] leading-6 text-muted-foreground" aria-hidden="true">
        {text.slice(0, shown)}
        {/* Invisible remainder reserves space so the bubble doesn't grow while typing. */}
        <span className="invisible">{text.slice(shown)}</span>
      </p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {bubbleSide === "right" ? (
        <>
          {mascot}
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          {mascot}
        </>
      )}
    </div>
  );
}

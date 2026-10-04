"use client";

import { setMascotMuted, useMascotMuted } from "./mascotMute";

/** "[ comms: on ]" / "[ comms: muted ]" toggle for lil guy's peeps. */
export default function MascotMuteToggle({ className = "" }: { className?: string }) {
  const muted = useMascotMuted();
  return (
    <button
      type="button"
      aria-pressed={muted}
      aria-label={muted ? "Unmute lil guy" : "Mute lil guy"}
      onClick={(e) => {
        e.stopPropagation(); // don't skip the line when clicked inside the bubble
        setMascotMuted(!muted);
      }}
      className={`transition hover:underline ${muted ? "text-dim" : "text-accent-primary"} ${className}`}
    >
      [ comms: {muted ? "muted" : "on"} ]
    </button>
  );
}

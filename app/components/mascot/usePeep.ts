"use client";

import { useCallback, useEffect } from "react";
import { bindAudioUnlock, playPeep, preloadPeep } from "./peepEngine";

/**
 * Returns a `peep()` function for lil guy's voice.
 * - `src`: a file in /public (e.g. "/sounds/peep.mp3"), "synth" for the
 *   built-in chick peep, or null for silence.
 * - Each peep gets a small random pitch change and is trimmed short.
 * - Stays silent until the user first clicks or presses a key (browser rule).
 */
export function usePeep(src: string | null | undefined, volume = 0.35, muted = false) {
  useEffect(() => {
    bindAudioUnlock();
    if (src && src !== "synth") preloadPeep(src);
  }, [src]);

  return useCallback(() => {
    if (muted || !src) return;
    playPeep(src, volume);
  }, [src, volume, muted]);
}

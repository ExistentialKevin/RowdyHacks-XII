"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a `peep()` function that plays a short sound effect.
 * - No-ops when `src` is null/undefined or `muted` is true.
 * - Restarts the clip on every call so rapid mouth flaps each get a peep.
 * - Swallows autoplay errors (browsers block audio until the user interacts).
 */
export function usePeep(src: string | null | undefined, volume = 0.4, muted = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) {
      audioRef.current = null;
      return;
    }
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  return useCallback(() => {
    const audio = audioRef.current;
    if (!audio || muted) return;
    try {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }, [muted]);
}

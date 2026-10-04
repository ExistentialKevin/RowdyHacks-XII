// Central config for the Lil mascot. Change these in one place and every
// <SpeakingMascot /> in the app picks it up.

export const MASCOT_IMAGES = {
  closed: "/mascot/lil-closed.png",
  open: "/mascot/lil-open.png",
} as const;

/**
 * Lil guy's voice: played every time his mouth opens.
 *   "synth"            built-in synthesized chick peep (no file needed)
 *   "/sounds/peep.mp3" your own clip; drop it in /public/sounds
 *   null               silent
 * If the file is missing or won't load, it falls back to "synth".
 *
 * peep.mp3: "Short Chick Sound" by Nikin from Pixabay
 *   https://pixabay.com/users/nikin-253338/
 *   https://pixabay.com/sound-effects/nature-short-chick-sound-171389/
 */
export const MASCOT_PEEP_SRC: string | null = "/sounds/peep.mp3";

/** 0–1 volume for the peep. */
export const MASCOT_PEEP_VOLUME = 0.12;

/** Random pitch wobble per peep (0.15 = ±15%), so he sounds like he's talking. */
export const MASCOT_PEEP_PITCH_JITTER = 0.15;

/** Longest one peep from a file can play, in ms. Longer clips are trimmed with a fade. */
export const MASCOT_PEEP_MAX_MS = 200; // peep.mp3 is 192 ms, so it plays in full

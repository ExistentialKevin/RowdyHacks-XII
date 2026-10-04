// Central config for the Lil mascot. Change these in one place and every
// <SpeakingMascot /> in the app picks it up.

export const MASCOT_IMAGES = {
  closed: "/mascot/lil-closed.png",
  open: "/mascot/lil-open.png",
} as const;

/**
 * Peep sound played every time the mascot opens its mouth.
 *
 * TODO: drop your sound file into /public/sounds and point this at it, e.g.
 *   export const MASCOT_PEEP_SRC: string | null = "/sounds/peep.mp3";
 *
 * Leave it as null to keep the mascot silent.
 */
export const MASCOT_PEEP_SRC: string | null = null;

/** 0–1 volume for the peep. */
export const MASCOT_PEEP_VOLUME = 0.4;

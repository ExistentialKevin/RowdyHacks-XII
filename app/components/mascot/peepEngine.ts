"use client";

// Lil guy's voice engine.
//
// Uses the Web Audio API instead of <audio> so that:
//  - peeps start instantly and can overlap (no choppy restarts),
//  - every peep gets a slightly random pitch, so he sounds like he's talking,
//  - long clips are trimmed to a short peep with a quick fade-out,
//  - there's a built-in synthesized chick peep when no sound file is set ("synth").
//
// Browsers block audio until the user clicks or presses a key, so the
// AudioContext is only created on the first gesture (no console warnings).

import { MASCOT_PEEP_MAX_MS, MASCOT_PEEP_PITCH_JITTER } from "./mascotConfig";

let ctx: AudioContext | null = null;
let unlockBound = false;

/** Raw file bytes, fetched ahead of time (no AudioContext needed). */
const rawCache = new Map<string, Promise<ArrayBuffer | null>>();
/** Decoded clips. `null` means the file failed to load, so fall back to synth. */
const decoded = new Map<string, AudioBuffer | null>();
const decoding = new Set<string>();

function createCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function fetchRaw(src: string) {
  let p = rawCache.get(src);
  if (!p) {
    p = fetch(src)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
    rawCache.set(src, p);
  }
  return p;
}

function decode(src: string) {
  if (!ctx || decoded.has(src) || decoding.has(src)) return;
  const c = ctx;
  decoding.add(src);
  void fetchRaw(src)
    .then((buf) => (buf ? c.decodeAudioData(buf.slice(0)) : null))
    .catch(() => null)
    .then((audio) => {
      decoded.set(src, audio);
      decoding.delete(src);
    });
}

/** Resume audio on the first click / key / tap anywhere on the page. */
export function bindAudioUnlock() {
  if (unlockBound || typeof window === "undefined") return;
  unlockBound = true;
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const unlock = () => {
    const c = createCtx();
    if (!c) return;
    if (c.state === "suspended") void c.resume();
    rawCache.forEach((_, src) => decode(src));
    if (c.state === "running") events.forEach((e) => window.removeEventListener(e, unlock));
  };
  events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
}

/** Start downloading a clip so the first peep is ready. Safe to call often. */
export function preloadPeep(src: string) {
  if (typeof window === "undefined") return;
  void fetchRaw(src);
  decode(src);
}

function randomRate() {
  return 1 + (Math.random() * 2 - 1) * MASCOT_PEEP_PITCH_JITTER;
}

/** Tiny synthesized chick peep: a quick upward chirp with a soft tail. */
function playSynth(c: AudioContext, volume: number, rate: number) {
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(2300 * rate, t);
  osc.frequency.exponentialRampToValueAtTime(3800 * rate, t + 0.045);
  osc.frequency.exponentialRampToValueAtTime(3000 * rate, t + 0.09);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * 0.5), t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.11);
}

function playBuffer(c: AudioContext, buffer: AudioBuffer, volume: number, rate: number) {
  const t = c.currentTime;
  const maxSec = MASCOT_PEEP_MAX_MS / 1000;
  const length = Math.min(buffer.duration / rate, maxSec);
  const node = c.createBufferSource();
  const gain = c.createGain();
  node.buffer = buffer;
  node.playbackRate.value = rate;
  gain.gain.setValueAtTime(volume, t);
  // Short fade so trimmed clips don't click.
  gain.gain.setValueAtTime(volume, t + Math.max(0, length - 0.03));
  gain.gain.linearRampToValueAtTime(0, t + length);
  node.connect(gain).connect(c.destination);
  node.start(t);
  node.stop(t + length + 0.01);
}

/**
 * Play one peep. `src` is a file path, "synth" for the built-in peep, or null
 * for silence. Does nothing until the user has interacted with the page.
 */
export function playPeep(src: string | null, volume: number) {
  if (!src || !ctx || ctx.state !== "running") return;
  const rate = randomRate();
  if (src === "synth") return playSynth(ctx, volume, rate);

  const buffer = decoded.get(src);
  if (buffer) return playBuffer(ctx, buffer, volume, rate);
  if (buffer === null) return playSynth(ctx, volume, rate); // file missing or broken
  decode(src); // still loading: kick it off and stay quiet this time
}

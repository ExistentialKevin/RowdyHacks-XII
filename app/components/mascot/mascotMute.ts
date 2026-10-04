"use client";

import { useSyncExternalStore } from "react";

// Site-wide mute for lil guy, remembered in localStorage and shared by every
// <SpeakingMascot /> (and synced across open tabs).

const KEY = "heistschool.lilguy.muted";
const listeners = new Set<() => void>();

function read() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setMascotMuted(muted: boolean) {
  try {
    localStorage.setItem(KEY, muted ? "1" : "0");
  } catch {
    /* storage blocked: mute still applies until reload */
  }
  listeners.forEach((l) => l());
}

export function useMascotMuted() {
  return useSyncExternalStore(subscribe, read, () => false);
}

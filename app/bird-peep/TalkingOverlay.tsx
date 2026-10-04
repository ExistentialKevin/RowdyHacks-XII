"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Sound file in /public, e.g. "/sounds/demo.wav" */
  src: string;
  /** PNG with the mouth closed, e.g. "/character/closed.png" */
  closedImg: string;
  /** PNG with the mouth open, e.g. "/character/open.png" */
  openImg: string;
  /** Size of the character in pixels */
  size?: number;
  /** Called when the overlay should close (Close button or Escape key) */
  onClose: () => void;
  /** Called when the sound finishes playing */
  onFinished?: () => void;
};

const DURATION_MS = 5000;
const MIN_FLAP_MS = 80;
const MAX_FLAP_MS = 220;

export default function TalkingOverlay({
  src,
  closedImg,
  openImg,
  size = 280,
  onClose,
  onFinished,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const flapTimeoutRef = useRef<number>(0);
  const stopTimeoutRef = useRef<number>(0);

  const [mouthOpen, setMouthOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false); // true if the browser refused autoplay

  const stop = useCallback(() => {
    clearTimeout(flapTimeoutRef.current);
    clearTimeout(stopTimeoutRef.current);
    audioRef.current?.pause();
    setMouthOpen(false);
    setPlaying(false);
    onFinished?.();
  }, [onFinished]);

  // Randomly toggles the mouth open/closed at an irregular cadence
  const flap = useCallback(() => {
    setMouthOpen((prev) => !prev);
    const delay = MIN_FLAP_MS + Math.random() * (MAX_FLAP_MS - MIN_FLAP_MS);
    flapTimeoutRef.current = window.setTimeout(flap, delay);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.currentTime = 0;
      await audio.play();
      setBlocked(false);
      setPlaying(true);
      clearTimeout(flapTimeoutRef.current);
      flap();
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = window.setTimeout(stop, DURATION_MS);
    } catch {
      // Autoplay was blocked; show a Play button instead
      setBlocked(true);
    }
  }, [flap, stop]);

  const handleEnded = () => {
    stop();
  };

  // Start talking as soon as the overlay opens (works because it was opened by a click)
  useEffect(() => {
    play();
    return () => {
      clearTimeout(flapTimeoutRef.current);
      clearTimeout(stopTimeoutRef.current);
      audioRef.current?.pause();
    };
  }, [play]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Talking character"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* stopPropagation so clicks on the card don't close the overlay */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: 24,
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Both frames are always rendered and stacked, so swapping never flickers */}
        <div style={{ position: "relative", width: size, height: size }}>
          <img
            src={closedImg}
            alt=" A cute bird character with a closed beak."
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: mouthOpen ? 0 : 1,
            }}
          />
          <img
            src={openImg}
            alt=" A cute bird character with an open beak."
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: mouthOpen ? 1 : 0,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={play} disabled={playing} style={buttonStyle}>
            {playing ? "Talking…" : blocked ? "▶ Play" : "Replay"}
          </button>
          <button onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={src} onEnded={handleEnded} preload="auto" />
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "8px 18px",
  borderRadius: 999,
  border: "none",
  background: "white",
  color: "#111",
  fontWeight: 600,
  cursor: "pointer",
};

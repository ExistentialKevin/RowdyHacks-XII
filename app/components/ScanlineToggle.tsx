"use client";

import { setScanline, useScanline } from "./scanlineState";

/** "[ comms: on ]" / "[ comms: muted ]" toggle for lil guy's peeps. */
export default function ScanlineToggle({
  className = "",
  isScanlineVisible = () => true,
}: {
  className?: string;
  isScanlineVisible: () => boolean;
}) {
  const scanLineOff = useScanline();
  return (
    <button
      type="button"
      aria-pressed={scanLineOff}
      aria-label={scanLineOff ? "Turn on Scanlines" : "Turn off Scanlines"}
      onClick={(e) => {
        e.stopPropagation(); // don't skip the line when clicked inside the bubble
        setScanline(!scanLineOff);
        isScanlineVisible = !scanLineOff;
      }}
      className={`transition hover:underline ${scanLineOff ? "text-dim" : "text-accent-primary"} ${className}`}
    >
      [ fake_mustache: {scanLineOff ? "off" : "on"} ]
    </button>
  );
}

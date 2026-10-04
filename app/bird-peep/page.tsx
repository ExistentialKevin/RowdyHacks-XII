"use client";

import { useState } from "react";
import TalkingOverlay from "./TalkingOverlay";

export default function TalkPage() {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Talking Character</h1>
        <p>Click the button to bring up the character.</p>
        <button
          onClick={() => setShowOverlay(true)}
          style={{
            marginTop: 12,
            padding: "12px 24px",
            borderRadius: 999,
            border: "none",
            background: "#111",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Say hello
        </button>
      </div>

      {showOverlay && (
        <TalkingOverlay
          src="/sounds/demo.wav"
          closedImg="/bird-peep/closed.png"
          openImg="/bird-peep/open.png"
          onClose={() => setShowOverlay(false)}
        />
      )}
    </main>
  );
}

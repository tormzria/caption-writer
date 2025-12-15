"use client";

import React from "react";

export default function BlurredImage({
  src,
  revealed
}: {
  src: string;
  revealed: boolean;
}) {
  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 16, overflow: "hidden" }}>
      <img
        src={src}
        alt="uploaded"
        style={{
          width: "100%",
          display: "block",
          filter: revealed ? "none" : "blur(18px)",
          transform: revealed ? "none" : "scale(1.02)",
          transition: "filter 250ms ease, transform 250ms ease"
        }}
      />
      {!revealed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.25)",
            padding: 12,
            textAlign: "center"
          }}
        >
          <span className="badge">Tap “Reveal” after you guess 👀</span>
        </div>
      )}
    </div>
  );
}

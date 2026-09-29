import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_BADGE } from "../springs";

// Per-CHARACTER staggered pop — each letter scales/rotates up from nothing,
// much tighter stagger than KineticText's per-word mask reveal. Punchier
// and more "climax" than KineticText's composed slide-up, reserved for
// scenes that want a big, snappy reveal moment rather than an editorial one.
export const CharacterReveal: React.FC<{
  text: string;
  startFrame?: number;
  staggerFrames?: number;
  style?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
}> = ({ text, startFrame = 0, staggerFrames = 1.2, style, wrapperStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Array.from(text);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...wrapperStyle }}>
      {chars.map((ch, i) => {
        const charFrame = frame - startFrame - i * staggerFrames;
        const progress = spring({ frame: charFrame, fps, config: SPRING_BADGE, durationInFrames: 14 });
        const clamped = Math.max(0, Math.min(progress, 1.3));

        return (
          <span
            key={`${i}-${ch}`}
            style={{
              display: "inline-block",
              whiteSpace: ch === " " ? "pre" : "normal",
              opacity: Math.min(clamped * 1.6, 1),
              transform: `translateY(${(1 - clamped) * 24}px) scale(${0.4 + clamped * 0.6}) rotate(${(1 - clamped) * 10}deg)`,
              ...style,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

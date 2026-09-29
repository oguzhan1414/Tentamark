import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_TEXT } from "../springs";

// Word-by-word mask reveal — each word slides up from behind an
// overflow-hidden mask instead of just fading/translating as a whole block.
// Distinct from HormoziCaptions' TikTok karaoke-pop style (used on hook
// scenes only): this is the quieter, editorial "Apple keynote" treatment for
// the handful of headline/quote moments that should read as premium rather
// than viral.
export const KineticText: React.FC<{
  text: string;
  startFrame?: number;
  staggerFrames?: number;
  style?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
}> = ({ text, startFrame = 0, staggerFrames = 2.5, style, wrapperStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...wrapperStyle }}>
      {words.map((word, i) => {
        const wordFrame = frame - startFrame - i * staggerFrames;
        const progress = spring({ frame: wordFrame, fps, config: SPRING_TEXT, durationInFrames: 18 });
        const clamped = Math.max(0, Math.min(progress, 1.15));

        return (
          <span key={`${i}-${word}`} style={{ overflow: "hidden", display: "inline-block", paddingBottom: "0.08em" }}>
            <span
              style={{
                display: "inline-block",
                marginRight: "0.32em",
                opacity: Math.min(clamped * 1.6, 1),
                transform: `translateY(${(1 - clamped) * 105}%)`,
                ...style,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

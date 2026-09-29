import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";

// The text block is present from frame 0 (no entrance motion) — a highlight
// color sweeps through the words in sequence instead, "lighting up" each one
// as it passes. Calmer than KineticText/CharacterReveal since nothing
// slides or pops; fits scenes that want a confident, editorial reveal
// (a review quote, a closing line) rather than a hit/climax moment.
export const WordHighlight: React.FC<{
  text: string;
  startFrame?: number;
  staggerFrames?: number;
  dimColor?: string;
  litColor: string;
  style?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
}> = ({ text, startFrame = 0, staggerFrames = 4, dimColor = "rgba(255,255,255,0.4)", litColor, style, wrapperStyle }) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...wrapperStyle }}>
      {words.map((word, i) => {
        const wordFrame = Math.max(0, Math.min(frame - startFrame - i * staggerFrames, 10));
        const color = interpolateColors(wordFrame, [0, 10], [dimColor, litColor]);

        return (
          <span key={`${i}-${word}`} style={{ marginRight: "0.3em", color, ...style }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

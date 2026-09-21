import React from "react";
import { AbsoluteFill } from "remotion";

export const AmbientGlow: React.FC<{
  colors: string[];
}> = ({ colors }) => {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            borderRadius: "50%",
            background: color,
            filter: "blur(120px)",
            opacity: 0.35,
            top: i === 0 ? -260 : undefined,
            bottom: i === 1 ? -320 : undefined,
            left: i % 2 === 0 ? -220 : undefined,
            right: i % 2 === 1 ? -220 : undefined,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

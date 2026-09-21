import React from "react";
import { interpolate, Solid, useCurrentFrame, useVideoConfig } from "remotion";
import { lightLeak } from "@remotion/effects/light-leak";

// The one cinematic flourish per video — a light-leak flash over the cut
// into the outro, tinted with the brand's own accent hue instead of a fixed
// color, so it reads as tailored rather than a stock template effect.
export const LightLeakOverlay: React.FC<{ hueShift: number }> = ({ hueShift }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  return (
    <Solid
      width={width}
      height={height}
      effects={[
        lightLeak({
          hueShift,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }),
      ]}
    />
  );
};

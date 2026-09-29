import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ScenePlanItem } from "../../src/lib/video/types";

export const StoryProgressBar: React.FC<{
  scenePlan: ScenePlanItem[];
  accentColor: string;
}> = ({ scenePlan, accentColor }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isVertical = height > width;

  // Calculate the cumulative start and end frames for each scene
  const sceneRanges = scenePlan.map((scene, index) => {
    const start = scenePlan.slice(0, index).reduce((total, previous) => total + previous.frames, 0);
    const end = start + scene.frames;
    return { start, end, duration: scene.frames };
  });

  return (
    <div
      style={{
        position: "absolute",
        top: isVertical ? 32 : 24,
        left: isVertical ? 28 : 40,
        right: isVertical ? 28 : 40,
        display: "flex",
        gap: isVertical ? 6 : 8,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {sceneRanges.map((range, idx) => {
        let fillFraction = 0;
        if (frame >= range.end) {
          fillFraction = 1;
        } else if (frame >= range.start) {
          fillFraction = interpolate(frame, [range.start, range.end], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        }

        return (
          <div
            key={`segment-${idx}`}
            style={{
              flex: 1,
              height: isVertical ? 4.5 : 4,
              backgroundColor: "rgba(255, 255, 255, 0.22)",
              borderRadius: 999,
              overflow: "hidden",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                width: `${fillFraction * 100}%`,
                height: "100%",
                backgroundColor: fillFraction === 1 ? "#ffffff" : accentColor,
                boxShadow: fillFraction > 0 ? `0 0 10px ${accentColor}` : "none",
                borderRadius: 999,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

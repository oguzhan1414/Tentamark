import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { fps, transitionFrames } from "./theme";
import type { VideoInputProps } from "../src/lib/video/types";

const DEFAULT_PROPS: VideoInputProps = {
  format: "horizontal",
  durationSeconds: 15,
  fps: 30,
  accentColors: ["#fa5252"],
  brandName: "Tentamark",
  scenePlan: [
    { archetype: "hook", frames: 90, lines: ["Örnek başlık", "buraya gelecek"] },
    { archetype: "outro", frames: 90, brandName: "Tentamark", logoUrl: null, tagline: "", ctaLabel: null },
  ],
};

export const Root: React.FC = () => {
  return (
    <Composition
      id="TentamarkBrandVideo"
      component={Main}
      fps={fps}
      // Width/height/duration all depend on the caller's chosen format and
      // resolved scene plan, so they're computed here instead of registering
      // one fixed <Composition> per format/duration combination.
      calculateMetadata={({ props }) => {
        const { format, scenePlan } = props as VideoInputProps;
        // Mirrors scenePlan.ts's own math exactly: the cut into the final
        // (outro) scene is a light-leak Overlay (Main.tsx), which — unlike
        // a crossfade/slide Transition — does NOT shorten the timeline.
        // Only the other cuts (sceneCount - 2, floored at 0) overlap.
        const transitionCutCount = Math.max(scenePlan.length - 2, 0);
        const totalFrames = scenePlan.reduce((sum, s) => sum + s.frames, 0) - transitionFrames * transitionCutCount;
        return {
          width: format === "vertical" ? 1080 : 1920,
          height: format === "vertical" ? 1920 : 1080,
          durationInFrames: Math.max(totalFrames, fps), // never less than 1s, guards a malformed/empty plan
        };
      }}
      defaultProps={DEFAULT_PROPS}
    />
  );
};

import React from "react";
import { AbsoluteFill, Video } from "remotion";
import type { Theme } from "../theme";

export interface UserClipShowcaseProps {
  videoUrl: string;
  trimBeforeFrames: number;
  trimAfterFrames: number;
  objectPositionX: string;
  objectPositionY: string;
  theme: Theme;
}

// Plays the user's own uploaded clip as the scene's primary content — unlike
// VideoBackground.tsx/UGCSplitShowcase.tsx's decorative, muted background
// video, this one keeps its own audio (that's the whole point of the raw
// footage) and needs `loop` for when trimBefore/trimAfter leave the clip
// shorter than its allotted scene duration — the reason this uses <Video>
// rather than <OffthreadVideo>, whose HTMLAttributes don't expose loop.
export const UserClipShowcase: React.FC<UserClipShowcaseProps> = ({
  videoUrl,
  trimBeforeFrames,
  trimAfterFrames,
  objectPositionX,
  objectPositionY,
  theme,
}) => {
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: theme.ink }}>
      <Video
        src={videoUrl}
        trimBefore={trimBeforeFrames}
        trimAfter={trimAfterFrames}
        loop
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${objectPositionX} ${objectPositionY}`,
        }}
      />

      {/* Top/bottom edge shadow for Reels/Shorts safe zones — same shape as
          VideoBackground.tsx's overlay, kept here rather than shared since
          this one has no vignette/tint (the clip IS the content, not a
          backdrop for graphics on top of it). */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 16%, transparent 80%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

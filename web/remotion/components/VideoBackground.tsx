import React from "react";
import { AbsoluteFill, Video, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export interface VideoBackgroundProps {
  src?: string | null;
  tintColor?: string;
  darkness?: number; // 0.2 to 0.8
  blur?: number; // px blur
  kenBurns?: boolean;
  playbackRate?: number;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  tintColor = "#D97B29",
  darkness = 0.58,
  blur = 0,
  kenBurns = true,
  playbackRate = 1.0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Subtle continuous cinematic camera push-in (Ken Burns)
  const scale = kenBurns
    ? interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1.0;

  if (!src) {
    return null;
  }

  // Resolve staticFile if relative path, otherwise use as-is
  const resolvedSrc = src.startsWith("http") || src.startsWith("blob:") ? src : staticFile(src);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Underlying HD Video Layer */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      >
        <Video
          src={resolvedSrc}
          loop
          muted
          playbackRate={playbackRate}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* 2. Brand Color Tint Wash (Mix-Blend Mode) */}
      <AbsoluteFill
        style={{
          backgroundColor: tintColor,
          mixBlendMode: "color",
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />

      {/* 3. High-End Dark Vignette Overlay (Protects Text Contrast) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(10,12,18,${darkness * 0.55}) 0%, rgba(5,6,10,${Math.min(0.92, darkness * 1.35)}) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* 4. Top and Bottom Ambient Edge Shadow for Reels / Shorts Safe Zones */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.85) 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

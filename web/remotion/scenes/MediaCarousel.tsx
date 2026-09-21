import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { bodyFont } from "../fonts";
import type { Theme } from "../theme";

export const MediaCarousel: React.FC<{ imageUrls: string[]; caption: string; theme: Theme }> = ({
  imageUrls,
  caption,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const isVertical = height > width;
  const perImage = durationInFrames / Math.max(imageUrls.length, 1);
  const captionOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#070b14", overflow: "hidden" }}>
      {imageUrls.map((url, i) => {
        const start = i * perImage;
        const localFrame = frame - start;
        const isLast = i === imageUrls.length - 1;
        const fadeIn = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const fadeOut = isLast
          ? 1
          : interpolate(localFrame, [perImage - 15, perImage], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
        const scale = 1 + (Math.min(Math.max(localFrame, 0), perImage) / perImage) * 0.08;

        return (
          <AbsoluteFill key={url} style={{ opacity }}>
            <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
          </AbsoluteFill>
        );
      })}

      {/* Modern gradient overlay at the bottom */}
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(7,11,20,0.92) 0%, rgba(7,11,20,0.4) 35%, transparent 65%)" }} />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: isVertical ? "center" : "flex-start",
          padding: isVertical ? "0 40px 64px" : "0 80px 72px",
        }}
      >
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 600,
            fontSize: isVertical ? 32 : 36,
            lineHeight: 1.35,
            color: "#ffffff",
            opacity: captionOpacity,
            textAlign: isVertical ? "center" : "left",
            maxWidth: isVertical ? 720 : 840,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            padding: "16px 28px",
            borderRadius: 20,
            backdropFilter: "blur(16px)",
            border: `1px solid ${theme.accent}44`,
            boxShadow: "0 16px 36px rgba(0,0,0,0.6)",
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

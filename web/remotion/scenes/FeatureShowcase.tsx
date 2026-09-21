import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, bodyFont } from "../fonts";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import type { Theme } from "../theme";

export const FeatureShowcase: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  reverse: boolean;
  badges?: string[];
  theme: Theme;
}> = ({ eyebrow, title, description, imageUrl, reverse, badges, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Staggered entrance springs
  const cardSpring = spring({ frame: frame - 4, fps, config: { damping: 14, mass: 0.8 }, durationInFrames: 28 });
  const textSpring = spring({ frame: frame - 10, fps, config: { damping: 16, mass: 0.7 }, durationInFrames: 24 });
  const badge1Spring = spring({ frame: frame - 18, fps, config: { damping: 11, mass: 0.6 }, durationInFrames: 22 });
  const badge2Spring = spring({ frame: frame - 26, fps, config: { damping: 11, mass: 0.6 }, durationInFrames: 22 });

  // Ken Burns zoom
  const kenBurnsZoom = interpolate(frame, [0, 120], [1, 1.08], { extrapolateRight: "clamp" });
  const cardFloatY = Math.sin(frame / 25) * 8;

  const displayBadges = badges && badges.length > 0 ? badges : ["⚡ Yüksek Kalite", "✓ Doğrulanmış"];

  const titleSize = isVertical ? 50 : 66;
  const descSize = isVertical ? 24 : 28;

  const textBlock = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isVertical ? "center" : "flex-start",
        textAlign: isVertical ? "center" : "left",
        opacity: textSpring,
        transform: `translateY(${(1 - textSpring) * 28}px)`,
        maxWidth: isVertical ? 680 : 540,
        zIndex: 5,
      }}
    >
      {/* Eyebrow Step Indicator */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          padding: "6px 18px",
          borderRadius: 999,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          border: `1px solid ${theme.accent}55`,
          boxShadow: `0 4px 16px ${theme.accent}22`,
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 14,
            color: theme.accent,
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            fontFamily: bodyFont,
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "#e2e8f0",
          }}
        >
          Öne Çıkan Özellik
        </span>
      </div>

      {/* Main Title */}
      <h2
        style={{
          fontFamily: displayFont,
          fontWeight: 900,
          fontSize: titleSize,
          lineHeight: 1.1,
          color: "#ffffff",
          margin: 0,
          letterSpacing: -1.2,
          textShadow: "0 4px 0 #000, 0 8px 30px rgba(0,0,0,0.8)",
        }}
      >
        {title}
      </h2>

      {/* Description */}
      <p
        style={{
          fontFamily: bodyFont,
          fontWeight: 500,
          fontSize: descSize,
          lineHeight: 1.45,
          color: "#e2e8f0",
          marginTop: 16,
          marginBottom: 0,
          textShadow: "0 2px 10px rgba(0,0,0,0.8)",
        }}
      >
        {description}
      </p>
    </div>
  );

  const mockupCard = (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: isVertical ? 580 : 660,
        opacity: cardSpring,
        transform: `perspective(1200px) rotateX(6deg) rotateY(${isVertical ? 0 : reverse ? -5 : 5}deg) translateY(${cardFloatY}px) scale(${0.92 + cardSpring * 0.08})`,
        filter: "drop-shadow(0 35px 60px rgba(0,0,0,0.8))",
        zIndex: 5,
      }}
    >
      {/* 3D App Window Frame */}
      <div
        style={{
          borderRadius: 24,
          overflow: "hidden",
          border: "1.5px solid rgba(255, 255, 255, 0.22)",
          backgroundColor: "#111827",
          boxShadow: `0 0 50px ${theme.accent}30`,
        }}
      >
        {/* Mac OS Window Header Bar */}
        <div
          style={{
            height: 38,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 18,
            gap: 8,
          }}
        >
          <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#27c93f" }} />
        </div>

        {/* Media Window Content with Ken Burns */}
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: isVertical ? "4/3" : "16/10", maxHeight: isVertical ? 420 : 400 }}>
          {imageUrl ? (
            <Img
              src={imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${kenBurnsZoom})`,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, ${theme.accent}33, #0f172a)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: displayFont, fontSize: 32, color: "#ffffff" }}>{title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Badge 1 (Top) */}
      {displayBadges[0] ? (
        <div
          style={{
            position: "absolute",
            top: -16,
            right: isVertical ? 16 : -24,
            opacity: badge1Spring,
            transform: `scale(${badge1Spring}) rotate(3deg)`,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: `2px solid ${theme.accent}`,
            borderRadius: 999,
            padding: "8px 20px",
            color: "#ffffff",
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: isVertical ? 15 : 18,
            boxShadow: `0 14px 34px rgba(0,0,0,0.7), 0 0 24px ${theme.accent}66`,
            backdropFilter: "blur(14px)",
            zIndex: 10,
          }}
        >
          {displayBadges[0]}
        </div>
      ) : null}

      {/* Floating Badge 2 (Bottom) */}
      {displayBadges[1] ? (
        <div
          style={{
            position: "absolute",
            bottom: -18,
            left: isVertical ? 20 : -20,
            opacity: badge2Spring,
            transform: `scale(${badge2Spring}) rotate(-3deg)`,
            backgroundColor: theme.accent,
            borderRadius: 999,
            padding: "8px 22px",
            color: "#ffffff",
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: isVertical ? 15 : 18,
            boxShadow: `0 16px 36px ${theme.accent}77, 0 0 30px ${theme.accent}55`,
            zIndex: 10,
          }}
        >
          {displayBadges[1]}
        </div>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AtmosphericBackground theme={theme} />

      {/* Full-bleed ambient B-roll backdrop in vertical format */}
      {isVertical && imageUrl ? (
        <AbsoluteFill style={{ opacity: 0.28, pointerEvents: "none" }}>
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(40px) brightness(0.4)",
              transform: `scale(${kenBurnsZoom * 1.05})`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {isVertical ? (
        <AbsoluteFill
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 48px",
            gap: 40,
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>{mockupCard}</div>
          {textBlock}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            flexDirection: reverse ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 90px",
            gap: 70,
          }}
        >
          <div style={{ flex: "0 0 44%", display: "flex", justifyContent: "center" }}>{textBlock}</div>
          <div style={{ flex: "1 1 56%", display: "flex", justifyContent: "center" }}>{mockupCard}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

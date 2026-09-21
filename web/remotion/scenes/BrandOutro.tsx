import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Circle } from "@remotion/rough-notation";
import { ding } from "@remotion/sfx";
import { displayFont, bodyFont } from "../fonts";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import type { Theme } from "../theme";

const CTA_START_FRAME = 48;

export const BrandOutro: React.FC<{
  brandName: string;
  logoUrl: string | null;
  tagline: string;
  ctaLabel: string | null;
  theme: Theme;
}> = ({ brandName, logoUrl, tagline, ctaLabel, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Staggered entrances
  const markSpring = spring({ frame, fps, config: { damping: 14, mass: 0.6 }, durationInFrames: 24 });
  const taglineOpacity = interpolate(frame - 18, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaSpring = spring({ frame: frame - CTA_START_FRAME, fps, config: { damping: 12, mass: 0.6 }, durationInFrames: 24 });
  const circleProgress = interpolate(frame - 24, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Expanding beacon ring on CTA entrance
  const ringProgress = interpolate(frame - CTA_START_FRAME, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringScale = 1 + ringProgress * 0.4;
  const ringOpacity = (1 - ringProgress) * 0.6;

  const pulse = 1 + Math.sin(Math.max(frame - (CTA_START_FRAME + 24), 0) / 12) * 0.024;

  const nameSize = isVertical ? 48 : 58;
  const taglineSize = isVertical ? 26 : 30;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 56px", textAlign: "center" }}>

        {/* Brand Logo & Name Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: markSpring,
            transform: `scale(${0.85 + markSpring * 0.15})`,
            marginBottom: 28,
          }}
        >
          {logoUrl ? (
            <div
              style={{
                padding: "12px 24px",
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Img src={logoUrl} style={{ height: isVertical ? 68 : 80, maxWidth: 340, objectFit: "contain" }} />
            </div>
          ) : null}

          <Circle color={theme.accent} padding={{ top: 8, bottom: 8, left: 18, right: 18 }} progress={circleProgress}>
            <span
              style={{
                fontFamily: displayFont,
                fontWeight: 900,
                fontSize: nameSize,
                color: "#ffffff",
                letterSpacing: -1,
                textShadow: "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {brandName}
            </span>
          </Circle>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 400,
            fontSize: taglineSize,
            lineHeight: 1.4,
            color: "#cbd5e1",
            opacity: taglineOpacity,
            marginTop: 4,
            maxWidth: isVertical ? 640 : 840,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          }}
        >
          {tagline}
        </div>

        {/* Action Button */}
        {ctaLabel ? (
          <div style={{ position: "relative", marginTop: 44 }}>
            {/* Pulsing Beacon Ring */}
            {ringProgress > 0 && ringProgress < 1 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  border: `2px solid ${theme.accent}`,
                  transform: `scale(${ringScale})`,
                  opacity: ringOpacity,
                  pointerEvents: "none",
                }}
              />
            ) : null}

            {/* Elevated Pill Button */}
            <div
              style={{
                opacity: ctaSpring,
                transform: `scale(${(0.88 + ctaSpring * 0.12) * pulse})`,
                backgroundColor: theme.accent,
                borderRadius: 999,
                padding: isVertical ? "20px 48px" : "24px 64px",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                boxShadow: `0 16px 40px ${theme.accent}77, 0 0 45px ${theme.accent}44`,
              }}
            >
              <span
                style={{
                  fontFamily: displayFont,
                  fontWeight: 800,
                  fontSize: isVertical ? 28 : 34,
                  color: "#ffffff",
                  letterSpacing: -0.5,
                }}
              >
                {ctaLabel}
              </span>
              <span style={{ fontSize: isVertical ? 26 : 32, color: "#ffffff", transform: "translateY(-1px)" }}>→</span>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      {ctaLabel ? (
        <Sequence from={CTA_START_FRAME} layout="none">
          <Audio src={ding} volume={0.4} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

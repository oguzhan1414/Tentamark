import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, bodyFont } from "../fonts";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import type { Theme } from "../theme";

// Parses strings like "%100", "10.000+", "4.9", "3x" into animatable components
function parseNumericHeadline(headline: string) {
  const match = headline.match(/^([^\d]*)(\d+(?:[.,]\d+)?)([^\d]*)$/);
  if (!match) return null;
  const prefix = match[1] || "";
  const rawNum = match[2].replace(",", ".");
  const isDecimal = rawNum.includes(".");
  const targetVal = parseFloat(rawNum);
  const suffix = match[3] || "";
  return { prefix, targetVal, suffix, isDecimal };
}

export const StatCallout: React.FC<{
  headline: string;
  supporting: string;
  theme: Theme;
}> = ({ headline, supporting, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const headlineSpring = spring({ frame, fps, config: { damping: 14, mass: 0.6 }, durationInFrames: 26 });
  const supportOpacity = interpolate(frame - 20, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barWidth = interpolate(frame - 8, [0, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const parsed = parseNumericHeadline(headline.trim());

  let renderedHeadline = headline;
  if (parsed && !isNaN(parsed.targetVal)) {
    const progress = interpolate(frame, [0, 32], [0, 1], {
      extrapolateRight: "clamp",
    });
    const currentVal = parsed.targetVal * progress;
    const formattedNum = parsed.isDecimal ? currentVal.toFixed(1) : Math.round(currentVal).toLocaleString("tr-TR");
    renderedHeadline = `${parsed.prefix}${formattedNum}${parsed.suffix}`;
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AtmosphericBackground theme={theme} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: isVertical ? "0 48px" : "0 140px",
          textAlign: "center",
        }}
      >
        {/* Metric Category Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
            padding: "6px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: `1px solid ${theme.accent}44`,
            opacity: headlineSpring,
            transform: `translateY(${(1 - headlineSpring) * -12}px)`,
          }}
        >
          <span style={{ fontSize: 13, color: theme.accent }}>✦</span>
          <span
            style={{
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#e2e8f0",
            }}
          >
            Kanıtlanmış Performans
          </span>
        </div>

        {/* Big Animated Counter */}
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: isVertical ? 102 : 136,
            lineHeight: 1.0,
            color: theme.accent,
            opacity: headlineSpring,
            transform: `scale(${0.85 + headlineSpring * 0.15})`,
            letterSpacing: -2,
            textShadow: `0 10px 40px ${theme.accent}55, 0 0 80px ${theme.accent}22`,
          }}
        >
          {renderedHeadline}
        </div>

        {/* Animated Accent Underline / Progress Bar */}
        <div
          style={{
            width: isVertical ? 240 : 320,
            height: 6,
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            marginTop: 20,
            marginBottom: 24,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${barWidth * 100}%`,
              height: "100%",
              backgroundColor: theme.accent,
              boxShadow: `0 0 16px ${theme.accent}`,
              borderRadius: 999,
            }}
          />
        </div>

        {/* Supporting Explanation */}
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 500,
            fontSize: isVertical ? 28 : 34,
            lineHeight: 1.38,
            color: "#ffffff",
            opacity: supportOpacity,
            maxWidth: isVertical ? 600 : 840,
            textShadow: "0 4px 16px rgba(0,0,0,0.6)",
          }}
        >
          {supporting}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

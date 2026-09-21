import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, bodyFont } from "../fonts";
import type { Theme } from "../theme";

export const WrappedShowcase: React.FC<{
  headline: string;
  metricValue: string;
  metricLabel: string;
  comparisonText: string;
  theme: Theme;
}> = ({ headline, metricValue, metricLabel, comparisonText, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const headerSpring = spring({ frame, fps, config: { damping: 14, mass: 0.6 }, durationInFrames: 22 });
  const numberSpring = spring({ frame: frame - 6, fps, config: { damping: 12, mass: 0.5 }, durationInFrames: 26 });
  const pillSpring = spring({ frame: frame - 16, fps, config: { damping: 11, mass: 0.5 }, durationInFrames: 22 });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? "40px 32px" : "40px 100px",
        textAlign: "center",
      }}
    >
      {/* Category Pill */}
      <div
        style={{
          opacity: headerSpring,
          transform: `translateY(${(1 - headerSpring) * -16}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 24px",
          borderRadius: 999,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          border: "1.5px solid rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(16px)",
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 16 }}>📊</span>
        <span
          style={{
            fontFamily: bodyFont,
            fontWeight: 800,
            fontSize: isVertical ? 15 : 18,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#ffffff",
          }}
        >
          {headline}
        </span>
      </div>

      {/* Main Metric Value Card */}
      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 660 : 800,
          opacity: numberSpring,
          transform: `scale(${0.88 + numberSpring * 0.12})`,
          padding: isVertical ? "40px 28px" : "48px 40px",
          borderRadius: 36,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
          border: "2px solid rgba(34, 197, 94, 0.4)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.7), 0 0 50px rgba(34, 197, 94, 0.25)",
          backdropFilter: "blur(28px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Giant Number */}
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 900,
            fontSize: isVertical ? 96 : 124,
            lineHeight: 0.95,
            color: "#22c55e", // Electric neon green
            letterSpacing: -2,
            textShadow: "0 0 35px rgba(34, 197, 94, 0.7), 0 0 70px rgba(34, 197, 94, 0.3)",
          }}
        >
          {metricValue}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: isVertical ? 32 : 40,
            color: "#ffffff",
            letterSpacing: -0.5,
          }}
        >
          {metricLabel}
        </div>

        {/* Trending / Comparison Tag */}
        <div
          style={{
            opacity: pillSpring,
            transform: `scale(${pillSpring})`,
            marginTop: 14,
            padding: "8px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(34, 197, 94, 0.25)",
            border: "1px solid rgba(34, 197, 94, 0.6)",
            color: "#4ade80",
            fontFamily: bodyFont,
            fontWeight: 700,
            fontSize: isVertical ? 16 : 18,
            boxShadow: "0 6px 20px rgba(34, 197, 94, 0.3)",
          }}
        >
          {comparisonText}
        </div>
      </div>
    </AbsoluteFill>
  );
};

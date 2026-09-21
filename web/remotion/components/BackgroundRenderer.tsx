import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Theme } from "../theme";
import type { BackgroundTheme } from "../../src/lib/video/types";

export const BackgroundRenderer: React.FC<{
  theme: Theme;
  backgroundTheme?: BackgroundTheme;
}> = ({ theme, backgroundTheme = "tech_slate" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Floating physics
  const orb1X = Math.sin(frame / 38) * 80;
  const orb1Y = Math.cos(frame / 48) * 60;
  const orb2X = Math.cos(frame / 42) * 70;
  const orb2Y = Math.sin(frame / 52) * 50;

  if (backgroundTheme === "warm_luxury") {
    // E-Commerce / Luxury / Coffee / Lifestyle: Warm amber, deep espresso, and gold studio lighting
    const amberPulse = 1 + Math.sin(frame / 35) * 0.08;
    return (
      <AbsoluteFill style={{ backgroundColor: "#0e0907", overflow: "hidden" }}>
        {/* Warm golden-amber center spotlight */}
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "20%",
            width: Math.min(width, height) * 0.85,
            height: Math.min(width, height) * 0.85,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.12) 50%, transparent 75%)",
            filter: "blur(90px)",
            transform: `translate(${orb1X}px, ${orb1Y}px) scale(${amberPulse})`,
            pointerEvents: "none",
          }}
        />

        {/* Secondary warm rose/copper tone */}
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "15%",
            width: Math.min(width, height) * 0.75,
            height: Math.min(width, height) * 0.75,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234, 88, 12, 0.22) 0%, rgba(180, 83, 9, 0.08) 55%, transparent 75%)",
            filter: "blur(110px)",
            transform: `translate(${orb2X}px, ${orb2Y}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Subtle warm luxury grain & vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 45%, rgba(10, 6, 4, 0.85) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (backgroundTheme === "wrapped_neon") {
    // Spotify Wrapped Style: Electric duotone neon violet, green, and cyan with dynamic motion
    const neonWave = Math.sin(frame / 20) * 40;
    return (
      <AbsoluteFill style={{ backgroundColor: "#0b061a", overflow: "hidden" }}>
        {/* Electric Violet/Purple Orb */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: Math.min(width, height) * 0.8,
            height: Math.min(width, height) * 0.8,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.38) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%)",
            filter: "blur(85px)",
            transform: `translate(${orb1X}px, ${orb1Y + neonWave}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Electric Lime/Cyan Neon Orb */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: Math.min(width, height) * 0.8,
            height: Math.min(width, height) * 0.8,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.32) 0%, rgba(6, 182, 212, 0.14) 50%, transparent 75%)",
            filter: "blur(95px)",
            transform: `translate(${orb2X}px, ${orb2Y - neonWave}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Dynamic geometric contour lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-radial-gradient(circle at 50% 50%, transparent, transparent 40px, rgba(255, 255, 255, 0.03) 41px, transparent 42px)",
            transform: `scale(${1 + Math.sin(frame / 45) * 0.05})`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 40%, rgba(8, 4, 18, 0.8) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (backgroundTheme === "clean_trust") {
    // Social Proof / Reviews: Clean, trustworthy frosted glass slate studio
    return (
      <AbsoluteFill style={{ backgroundColor: "#080d17", overflow: "hidden" }}>
        {/* Soft daylight studio reflection */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "25%",
            width: Math.min(width, height) * 0.75,
            height: Math.min(width, height) * 0.75,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 75%)",
            filter: "blur(80px)",
            transform: `translate(${orb1X * 0.6}px, ${orb1Y * 0.6}px)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "20%",
            width: Math.min(width, height) * 0.7,
            height: Math.min(width, height) * 0.7,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.accent}24 0%, transparent 70%)`,
            filter: "blur(100px)",
            transform: `translate(${orb2X * 0.6}px, ${orb2Y * 0.6}px)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 50%, rgba(5, 8, 15, 0.82) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (backgroundTheme === "flash_urgency") {
    // Flash Sale / Limited Offer: Fiery crimson and amber urgency pulse
    const urgencyPulse = 1 + Math.sin(frame / 14) * 0.12;
    return (
      <AbsoluteFill style={{ backgroundColor: "#150406", overflow: "hidden" }}>
        {/* Pulsing fiery red core */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "20%",
            width: Math.min(width, height) * 0.8,
            height: Math.min(width, height) * 0.8,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.38) 0%, rgba(220, 38, 38, 0.15) 50%, transparent 75%)",
            filter: "blur(85px)",
            transform: `translate(${orb1X}px, ${orb1Y}px) scale(${urgencyPulse})`,
            pointerEvents: "none",
          }}
        />

        {/* Amber hot sparks aura */}
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "15%",
            width: Math.min(width, height) * 0.75,
            height: Math.min(width, height) * 0.75,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 75%)",
            filter: "blur(100px)",
            transform: `translate(${orb2X}px, ${orb2Y}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Speed vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 40%, rgba(16, 2, 4, 0.9) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }

  // Default: tech_slate (Tech grid, cyan/violet ambient lighting)
  return (
    <AbsoluteFill style={{ backgroundColor: "#070b14", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "25%",
          width: Math.min(width, height) * 0.75,
          height: Math.min(width, height) * 0.75,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accent}33 0%, ${theme.accent}05 60%, transparent 80%)`,
          filter: "blur(90px)",
          transform: `translate(${orb1X}px, ${orb1Y}px)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "20%",
          width: Math.min(width, height) * 0.7,
          height: Math.min(width, height) * 0.7,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 75%)",
          filter: "blur(100px)",
          transform: `translate(${orb2X}px, ${orb2Y}px)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "36px 36px",
          backgroundPosition: `${frame * 0.2}px ${frame * 0.2}px`,
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.1) 80%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.1) 80%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 55%, rgba(4, 7, 13, 0.75) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

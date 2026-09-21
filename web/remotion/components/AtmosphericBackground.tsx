import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Theme } from "../theme";

export const AtmosphericBackground: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Floating orb physics: gentle, continuous non-linear drift
  const orb1X = Math.sin(frame / 38) * 80;
  const orb1Y = Math.cos(frame / 48) * 60;
  const orb2X = Math.cos(frame / 42) * 70;
  const orb2Y = Math.sin(frame / 52) * 50;

  return (
    <AbsoluteFill style={{ backgroundColor: "#070b14", overflow: "hidden" }}>
      {/* Primary brand accent glow */}
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

      {/* Secondary atmospheric cyan/violet glow */}
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

      {/* Modern technical dot grid with radial fade mask */}
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

      {/* Subtle vignette border */}
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

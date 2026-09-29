import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { organicDrift } from "../organicDrift";
import type { Theme } from "../theme";

// Two structurally distinct treatments — NOT just recolors of the same
// twin-circle layout — so scenes that render this on top of the global
// BackgroundRenderer read as different moments rather than the same
// template repeating. Both are transparent-based (no opaque fill) so the
// chosen backgroundTheme underneath still shows through.
export const AtmosphericBackground: React.FC<{ theme: Theme; variant?: "orbit" | "diagonal" }> = ({
  theme,
  variant = "orbit",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  if (variant === "diagonal") {
    const sweepShift = (frame * 0.35) % 340;

    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {/* One large, off-center accent blob instead of two symmetric corner circles */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-12%",
            width: Math.min(width, height) * 0.95,
            height: Math.min(width, height) * 0.95,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.accent}2e 0%, ${theme.accent}08 55%, transparent 78%)`,
            filter: "blur(110px)",
            pointerEvents: "none",
          }}
        />

        {/* Moving diagonal light band, the "diagonal" signature */}
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background: `linear-gradient(115deg, transparent ${sweepShift - 30}%, rgba(255,255,255,0.05) ${sweepShift}%, transparent ${sweepShift + 30}%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 55%, rgba(4, 7, 13, 0.55) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }

  // "orbit" — floating twin-orb physics, kept for scenes that want the
  // calmer symmetric look, but no longer paints an opaque backdrop.
  const orb1X = organicDrift("atmo-orb1x", frame, 1 / 38, 80);
  const orb1Y = organicDrift("atmo-orb1y", frame, 1 / 48, 60);
  const orb2X = organicDrift("atmo-orb2x", frame, 1 / 42, 70);
  const orb2Y = organicDrift("atmo-orb2y", frame, 1 / 52, 50);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "25%",
          width: Math.min(width, height) * 0.75,
          height: Math.min(width, height) * 0.75,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accent}2b 0%, ${theme.accent}05 60%, transparent 80%)`,
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
            "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 75%)",
          filter: "blur(100px)",
          transform: `translate(${orb2X}px, ${orb2Y}px)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.1) 1.2px, transparent 1.2px)",
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
          background: "radial-gradient(circle at center, transparent 55%, rgba(4, 7, 13, 0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, bodyFont } from "../fonts";

export const IOSNotificationBanner: React.FC<{
  title?: string;
  message: string;
  appName?: string;
  delayFrames?: number;
  accentColor: string;
}> = ({
  title = "Yeni Müşteri Değerlendirmesi",
  message,
  appName = "INSTAGRAM",
  delayFrames = 12,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const slideSpring = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 14, mass: 0.7 },
    durationInFrames: 24,
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: isVertical ? 580 : 640,
        opacity: slideSpring,
        transform: `translateY(${(1 - slideSpring) * -60}px) scale(${0.92 + slideSpring * 0.08})`,
        borderRadius: 24,
        padding: "16px 22px",
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 24px 50px -10px rgba(0,0,0,0.7), 0 0 25px rgba(255,255,255,0.06)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        marginBottom: isVertical ? 24 : 32,
      }}
    >
      {/* Top Bar: Icon + App Name + Time */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Mock App Icon */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            {appName}
          </span>
        </div>
        <span style={{ fontFamily: bodyFont, fontSize: 13, color: "#64748b" }}>Şimdi</span>
      </div>

      {/* Notification Title & Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: isVertical ? 17 : 19,
            color: "#ffffff",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 400,
            fontSize: isVertical ? 15 : 17,
            lineHeight: 1.35,
            color: "#cbd5e1",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";
import { ding } from "@remotion/sfx";
import { displayFont } from "../fonts";
import type { Theme } from "../theme";

export interface UGCSplitShowcaseProps {
  topVideoUrl?: string; // e.g. "video/3.mp4" or "video/11.mp4"
  topImageUrl?: string;
  badgeText?: string;
  title: string;
  price: string;
  oldPrice?: string;
  discountBadge?: string;
  rating?: string;
  bullets?: string[];
  ctaLabel?: string;
  theme: Theme;
}

export const UGCSplitShowcase: React.FC<UGCSplitShowcaseProps> = ({
  topVideoUrl = "video/3.mp4",
  topImageUrl,
  badgeText = "🔥 EN ÇOK TERCİH EDİLEN",
  title,
  price,
  oldPrice,
  discountBadge = "-28% İNDİRİM",
  rating = "★★★★★ 4.9 (500+ Yorum)",
  bullets = ["⚡ Aynı Gün Kargo", "☕ %100 Taze Arabica"],
  ctaLabel = "Sipariş Ver",
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for bottom card
  const cardSlide = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 140 },
  });

  // Badge pop spring
  const badgePop = spring({
    frame: frame - 18,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 200 },
  });

  // Continuous micro zoom on top video
  const videoScale = interpolate(frame, [0, 180], [1.0, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsating CTA button
  const ctaPulse = 1 + Math.sin(frame * 0.15) * 0.03;

  const resolvedVideoSrc =
    topVideoUrl.startsWith("http") || topVideoUrl.startsWith("blob:")
      ? topVideoUrl
      : staticFile(topVideoUrl);

  return (
    <AbsoluteFill style={{ backgroundColor: "#090B10", overflow: "hidden" }}>
      {/* SFX Ding on price pop */}
      {frame === 20 && <Audio src={ding} volume={0.4} />}

      {/* TOP SECTION: 55% Cinematic Video */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "56%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${videoScale})`,
            transformOrigin: "center center",
          }}
        >
          {topVideoUrl ? (
            <Video
              src={resolvedVideoSrc}
              loop
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : topImageUrl ? (
            <img
              src={topImageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>

        {/* Cinematic Vignette on Top Video */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 65%, rgba(9,11,16,0.95) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Urgency Badge */}
        {badgeText && (
          <div
            style={{
              position: "absolute",
              top: 54,
              left: 32,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${theme.accent}66`,
              padding: "8px 18px",
              borderRadius: 30,
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 4px 20px ${theme.accent}33`,
            }}
          >
            <span style={{ color: theme.accent }}>{badgeText}</span>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: 44% High-Conversion Glassmorphic Product Card */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "46%",
          padding: "36px 36px 48px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, rgba(14,18,26,0.94) 0%, rgba(8,10,15,0.99) 100%)",
          borderTop: `2px solid ${theme.accent}44`,
          boxShadow: "0 -20px 50px rgba(0,0,0,0.8)",
          transform: `translateY(${(1 - cardSlide) * 120}px)`,
          opacity: cardSlide,
        }}
      >
        {/* Title and Rating */}
        <div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: -0.5,
              lineHeight: 1.15,
              marginBottom: 10,
              fontFamily: displayFont,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 15,
              fontWeight: 700,
              color: "#FACC15",
            }}
          >
            <span>{rating}</span>
          </div>
        </div>

        {/* Pricing & Discount Row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: theme.accent,
              letterSpacing: -1,
            }}
          >
            {price}
          </span>
          {oldPrice && (
            <span
              style={{
                fontSize: 24,
                color: "#6B7280",
                textDecoration: "line-through",
                fontWeight: 600,
              }}
            >
              {oldPrice}
            </span>
          )}
          {discountBadge && (
            <div
              style={{
                transform: `scale(${badgePop})`,
                background: "#DC2626",
                color: "#FFFFFF",
                padding: "6px 14px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 0.5,
                boxShadow: "0 4px 16px rgba(220, 38, 38, 0.4)",
              }}
            >
              {discountBadge}
            </div>
          )}
        </div>

        {/* Bullets */}
        {bullets && bullets.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {bullets.map((b, i) => (
              <span
                key={i}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "6px 14px",
                  borderRadius: 20,
                  color: "#E5E7EB",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${ctaPulse})`,
            width: "100%",
            background: `linear-gradient(135deg, ${theme.accent} 0%, #FFFFFF 160%)`,
            color: "#0F172A",
            padding: "18px 24px",
            borderRadius: 18,
            fontWeight: 800,
            fontSize: 20,
            textAlign: "center",
            boxShadow: `0 12px 30px ${theme.accent}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span>{ctaLabel}</span>
          <span style={{ fontSize: 22 }}>👉</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, bodyFont } from "../fonts";
import type { Theme } from "../theme";

export const ProductShowcase: React.FC<{
  title: string;
  price: string;
  oldPrice?: string;
  discountBadge?: string;
  imageUrl: string;
  rating?: string;
  badges?: string[];
  theme: Theme;
}> = ({
  title,
  price,
  oldPrice,
  discountBadge = "-30%",
  imageUrl,
  rating = "★ 4.9 (420+ İnceleme)",
  badges = ["⚡ Hızlı Kargo", "✓ %100 Orijinal"],
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const cardSpring = spring({ frame: frame - 4, fps, config: { damping: 14, mass: 0.8 }, durationInFrames: 26 });
  const priceSpring = spring({ frame: frame - 16, fps, config: { damping: 12, mass: 0.6 }, durationInFrames: 22 });
  const badgeSpring = spring({ frame: frame - 22, fps, config: { damping: 11, mass: 0.5 }, durationInFrames: 20 });

  const kenBurnsZoom = interpolate(frame, [0, 120], [1, 1.08], { extrapolateRight: "clamp" });
  const floatY = Math.sin(frame / 22) * 8;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Full-bleed ambient blurred backdrop */}
      {imageUrl ? (
        <AbsoluteFill style={{ opacity: 0.35, pointerEvents: "none" }}>
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(45px) brightness(0.45)",
              transform: `scale(${kenBurnsZoom * 1.06})`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          padding: isVertical ? "50px 36px" : "0 80px",
          gap: isVertical ? 32 : 64,
        }}
      >
        {/* 3D Product Image Card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: isVertical ? 520 : 600,
            opacity: cardSpring,
            transform: `perspective(1200px) rotateX(6deg) rotateY(${isVertical ? 0 : 5}deg) translateY(${floatY}px) scale(${0.92 + cardSpring * 0.08})`,
            filter: "drop-shadow(0 35px 60px rgba(0,0,0,0.85))",
            zIndex: 5,
          }}
        >
          {/* Glowing Product Container */}
          <div
            style={{
              borderRadius: 28,
              overflow: "hidden",
              border: "1.5px solid rgba(255, 255, 255, 0.22)",
              backgroundColor: "rgba(23, 15, 10, 0.8)",
              boxShadow: `0 0 60px rgba(245, 158, 11, 0.25)`,
            }}
          >
            <div style={{ position: "relative", overflow: "hidden", aspectRatio: isVertical ? "1/1" : "16/11", maxHeight: 440 }}>
              <Img
                src={imageUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${kenBurnsZoom})`,
                }}
              />
            </div>
          </div>

          {/* Discount Badge (Top-Right) */}
          {discountBadge ? (
            <div
              style={{
                position: "absolute",
                top: -16,
                right: isVertical ? 16 : -20,
                opacity: badgeSpring,
                transform: `scale(${badgeSpring}) rotate(4deg)`,
                backgroundColor: "#ef4444",
                borderRadius: 999,
                padding: "8px 22px",
                color: "#ffffff",
                fontFamily: displayFont,
                fontWeight: 900,
                fontSize: isVertical ? 18 : 22,
                boxShadow: "0 12px 30px rgba(239, 68, 68, 0.7), 0 0 25px rgba(239, 68, 68, 0.5)",
                zIndex: 10,
              }}
            >
              {discountBadge}
            </div>
          ) : null}

          {/* Star Rating Badge (Bottom-Left) */}
          <div
            style={{
              position: "absolute",
              bottom: -16,
              left: isVertical ? 16 : -16,
              opacity: badgeSpring,
              transform: `scale(${badgeSpring}) rotate(-2deg)`,
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1.5px solid rgba(245, 158, 11, 0.8)",
              borderRadius: 999,
              padding: "8px 20px",
              color: "#fbbf24",
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: isVertical ? 15 : 18,
              boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
              zIndex: 10,
            }}
          >
            {rating}
          </div>
        </div>

        {/* Product Details & Pricing Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isVertical ? "center" : "flex-start",
            textAlign: isVertical ? "center" : "left",
            maxWidth: isVertical ? 600 : 500,
            zIndex: 5,
          }}
        >
          {/* Product Title */}
          <h2
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontSize: isVertical ? 48 : 58,
              lineHeight: 1.12,
              color: "#ffffff",
              margin: "0 0 16px 0",
              letterSpacing: -1,
              textShadow: "0 4px 0 #000, 0 8px 30px rgba(0,0,0,0.8)",
            }}
          >
            {title}
          </h2>

          {/* Pricing Box */}
          <div
            style={{
              opacity: priceSpring,
              transform: `translateY(${(1 - priceSpring) * 20}px)`,
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 20,
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              padding: "10px 24px",
              borderRadius: 20,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(16px)",
            }}
          >
            <span
              style={{
                fontFamily: displayFont,
                fontWeight: 900,
                fontSize: isVertical ? 52 : 62,
                color: theme.accent,
                letterSpacing: -1,
                textShadow: `0 0 20px ${theme.accent}66`,
              }}
            >
              {price}
            </span>
            {oldPrice ? (
              <span
                style={{
                  fontFamily: displayFont,
                  fontWeight: 600,
                  fontSize: isVertical ? 26 : 30,
                  color: "#94a3b8",
                  textDecoration: "line-through",
                  opacity: 0.8,
                }}
              >
                {oldPrice}
              </span>
            ) : null}
          </div>

          {/* Feature Badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: isVertical ? "center" : "flex-start",
              gap: 10,
            }}
          >
            {badges.map((b, idx) => (
              <div
                key={idx}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#e2e8f0",
                  fontFamily: bodyFont,
                  fontWeight: 700,
                  fontSize: 15,
                  backdropFilter: "blur(12px)",
                }}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { uiSwitch } from "@remotion/sfx";
import { displayFont, bodyFont } from "../fonts";
import { CharacterReveal } from "../components/CharacterReveal";
import { SPRING_CARD, SPRING_BADGE, TEMPO_MAP, tempoSpring, entranceBlur } from "../springs";
import { radiusForShape, borderForShape, shadowForShape, filterForImagery } from "../designSystemStyles";
import { organicDrift } from "../organicDrift";
import type { Theme } from "../theme";

export const ProductShowcase: React.FC<{
  title: string;
  price: string;
  oldPrice?: string;
  discountBadge?: string;
  imageUrl?: string;
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
  const resolvedImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";

  const cardSpring = spring({ frame: frame - 4, fps, config: tempoSpring(SPRING_CARD, TEMPO_MAP.product), durationInFrames: 26 });
  const priceSpring = spring({ frame: frame - 16, fps, config: SPRING_BADGE, durationInFrames: 22 });
  const badgeSpring = spring({ frame: frame - 22, fps, config: SPRING_BADGE, durationInFrames: 20 });

  const kenBurnsZoom = interpolate(frame, [0, 120], [1, 1.08], { extrapolateRight: "clamp" });
  const floatY = organicDrift("product-float", frame, 1 / 22, 8);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Full-bleed ambient blurred backdrop */}
      {resolvedImageUrl ? (
        <AbsoluteFill style={{ opacity: 0.35, pointerEvents: "none" }}>
          <Img
            src={resolvedImageUrl}
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
          {/* Glowing Product Container — shape/border now follow the brand's own archetype instead of one fixed look */}
          <div
            style={{
              borderRadius: radiusForShape(theme.shape),
              overflow: "hidden",
              border: borderForShape(theme.shape, theme.accent),
              backgroundColor: "rgba(23, 15, 10, 0.8)",
              boxShadow: shadowForShape(theme.shape, theme.accent),
            }}
          >
            <div style={{ position: "relative", overflow: "hidden", aspectRatio: isVertical ? "1/1" : "16/11" }}>
              {resolvedImageUrl ? (
                <Img
                  src={resolvedImageUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: filterForImagery(theme.imagery),
                    transform: `scale(${kenBurnsZoom})`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 18,
                    padding: 36,
                    textAlign: "center",
                    background: `radial-gradient(circle at 50% 35%, ${theme.accent}66, transparent 42%), linear-gradient(145deg, #243047, #0f172a)`,
                  }}
                >
                  <div
                    style={{
                      width: isVertical ? 150 : 170,
                      height: isVertical ? 150 : 170,
                      borderRadius: 40,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: `${theme.accent}22`,
                      border: `2px solid ${theme.accent}99`,
                      color: theme.accent,
                      fontFamily: displayFont,
                      fontSize: isVertical ? 64 : 72,
                      fontWeight: 900,
                      boxShadow: `0 20px 50px ${theme.accent}33`,
                    }}
                  >
                    {title.trim().charAt(0).toLocaleUpperCase("tr-TR") || "✦"}
                  </div>
                  <span
                    style={{
                      maxWidth: "85%",
                      color: "#ffffff",
                      fontFamily: displayFont,
                      fontWeight: 800,
                      fontSize: isVertical ? 28 : 32,
                      lineHeight: 1.15,
                    }}
                  >
                    {title}
                  </span>
                </div>
              )}
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
                filter: entranceBlur(badgeSpring),
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
          {/* Product Title — punchy per-character pop, matches this scene's "climax" tempo */}
          <CharacterReveal
            text={title}
            startFrame={6}
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontSize: isVertical ? 48 : 58,
              lineHeight: 1.12,
              color: "#ffffff",
              letterSpacing: -1,
              textShadow: "0 4px 0 #000, 0 8px 30px rgba(0,0,0,0.8)",
            }}
            wrapperStyle={{ justifyContent: isVertical ? "center" : "flex-start", marginBottom: 16 }}
          />

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

      {discountBadge ? (
        <Sequence from={22} layout="none">
          <Audio src={uiSwitch} volume={0.3} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

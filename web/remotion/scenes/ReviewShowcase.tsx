import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont, bodyFont } from "../fonts";
import type { Theme } from "../theme";

export const ReviewShowcase: React.FC<{
  quote: string;
  authorName: string;
  ratingStars?: number;
  verifiedBuyer?: boolean;
  theme: Theme;
}> = ({
  quote,
  authorName,
  ratingStars = 5,
  verifiedBuyer = true,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const cardSpring = spring({ frame: frame - 4, fps, config: { damping: 14, mass: 0.7 }, durationInFrames: 24 });
  const quoteSpring = spring({ frame: frame - 18, fps, config: { damping: 16, mass: 0.7 }, durationInFrames: 22 });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? "40px 32px" : "40px 100px",
        textAlign: "center",
      }}
    >
      {/* 5 Gold Stars with Staggered Entrance */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isVertical ? 10 : 14,
          marginBottom: isVertical ? 24 : 32,
        }}
      >
        {Array.from({ length: ratingStars }).map((_, i) => {
          const starDelay = 8 + i * 5;
          const starSpring = spring({
            frame: frame - starDelay,
            fps,
            config: { damping: 11, mass: 0.5 },
            durationInFrames: 18,
          });

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: isVertical ? 42 : 52,
                color: "#fbbf24",
                opacity: starSpring,
                transform: `scale(${starSpring * 1.1}) translateY(${(1 - starSpring) * -20}px)`,
                textShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
              }}
            >
              ★
            </span>
          );
        })}
      </div>

      {/* Glassmorphic Review Card */}
      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 680 : 860,
          opacity: cardSpring,
          transform: `scale(${0.92 + cardSpring * 0.08}) translateY(${(1 - cardSpring) * 25}px)`,
          padding: isVertical ? "36px 28px" : "44px 48px",
          borderRadius: 32,
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          border: "1.5px solid rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: `0 30px 60px rgba(0,0,0,0.7), 0 0 30px ${theme.accent}20`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Quotation Icon */}
        <span
          style={{
            fontFamily: displayFont,
            fontSize: isVertical ? 48 : 60,
            lineHeight: 0.8,
            color: theme.accent,
            opacity: 0.9,
          }}
        >
          “
        </span>

        {/* Customer Quote Text */}
        <p
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: isVertical ? 32 : 38,
            lineHeight: 1.35,
            color: "#ffffff",
            margin: 0,
            opacity: quoteSpring,
            letterSpacing: -0.5,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          }}
        >
          {quote}
        </p>

        {/* Author & Verified Badge Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Avatar / Initial circle */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              backgroundColor: theme.accent,
              color: "#ffffff",
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${theme.accent}66`,
            }}
          >
            {authorName.slice(0, 1).toUpperCase()}
          </div>

          <span
            style={{
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: isVertical ? 20 : 22,
              color: "#f1f5f9",
            }}
          >
            {authorName}
          </span>

          {verifiedBuyer ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 14px",
                borderRadius: 999,
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                border: "1px solid rgba(34, 197, 94, 0.6)",
                color: "#4ade80",
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 0.5,
              }}
            >
              <span>✓</span>
              <span>Doğrulanmış Alıcı</span>
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

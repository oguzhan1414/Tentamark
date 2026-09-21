import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface TikTokCommentStickerProps {
  username?: string;
  comment: string;
  likes?: string;
  avatarLetter?: string;
  avatarBg?: string;
  delayFrames?: number;
  rotation?: number; // e.g. -2.5 deg
}

export const TikTokCommentSticker: React.FC<TikTokCommentStickerProps> = ({
  username = "merve.kayaa",
  comment = "Abi bu taze kavrulmuş kahve nereden? Link var mı?",
  likes = "1.8K",
  avatarLetter = "M",
  avatarBg = "#E11D48",
  delayFrames = 5,
  rotation = -2.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance pop
  const popSpring = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });

  const opacity = interpolate(frame - delayFrames, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Micro floating motion
  const floatY = Math.sin(frame * 0.09) * 4;

  if (frame < delayFrames) return null;

  return (
    <div
      style={{
        transform: `translateY(${floatY}px) scale(${popSpring}) rotate(${rotation}deg)`,
        opacity,
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        padding: "16px 20px",
        boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.15)",
        maxWidth: 520,
        width: "90%",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        border: "1px solid rgba(255, 255, 255, 0.8)",
        color: "#111827",
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          backgroundColor: avatarBg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 18,
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {avatarLetter}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4B5563" }}>
            @{username}
          </span>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>• yanıtladı</span>
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {comment}
        </div>
      </div>

      {/* Heart & Like Count */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          paddingLeft: 6,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16 }}>❤️</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>{likes}</span>
      </div>
    </div>
  );
};

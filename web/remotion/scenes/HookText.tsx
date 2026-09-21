import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { HormoziCaptions } from "../components/HormoziCaptions";
import { IOSNotificationBanner } from "../components/IOSNotificationBanner";
import type { Theme } from "../theme";

import { TikTokCommentSticker } from "../components/TikTokCommentSticker";

export const HookText: React.FC<{
  lines: string[];
  highlightWord?: string;
  commentSticker?: {
    username?: string;
    comment: string;
    likes?: string;
    avatarLetter?: string;
    avatarBg?: string;
  };
  theme: Theme;
}> = ({ lines, highlightWord, commentSticker, theme }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isVertical = height > width;

  // Gentle Ken Burns zoom
  const cameraZoom = interpolate(frame, [0, 90], [1, 1.05], { extrapolateRight: "clamp" });

  const punchline = lines[lines.length - 1] || "";

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill

        style={{
          transform: `scale(${cameraZoom})`,
          justifyContent: "center",
          alignItems: "center",
          padding: isVertical ? "40px 32px" : "40px 80px",
        }}
      >
        {/* Viral Pattern-Interrupt: TikTok Comment Bubble or iOS Notification Banner */}
        {commentSticker ? (
          <div
            style={{
              position: "absolute",
              top: isVertical ? 90 : 40,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <TikTokCommentSticker
              username={commentSticker.username}
              comment={commentSticker.comment}
              likes={commentSticker.likes}
              avatarLetter={commentSticker.avatarLetter}
              avatarBg={commentSticker.avatarBg}
            />
          </div>
        ) : (
          <IOSNotificationBanner
            appName="INSTAGRAM"
            title="⚡ Viral Tavsiye"
            message={`"${punchline}"`}
            accentColor={theme.accent}
            delayFrames={4}
          />
        )}

        {/* Submagic / Hormozi Style Karaoke Words */}
        <div style={{ marginTop: commentSticker ? (isVertical ? 90 : 40) : 0, width: "100%" }}>
          <HormoziCaptions
            lines={lines}
            highlightWord={highlightWord}
            accentColor={theme.accent}
            startDelayFrames={14}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};


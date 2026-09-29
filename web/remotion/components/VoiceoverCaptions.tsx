import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { displayFont } from "../fonts";

const COMBINE_TOKENS_WITHIN_MS = 1200;

/*
  Top-level overlay (sibling to StoryProgressBar, rendered outside the
  TransitionSeries in Main.tsx) so it appears over EVERY scene archetype for
  free, with zero per-scene-file changes — HormoziCaptions/HookText.tsx stay
  untouched, this is additive and only mounts when a real voice-over with
  real word timing exists. Reads the global useCurrentFrame() directly (this
  component has no Sequence offset of its own), which lines up exactly with
  Caption.startMs/endMs since the voice-over <Audio> track itself starts at
  frame 0 of the whole composition.
*/
export const VoiceoverCaptions: React.FC<{ captions: Caption[]; accentColor: string }> = ({ captions, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: COMBINE_TOKENS_WITHIN_MS }),
    [captions]
  );

  const currentMs = (frame / fps) * 1000;
  const activePage = pages.find((page) => currentMs >= page.startMs && currentMs < page.startMs + page.durationMs);
  if (!activePage) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: isVertical ? 150 : 90,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 90,
        padding: "0 32px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: isVertical ? "6px 10px" : "8px 14px",
          maxWidth: isVertical ? 880 : 1300,
        }}
      >
        {activePage.tokens.map((token, i) => {
          const isActive = token.fromMs <= currentMs && token.toMs > currentMs;
          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                fontFamily: displayFont,
                fontWeight: 900,
                fontSize: isVertical ? 46 : 58,
                letterSpacing: -0.8,
                textTransform: "uppercase",
                color: isActive ? "#FACC15" : "#ffffff",
                textShadow: isActive
                  ? `0 4px 0 #000, 0 0 25px ${accentColor}88`
                  : "0 4px 0 #000, 0 6px 18px rgba(0,0,0,0.8)",
                WebkitTextStroke: "1.25px rgba(0,0,0,0.9)",
              }}
            >
              {token.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};

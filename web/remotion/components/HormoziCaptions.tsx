import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont } from "../fonts";

export const HormoziCaptions: React.FC<{
  lines: string[];
  startDelayFrames?: number;
  highlightWord?: string;
  accentColor: string;
}> = ({ lines, startDelayFrames = 6, highlightWord, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Flatten all words across lines while preserving line grouping
  const allWords = lines.flatMap((line) => line.split(/\s+/).filter(Boolean));
  const totalWords = Math.max(allWords.length, 1);

  // Each word gets active focus for a calculated number of frames
  const framesPerWord = Math.max(Math.floor(65 / totalWords), 6);

  let targetHighlight = highlightWord?.trim().toLowerCase();
  if (!targetHighlight && allWords.length > 0) {
    targetHighlight = allWords[allWords.length - 1].replace(/[.,!?:;]/g, "").toLowerCase();
  }

  let wordGlobalIndex = 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isVertical ? 14 : 20,
        textAlign: "center",
        width: "100%",
        maxWidth: isVertical ? 920 : 1200,
        padding: "0 24px",
      }}
    >
      {lines.map((line, lineIdx) => {
        const words = line.split(/\s+/).filter(Boolean);

        return (
          <div
            key={`line-${lineIdx}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: isVertical ? "10px 14px" : "14px 22px",
              lineHeight: 1.15,
            }}
          >
            {words.map((word) => {
              const currentWordIdx = wordGlobalIndex++;
              const wordStart = startDelayFrames + currentWordIdx * framesPerWord;
              const wordEnd = wordStart + framesPerWord;
              const isActive = frame >= wordStart && frame < wordEnd;
              const isPast = frame >= wordEnd;

              // Entrance spring for the word
              const entranceSpring = spring({
                frame: frame - wordStart,
                fps,
                config: { damping: 12, mass: 0.5 },
                durationInFrames: 18,
              });

              // Pop effect when active
              const popScale = isActive
                ? interpolate(frame - wordStart, [0, framesPerWord / 2, framesPerWord], [1.0, 1.25, 1.15], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : isPast
                  ? 1.0
                  : 0.9;

              const cleanWord = word.replace(/[.,!?:;]/g, "").toLowerCase();
              const isSpecialHighlight = cleanWord === targetHighlight;

              // Color logic:
              // - Active word pops in neon yellow #FACC15 or neon green #4ADE80 or brand accent
              // - Special target keyword stays in brand accent pill
              // - Other past/future words stay crisp white
              let textColor = "#ffffff";
              let backgroundColor = "transparent";
              let boxShadow = "none";
              let padding = "2px 6px";
              let borderRadius = 0;

              if (isSpecialHighlight && isPast) {
                textColor = "#ffffff";
                backgroundColor = accentColor;
                borderRadius = isVertical ? 16 : 22;
                padding = isVertical ? "6px 20px" : "8px 28px";
                boxShadow = `0 12px 36px ${accentColor}77, 0 0 35px ${accentColor}55`;
              } else if (isActive) {
                textColor = "#FACC15"; // Signature viral TikTok yellow highlight
                boxShadow = "0 0 25px rgba(250, 204, 21, 0.6)";
              }

              return (
                <span
                  key={`word-${currentWordIdx}`}
                  style={{
                    display: "inline-block",
                    fontFamily: displayFont,
                    fontWeight: 900,
                    fontSize: isVertical ? 68 : 88,
                    letterSpacing: -1.2,
                    textTransform: "uppercase",
                    color: textColor,
                    backgroundColor,
                    borderRadius,
                    padding,
                    boxShadow,
                    opacity: entranceSpring,
                    transform: `scale(${popScale * entranceSpring}) translateY(${(1 - entranceSpring) * 35}px)`,
                    textShadow:
                      isActive || isSpecialHighlight
                        ? `0 4px 0 #000, 0 8px 24px rgba(0,0,0,0.85)`
                        : `0 4px 0 #000, 0 6px 18px rgba(0,0,0,0.8)`,
                    WebkitTextStroke: "1.5px rgba(0, 0, 0, 0.9)",
                    transition: "color 0.1s ease",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

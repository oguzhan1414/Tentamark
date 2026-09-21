import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { whoosh } from "@remotion/sfx";
import { HookText } from "./scenes/HookText";
import { FeatureShowcase } from "./scenes/FeatureShowcase";
import { ProductShowcase } from "./scenes/ProductShowcase";
import { ReviewShowcase } from "./scenes/ReviewShowcase";
import { WrappedShowcase } from "./scenes/WrappedShowcase";
import { StatCallout } from "./scenes/StatCallout";
import { MediaCarousel } from "./scenes/MediaCarousel";
import { BrandOutro } from "./scenes/BrandOutro";
import { UGCSplitShowcase } from "./scenes/UGCSplitShowcase";
import { LightLeakOverlay } from "./components/LightLeakOverlay";
import { StoryProgressBar } from "./components/StoryProgressBar";
import { BackgroundRenderer } from "./components/BackgroundRenderer";
import { VideoBackground } from "./components/VideoBackground";
import { buildTheme, hexToHue, transitionFrames, type Theme } from "./theme";
import type { ScenePlanItem, VideoInputProps } from "../src/lib/video/types";

function renderScene(item: ScenePlanItem, theme: Theme) {
  switch (item.archetype) {
    case "hook":
      return (
        <HookText
          lines={item.lines}
          highlightWord={item.highlightWord}
          commentSticker={item.commentSticker}
          theme={theme}
        />
      );
    case "ugc_split":
      return (
        <UGCSplitShowcase
          topVideoUrl={item.topVideoUrl}
          badgeText={item.badgeText}
          title={item.title}
          price={item.price}
          oldPrice={item.oldPrice}
          discountBadge={item.discountBadge}
          rating={item.rating}
          bullets={item.bullets}
          ctaLabel={item.ctaLabel}
          theme={theme}
        />
      );
    case "feature":
      return (
        <FeatureShowcase
          eyebrow={item.eyebrow}
          title={item.title}
          description={item.description}
          imageUrl={item.imageUrl}
          reverse={item.reverse}
          badges={item.badges}
          theme={theme}
        />
      );
    case "product":
      return (
        <ProductShowcase
          title={item.title}
          price={item.price}
          oldPrice={item.oldPrice}
          discountBadge={item.discountBadge}
          imageUrl={item.imageUrl}
          rating={item.rating}
          badges={item.badges}
          theme={theme}
        />
      );
    case "review":
      return (
        <ReviewShowcase
          quote={item.quote}
          authorName={item.authorName}
          ratingStars={item.ratingStars}
          verifiedBuyer={item.verifiedBuyer}
          theme={theme}
        />
      );
    case "wrapped":
      return (
        <WrappedShowcase
          headline={item.headline}
          metricValue={item.metricValue}
          metricLabel={item.metricLabel}
          comparisonText={item.comparisonText}
          theme={theme}
        />
      );
    case "stat":
      return <StatCallout headline={item.headline} supporting={item.supporting} theme={theme} />;
    case "carousel":
      return <MediaCarousel imageUrls={item.imageUrls} caption={item.caption} theme={theme} />;
    case "outro":
      return (
        <BrandOutro
          brandName={item.brandName}
          logoUrl={item.logoUrl}
          tagline={item.tagline}
          ctaLabel={item.ctaLabel}
          theme={theme}
        />
      );
  }
}

function transitionFor(index: number) {
  return index % 2 === 0 ? fade() : slide({ direction: "from-right" });
}

export const Main: React.FC<VideoInputProps> = ({
  scenePlan,
  accentColors,
  backgroundTheme = "tech_slate",
  videoBackgroundUrl,
  voiceoverAudio,
}) => {
  const { durationInFrames } = useVideoConfig();
  const theme = buildTheme(accentColors);
  const lightLeakCutIndex = scenePlan.length - 2;

  // Background music volume ducks when voiceover is present
  const maxMusicVol = voiceoverAudio ? 0.16 : 0.32;

  return (
    <AbsoluteFill>
      {/* 1. Background Atmosphere: Either Real Cinematic Video B-Roll OR Dynamic Canvas Atmosphere */}
      {videoBackgroundUrl ? (
        <VideoBackground
          src={videoBackgroundUrl}
          tintColor={theme.accent}
          darkness={0.62}
        />
      ) : (
        <BackgroundRenderer theme={theme} backgroundTheme={backgroundTheme} />
      )}

      {/* 2. AI Voiceover Narration Track (if generated) */}
      {voiceoverAudio && (
        <Audio
          src={
            voiceoverAudio.startsWith("http") || voiceoverAudio.startsWith("blob:")
              ? voiceoverAudio
              : staticFile(voiceoverAudio)
          }
          volume={1.0}
        />
      )}

      {/* 3. Background Lo-Fi Rhythm Track with smooth fade-in, auto-ducking, and fade-out */}
      <Audio
        src={staticFile("audio/lofi-beat.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 15, durationInFrames - 30, durationInFrames],
            [0, maxMusicVol, maxMusicVol, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          )
        }
        loop
      />


      {/* Instagram Stories / Reels Native Progress Bar at top */}
      <StoryProgressBar scenePlan={scenePlan} accentColor={theme.accent} />

      {/* Main Scene Transitions */}
      <TransitionSeries>
        {scenePlan.flatMap((item, i) => {
          const sequence = (
            <TransitionSeries.Sequence key={`scene-${i}`} durationInFrames={item.frames}>
              {renderScene(item, theme)}
            </TransitionSeries.Sequence>
          );
          if (i === scenePlan.length - 1) return [sequence];

          if (i === lightLeakCutIndex) {
            const cut = (
              <TransitionSeries.Overlay key={`overlay-${i}`} durationInFrames={transitionFrames * 2}>
                <LightLeakOverlay hueShift={hexToHue(theme.accent)} />
                <Audio src={whoosh} volume={0.45} />
              </TransitionSeries.Overlay>
            );
            return [sequence, cut];
          }

          const transition = (
            <TransitionSeries.Transition
              key={`transition-${i}`}
              presentation={transitionFor(i)}
              timing={linearTiming({ durationInFrames: transitionFrames })}
            />
          );
          return [sequence, transition];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

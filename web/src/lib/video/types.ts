export type VideoFormat = "vertical" | "horizontal";
export type VideoDuration = 10 | 15 | 20;
export type VideoMusicTrack = "lofi" | "none";

// Shared client+server contract for voice-over, same reason VideoDuration/
// VideoMusicTrack live here rather than in scenePlan.ts or a server-only
// file — the dashboard UI's <select> and the API route's validation both
// need this without importing server-only code.
export const OPENAI_TTS_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
export type OpenAIVoice = (typeof OPENAI_TTS_VOICES)[number];
// Comfortably under OpenAI's real ~4096-char tts-1 input cap — this just
// guards against a pathologically long script blowing up render time/cost.
export const MAX_VOICEOVER_SCRIPT_LENGTH = 1000;

/*
  One resolved, self-contained scene. "Resolved" means every string/URL a
  scene component needs is already here — Main.tsx (web/remotion/Main.tsx)
  never re-derives anything from brand data, it only renders this plan.
  Frame counts are in the exact unit TransitionSeries.Sequence expects.
*/
export type BackgroundTheme =
  | "tech_slate"
  | "warm_luxury"
  | "wrapped_neon"
  | "clean_trust"
  | "flash_urgency";

export type ScenePlanItem =
  | {
      archetype: "hook";
      frames: number;
      lines: string[];
      highlightWord?: string;
      commentSticker?: {
        username?: string;
        comment: string;
        likes?: string;
        avatarLetter?: string;
        avatarBg?: string;
      };
    }
  | {
      archetype: "ugc_split";
      frames: number;
      topVideoUrl?: string;
      badgeText?: string;
      title: string;
      price: string;
      oldPrice?: string;
      discountBadge?: string;
      rating?: string;
      bullets?: string[];
      ctaLabel?: string;
    }
  | {
      archetype: "feature";
      frames: number;
      eyebrow: string;
      title: string;
      description: string;
      imageUrl: string;
      reverse: boolean;
      badges?: string[];
    }
  | {
      archetype: "product";
      frames: number;
      title: string;
      price: string;
      oldPrice?: string;
      discountBadge?: string;
      imageUrl: string;
      rating?: string;
      badges?: string[];
    }
  | {
      archetype: "review";
      frames: number;
      quote: string;
      authorName: string;
      ratingStars: number;
      verifiedBuyer?: boolean;
      productThumbnail?: string;
    }
  | {
      archetype: "wrapped";
      frames: number;
      headline: string;
      metricValue: string;
      metricLabel: string;
      comparisonText: string;
    }
  | { archetype: "stat"; frames: number; headline: string; supporting: string }
  | { archetype: "carousel"; frames: number; imageUrls: string[]; caption: string }
  | {
      archetype: "user_clip";
      frames: number;
      videoUrl: string;
      trimBeforeFrames: number;
      trimAfterFrames: number;
      objectPositionX: string;
      objectPositionY: string;
    }
  | {
      archetype: "outro";
      frames: number;
      brandName: string;
      logoUrl: string | null;
      tagline: string;
      ctaLabel: string | null;
    };

export type SceneArchetype = ScenePlanItem["archetype"];

// The exact shape passed to Remotion as inputProps — web/remotion/Root.tsx's
// calculateMetadata reads format+scenePlan from this to size/time the video.
export type VideoInputProps = {
  format: VideoFormat;
  durationSeconds: VideoDuration;
  fps: 30;
  accentColors: string[];
  // Feed remotion/theme.ts's buildTheme() beyond raw color — same brand_dna
  // fields getBrandContext() already fetches for AI copy, now also driving
  // the design-system archetype (typography/shape/imagery) picked per brand.
  visualStyle?: string | null;
  traitScores?: import("../brand/traits").TraitScores | null;
  industry?: string;
  brandName: string;
  recipeId?: import("./scenePlan").VideoRecipeId;
  backgroundTheme?: BackgroundTheme;
  videoBackgroundUrl?: string;
  musicTrack?: VideoMusicTrack;
  voiceoverAudio?: string;
  // Resolved word-level timing for voiceoverAudio, computed server-side once
  // in buildVideoInputProps.ts (Groq Whisper) — Main.tsx just renders it,
  // same "never re-derive, only render" convention as scenePlan itself.
  captions?: import("@remotion/captions").Caption[];
  scenePlan: ScenePlanItem[];
};


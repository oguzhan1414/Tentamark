export type VideoFormat = "vertical" | "horizontal";
export type VideoDuration = 10 | 15 | 20;

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
  brandName: string;
  backgroundTheme?: BackgroundTheme;
  videoBackgroundUrl?: string;
  voiceoverAudio?: string;
  scenePlan: ScenePlanItem[];
};


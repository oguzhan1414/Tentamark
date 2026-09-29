import { planScenes, type VideoRecipeId, type VideoSourceType } from "./scenePlan";
import type { ScenePlanItem, VideoDuration, VideoFormat, VideoInputProps, VideoMusicTrack } from "./types";

type PreviewPlanParams = {
  format: VideoFormat;
  durationSeconds: VideoDuration;
  sourceType: VideoSourceType;
  requestedRecipe: VideoRecipeId | "auto";
  topic: string;
  imageUrls: string[];
  brandName: string;
  accentColors?: string[];
  visualStyle?: string | null;
  traitScores?: import("./types").VideoInputProps["traitScores"];
  videoBackgroundUrl?: string;
  userClipUrl?: string;
  musicTrack: VideoMusicTrack;
};

export function createPreviewInputProps(params: PreviewPlanParams): VideoInputProps {
  const planned = planScenes({
    durationSeconds: params.durationSeconds,
    imageCount: params.imageUrls.length,
    seed: `${params.sourceType}:${params.topic}:${params.durationSeconds}`,
    sourceType: params.sourceType,
    requestedRecipe: params.requestedRecipe,
    hasVideoBackground: Boolean(params.videoBackgroundUrl),
    hasReview: params.sourceType === "product_url",
  });
  const fallbackImage = params.imageUrls[0] || "/tenta-avatar-open.png";
  let imageCursor = 0;

  const scenePlan: ScenePlanItem[] = planned.slots.map((slot): ScenePlanItem => {
    const imageUrl = params.imageUrls[imageCursor++ % Math.max(params.imageUrls.length, 1)] || fallbackImage;
    switch (slot.archetype) {
      case "hook":
        return {
          archetype: "hook",
          frames: slot.frames,
          lines: ["Fikrini görünür kıl", params.topic.slice(0, 36) || "markanı öne çıkar"],
          highlightWord: "görünür",
        };
      case "feature":
        return {
          archetype: "feature",
          frames: slot.frames,
          eyebrow: "ÖNE ÇIKAN",
          title: params.topic.slice(0, 38) || "Markana özel",
          description: "Mesajını kısa, net ve akılda kalıcı bir yaratıcı anlatıya dönüştür.",
          imageUrl,
          reverse: slot.reverse,
          badges: ["Markaya uygun", "Yayına hazır"],
        };
      case "product":
        return {
          archetype: "product",
          frames: slot.frames,
          title: params.topic.slice(0, 42) || "Öne çıkan ürün",
          price: "Fiyatı keşfet",
          imageUrl,
          badges: ["Yeni", "Hemen keşfet"],
        };
      case "review":
        return {
          archetype: "review",
          frames: slot.frames,
          quote: "Gerçek ürün verisi alındığında müşteri yorumu burada gösterilecek.",
          authorName: "Önizleme",
          ratingStars: 5,
          verifiedBuyer: false,
        };
      case "wrapped":
        return {
          archetype: "wrapped",
          frames: slot.frames,
          headline: "Tek fikir, güçlü anlatı",
          metricValue: "1",
          metricLabel: "yaratıcı brief",
          comparisonText: "Görsel hikâyeye dönüşmeye hazır.",
        };
      case "ugc_split":
        return {
          archetype: "ugc_split",
          frames: slot.frames,
          topVideoUrl: params.videoBackgroundUrl,
          title: params.topic.slice(0, 38) || "Markana özel",
          price: "Hemen keşfet",
          badgeText: "ÖNE ÇIKAN",
          bullets: ["Kısa ve net", "Mobil uyumlu"],
          ctaLabel: "İncele",
        };
      case "stat":
        return {
          archetype: "stat",
          frames: slot.frames,
          headline: "İlk saniyede dikkat",
          supporting: params.topic.slice(0, 80) || "Mesajını güçlü bir hook ile başlat.",
        };
      case "carousel":
        return {
          archetype: "carousel",
          frames: slot.frames,
          imageUrls: params.imageUrls.length > 0 ? params.imageUrls.slice(0, 4) : [fallbackImage],
          caption: params.topic.slice(0, 70) || "Hikâyeni görsellerle anlat.",
        };
      case "user_clip":
        // Cheap/approximate preview only, matching VideoPlanPreview's own
        // "low-cost preview" framing — centered crop, no trim, plays from
        // the start for however long the scene slot lasts.
        return {
          archetype: "user_clip",
          frames: slot.frames,
          videoUrl: params.userClipUrl || fallbackImage,
          trimBeforeFrames: 0,
          trimAfterFrames: slot.frames,
          objectPositionX: "50%",
          objectPositionY: "50%",
        };
      case "outro":
        return {
          archetype: "outro",
          frames: slot.frames,
          brandName: params.brandName,
          logoUrl: null,
          tagline: "Fikrini yayına hazırla.",
          ctaLabel: "Hemen Başla",
        };
    }
  });

  return {
    format: params.format,
    durationSeconds: params.durationSeconds,
    fps: 30,
    accentColors: params.accentColors?.length ? params.accentColors : ["#fa5252"],
    visualStyle: params.visualStyle,
    traitScores: params.traitScores,
    brandName: params.brandName,
    recipeId: planned.recipeId,
    videoBackgroundUrl: params.videoBackgroundUrl,
    musicTrack: params.musicTrack,
    scenePlan,
  };
}

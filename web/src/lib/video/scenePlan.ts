import type { SceneArchetype, VideoDuration } from "./types";

export type VideoSourceType = "existing_content" | "custom_topic" | "product_url" | "user_upload";
export type VideoRecipeId = "quick_promo" | "product_spotlight" | "content_story" | "user_clip_reel";

export type SceneSlot =
  | { archetype: "hook"; frames: number }
  | { archetype: "ugc_split"; frames: number }
  | { archetype: "feature"; frames: number; reverse: boolean }
  | { archetype: "product"; frames: number }
  | { archetype: "review"; frames: number }
  | { archetype: "wrapped"; frames: number }
  | { archetype: "stat"; frames: number }
  | { archetype: "carousel"; frames: number }
  | { archetype: "user_clip"; frames: number }
  | { archetype: "outro"; frames: number };

export type PlanScenesParams = {
  durationSeconds: VideoDuration;
  imageCount: number;
  seed: string;
  sourceType?: VideoSourceType;
  requestedRecipe?: VideoRecipeId | "auto";
  hasVideoBackground?: boolean;
  hasReview?: boolean;
};

export const VIDEO_RECIPES: Record<VideoRecipeId, { label: string; description: string }> = {
  quick_promo: { label: "Hızlı Tanıtım", description: "Kısa hook, fayda ve net CTA." },
  product_spotlight: { label: "Ürün Vitrini", description: "Ürün, özellik, sosyal kanıt ve CTA." },
  content_story: { label: "İçerik Hikâyesi", description: "Mevcut fikri görsel bir anlatıya dönüştürür." },
  user_clip_reel: { label: "Kendi Videon", description: "Yüklediğin klip, marka hook'u ve outro ile Reel'e dönüşür." },
};

const FPS = 30;
export const TRANSITION_FRAMES = 15;
export const MIN_SCENE_FRAMES = 45;

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function random() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pick<T>(pool: T[], random: () => number): T {
  return pool[Math.floor(random() * pool.length)];
}

function allocateFrames(weights: number[], totalFrames: number): number[] {
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((weight) => (weight / weightSum) * totalFrames);
  const floored = raw.map(Math.floor);
  const remainder = totalFrames - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; index < remainder; index++) floored[order[index].index] += 1;
  return floored.map((frames) => Math.max(frames, MIN_SCENE_FRAMES));
}

export function selectVideoRecipe(
  sourceType: VideoSourceType,
  requestedRecipe: VideoRecipeId | "auto" = "auto"
): VideoRecipeId {
  if (requestedRecipe !== "auto") return requestedRecipe;
  if (sourceType === "user_upload") return "user_clip_reel";
  if (sourceType === "product_url") return "product_spotlight";
  if (sourceType === "existing_content") return "content_story";
  return "quick_promo";
}

// The uploaded clip gets almost the entire runtime — just a brand hook and
// outro bookend it, unlike the AI-generated recipes which pick a random
// spread of graphic archetypes for the middle.
function userClipArchetypes(): SceneArchetype[] {
  return ["user_clip"];
}

function desiredMiddleCount(durationSeconds: VideoDuration, imageCount: number): number {
  if (durationSeconds === 10) return 1;
  if (durationSeconds === 15) return imageCount >= 1 ? 3 : 2;
  return imageCount >= 1 ? 4 : 3;
}

function productArchetypes(params: PlanScenesParams): SceneArchetype[] {
  if (params.durationSeconds === 10) return ["product"];
  if (params.durationSeconds === 15) {
    return params.hasReview ? ["product", "feature", "review"] : ["product", "feature", "wrapped"];
  }
  return [
    "product",
    params.hasVideoBackground ? "ugc_split" : "wrapped",
    "feature",
    params.hasReview ? "review" : "stat",
  ];
}

function chooseWithoutImmediateRepeat(
  candidates: SceneArchetype[],
  count: number,
  random: () => number
): SceneArchetype[] {
  const chosen: SceneArchetype[] = [];
  for (let index = 0; index < count; index++) {
    const available = candidates.filter((candidate) => candidate !== chosen.at(-1));
    chosen.push(pick(available.length > 0 ? available : candidates, random));
  }
  return chosen;
}

function contentStoryArchetypes(params: PlanScenesParams, random: () => number): SceneArchetype[] {
  const candidates: SceneArchetype[] = ["wrapped", "stat"];
  if (params.imageCount >= 1) candidates.push("feature");
  if (params.imageCount >= 2) candidates.push("carousel");
  if (params.hasVideoBackground) candidates.push("ugc_split");
  return chooseWithoutImmediateRepeat(candidates, desiredMiddleCount(params.durationSeconds, params.imageCount), random);
}

function quickPromoArchetypes(params: PlanScenesParams, random: () => number): SceneArchetype[] {
  const candidates: SceneArchetype[] = ["stat", "wrapped"];
  if (params.imageCount >= 1) candidates.push("feature");
  if (params.imageCount >= 2) candidates.push("carousel");
  if (params.hasVideoBackground) candidates.push("ugc_split");
  return chooseWithoutImmediateRepeat(candidates, desiredMiddleCount(params.durationSeconds, params.imageCount), random);
}

// Redistributes an already-planned slot array's frames to hit an exact
// target rendered duration (e.g. a real voice-over's audio length) without
// touching planScenes()'s archetype/scene-count decisions. Reuses the plan's
// OWN existing weighting (slots[].frames) rather than the raw archetype
// weights, so relative pacing (hook/outro shorter, middle scenes longer) is
// preserved — and reuses allocateFrames() itself, so the same
// MIN_SCENE_FRAMES floor applies automatically, no separate clamp to write.
export function rescaleSlotsToDuration(slots: SceneSlot[], targetRenderedFrames: number): SceneSlot[] {
  const transitionCutCount = Math.max(slots.length - 2, 0);
  const totalFramesWithOverlap = targetRenderedFrames + TRANSITION_FRAMES * transitionCutCount;
  const weights = slots.map((slot) => slot.frames);
  const newFrames = allocateFrames(weights, totalFramesWithOverlap);
  return slots.map((slot, index) => ({ ...slot, frames: newFrames[index] }));
}

export function getRenderedDurationInFrames(scenePlan: Array<{ frames: number }>): number {
  const transitionCutCount = Math.max(scenePlan.length - 2, 0);
  return scenePlan.reduce((total, scene) => total + scene.frames, 0) - TRANSITION_FRAMES * transitionCutCount;
}

export function planScenes(params: PlanScenesParams): { recipeId: VideoRecipeId; slots: SceneSlot[] } {
  const sourceType = params.sourceType ?? "custom_topic";
  const recipeId = selectVideoRecipe(sourceType, params.requestedRecipe);
  const random = seededRandom(params.seed);
  const middles =
    recipeId === "user_clip_reel"
      ? userClipArchetypes()
      : recipeId === "product_spotlight"
        ? productArchetypes(params)
        : recipeId === "content_story"
          ? contentStoryArchetypes(params, random)
          : quickPromoArchetypes(params, random);

  const archetypes: SceneArchetype[] = ["hook", ...middles, "outro"];
  const transitionCutCount = Math.max(archetypes.length - 2, 0);
  const totalFramesWithOverlap = params.durationSeconds * FPS + TRANSITION_FRAMES * transitionCutCount;
  const weights = archetypes.map((archetype) => (archetype === "hook" ? 0.9 : archetype === "outro" ? 0.95 : 1.15));
  const frames = allocateFrames(weights, totalFramesWithOverlap);

  let reverse = false;
  const slots = archetypes.map((archetype, index): SceneSlot => {
    if (archetype === "feature") {
      const slot: SceneSlot = { archetype, frames: frames[index], reverse };
      reverse = !reverse;
      return slot;
    }
    return { archetype, frames: frames[index] } as SceneSlot;
  });

  return { recipeId, slots };
}

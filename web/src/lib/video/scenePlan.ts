export type SceneSlot =
  | { archetype: "hook"; frames: number }
  | { archetype: "feature"; frames: number; reverse: boolean }
  | { archetype: "stat"; frames: number }
  | { archetype: "carousel"; frames: number }
  | { archetype: "outro"; frames: number };

const FPS = 30;
const TRANSITION_FRAMES = 15;
const MIN_SCENE_FRAMES = 45; // 1.5s floor — nothing should flash by imperceptibly

// Small deterministic PRNG seeded from a string (the job id) — mulberry32
// over a string hash. Not cryptographic, just needs to be stable per seed
// (a re-render of the same job reproduces the same structure) and spread out
// across different seeds (two different jobs shouldn't pick the same scenes).
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

// Largest-remainder rounding: distributes totalFrames across weights so the
// integers sum EXACTLY to totalFrames (plain Math.round per-item would drift
// off by a frame or two, which would silently change the requested duration).
function allocateFrames(weights: number[], totalFrames: number): number[] {
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / weightSum) * totalFrames);
  const floored = raw.map(Math.floor);
  const remainder = totalFrames - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) floored[order[k].i] += 1;
  return floored.map((f) => Math.max(f, MIN_SCENE_FRAMES));
}

/*
  Pure, Remotion-free scene STRUCTURE planner — decides which archetypes fill
  a video, in what order, and for how many frames, given only the chosen
  length, how many images are available, and a seed. No brand copy or AI call
  here (see buildVideoInputProps.ts for that) — this stays independently
  testable and fast.

  Scene COUNT is driven by duration, not fixed: 10s -> opener+outro only,
  15s -> +1 middle scene, 20s -> +2 middle scenes. Selection within the
  eligible pool (filtered by imageCount) is seeded-random with a
  no-immediate-repeat rule, so two jobs of the same brand/duration don't come
  out structurally identical, but retrying the same job is reproducible.
*/
export function planScenes(params: { durationSeconds: 10 | 15 | 20; imageCount: number; seed: string }): SceneSlot[] {
  const { durationSeconds, imageCount, seed } = params;
  const random = seededRandom(seed);

  // Dynamic pacing: 10s -> 1 middle scene (3 scenes total),
  // 15s -> 2-3 middle scenes (4-5 scenes total),
  // 20s -> 3-4 middle scenes (5-6 scenes total).
  // This keeps average scene duration between 2.5s and 4.0s for high engagement.
  const middleSlotCount =
    durationSeconds === 10
      ? 1
      : durationSeconds === 15
        ? (imageCount >= 2 ? 3 : 2)
        : (imageCount >= 2 ? 4 : 3);

  // Hook is always the preferred high-energy opener for social video
  const opener = "hook";

  const middlePool: Array<"feature" | "stat" | "carousel"> = ["stat"];
  if (imageCount >= 1) middlePool.push("feature");
  if (imageCount >= 2) middlePool.push("carousel");

  const recentlyUsed: string[] = [opener];
  const middles: Array<"feature" | "stat" | "carousel"> = [];
  for (let i = 0; i < middleSlotCount; i++) {
    const available = middlePool.filter((a) => !recentlyUsed.includes(a));
    const pool = available.length > 0 ? available : middlePool;
    const choice = pick(pool, random);
    middles.push(choice);
    recentlyUsed.push(choice);
    if (recentlyUsed.length > 2) recentlyUsed.shift();
  }

  const archetypes: Array<"hook" | "stat" | "feature" | "carousel"> = [opener, ...middles];
  const sceneCount = archetypes.length + 1; // + outro

  // The cut right into the outro is a light-leak Overlay (see Main.tsx), not
  // a crossfade/slide Transition — Overlays don't shorten the timeline the
  // way Transitions do, so only the OTHER cuts contribute overlap frames.
  const transitionCutCount = Math.max(sceneCount - 2, 0);
  const totalOnScreenFrames = durationSeconds * FPS;
  const totalFramesWithOverlap = totalOnScreenFrames + TRANSITION_FRAMES * transitionCutCount;

  // Punchy hook (0.9), generous showcase (1.1 - 1.2), clean outro (0.95)
  const weights = [0.95, ...middles.map(() => 1.15), 0.95];
  const frames = allocateFrames(weights, totalFramesWithOverlap);

  let reverseToggle = false;
  const slots: SceneSlot[] = archetypes.map((archetype, i): SceneSlot => {
    if (archetype === "feature") {
      const slot: SceneSlot = { archetype: "feature", frames: frames[i], reverse: reverseToggle };
      reverseToggle = !reverseToggle;
      return slot;
    }
    return { archetype, frames: frames[i] };
  });
  slots.push({ archetype: "outro", frames: frames[frames.length - 1] });

  return slots;
}

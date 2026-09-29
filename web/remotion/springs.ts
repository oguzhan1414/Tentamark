import type { SceneArchetype } from "../src/lib/video/types";

// Shared "organic overshoot" spring configs. Damping ratio is kept below 1
// on purpose (ratio = damping / (2*sqrt(mass*stiffness))) so entrances
// overshoot their resting value and settle back instead of easing straight
// in — CARD sits around ~0.48 (visible but composed, for large panels),
// BADGE around ~0.35 (punchier pop, for small pills/badges), TEXT around
// ~0.59 (present but not distracting for headline copy).
export const SPRING_CARD = { damping: 10, mass: 1, stiffness: 110 };
export const SPRING_BADGE = { damping: 7, mass: 0.6, stiffness: 170 };
export const SPRING_TEXT = { damping: 12, mass: 0.8, stiffness: 130 };

// Tempo contrast — every scene used to enter at the same pace (spring in,
// hold, cut). Each archetype now has a narrative "role" that scales the
// SAME base preset (SPRING_CARD/BADGE/TEXT) toward sharper or calmer,
// instead of every scene getting an identical physics feel.
export type TempoRole = "hit" | "breathe" | "build" | "climax";

export const TEMPO_MAP: Record<SceneArchetype, TempoRole> = {
  hook: "hit",
  ugc_split: "build",
  feature: "breathe",
  product: "climax",
  review: "breathe",
  wrapped: "hit",
  stat: "hit",
  carousel: "build",
  user_clip: "breathe",
  outro: "climax",
};

const TEMPO_SCALE: Record<TempoRole, { damping: number; stiffnessMult: number }> = {
  hit: { damping: 7, stiffnessMult: 1.35 }, // fast, sharp snap
  breathe: { damping: 13, stiffnessMult: 0.75 }, // slow, composed
  build: { damping: 10, stiffnessMult: 1 }, // baseline, unscaled
  climax: { damping: 8, stiffnessMult: 1.5 }, // dramatic, biggest overshoot
};

export function tempoSpring(
  base: { damping: number; mass: number; stiffness: number },
  role: TempoRole
): { damping: number; mass: number; stiffness: number } {
  const scale = TEMPO_SCALE[role];
  return { mass: base.mass, damping: scale.damping, stiffness: base.stiffness * scale.stiffnessMult };
}

// Decaying blur applied over the first ~10-12 frames of an entrance —
// approximates directional motion blur on fast-popping elements without a
// real per-pixel shader. `progress` is a spring value (0 at rest-before, 1
// at rest-after; can overshoot past 1, which is clamped to zero blur).
export function entranceBlur(progress: number, maxBlurPx = 14): string {
  const blur = Math.max(0, 1 - progress) * maxBlurPx;
  return blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : "none";
}

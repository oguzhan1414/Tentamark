// Plain data module, deliberately NOT "use server" — autofillFromWebsite.ts
// is a server actions file, and Next.js's server-actions transform only
// supports async-function exports crossing into client components. A real
// runtime value like TRAIT_KEYS (a plain array) gets mangled into a
// non-iterable stub when imported from a "use server" file into a "use
// client" page; only the types survived that boundary safely. Shared here
// instead so both sides import the same source of truth.
export const TRAIT_KEYS = [
  "samimi",
  "profesyonel",
  "teknolojik",
  "enerjik",
  "destekleyici",
  "luks",
] as const;
export type TraitKey = (typeof TRAIT_KEYS)[number];
export type TraitScores = Record<TraitKey, number>;

export type TonePosition = { x: number; y: number };

// Shared so the UI (page.tsx) and the AI prompt builder (getBrandContext.ts)
// describe the same dragged position with the same words — x/y are 0-100,
// matching ToneQuadrant's pointer-to-percent mapping.
export function describeTone(pos: TonePosition): string {
  const xLabel = pos.x < 33 ? "Profesyonel" : pos.x > 66 ? "Rahat" : "Dengeli";
  const yLabel = pos.y < 33 ? "Enerjik" : pos.y > 66 ? "Sakin" : "Ilımlı";
  return `${xLabel} & ${yLabel}`;
}

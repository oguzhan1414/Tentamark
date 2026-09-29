// Card format support, kept in its own zero-dependency module so it can be
// imported from client components (dashboard/image/page.tsx) without pulling
// in typeRegistry.ts's server-only code (resolveAndValidateUrl -> node:dns).
export type CardFormat = "square" | "story" | "landscape";

export const DEFAULT_SUPPORTED_FORMATS: readonly CardFormat[] = ["square", "story"];

// Single source of truth for which formats each card type's layouts actually
// have dimensions/HTML for. Only deal/newsflash/photoreview/podcast ship a
// landscape layout — every other type's variant files only handle
// square/story, so offering landscape for them silently falls back to
// 1080x1080 square output while the UI still labels it "16:9".
//
// Kept as literal per-key tuples (not widened to Record<string, CardFormat[]>)
// so typeRegistry.ts's defineCardType(..., CARD_TYPE_SUPPORTED_FORMATS.quote, ...)
// calls can infer each type's narrower local format union from this value —
// use getSupportedFormats() below for a dynamic string-keyed lookup instead.
export const CARD_TYPE_SUPPORTED_FORMATS = {
  quote: ["square", "story"],
  comparison: ["square", "story"],
  carousel: ["square", "story"],
  notification: ["square", "story"],
  socialpost: ["square", "story"],
  trend: ["square", "story"],
  problemsolution: ["square", "story"],
  product: ["square", "story"],
  stat: ["square", "story"],
  testimonial: ["square", "story"],
  changelog: ["square", "story"],
  checklist: ["square", "story"],
  event: ["square", "story"],
  thisorthat: ["square", "story"],
  matrix: ["square", "story"],
  chat: ["square", "story"],
  notes: ["square", "story"],
  coupon: ["square", "story"],
  featuretable: ["square", "story"],
  podcast: ["square", "story", "landscape"],
  photoreview: ["square", "story", "landscape"],
  deal: ["square", "story", "landscape"],
  newsflash: ["square", "story", "landscape"],
} as const satisfies Record<string, readonly CardFormat[]>;

export function getSupportedFormats(typeKey: string): readonly CardFormat[] {
  return (
    (CARD_TYPE_SUPPORTED_FORMATS as Record<string, readonly CardFormat[] | undefined>)[typeKey] ??
    DEFAULT_SUPPORTED_FORMATS
  );
}

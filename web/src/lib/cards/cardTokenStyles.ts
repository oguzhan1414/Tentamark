import { hexToHsl, hslToHex, type BrandDesignTokens } from "@/lib/brand/designTokens";

/*
  Card-rendering-specific translation of BrandDesignTokens into the raw CSS
  values/strings the hand-written HTML template literals in each card
  variant need. Kept separate from lib/brand/designTokens.ts (which stays
  renderer-agnostic) since video will need its own translation later, not
  this one.
*/

export function radiusPx(style: BrandDesignTokens["shape"]["radiusStyle"]): number {
  return { sharp: 12, soft: 28, rounded: 44 }[style];
}

export function frameBorderCss(style: BrandDesignTokens["shape"]["borderStyle"], inkHex: string): string {
  if (style === "none") return "none";
  if (style === "thin") return `1px solid ${inkHex}22`;
  return `3px solid ${inkHex}`;
}

export function shadowCss(style: BrandDesignTokens["shape"]["shadowStyle"]): string {
  switch (style) {
    case "none":
      return "none";
    case "soft":
      return "0 20px 48px -10px rgba(0,0,0,0.08)";
    case "editorial":
      return "0 24px 60px -12px rgba(0,0,0,0.10)";
    case "dramatic":
      return "0 32px 64px -16px rgba(0,0,0,0.22)";
  }
}

export function densityScale(density: BrandDesignTokens["layout"]["density"]): number {
  return { compact: 0.82, balanced: 1, spacious: 1.18 }[density];
}

// e.g. scalePadding([90, 90], densityScale(tokens.layout.density)) -> "106px 106px"
export function scalePadding(basePx: number[], scale: number): string {
  return basePx.map((value) => `${Math.round(value * scale)}px`).join(" ");
}

// Clamps a brand hue's lightness into a legible-as-a-solid-fill band before
// it sits behind white text (chips, CTA pills, avatar-fallback badges) —
// same "don't trust an arbitrary brand hex" caution as theme.ts's accent
// selection, just applied to lightness instead of filtering candidates out.
export function legibleChipColor(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  const clampedLightness = Math.min(0.45, Math.max(0.22, l));
  return hslToHex(h, s, clampedLightness);
}

const SERIF_FAMILIES = new Set(["Playfair Display", "Newsreader"]);
const MONO_FAMILIES = new Set(["JetBrains Mono", "Fira Code"]);

export function fontStackFor(family: string): string {
  if (SERIF_FAMILIES.has(family)) return `"${family}", Georgia, serif`;
  if (MONO_FAMILIES.has(family)) return `"${family}", "Fira Code", monospace`;
  return `"${family}", sans-serif`;
}

const GOOGLE_FONT_WEIGHTS = "400;500;600;700;800;900";

// extraFamilies: for a variant that also needs a fixed, non-token font (e.g.
// changelog's code snippet staying monospace regardless of brand typography).
export function googleFontsHrefFor(tokens: BrandDesignTokens, extraFamilies: string[] = []): string {
  const families = Array.from(new Set([tokens.typography.headingFamily, tokens.typography.bodyFamily]));
  const query = [...families.map((family) => `${family}:wght@${GOOGLE_FONT_WEIGHTS}`), ...extraFamilies]
    .map((family) => `family=${family.replace(/ /g, "+")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

// Only the left/right half of logoPosition is honored — none of the flat
// "header row" editorial layouts have a natural top/bottom brand slot
// without a real layout rewrite, which is out of scope for this pass.
export function flexDirForLogoSide(pos: BrandDesignTokens["layout"]["logoPosition"]): "row" | "row-reverse" {
  return pos === "top-right" || pos === "bottom-right" ? "row-reverse" : "row";
}

export function alignForLogoSide(pos: BrandDesignTokens["layout"]["logoPosition"]): "flex-start" | "flex-end" {
  return pos === "top-right" || pos === "bottom-right" ? "flex-end" : "flex-start";
}

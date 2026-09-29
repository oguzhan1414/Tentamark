import { deriveBrandDesignTokens, type BrandDesignTokens, type DesignArchetype } from "../src/lib/brand/designTokens";
import type { TraitScores } from "../src/lib/brand/traits";

export const fps = 30;
export const transitionFrames = 15;

// Neutral base stays fixed and dark on purpose — every scene's glassmorphic
// cards/white text assume a cinematic dark backdrop, unlike designTokens.ts's
// own light `colors.background/surface` (built for editorial card images).
// Only the brand-derived roles below (accent/secondary + archetype tokens)
// vary per brand; reusing deriveBrandDesignTokens for THOSE means the same
// classifier/color math that already drives card generation now drives
// video too, instead of a second hand-rolled copy of it.
const baseColors = {
  bg: "#fbfaf9",
  ink: "#172b46",
  muted: "#536276",
  faint: "#8691a0",
  white: "#ffffff",
};

export type Theme = typeof baseColors & {
  accent: string;
  accentSoft: string;
  secondary: string;
  archetype: DesignArchetype;
  typography: BrandDesignTokens["typography"];
  shape: BrandDesignTokens["shape"];
  imagery: BrandDesignTokens["imagery"];
};

export function buildTheme(
  colorPalette: string[] | undefined,
  visualStyle?: string | null,
  traitScores?: TraitScores | null
): Theme {
  const tokens = deriveBrandDesignTokens({
    colorPalette: colorPalette ?? [],
    visualStyle: visualStyle ?? null,
    traitScores: traitScores ?? null,
  });
  return {
    ...baseColors,
    accent: tokens.colors.accent,
    accentSoft: `${tokens.colors.accent}2e`,
    secondary: tokens.colors.secondary,
    archetype: tokens.archetype,
    typography: tokens.typography,
    shape: tokens.shape,
    imagery: tokens.imagery,
  };
}

// Feeds the light-leak overlay's hueShift (0-360) so the one cinematic
// flourish in the video (the flash into the outro) is tinted with the
// brand's own accent instead of always being the same yellow-orange default.
export function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

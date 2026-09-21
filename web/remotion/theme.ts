export const fps = 30;
export const transitionFrames = 15;

const baseColors = {
  bg: "#fbfaf9",
  ink: "#172b46",
  muted: "#536276",
  faint: "#8691a0",
  white: "#ffffff",
};

export type Theme = typeof baseColors & { accent: string; accentSoft: string };

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// Some brand palettes (seen live: a language-learning brand whose whole
// palette was near-black browns, #1F1215/#2D181B) are moody/dark on
// purpose — great for a background swatch, unreadable as light-on-dark
// accent TEXT (HookText's punchline, StatCallout's headline) against the
// dark `ink` scene background. Relative luminance below this reads as too
// dark to use as a light accent; Tentamark's own red (~0.46) sits well
// above it, real "pop" brand colors (oranges, blues, greens) do too.
const MIN_ACCENT_LUMINANCE = 0.35;

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// HSL saturation only (0-1) — used to prefer a brand's vibrant "pop" color
// over a pale neutral that happens to pass the luminance bar too (a cream
// swatch reads as legible but washed-out next to an orange from the same
// palette; saturation is what actually distinguishes "accent" from
// "background neutral" among colors that are all light enough to use).
function saturation(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  const delta = max - min;
  return delta / (1 - Math.abs(2 * lightness - 1));
}

/*
  Only the accent role (badge, CTA, glow tint) comes from the brand's own
  palette — the neutral bg/ink/muted base stays fixed. brand_dna.color_palette
  is typically 1-3 raw swatches, not an accessible full neutral scale, so
  forcing an arbitrary brand hex into a background/body-text role risks
  illegible combinations we can't QA per brand.

  Takes the WHOLE palette, not just its first entry — seen live: a coffee
  brand's palette was `[#6F4E37 (coffee brown), #F5E6D3 (cream), #D97B29
  (orange), #2B1B12]`. Index 0 fails the luminance check outright; picking
  the next passing entry in array order would land on the pale cream instead
  of the brand's actual "pop" color one slot later. Among every palette
  entry light enough to read on the dark `ink` background, picks the most
  saturated (most "accent-like", least washed-out) one — falls back to
  Tentamark's own red only if nothing in the palette clears the bar.
*/
export function buildTheme(colorPalette: string[] | undefined): Theme {
  const candidates = (colorPalette ?? []).filter((c) => HEX_COLOR.test(c) && relativeLuminance(c) >= MIN_ACCENT_LUMINANCE);
  const accent = candidates.length > 0 ? candidates.reduce((best, c) => (saturation(c) > saturation(best) ? c : best)) : "#fa5252";
  return { ...baseColors, accent, accentSoft: `${accent}2e` };
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

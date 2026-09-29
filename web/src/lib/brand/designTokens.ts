import { TRAIT_KEYS, type TraitKey, type TraitScores } from "./traits";

/*
  Shared, brand-wide design tokens — deliberately not under lib/cards/, since
  video (see remotion/theme.ts's buildTheme) will want the same semantic
  tokens later. Card-specific translation (px values, CSS strings, Google
  Fonts URLs) lives in lib/cards/cardTokenStyles.ts instead, so this file
  stays renderer-agnostic.
*/
export type DesignArchetype = "minimal" | "warm" | "bold_playful" | "luxury_editorial" | "tech_dramatic" | "neutral";

export type BrandDesignTokens = {
  archetype: DesignArchetype;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    headingFamily: string;
    bodyFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  shape: {
    radiusStyle: "sharp" | "soft" | "rounded";
    borderStyle: "none" | "thin" | "bold";
    shadowStyle: "none" | "soft" | "editorial" | "dramatic";
  };
  imagery: {
    treatment: "clean" | "warm" | "vivid" | "editorial" | "cinematic";
    overlayStrength: number;
    preferredCrop: "product" | "person" | "environment";
  };
  layout: {
    density: "compact" | "balanced" | "spacious";
    logoPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    ctaStyle: "text" | "pill" | "button";
  };
};

export type DesignTokenInput = {
  colorPalette: string[];
  visualStyle: string | null;
  traitScores: TraitScores | null;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const FALLBACK_ACCENT = "#fa5252"; // same fallback as remotion/theme.ts's buildTheme

// Same "don't trust an arbitrary brand hex as a background" caution as
// remotion/theme.ts's MIN_ACCENT_LUMINANCE comment: a color dark enough to
// read as moody-on-purpose (a brand's own near-black brown, say) still isn't
// legible as an accent that has to pop against a light editorial card.
const MIN_ACCENT_LUMINANCE = 0.35;

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function hue2rgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360 / 360;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }
  const toHex = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function saturation(hex: string): number {
  return hexToHsl(hex).s;
}

/*
  Generalizes buildTheme() (remotion/theme.ts) from "pick one accent color"
  to all six color roles. Deliberately not shared code with theme.ts — that
  function feeds the live video renderer and reshaping it is out of scope
  here; the luminance/saturation math is duplicated on purpose.

  No special-cased "empty palette" branch: with zero valid hexes, `primary`
  falls through to FALLBACK_ACCENT and `secondary`/background/surface/text
  all derive from ITS hue via the same formula every other brand uses —
  same as the archetype side, one code path handles "brand never ran
  autofill" without a separate fallback object to keep in sync.
*/
function deriveColors(colorPalette: string[]): BrandDesignTokens["colors"] {
  const validColors = colorPalette.filter((c) => HEX_COLOR.test(c));
  const bySaturation = [...validColors].sort((a, b) => saturation(b) - saturation(a));
  const accentCandidates = validColors.filter((c) => relativeLuminance(c) >= MIN_ACCENT_LUMINANCE);
  const accent =
    accentCandidates.length > 0
      ? accentCandidates.reduce((best, c) => (saturation(c) > saturation(best) ? c : best))
      : FALLBACK_ACCENT;
  const primary = bySaturation[0] ?? FALLBACK_ACCENT;
  const primaryHsl = hexToHsl(primary);
  const secondary = bySaturation[1] ?? hslToHex(primaryHsl.h + 150, primaryHsl.s, primaryHsl.l);

  return {
    primary,
    secondary,
    accent,
    background: hslToHex(primaryHsl.h, 0.08, 0.97),
    surface: hslToHex(primaryHsl.h, 0.04, 0.99),
    text: hslToHex(primaryHsl.h, 0.12, 0.14),
  };
}

const ARCHETYPE_TOKENS: Record<DesignArchetype, Omit<BrandDesignTokens, "colors" | "archetype">> = {
  minimal: {
    typography: { headingFamily: "Inter", bodyFamily: "Inter", headingWeight: 600, bodyWeight: 400 },
    shape: { radiusStyle: "sharp", borderStyle: "thin", shadowStyle: "soft" },
    imagery: { treatment: "clean", overlayStrength: 0.15, preferredCrop: "product" },
    layout: { density: "spacious", logoPosition: "top-left", ctaStyle: "text" },
  },
  warm: {
    typography: { headingFamily: "Plus Jakarta Sans", bodyFamily: "Plus Jakarta Sans", headingWeight: 800, bodyWeight: 500 },
    shape: { radiusStyle: "rounded", borderStyle: "none", shadowStyle: "soft" },
    imagery: { treatment: "warm", overlayStrength: 0.25, preferredCrop: "person" },
    layout: { density: "balanced", logoPosition: "bottom-left", ctaStyle: "pill" },
  },
  bold_playful: {
    typography: { headingFamily: "Baloo 2", bodyFamily: "IBM Plex Sans", headingWeight: 800, bodyWeight: 600 },
    shape: { radiusStyle: "rounded", borderStyle: "bold", shadowStyle: "dramatic" },
    imagery: { treatment: "vivid", overlayStrength: 0.35, preferredCrop: "person" },
    layout: { density: "compact", logoPosition: "top-right", ctaStyle: "button" },
  },
  luxury_editorial: {
    typography: { headingFamily: "Playfair Display", bodyFamily: "IBM Plex Sans", headingWeight: 700, bodyWeight: 500 },
    shape: { radiusStyle: "sharp", borderStyle: "thin", shadowStyle: "editorial" },
    imagery: { treatment: "editorial", overlayStrength: 0.2, preferredCrop: "product" },
    layout: { density: "spacious", logoPosition: "top-left", ctaStyle: "text" },
  },
  tech_dramatic: {
    typography: { headingFamily: "JetBrains Mono", bodyFamily: "IBM Plex Sans", headingWeight: 700, bodyWeight: 500 },
    shape: { radiusStyle: "sharp", borderStyle: "bold", shadowStyle: "dramatic" },
    imagery: { treatment: "cinematic", overlayStrength: 0.4, preferredCrop: "environment" },
    layout: { density: "compact", logoPosition: "bottom-right", ctaStyle: "button" },
  },
  neutral: {
    typography: { headingFamily: "Plus Jakarta Sans", bodyFamily: "IBM Plex Sans", headingWeight: 700, bodyWeight: 500 },
    shape: { radiusStyle: "soft", borderStyle: "thin", shadowStyle: "soft" },
    imagery: { treatment: "clean", overlayStrength: 0.2, preferredCrop: "product" },
    layout: { density: "balanced", logoPosition: "top-left", ctaStyle: "pill" },
  },
};

// visual_style is free text an AI model wrote (autofillFromWebsite.ts), not
// an enum — checked in this fixed priority order (first match wins) against
// that function's own example phrasings ("minimal ve pastel", "maksimalist
// ve enerjik renkli", "lüks ve sade", "el yapımı ve sıcak") to confirm the
// ordering resolves each of them sensibly rather than being arbitrary.
const KEYWORD_RULES: Array<{ archetype: DesignArchetype; keywords: string[] }> = [
  {
    archetype: "luxury_editorial",
    keywords: ["lüks", "luks", "luxury", "editorial", "zarif", "elegan", "premium", "şık", "sik", "haute"],
  },
  {
    archetype: "tech_dramatic",
    keywords: ["teknoloji", "tech", "dijital", "futur", "cyber", "sert", "karanlık", "karanlik", "dark"],
  },
  {
    archetype: "bold_playful",
    keywords: [
      "maksimalist",
      "enerjik",
      "energetic",
      "eğlenceli",
      "eglenceli",
      "renkli",
      "vivid",
      "canlı",
      "canli",
      "genç",
      "genc",
      "fun",
    ],
  },
  {
    archetype: "warm",
    keywords: [
      "sıcak",
      "sicak",
      "warm",
      "samimi",
      "pastel",
      "yumuşak",
      "yumusak",
      "friendly",
      "sevimli",
      "el yapımı",
      "el yapimi",
    ],
  },
  { archetype: "minimal", keywords: ["minimal", "sade", "sakin", "temiz", "clean", "modern"] },
];

const TRAIT_TO_ARCHETYPE: Record<TraitKey, DesignArchetype> = {
  samimi: "warm",
  profesyonel: "minimal",
  teknolojik: "tech_dramatic",
  enerjik: "bold_playful",
  destekleyici: "warm",
  luks: "luxury_editorial",
};

// parseTraitScores (getBrandContext.ts) fills every key with 50 when a brand
// has no real trait_scores row yet — a flat all-50 object carries no signal,
// so a small spread across the 6 scores is required before trusting it over
// the "neutral" fallback.
const MIN_TRAIT_SPREAD = 10;

export function classifyArchetype(visualStyle: string | null, traitScores: TraitScores | null): DesignArchetype {
  const text = (visualStyle ?? "").toLocaleLowerCase("tr-TR");
  if (text) {
    for (const rule of KEYWORD_RULES) {
      if (rule.keywords.some((keyword) => text.includes(keyword))) return rule.archetype;
    }
  }

  if (traitScores) {
    const values = TRAIT_KEYS.map((key) => traitScores[key]);
    const spread = Math.max(...values) - Math.min(...values);
    if (spread >= MIN_TRAIT_SPREAD) {
      const topTrait = TRAIT_KEYS.reduce((best, key) => (traitScores[key] > traitScores[best] ? key : best));
      return TRAIT_TO_ARCHETYPE[topTrait];
    }
  }

  return "neutral";
}

export function deriveBrandDesignTokens(input: DesignTokenInput): BrandDesignTokens {
  const archetype = classifyArchetype(input.visualStyle, input.traitScores);
  return {
    archetype,
    colors: deriveColors(input.colorPalette),
    ...ARCHETYPE_TOKENS[archetype],
  };
}

// Card variants wired to BrandDesignTokens accept `tokens` as optional so a
// direct/test call without a real brand still renders instead of crashing —
// both API routes always compute and pass real tokens, so this only matters
// off that path.
export const DEFAULT_DESIGN_TOKENS: BrandDesignTokens = deriveBrandDesignTokens({
  colorPalette: [],
  visualStyle: null,
  traitScores: null,
});

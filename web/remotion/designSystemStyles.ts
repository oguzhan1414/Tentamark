import type { Theme } from "./theme";

// Translates the abstract per-archetype tokens (theme.shape/imagery, from
// deriveBrandDesignTokens) into concrete CSS values — kept out of theme.ts
// itself so that file stays about DERIVING the design system, not rendering
// it, and out of individual scenes so every scene that wants "the brand's
// card shadow" reads the same value instead of re-guessing pixel numbers.

const RADIUS_MAP: Record<Theme["shape"]["radiusStyle"], number> = {
  sharp: 10,
  soft: 22,
  rounded: 34,
};

export function radiusForShape(shape: Theme["shape"]): number {
  return RADIUS_MAP[shape.radiusStyle];
}

export function borderForShape(shape: Theme["shape"], accent: string): string {
  if (shape.borderStyle === "none") return "none";
  if (shape.borderStyle === "bold") return `2.5px solid ${accent}`;
  return "1.5px solid rgba(255, 255, 255, 0.18)";
}

export function shadowForShape(shape: Theme["shape"], accent: string): string {
  switch (shape.shadowStyle) {
    case "none":
      return "none";
    case "editorial":
      return "0 30px 70px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)";
    case "dramatic":
      return `0 40px 90px rgba(0,0,0,0.75), 0 0 60px ${accent}33`;
    default:
      return "0 22px 50px rgba(0,0,0,0.45)";
  }
}

const IMAGERY_FILTER: Record<Theme["imagery"]["treatment"], string> = {
  clean: "none",
  warm: "saturate(1.15) sepia(0.07)",
  vivid: "saturate(1.35) contrast(1.08)",
  editorial: "grayscale(0.18) contrast(1.05)",
  cinematic: "contrast(1.15) saturate(0.9) brightness(0.94)",
};

export function filterForImagery(imagery: Theme["imagery"]): string {
  return IMAGERY_FILTER[imagery.treatment];
}

// Bottom-anchored wash so overlaid text stays legible without hiding the
// photo — strength comes straight from the archetype's imagery.overlayStrength.
export function overlayGradientForImagery(imagery: Theme["imagery"], accent: string): string {
  const alpha = Math.round(imagery.overlayStrength * 255)
    .toString(16)
    .padStart(2, "0");
  return `linear-gradient(180deg, transparent 35%, ${accent}${alpha} 100%)`;
}

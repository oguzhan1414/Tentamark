import type { PodcastCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderPodcastNeonPurple } from "./neonPurple";
import { renderPodcastElectricOrange } from "./electricOrange";
import { renderPodcastEmeraldGreen } from "./emeraldGreen";
import { renderPodcastCyberBlue } from "./cyberBlue";

// tokens is optional and only actually read (for fonts) by
// renderPodcastNeonPurple today — the other variants' character is
// untouched by BrandDesignTokens this pass.
export const PODCAST_VARIANTS: Record<string, (props: PodcastCardProps, tokens?: BrandDesignTokens) => string> = {
  neonPurple: renderPodcastNeonPurple,
  electricOrange: renderPodcastElectricOrange,
  emeraldGreen: renderPodcastEmeraldGreen,
  cyberBlue: renderPodcastCyberBlue,
};

export function pickPodcastVariant(variantKey?: string): (props: PodcastCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && PODCAST_VARIANTS[variantKey]) return PODCAST_VARIANTS[variantKey];
  return PODCAST_VARIANTS.neonPurple;
}

import type { StatCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderStatAurora } from "./aurora";
import { renderStatEditorial } from "./editorial";
import { renderStatClay } from "./clay";
import { renderStatCyber } from "./cyber";
import { renderStatHero } from "./hero";
import { renderStatBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderStatEditorial today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const STAT_VARIANTS: Record<string, (props: StatCardProps, tokens?: BrandDesignTokens) => string> = {
  aurora: renderStatAurora,
  editorial: renderStatEditorial,
  clay: renderStatClay,
  cyber: renderStatCyber,
  hero: renderStatHero,
  brutalist: renderStatBrutalist,
};

export function pickStatVariant(variantKey?: string): (props: StatCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && STAT_VARIANTS[variantKey]) return STAT_VARIANTS[variantKey];
  return STAT_VARIANTS.aurora; // Default to Aurora Glass!
}

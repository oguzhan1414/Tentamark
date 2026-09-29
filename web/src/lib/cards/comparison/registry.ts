import type { ComparisonCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderComparisonAurora } from "./aurora";
import { renderComparisonSplit } from "./split";
import { renderComparisonEditorial } from "./editorial";
import { renderComparisonBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderComparisonEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const COMPARISON_VARIANTS: Record<string, (props: ComparisonCardProps, tokens?: BrandDesignTokens) => string> = {
  aurora: renderComparisonAurora,
  split: renderComparisonSplit,
  editorial: renderComparisonEditorial,
  brutalist: renderComparisonBrutalist,
};

export function pickComparisonVariant(
  variantKey?: string
): (props: ComparisonCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && COMPARISON_VARIANTS[variantKey]) return COMPARISON_VARIANTS[variantKey];
  return COMPARISON_VARIANTS.aurora; // Default to Aurora Glass!
}

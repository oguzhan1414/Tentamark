import type { FeatureTableCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderFeatureTableDark } from "./dark";
import { renderFeatureTableEditorial } from "./editorial";
import { renderFeatureTableBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderFeatureTableEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const FEATURE_TABLE_VARIANTS: Record<string, (props: FeatureTableCardProps, tokens?: BrandDesignTokens) => string> = {
  dark: renderFeatureTableDark,
  editorial: renderFeatureTableEditorial,
  brutalist: renderFeatureTableBrutalist,
};

export function pickFeatureTableVariant(
  variantKey?: string
): (props: FeatureTableCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && FEATURE_TABLE_VARIANTS[variantKey]) return FEATURE_TABLE_VARIANTS[variantKey];
  return FEATURE_TABLE_VARIANTS.dark;
}

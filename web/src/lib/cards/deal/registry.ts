import type { DealCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderDealLifestyleSplit } from "./lifestyleSplit";
import { renderDealBoldBanner } from "./boldBanner";

// tokens is optional and only actually read by renderDealLifestyleSplit
// today — the other variant's character is untouched by BrandDesignTokens
// this pass.
export const DEAL_VARIANTS: Record<string, (props: DealCardProps, tokens?: BrandDesignTokens) => string> = {
  lifestyleSplit: renderDealLifestyleSplit,
  boldBanner: renderDealBoldBanner,
};

export function pickDealVariant(variantKey?: string): (props: DealCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && DEAL_VARIANTS[variantKey]) return DEAL_VARIANTS[variantKey];
  return DEAL_VARIANTS.lifestyleSplit;
}

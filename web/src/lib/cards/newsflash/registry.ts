import type { NewsFlashCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderNewsFlashBreakingRed } from "./breakingRed";

export const NEWSFLASH_VARIANTS: Record<string, (props: NewsFlashCardProps, tokens?: BrandDesignTokens) => string> = {
  breakingRed: renderNewsFlashBreakingRed,
};

export function pickNewsFlashVariant(
  variantKey?: string
): (props: NewsFlashCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && NEWSFLASH_VARIANTS[variantKey]) return NEWSFLASH_VARIANTS[variantKey];
  return NEWSFLASH_VARIANTS.breakingRed;
}

import type { PhotoReviewCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderPhotoReviewCleanFloat } from "./cleanFloat";
import { renderPhotoReviewGlassFrost } from "./glassFrost";
import { renderPhotoReviewWarmEditorial } from "./warmEditorial";

// tokens is optional and only actually read by renderPhotoReviewWarmEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const PHOTOREVIEW_VARIANTS: Record<string, (props: PhotoReviewCardProps, tokens?: BrandDesignTokens) => string> = {
  cleanFloat: renderPhotoReviewCleanFloat,
  glassFrost: renderPhotoReviewGlassFrost,
  warmEditorial: renderPhotoReviewWarmEditorial,
};

export function pickPhotoReviewVariant(
  variantKey?: string
): (props: PhotoReviewCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && PHOTOREVIEW_VARIANTS[variantKey]) return PHOTOREVIEW_VARIANTS[variantKey];
  return PHOTOREVIEW_VARIANTS.cleanFloat;
}

import type { SocialPostCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderSocialPost } from "./post";
import { renderSocialPostDark } from "./dark";
import { renderSocialPostBrutalist } from "./brutalist";

// tokens is optional and only actually read (for colors.accent) by
// renderSocialPost today — the other variants' character is untouched by
// BrandDesignTokens this pass.
export const SOCIAL_POST_VARIANTS: Record<string, (props: SocialPostCardProps, tokens?: BrandDesignTokens) => string> = {
  feed: renderSocialPost,
  dark: renderSocialPostDark,
  brutalist: renderSocialPostBrutalist,
};

export function pickSocialPostVariant(
  variantKey?: string
): (props: SocialPostCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && SOCIAL_POST_VARIANTS[variantKey]) return SOCIAL_POST_VARIANTS[variantKey];
  return SOCIAL_POST_VARIANTS.feed;
}

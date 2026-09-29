import type { ChangelogCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderChangelogDark } from "./dark";
import { renderChangelogEditorial } from "./editorial";
import { renderChangelogBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderChangelogEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const CHANGELOG_VARIANTS: Record<string, (props: ChangelogCardProps, tokens?: BrandDesignTokens) => string> = {
  dark: renderChangelogDark,
  editorial: renderChangelogEditorial,
  brutalist: renderChangelogBrutalist,
};

export function pickChangelogVariant(
  variantKey?: string
): (props: ChangelogCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && CHANGELOG_VARIANTS[variantKey]) return CHANGELOG_VARIANTS[variantKey];
  return CHANGELOG_VARIANTS.dark;
}

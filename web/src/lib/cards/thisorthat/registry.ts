import type { ThisOrThatCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderThisOrThatDark } from "./dark";
import { renderThisOrThatEditorial } from "./editorial";
import { renderThisOrThatBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderThisOrThatEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const THIS_OR_THAT_VARIANTS: Record<string, (props: ThisOrThatCardProps, tokens?: BrandDesignTokens) => string> = {
  dark: renderThisOrThatDark,
  editorial: renderThisOrThatEditorial,
  brutalist: renderThisOrThatBrutalist,
};

export function pickThisOrThatVariant(
  variantKey?: string
): (props: ThisOrThatCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && THIS_OR_THAT_VARIANTS[variantKey]) return THIS_OR_THAT_VARIANTS[variantKey];
  return THIS_OR_THAT_VARIANTS.dark;
}

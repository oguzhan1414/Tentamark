import type { ProductCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderProductHero } from "./hero";
import { renderProductEditorial } from "./editorial";
import { renderProductBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderProductEditorial today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const PRODUCT_VARIANTS: Record<string, (props: ProductCardProps, tokens?: BrandDesignTokens) => string> = {
  hero: renderProductHero,
  editorial: renderProductEditorial,
  brutalist: renderProductBrutalist,
};

export function pickProductVariant(variantKey?: string): (props: ProductCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && PRODUCT_VARIANTS[variantKey]) return PRODUCT_VARIANTS[variantKey];
  return PRODUCT_VARIANTS.hero;
}

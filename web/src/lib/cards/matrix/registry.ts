import type { MatrixCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderMatrixDark } from "./dark";
import { renderMatrixEditorial } from "./editorial";
import { renderMatrixBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderMatrixEditorial today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const MATRIX_VARIANTS: Record<string, (props: MatrixCardProps, tokens?: BrandDesignTokens) => string> = {
  dark: renderMatrixDark,
  editorial: renderMatrixEditorial,
  brutalist: renderMatrixBrutalist,
};

export function pickMatrixVariant(variantKey?: string): (props: MatrixCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && MATRIX_VARIANTS[variantKey]) return MATRIX_VARIANTS[variantKey];
  return MATRIX_VARIANTS.dark;
}

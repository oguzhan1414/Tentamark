import type { TrendCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderTrendChart } from "./chart";
import { renderTrendEditorial } from "./editorial";
import { renderTrendBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderTrendEditorial today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const TREND_VARIANTS: Record<string, (props: TrendCardProps, tokens?: BrandDesignTokens) => string> = {
  chart: renderTrendChart,
  editorial: renderTrendEditorial,
  brutalist: renderTrendBrutalist,
};

export function pickTrendVariant(variantKey?: string): (props: TrendCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && TREND_VARIANTS[variantKey]) return TREND_VARIANTS[variantKey];
  return TREND_VARIANTS.chart;
}

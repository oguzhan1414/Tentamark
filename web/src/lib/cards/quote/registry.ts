import type { QuoteCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderQuoteAurora } from "./aurora";
import { renderQuoteEditorial } from "./editorial";
import { renderQuoteClay } from "./clay";
import { renderQuoteCyber } from "./cyber";
import { renderQuoteCentered } from "./centered";
import { renderQuoteBrutalist } from "./brutalist";
import { renderQuotePastel } from "./pastel";

// tokens is optional and only actually read by renderQuoteEditorial today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const QUOTE_VARIANTS: Record<string, (props: QuoteCardProps, tokens?: BrandDesignTokens) => string> = {
  aurora: renderQuoteAurora,
  editorial: renderQuoteEditorial,
  clay: renderQuoteClay,
  cyber: renderQuoteCyber,
  centered: renderQuoteCentered,
  brutalist: renderQuoteBrutalist,
  pastel: renderQuotePastel,
};

export function pickQuoteVariant(variantKey?: string): (props: QuoteCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && QUOTE_VARIANTS[variantKey]) return QUOTE_VARIANTS[variantKey];
  return QUOTE_VARIANTS.aurora; // Default to the stunning Aurora Glass!
}

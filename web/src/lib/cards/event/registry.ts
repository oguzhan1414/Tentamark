import type { EventCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderEventDark } from "./dark";
import { renderEventEditorial } from "./editorial";
import { renderEventBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderEventEditorial today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const EVENT_VARIANTS: Record<string, (props: EventCardProps, tokens?: BrandDesignTokens) => string> = {
  dark: renderEventDark,
  editorial: renderEventEditorial,
  brutalist: renderEventBrutalist,
};

export function pickEventVariant(variantKey?: string): (props: EventCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && EVENT_VARIANTS[variantKey]) return EVENT_VARIANTS[variantKey];
  return EVENT_VARIANTS.dark;
}

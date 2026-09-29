import type { CarouselCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderCarouselCover } from "./cover";
import { renderCarouselItem } from "./item";
import { renderCarouselCta } from "./cta";
import { renderCarouselCoverEditorial, renderCarouselItemEditorial, renderCarouselCtaEditorial } from "./editorial";
import { renderCarouselCoverBrutalist, renderCarouselItemBrutalist, renderCarouselCtaBrutalist } from "./brutalist";

// tokens is optional and only actually read by the editorial layout today —
// the other layouts' character is untouched by BrandDesignTokens this pass.
export type CarouselLayout = {
  cover: (props: CarouselCardProps, totalSlides: number, tokens?: BrandDesignTokens) => string;
  item: (
    props: CarouselCardProps,
    opts: { text: string; slideIndex: number; itemNumber: number; totalSlides: number },
    tokens?: BrandDesignTokens
  ) => string;
  cta: (props: CarouselCardProps, totalSlides: number, tokens?: BrandDesignTokens) => string;
};

export const CAROUSEL_VARIANTS: Record<string, CarouselLayout> = {
  centered: { cover: renderCarouselCover, item: renderCarouselItem, cta: renderCarouselCta },
  editorial: { cover: renderCarouselCoverEditorial, item: renderCarouselItemEditorial, cta: renderCarouselCtaEditorial },
  brutalist: { cover: renderCarouselCoverBrutalist, item: renderCarouselItemBrutalist, cta: renderCarouselCtaBrutalist },
};

export function pickCarouselVariant(variantKey?: string): CarouselLayout {
  if (variantKey && CAROUSEL_VARIANTS[variantKey]) return CAROUSEL_VARIANTS[variantKey];
  return CAROUSEL_VARIANTS.centered;
}

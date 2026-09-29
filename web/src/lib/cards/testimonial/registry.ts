import type { TestimonialCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderTestimonialSpotlight } from "./card";
import { renderTestimonialEditorial } from "./editorial";
import { renderTestimonialPastel } from "./pastel";

// tokens is optional and only actually read by renderTestimonialEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const TESTIMONIAL_VARIANTS: Record<string, (props: TestimonialCardProps, tokens?: BrandDesignTokens) => string> = {
  spotlight: renderTestimonialSpotlight,
  editorial: renderTestimonialEditorial,
  pastel: renderTestimonialPastel,
};

export function pickTestimonialVariant(
  variantKey?: string
): (props: TestimonialCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && TESTIMONIAL_VARIANTS[variantKey]) return TESTIMONIAL_VARIANTS[variantKey];
  return TESTIMONIAL_VARIANTS.spotlight;
}

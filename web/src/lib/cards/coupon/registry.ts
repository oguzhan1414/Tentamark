import type { CouponCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderCouponTicket } from "./ticket";
import { renderCouponModern } from "./modern";
import { renderCouponBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderCouponModern today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const COUPON_VARIANTS: Record<string, (props: CouponCardProps, tokens?: BrandDesignTokens) => string> = {
  ticket: renderCouponTicket,
  modern: renderCouponModern,
  brutalist: renderCouponBrutalist,
};

export function pickCouponVariant(variantKey?: string): (props: CouponCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && COUPON_VARIANTS[variantKey]) return COUPON_VARIANTS[variantKey];
  return COUPON_VARIANTS.ticket;
}

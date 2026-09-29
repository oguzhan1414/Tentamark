import type { NotificationCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderNotificationBubble } from "./bubble";
import { renderNotificationLight } from "./light";
import { renderNotificationBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderNotificationLight
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const NOTIFICATION_VARIANTS: Record<string, (props: NotificationCardProps, tokens?: BrandDesignTokens) => string> = {
  bubble: renderNotificationBubble,
  light: renderNotificationLight,
  brutalist: renderNotificationBrutalist,
};

export function pickNotificationVariant(
  variantKey?: string
): (props: NotificationCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && NOTIFICATION_VARIANTS[variantKey]) return NOTIFICATION_VARIANTS[variantKey];
  return NOTIFICATION_VARIANTS.bubble;
}

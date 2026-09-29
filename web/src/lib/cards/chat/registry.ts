import type { ChatCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderChatIos } from "./ios";
import { renderChatWhatsapp } from "./whatsapp";
import { renderChatDark } from "./dark";

// tokens is optional and only actually read (for fonts) by renderChatIos
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const CHAT_VARIANTS: Record<string, (props: ChatCardProps, tokens?: BrandDesignTokens) => string> = {
  ios: renderChatIos,
  whatsapp: renderChatWhatsapp,
  dark: renderChatDark,
};

export function pickChatVariant(variantKey?: string): (props: ChatCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && CHAT_VARIANTS[variantKey]) return CHAT_VARIANTS[variantKey];
  return CHAT_VARIANTS.ios;
}

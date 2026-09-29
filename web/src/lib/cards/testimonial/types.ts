export type CardFormat = "square" | "story";

export type TestimonialCardProps = {
  testimonialText: string;
  customerName: string;
  customerRole?: string;
  customerAvatarUrl?: string | null;
  rating?: number; // 1-5, omit to hide the star row entirely
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function testimonialCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#FA5252";
}

export function fontSizeForLength(length: number, format: CardFormat): number {
  const base = format === "story" ? 44 : 38;
  if (length <= 60) return base;
  if (length <= 120) return base * 0.85;
  if (length <= 200) return base * 0.7;
  return base * 0.58;
}

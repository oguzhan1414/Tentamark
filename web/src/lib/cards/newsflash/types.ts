export type CardFormat = "square" | "story" | "landscape";

export type NewsFlashCardProps = {
  bgImageUrl: string;
  badgeText: string;
  sourceText?: string;
  headline: string;
  ctaText?: string;
  bubbleText?: string;
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

export function newsFlashCardDimensions(format: CardFormat) {
  return DIMENSIONS[format] || DIMENSIONS.square;
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#EF4444";
}

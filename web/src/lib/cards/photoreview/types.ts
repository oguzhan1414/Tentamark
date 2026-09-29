export type CardFormat = "square" | "story" | "landscape";

export type PhotoReviewCardProps = {
  bgImageUrl: string;
  headerText: string;
  reviewText: string;
  customerName: string;
  customerAvatarUrl?: string;
  rating?: number;
  badgeText?: string;
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

export function photoReviewCardDimensions(format: CardFormat) {
  return DIMENSIONS[format] || DIMENSIONS.square;
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#EAB308";
}

export type CardFormat = "square" | "story";

export type ComparisonCardProps = {
  leftLabel: string;
  leftText: string;
  rightLabel: string;
  rightText: string;
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function comparisonCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#FA5252";
}

export function fontSizeForLength(length: number): number {
  if (length <= 40) return 40;
  if (length <= 80) return 32;
  return 26;
}

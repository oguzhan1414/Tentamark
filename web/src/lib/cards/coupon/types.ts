export type CardFormat = "square" | "story";

export type CouponCardProps = {
  discountText: string; // e.g. "%30 İNDİRİM"
  couponCode: string; // e.g. "TENTA30"
  headline: string; // e.g. "Büyük Sezon Sonu İndirimi Başladı"
  expiryText?: string; // e.g. "Son Gün: Pazar 23:59"
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function couponCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#FA5252";
}

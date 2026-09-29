export type CardFormat = "square" | "story";

export type ThisOrThatCardProps = {
  question: string; // e.g. "Pazarlamada Hangisi Daha Önemli?"
  optionA: string; // e.g. "Tutarlı Organik İçerik"
  optionB: string; // e.g. "Agresif Reklam Bütçesi"
  ctaText?: string; // e.g. "Yorumlarda Belirt 👇", "Oyunu Kullan 📊"
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function thisOrThatCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#6366F1";
}

export type CardFormat = "square" | "story";

export type FeatureTableCardProps = {
  title: string;
  feature1: string;
  competitor1: string;
  tentamark1: string;
  feature2: string;
  competitor2: string;
  tentamark2: string;
  feature3: string;
  competitor3: string;
  tentamark3: string;
  feature4?: string;
  competitor4?: string;
  tentamark4?: string;
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function featureTableCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#00E599";
}

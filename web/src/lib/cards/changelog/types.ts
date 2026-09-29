export type CardFormat = "square" | "story";

export type ChangelogCardProps = {
  badge: string; // e.g. "v2.4 Yayında", "YENİ ÖZELLİK"
  title: string; // Feature headline
  description: string; // Detail description
  codeSnippet?: string; // Optional code snippet, terminal command, or bullet highlights
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function changelogCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#00E599";
}

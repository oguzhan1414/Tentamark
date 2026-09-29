export type QuoteCardFormat = "square" | "story";

export type QuoteCardProps = {
  quote: string;
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string; // hex, defaults to Tentamark rose
  format: QuoteCardFormat;
};

const DIMENSIONS: Record<QuoteCardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function quoteCardDimensions(format: QuoteCardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Font-size scales down as the quote gets longer so a short punchy line and
// a long sentence both fill the card well instead of one looking tiny and
// the other overflowing — the real, ongoing problem flagged when this
// approach was first discussed (AI-written captions vary wildly in length).
// Every layout in this folder should run its quote text through this
// rather than picking its own fixed size.
export function fontSizeForLength(length: number, format: QuoteCardFormat): number {
  const base = format === "story" ? 88 : 76;
  if (length <= 40) return base;
  if (length <= 80) return base * 0.82;
  if (length <= 140) return base * 0.64;
  return base * 0.5;
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#FA5252";
}

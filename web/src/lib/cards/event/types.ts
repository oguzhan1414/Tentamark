export type CardFormat = "square" | "story";

export type EventCardProps = {
  eventTitle: string;
  dateText: string; // e.g. "28 Eylül Perşembe • 20:00"
  speaker1Name: string;
  speaker1Role: string;
  speaker1AvatarUrl?: string | null;
  speaker2Name?: string;
  speaker2Role?: string;
  speaker2AvatarUrl?: string | null;
  badgeText?: string; // e.g. "CANLI YAYIN 🔴", "WEBINAR", "X SPACE"
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function eventCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#FA5252";
}

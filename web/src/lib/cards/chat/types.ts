export type CardFormat = "square" | "story";

export type ChatCardProps = {
  senderName: string; // e.g. "Mutlu Müşteri"
  incomingMessage: string; // e.g. "Siparişim ne zaman kargoya verilir acaba?"
  outgoingMessage: string; // e.g. "Tüm siparişlerimiz aynı gün kargoda ve 24 saatte kapınızda! 🚀"
  timeText?: string; // e.g. "14:32 • İletildi"
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function chatCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#007AFF";
}

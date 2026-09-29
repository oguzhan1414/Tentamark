export type CardFormat = "square" | "story";

export type CarouselCardProps = {
  title: string;
  items: string[]; // one string per content slide, cover/CTA are generated around these
  ctaLabel?: string; // defaults to a generic save/follow prompt
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function carouselCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#FA5252";
}

// Shared chrome every slide in a set renders so the set reads as one
// connected object, not three separate cards — page dots, brand row corner.
export function pageDots(total: number, activeIndex: number, accent: string): string {
  return Array.from({ length: total }, (_, i) =>
    `<span style="width:${i === activeIndex ? 22 : 7}px;height:7px;border-radius:999px;background:${
      i === activeIndex ? accent : "#ffffff33"
    };transition:none;"></span>`
  ).join("");
}

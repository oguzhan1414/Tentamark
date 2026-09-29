import { getCardTemplate } from "./templateFieldConfig";

// The 10 content-purpose categories from the Creative Studio roadmap
// (docs/14-creative-studio-roadmap-27.09.2026.md §5.3).
export type ContentPurpose =
  | "product_intro"
  | "discount_campaign"
  | "educational"
  | "list_checklist"
  | "stat_data"
  | "customer_review"
  | "comparison"
  | "event"
  | "announcement_news"
  | "founder_personal";

export const CONTENT_PURPOSES: ContentPurpose[] = [
  "product_intro",
  "discount_campaign",
  "educational",
  "list_checklist",
  "stat_data",
  "customer_review",
  "comparison",
  "event",
  "announcement_news",
  "founder_personal",
];

export const CONTENT_PURPOSE_LABELS: Record<ContentPurpose, { tr: string; en: string }> = {
  product_intro: { tr: "Ürün tanıtımı", en: "Product introduction" },
  discount_campaign: { tr: "İndirim/kampanya", en: "Discount / campaign" },
  educational: { tr: "Eğitici içerik", en: "Educational content" },
  list_checklist: { tr: "Liste/checklist", en: "List / checklist" },
  stat_data: { tr: "İstatistik/veri", en: "Stat / data" },
  customer_review: { tr: "Müşteri yorumu", en: "Customer review" },
  comparison: { tr: "Karşılaştırma", en: "Comparison" },
  event: { tr: "Etkinlik", en: "Event" },
  announcement_news: { tr: "Duyuru/haber", en: "Announcement / news" },
  founder_personal: { tr: "Kurucu/kişisel marka", en: "Founder / personal brand" },
};

export type SuggestionTier = "safe" | "bold" | "experimental";

type SuggestionSlot = { templateKey: string; variantKey: string; tier: SuggestionTier };

// Hand-curated, deterministic — every {templateKey, variantKey} pair here is
// verified against the real registry keys in each type's registry.ts (not
// templateFieldConfig.ts's UI labels, which for podcast/photoreview/deal/
// newsflash used to be kebab-case and silently didn't match — fixed
// alongside this file). One "safe" (brand-consistent, light/editorial),
// one "bold" (more dramatic/colorful), one "experimental" (a different
// template entirely, or an unusual skin) per purpose.
export const TEMPLATE_SUGGESTIONS: Record<ContentPurpose, SuggestionSlot[]> = {
  product_intro: [
    { templateKey: "product", variantKey: "editorial", tier: "safe" },
    { templateKey: "product", variantKey: "hero", tier: "bold" },
    { templateKey: "deal", variantKey: "lifestyleSplit", tier: "experimental" },
  ],
  discount_campaign: [
    { templateKey: "coupon", variantKey: "ticket", tier: "safe" },
    { templateKey: "coupon", variantKey: "modern", tier: "bold" },
    { templateKey: "deal", variantKey: "boldBanner", tier: "experimental" },
  ],
  educational: [
    { templateKey: "notes", variantKey: "notion", tier: "safe" },
    { templateKey: "checklist", variantKey: "editorial", tier: "bold" },
    { templateKey: "problemsolution", variantKey: "stacked", tier: "experimental" },
  ],
  list_checklist: [
    { templateKey: "checklist", variantKey: "editorial", tier: "safe" },
    { templateKey: "checklist", variantKey: "aurora", tier: "bold" },
    { templateKey: "featuretable", variantKey: "dark", tier: "experimental" },
  ],
  stat_data: [
    { templateKey: "stat", variantKey: "editorial", tier: "safe" },
    { templateKey: "trend", variantKey: "chart", tier: "bold" },
    { templateKey: "stat", variantKey: "cyber", tier: "experimental" },
  ],
  customer_review: [
    { templateKey: "testimonial", variantKey: "editorial", tier: "safe" },
    { templateKey: "photoreview", variantKey: "warmEditorial", tier: "bold" },
    { templateKey: "chat", variantKey: "whatsapp", tier: "experimental" },
  ],
  comparison: [
    { templateKey: "comparison", variantKey: "editorial", tier: "safe" },
    { templateKey: "featuretable", variantKey: "dark", tier: "bold" },
    { templateKey: "thisorthat", variantKey: "brutalist", tier: "experimental" },
  ],
  event: [
    { templateKey: "event", variantKey: "editorial", tier: "safe" },
    { templateKey: "event", variantKey: "dark", tier: "bold" },
    { templateKey: "podcast", variantKey: "neonPurple", tier: "experimental" },
  ],
  announcement_news: [
    { templateKey: "changelog", variantKey: "editorial", tier: "safe" },
    { templateKey: "newsflash", variantKey: "breakingRed", tier: "bold" },
    { templateKey: "notification", variantKey: "bubble", tier: "experimental" },
  ],
  founder_personal: [
    { templateKey: "quote", variantKey: "editorial", tier: "safe" },
    { templateKey: "notes", variantKey: "darknotes", tier: "bold" },
    { templateKey: "socialpost", variantKey: "dark", tier: "experimental" },
  ],
};

export type ResolvedSuggestion = {
  templateKey: string;
  templateLabel: { tr: string; en: string };
  variantKey: string;
  variantLabel: { tr: string; en: string };
  colorPreview: string;
  tier: SuggestionTier;
};

// Resolves each slot against the live CARD_TEMPLATES config so labels/colors
// never drift out of sync — a slot whose templateKey/variantKey no longer
// exists (e.g. a future rename) is dropped rather than shown broken.
export function getTemplateSuggestions(purpose: ContentPurpose): ResolvedSuggestion[] {
  const slots = TEMPLATE_SUGGESTIONS[purpose] ?? [];
  const resolved: ResolvedSuggestion[] = [];
  for (const slot of slots) {
    const template = getCardTemplate(slot.templateKey);
    const variant = template?.variants?.find((v) => v.key === slot.variantKey);
    if (!template || !variant) continue;
    resolved.push({
      templateKey: template.key,
      templateLabel: template.label,
      variantKey: variant.key,
      variantLabel: variant.label,
      colorPreview: variant.colorPreview,
      tier: slot.tier,
    });
  }
  return resolved;
}

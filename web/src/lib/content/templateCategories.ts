import { translations, type Locale } from "@/lib/i18n/translations";

export type TemplateCategoryId = "musteri_yorumu" | "haftalik_ipucu" | "urun_lansmani" | "genel";

export const TEMPLATE_CATEGORY_ICONS: Record<TemplateCategoryId, string> = {
  musteri_yorumu: "💬",
  haftalik_ipucu: "💡",
  urun_lansmani: "🚀",
  genel: "📄",
};

export function getTemplateCategories(localeOrIsEn?: Locale | boolean) {
  const loc: Locale = typeof localeOrIsEn === "string" ? localeOrIsEn : localeOrIsEn ? "en" : "tr";
  const catDict = translations[loc].dashboard.templates.categories;
  const ids: TemplateCategoryId[] = ["musteri_yorumu", "haftalik_ipucu", "urun_lansmani", "genel"];
  return ids.map((id) => ({
    id,
    label: catDict[id] ?? id,
    icon: TEMPLATE_CATEGORY_ICONS[id] ?? "📄",
  }));
}

export function templateCategoryIcon(id: string | null): string {
  if (!id) return "📄";
  return TEMPLATE_CATEGORY_ICONS[id as TemplateCategoryId] ?? "📄";
}

export function templateCategoryLabel(id: string | null, localeOrIsEn?: Locale | boolean): string {
  const loc: Locale = typeof localeOrIsEn === "string" ? localeOrIsEn : localeOrIsEn ? "en" : "tr";
  const catDict = translations[loc].dashboard.templates.categories;
  if (!id) return catDict.genel;
  return catDict[id as TemplateCategoryId] ?? catDict.genel;
}

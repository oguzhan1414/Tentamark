export type TemplateCategoryId = "musteri_yorumu" | "haftalik_ipucu" | "urun_lansmani" | "genel";

export const TEMPLATE_CATEGORIES: { id: TemplateCategoryId; label: string; labelEn: string; icon: string }[] = [
  { id: "musteri_yorumu", label: "Müşteri Yorumu", labelEn: "Customer Review", icon: "💬" },
  { id: "haftalik_ipucu", label: "Haftalık İpucu", labelEn: "Weekly Tip", icon: "💡" },
  { id: "urun_lansmani", label: "Ürün Lansmanı", labelEn: "Product Launch", icon: "🚀" },
  { id: "genel", label: "Genel", labelEn: "General", icon: "📄" },
];

export function getTemplateCategories(isEn?: boolean) {
  return TEMPLATE_CATEGORIES.map((c) => ({
    id: c.id,
    label: isEn ? c.labelEn : c.label,
    icon: c.icon,
  }));
}

export function templateCategoryIcon(id: string | null): string {
  return TEMPLATE_CATEGORIES.find((c) => c.id === id)?.icon ?? "📄";
}

export function templateCategoryLabel(id: string | null, isEn?: boolean): string {
  const item = TEMPLATE_CATEGORIES.find((c) => c.id === id);
  if (!item) return isEn ? "General" : "Genel";
  return isEn ? item.labelEn : item.label;
}

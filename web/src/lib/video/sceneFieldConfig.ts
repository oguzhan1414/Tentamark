import type { SceneArchetype } from "./types";

// The video-scene equivalent of cards/templateFieldConfig.ts — maps each
// scene archetype to which of its own copy fields the storyboard editor
// shows as an editable input. "lines2" is hook's fixed 2-line headline
// (rendered as two separate inputs); "stringList" fields (badges/bullets)
// are edited as one entry per line, same convention the card-image editor
// already uses for its own "lines" field kind.
export type SceneFieldKind = "text" | "textarea" | "lines2" | "stringList";

export type SceneFieldConfig = {
  key: string;
  kind: SceneFieldKind;
  label: { tr: string; en: string };
};

// user_clip has no editable copy at all — it's just the user's own footage.
export const SCENE_FIELD_CONFIG: Partial<Record<SceneArchetype, SceneFieldConfig[]>> = {
  hook: [
    { key: "lines", kind: "lines2", label: { tr: "Başlık Satırları", en: "Headline Lines" } },
    { key: "highlightWord", kind: "text", label: { tr: "Vurgulanan Kelime", en: "Highlighted Word" } },
  ],
  feature: [
    { key: "eyebrow", kind: "text", label: { tr: "Üst Etiket", en: "Eyebrow" } },
    { key: "title", kind: "text", label: { tr: "Başlık", en: "Title" } },
    { key: "description", kind: "textarea", label: { tr: "Açıklama", en: "Description" } },
    { key: "badges", kind: "stringList", label: { tr: "Rozetler (her satıra bir tane)", en: "Badges (one per line)" } },
  ],
  product: [
    { key: "title", kind: "text", label: { tr: "Başlık", en: "Title" } },
    { key: "badges", kind: "stringList", label: { tr: "Rozetler (her satıra bir tane)", en: "Badges (one per line)" } },
  ],
  review: [
    { key: "quote", kind: "textarea", label: { tr: "Müşteri Yorumu", en: "Customer Quote" } },
    { key: "authorName", kind: "text", label: { tr: "Yorum Sahibi", en: "Author" } },
  ],
  wrapped: [
    { key: "headline", kind: "text", label: { tr: "Başlık", en: "Headline" } },
    { key: "metricValue", kind: "text", label: { tr: "Değer", en: "Metric Value" } },
    { key: "metricLabel", kind: "text", label: { tr: "Değer Etiketi", en: "Metric Label" } },
    { key: "comparisonText", kind: "textarea", label: { tr: "Karşılaştırma Metni", en: "Comparison Text" } },
  ],
  ugc_split: [
    { key: "badgeText", kind: "text", label: { tr: "Rozet", en: "Badge" } },
    { key: "title", kind: "text", label: { tr: "Başlık", en: "Title" } },
    { key: "bullets", kind: "stringList", label: { tr: "Maddeler (her satıra bir tane)", en: "Bullets (one per line)" } },
    { key: "ctaLabel", kind: "text", label: { tr: "Aksiyon Metni", en: "CTA Label" } },
  ],
  stat: [
    { key: "headline", kind: "text", label: { tr: "Başlık", en: "Headline" } },
    { key: "supporting", kind: "textarea", label: { tr: "Destek Metni", en: "Supporting Text" } },
  ],
  carousel: [{ key: "caption", kind: "textarea", label: { tr: "Alt Yazı", en: "Caption" } }],
  outro: [
    { key: "tagline", kind: "text", label: { tr: "Kapanış Cümlesi", en: "Tagline" } },
    { key: "ctaLabel", kind: "text", label: { tr: "Aksiyon Metni", en: "CTA Label" } },
  ],
};

// Which of an archetype's own props holds swappable image URL(s), if any —
// drives whether the storyboard card shows a "Görseli Değiştir" button.
export const SCENE_IMAGE_FIELD: Partial<Record<SceneArchetype, "imageUrl" | "imageUrls">> = {
  feature: "imageUrl",
  product: "imageUrl",
  carousel: "imageUrls",
};

export function canRegenerateWithAI(archetype: SceneArchetype): boolean {
  return archetype !== "user_clip";
}

// hook/outro bookend every recipe — see scenePlanEditor.ts's isBookend().
export function canDeleteOrDuplicate(archetype: SceneArchetype): boolean {
  return archetype !== "hook" && archetype !== "outro";
}

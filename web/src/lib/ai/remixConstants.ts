export type RemixTone =
  | "shorter"
  | "casual"
  | "professional"
  | "storytelling"
  | "action";

export interface RemixOption {
  id: RemixTone;
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  badge: string;
}

export const REMIX_OPTIONS: RemixOption[] = [
  {
    id: "shorter",
    label: "Kısa & Vurucu",
    labelEn: "Short & Punchy",
    icon: "⚡",
    description: "Gereksiz lafları atar, tek nefeste okunan 2-3 kancalı cümleye indirir.",
    descriptionEn: "Cuts the fluff down to 2-3 punchy, scroll-stopping sentences.",
    badge: "Punchy",
  },
  {
    id: "casual",
    label: "Samimi & Esprili",
    labelEn: "Casual & Fun",
    icon: "🎭",
    description: "Sıcak, esprili, kahve sohbeti samimiyetinde ve doğal emojili.",
    descriptionEn: "Warm, witty, conversational and loaded with relatable natural energy.",
    badge: "Sıcak",
  },
  {
    id: "professional",
    label: "Profesyonel & B2B",
    labelEn: "Professional & B2B",
    icon: "💼",
    description: "Sektör otoritesi, güven veren kurumsal ve içgörü odaklı dil.",
    descriptionEn: "Authoritative, insightful, thought-leadership tone fit for LinkedIn.",
    badge: "Otoriter",
  },
  {
    id: "storytelling",
    label: "Hikaye Anlatımı",
    labelEn: "Storytelling",
    icon: "📖",
    description: "Problem → Kırılma Noktası → Zafer kurgusunda sürükleyici anlatım.",
    descriptionEn: "Hook → Tension → Breakthrough structure that keeps eyes reading.",
    badge: "Hikaye",
  },
  {
    id: "action",
    label: "Satış & Eylem (CTA)",
    labelEn: "Direct Action (CTA)",
    icon: "🚀",
    description: "Doğrudan dönüşüm, aciliyet hissi ve net aksiyon çağrısı.",
    descriptionEn: "High-conversion copy designed to trigger clicks, saves, or DMs.",
    badge: "Dönüşüm",
  },
];

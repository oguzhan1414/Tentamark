export type LaunchPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "threads"
  | "tiktok"
  | "pinterest"
  | "telegram"
  | "youtube";

export const ALL_PLATFORMS: LaunchPlatform[] = [
  "instagram",
  "facebook",
  "linkedin",
  "threads",
  "tiktok",
  "pinterest",
  "telegram",
  "youtube",
];

export const PLATFORM_LABEL: Record<LaunchPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  threads: "Threads",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  telegram: "Telegram",
  youtube: "YouTube",
};

export const PLATFORM_RULE: Record<LaunchPlatform, string> = {
  instagram: "Instagram: kısa, enerjik, samimi. Gerekirse 1-2 emoji ve ilgili hashtag kullan.",
  facebook: "Facebook: sıcak, topluluk odaklı, biraz daha uzun olabilir.",
  linkedin: "LinkedIn: profesyonel, düşünce lideri tonunda, emoji kullanma.",
  threads: "Threads: kısa, sohbet/akış tonunda, güncel ve doğal — X/Twitter'a yakın bir ritimde yaz, gerekirse emoji kullan.",
  tiktok: "TikTok: dikey videoya eşlik eden kısa, enerjik bir altyazı — resmi/kurumsal durma, ilgili hashtag'leri ekle.",
  pinterest:
    "Pinterest: aranabilir, anahtar kelime dolu bir açıklama yaz — kullanıcılar Pinterest'te arama yapar, akışta kaymaz. Emoji'den kaçın, net ve tarif eder gibi anlat.",
  telegram:
    "Telegram: samimi, doğrudan bir kanal duyurusu tonunda — topluluğa konuşur gibi yaz, kısa paragraflar ve gerekirse emoji kullanabilirsin.",
  youtube:
    "YouTube: video başlığı gibi düşün — ilk cümle merak uyandırsın, devamında video içeriğini özetleyen, anahtar kelime içeren bir açıklama yaz.",
};

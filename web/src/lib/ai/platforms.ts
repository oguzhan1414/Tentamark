export type LaunchPlatform = "instagram" | "facebook" | "linkedin" | "threads" | "tiktok";

export const ALL_PLATFORMS: LaunchPlatform[] = ["instagram", "facebook", "linkedin", "threads", "tiktok"];

export const PLATFORM_LABEL: Record<LaunchPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  threads: "Threads",
  tiktok: "TikTok",
};

export const PLATFORM_RULE: Record<LaunchPlatform, string> = {
  instagram: "Instagram: kısa, enerjik, samimi. Gerekirse 1-2 emoji ve ilgili hashtag kullan.",
  facebook: "Facebook: sıcak, topluluk odaklı, biraz daha uzun olabilir.",
  linkedin: "LinkedIn: profesyonel, düşünce lideri tonunda, emoji kullanma.",
  threads: "Threads: kısa, sohbet/akış tonunda, güncel ve doğal — X/Twitter'a yakın bir ritimde yaz, gerekirse emoji kullan.",
  tiktok: "TikTok: dikey videoya eşlik eden kısa, enerjik bir altyazı — resmi/kurumsal durma, ilgili hashtag'leri ekle.",
};

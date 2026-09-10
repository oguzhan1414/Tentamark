export type LaunchPlatform = "instagram" | "facebook" | "linkedin";

export const ALL_PLATFORMS: LaunchPlatform[] = ["instagram", "facebook", "linkedin"];

export const PLATFORM_LABEL: Record<LaunchPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

export const PLATFORM_RULE: Record<LaunchPlatform, string> = {
  instagram: "Instagram: kısa, enerjik, samimi. Gerekirse 1-2 emoji ve ilgili hashtag kullan.",
  facebook: "Facebook: sıcak, topluluk odaklı, biraz daha uzun olabilir.",
  linkedin: "LinkedIn: profesyonel, düşünce lideri tonunda, emoji kullanma.",
};

export type HashtagCategory = "broad" | "niche" | "industry";

export interface SmartHashtagGroup {
  category: HashtagCategory;
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  colorClass: {
    bg: string;
    border: string;
    text: string;
    chipActive: string;
    chipInactive: string;
  };
  tags: string[];
}

export interface SmartHashtagsResult {
  groups: SmartHashtagGroup[];
  recommendedCount: number;
  platformTip: string;
  platformTipEn: string;
  suggestedTags: string[];
}

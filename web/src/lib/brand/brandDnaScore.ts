// Pure function, no I/O — the caller (brand/page.tsx) already has every
// field loaded into React state, so this just scores what's already there
// rather than re-fetching. A weighted checklist, not machine learning: the
// weights reflect how much each field actually changes AI output quality
// (getBrandContext.ts reads every one of these into the prompt every call).

export type BrandDnaScoreInput = {
  industry: string;
  toneOfVoice: string;
  brandTraits: string[];
  targetAudience: string[];
  personaLabel: string;
  competitors: string[];
  competitorAnalysisCount: number;
  traitScores: Record<string, number>;
  forbiddenWords: string[];
  founderName: string;
};

export type BrandDnaScoreResult = {
  score: number; // 0-100
  missing: string[]; // Turkish labels, in the order they were checked
};

export function computeBrandDnaScore(input: BrandDnaScoreInput): BrandDnaScoreResult {
  let score = 0;
  const missing: string[] = [];

  // Core identity — 40
  if (input.industry.trim()) score += 10;
  else missing.push("Sektör");

  if (input.toneOfVoice.trim().length > 15) score += 15;
  else missing.push("Ses Tonu");

  if (input.brandTraits.length >= 2) score += 15;
  else missing.push("Marka Nitelikleri");

  // Audience — 25
  if (input.targetAudience.length > 0) score += 15;
  else missing.push("Hedef Kitle");

  if (input.personaLabel.trim()) score += 10;
  else missing.push("Müşteri Personası");

  // Competitive context — 15
  if (input.competitors.length > 0) score += 10;
  else missing.push("Rakipler");

  if (input.competitorAnalysisCount > 0) score += 5;
  else missing.push("Rakip Analizi");

  // Voice precision — 15
  const traitsCustomized = Object.values(input.traitScores).some((v) => v !== 50);
  if (traitsCustomized) score += 8;
  else missing.push("Karakter Skorları");

  if (input.forbiddenWords.length > 0) score += 7;
  else missing.push("Yasaklı Kelimeler");

  // Bonus — 5 (optional feature, doesn't block a "complete" score the same way)
  if (input.founderName.trim()) score += 5;
  else missing.push("Kurucu Sesi (opsiyonel)");

  return { score: Math.round(score), missing };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { getLatestStrategy } from "./generateStrategy";
import { getAudienceInsight } from "./getAudienceInsight";

export type BrandIntelligenceSummary = {
  profileCompletenessPct: number;
  strategyAdherencePct: number | null; // null = not enough data yet
  competitorCount: number;
  strategyVersion: number | null;
  strategyGeneratedAt: string | null;
  findings: string[];
  recommendation: string | null;
};

/*
  Every number here is either a direct count/percentage from real rows, or
  explicitly null when there isn't enough data — no "Pazar Değişimi +14%" /
  "Rakip Hareketliliği Yüksek" style KPIs, because nothing in this app
  measures market movement or competitor activity yet (see the honesty
  boundary already established in getAudienceInsight.ts and the competitor
  analysis feature: AI-knowledge estimates are labeled as such, never
  presented as live-tracked data).
*/
export async function getBrandIntelligenceSummary(brandId: string): Promise<BrandIntelligenceSummary> {
  const supabase = await createClient();

  const [{ data: dna }, strategy, audienceInsight] = await Promise.all([
    supabase
      .from("brand_dna")
      .select(
        "industry, tone_of_voice, brand_traits, target_audience, competitors, competitor_analysis, audience_persona, trait_scores"
      )
      .eq("brand_id", brandId)
      .maybeSingle(),
    getLatestStrategy(brandId),
    getAudienceInsight(brandId),
  ]);

  // Profile completeness: 7 real fields, each either filled or not.
  const checks = [
    Boolean(dna?.industry),
    Boolean(dna?.tone_of_voice),
    Array.isArray(dna?.brand_traits) && dna.brand_traits.length > 0,
    Array.isArray(dna?.target_audience) && dna.target_audience.length > 0,
    Array.isArray(dna?.competitors) && dna.competitors.length > 0,
    Boolean((dna?.audience_persona as Record<string, unknown> | null)?.label),
    Boolean(strategy),
  ];
  const profileCompletenessPct = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );

  const competitorCount = Array.isArray(dna?.competitor_analysis) ? dna.competitor_analysis.length : 0;

  // Strategy adherence: reuse the same real signal as the audience insight —
  // present iff there was enough recent categorized content to compute a gap.
  const strategyAdherencePct = audienceInsight
    ? 100 - Math.abs(audienceInsight.plannedPercentage - audienceInsight.actualPercentage)
    : null;

  const findings: string[] = [];
  if (strategy) {
    findings.push(
      `Aktif strateji v${strategy.version}.0 — ${new Date(strategy.generated_at).toLocaleDateString("tr-TR")} tarihinde üretildi.`
    );
    if (strategy.changeNotes.pillarDiffs.length > 0) {
      const d = strategy.changeNotes.pillarDiffs[0];
      const from = d.oldPercentage === null ? "yeni eklendi" : `%${d.oldPercentage}`;
      const to = d.newPercentage === null ? "kaldırıldı" : `%${d.newPercentage}`;
      findings.push(`"${d.name}" sütunu son güncellemede ${from} → ${to} olarak değişti.`);
    }
  }
  if (audienceInsight) {
    findings.push(audienceInsight.text);
  }
  if (competitorCount > 0) {
    findings.push(`${competitorCount} rakip profili takip listenizde kayıtlı.`);
  }

  const recommendation = audienceInsight?.text ?? null;

  return {
    profileCompletenessPct,
    strategyAdherencePct,
    competitorCount,
    strategyVersion: strategy?.version ?? null,
    strategyGeneratedAt: strategy?.generated_at ?? null,
    findings: findings.slice(0, 4),
    recommendation,
  };
}

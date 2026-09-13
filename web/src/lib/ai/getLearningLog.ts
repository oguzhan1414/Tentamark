"use server";

import { createClient } from "@/lib/supabase/server";

export type LearningLogDay = {
  date: string; // yyyy-mm-dd
  entries: string[];
};

const STAGE_LABELS: Record<string, string> = {
  brand_autofill: "Marka web sitesi analiz edildi",
  positioning_and_strategy: "İçerik stratejisi güncellendi",
  audience_insight: "Kitle-strateji uyum analizi çalıştırıldı",
  weekly_pack: "Haftalık içerik paketi üretildi",
  idea: "İçerik fikri üretildi",
  platform_adapt: "Platforma özel uyarlama yapıldı",
  quality_pass: "Kalite kontrolü çalıştırıldı",
  dashboard_briefing: "Panel özeti güncellendi",
};

function labelFor(stage: string): string {
  return STAGE_LABELS[stage] ?? `${stage} çalıştırıldı`;
}

// Real ai_runs rows only — every entry here is something that actually
// happened and was logged, grouped and counted, not narrated/invented.
export async function getLearningLog(brandId: string, days = 14): Promise<LearningLogDay[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("ai_runs")
    .select("stage, status, created_at")
    .eq("brand_id", brandId)
    .eq("status", "SUCCESS")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const byDate = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const date = new Date(row.created_at).toISOString().slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, new Map());
    const stageCounts = byDate.get(date)!;
    stageCounts.set(row.stage, (stageCounts.get(row.stage) ?? 0) + 1);
  }

  return Array.from(byDate.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, stageCounts]) => ({
      date,
      entries: Array.from(stageCounts.entries()).map(([stage, count]) =>
        count > 1 ? `${labelFor(stage)} (${count})` : labelFor(stage)
      ),
    }));
}

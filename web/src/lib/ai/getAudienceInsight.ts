"use server";

import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq } from "./groqModel";
import { getLatestStrategy } from "./generateStrategy";

const PROMPT_VERSION = "audience-insight-v1";
const MIN_SAMPLE = 3;
const MIN_GAP = 10;

export type AudienceInsight = {
  text: string;
  pillarName: string;
  plannedPercentage: number;
  actualPercentage: number;
  sampleSize: number;
};

/*
  Real, not performance-based — there is no engagement/analytics ingestion
  pipeline wired up yet (analytics_snapshots exists in schema but nothing
  writes to it), so anything claiming "this topic performs better" would be
  fabricated. What IS real: content.category gets set to the strategy's own
  pillar name when content is created via the weekly-pack flow (see
  generateWeeklyPack.ts + compose/weekly/page.tsx), so actual production mix
  vs the planned pillar percentages is a genuine, measurable adherence gap.
*/
export async function getAudienceInsight(brandId: string): Promise<AudienceInsight | null> {
  const strategy = await getLatestStrategy(brandId);
  const pillars = strategy?.payload?.content_pillars ?? [];
  if (pillars.length === 0) return null;

  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentContent } = await supabase
    .from("content")
    .select("category")
    .eq("brand_id", brandId)
    .not("category", "is", null)
    .gte("created_at", since);

  const items = recentContent ?? [];
  if (items.length < MIN_SAMPLE) return null;

  const counts: Record<string, number> = {};
  for (const item of items) {
    const cat = String(item.category);
    counts[cat] = (counts[cat] ?? 0) + 1;
  }

  let biggest: { name: string; planned: number; actual: number; gap: number } | null = null;
  for (const pillar of pillars) {
    const actualCount = counts[pillar.name] ?? 0;
    const actual = Math.round((actualCount / items.length) * 100);
    const gap = Math.abs(pillar.percentage - actual);
    if (!biggest || gap > biggest.gap) {
      biggest = { name: pillar.name, planned: pillar.percentage, actual, gap };
    }
  }

  if (!biggest || biggest.gap < MIN_GAP) return null;

  const direction = biggest.actual < biggest.planned ? "hedefin altında kalıyor" : "hedefin üzerinde";
  const fallbackText = `"${biggest.name}" sütunu stratejinizde %${biggest.planned} olarak planlanmış, ancak son 30 günde üretilen içeriğin %${biggest.actual}'i bu kategoride (${items.length} içerik incelendi) — ${direction}.`;

  const startedAt = Date.now();
  let text = fallbackText;
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const system =
      "Sen Tentamark'ın içerik-strateji uyum analizcisisin. Sana gerçek, ölçülmüş rakamlar " +
      "vereceğim. Bu rakamları kullanarak tek cümlelik doğal bir Türkçe içgörü yaz. Rakamları " +
      "OLDUĞU GİBİ kullan, değiştirme, yuvarlama, tahmin veya öneri ekleme. Selamlama veya " +
      "giriş cümlesi yazma, doğrudan içgörü cümlesiyle başla.";
    const userMsg = [
      `Sütun: ${biggest.name}`,
      `Planlanan pay: %${biggest.planned}`,
      `Son 30 günde gerçekleşen pay: %${biggest.actual} (${items.length} içerik üzerinden)`,
      `Bu sütun ${direction}.`,
    ].join("\n");

    const result = await callGroq(system, userMsg, {
      temperature: 0.3,
      maxTokens: 200,
      jsonMode: false,
      reasoningEffort: "low",
    });
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    text = result.content.trim() || fallbackText;
  } catch {
    status = "ERROR";
    // Keep the deterministic fallback — real numbers either way.
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "audience_insight",
    prompt_version: PROMPT_VERSION,
    model: MODEL,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: 0,
    latency_ms: Date.now() - startedAt,
    status,
  });

  return {
    text,
    pillarName: biggest.name,
    plannedPercentage: biggest.planned,
    actualPercentage: biggest.actual,
    sampleSize: items.length,
  };
}

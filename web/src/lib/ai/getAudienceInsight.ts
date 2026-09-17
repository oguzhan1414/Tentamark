"use server";

import { createClient } from "@/lib/supabase/server";
import { FAST_MODEL, callGroq, estimateGroqCost } from "./groqModel";
import { getLatestStrategy } from "./generateStrategy";
import { oneProportionZTest } from "../statistics";

const PROMPT_VERSION = "audience-insight-v2-ztest";
// A one-proportion z-test needs a few data points per category to mean
// anything at all — 5 is the conventional floor for this approximation
// (roughly "np and n(1-p) both >= a handful"), not just a round number.
const MIN_SAMPLE = 5;

export type AudienceInsight = {
  text: string;
  pillarName: string;
  plannedPercentage: number;
  actualPercentage: number;
  sampleSize: number;
  /** Two-tailed p-value from the significance test — how likely this gap is
   *  to be sampling noise rather than a real adherence drift. */
  pValue: number;
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

  // For each pillar: is the observed share a real, statistically significant
  // drift from the planned share, or could it plausibly be noise from a
  // small sample? A flat "gap > 10 points" threshold used to answer this
  // the same way regardless of whether items.length was 5 or 500 — a
  // one-proportion z-test naturally requires a bigger gap to count as
  // significant when the sample is small, which is the actually-correct
  // behavior, not an arbitrary rule.
  let biggest: { name: string; planned: number; actual: number; pValue: number } | null = null;
  for (const pillar of pillars) {
    const actualCount = counts[pillar.name] ?? 0;
    const test = oneProportionZTest(actualCount, items.length, pillar.percentage / 100);
    if (!test.significant) continue;
    if (!biggest || test.pValue < biggest.pValue) {
      const actual = Math.round((actualCount / items.length) * 100);
      biggest = { name: pillar.name, planned: pillar.percentage, actual, pValue: test.pValue };
    }
  }

  if (!biggest) return null;

  const direction = biggest.actual < biggest.planned ? "hedefin altında kalıyor" : "hedefin üzerinde";
  const fallbackText = `"${biggest.name}" sütunu stratejinizde %${biggest.planned} olarak planlanmış, ancak son 30 günde üretilen içeriğin %${biggest.actual}'i bu kategoride (${items.length} içerik incelendi) — ${direction}.`;

  const startedAt = Date.now();
  let text = fallbackText;
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let inputTokens = 0;
  let outputTokens = 0;
  let modelUsed: string = FAST_MODEL;

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
      model: FAST_MODEL,
      temperature: 0.3,
      maxTokens: 200,
      jsonMode: false,
      reasoningEffort: "low",
    });
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    modelUsed = result.model;
    text = result.content.trim() || fallbackText;
  } catch {
    status = "ERROR";
    // Keep the deterministic fallback — real numbers either way.
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "audience_insight",
    prompt_version: PROMPT_VERSION,
    model: modelUsed,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: estimateGroqCost(modelUsed, inputTokens, outputTokens),
    latency_ms: Date.now() - startedAt,
    status,
  });

  return {
    text,
    pillarName: biggest.name,
    plannedPercentage: biggest.planned,
    actualPercentage: biggest.actual,
    sampleSize: items.length,
    pValue: biggest.pValue,
  };
}

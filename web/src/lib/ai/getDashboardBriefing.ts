"use server";

import { createClient } from "@/lib/supabase/server";
import { FAST_MODEL, callGroq, estimateGroqCost } from "./groqModel";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — matches Social Stats' briefing pattern
const PROMPT_VERSION = "briefing-v1";

/*
  "Today's briefing" card for the dashboard (docs/repo-research — Social
  Stats' dashboard_briefing.py). Real analytics (checklist phase 8) doesn't
  exist yet, so this summarises what we DO have honestly: content pipeline
  state and connected-account health — not fake engagement numbers.

  Cached in `dashboard_briefings` (Postgres, no Redis here) for 1 hour;
  that cache is also the rate limit — there's no manual "regenerate" button,
  so worst case is ~24 Groq calls/day/brand from normal page loads. Returns
  '' on any failure or when there's nothing worth summarising (brand-new
  account, no content yet) — the dashboard just doesn't render the card.
*/
export async function getDashboardBriefing(brandId: string): Promise<string> {
  const supabase = await createClient();

  const { data: cached } = await supabase
    .from("dashboard_briefings")
    .select("text, generated_at")
    .eq("brand_id", brandId)
    .maybeSingle();

  if (cached && Date.now() - new Date(cached.generated_at).getTime() < CACHE_TTL_MS) {
    return cached.text;
  }

  const facts = await gatherFacts(supabase, brandId);
  if (!facts) return cached?.text ?? "";

  const startedAt = Date.now();
  try {
    const { text, inputTokens, outputTokens, model } = await callGroqForBriefing(facts);
    if (!text) return "";

    await supabase
      .from("dashboard_briefings")
      .upsert({ brand_id: brandId, text, generated_at: new Date().toISOString() });

    await supabase.from("ai_runs").insert({
      brand_id: brandId,
      stage: "dashboard_briefing",
      prompt_version: PROMPT_VERSION,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_estimate_usd: estimateGroqCost(model, inputTokens, outputTokens),
      latency_ms: Date.now() - startedAt,
      status: "SUCCESS",
      error: null,
    });

    return text;
  } catch {
    // Never break the dashboard over a briefing failure — just don't show one.
    return "";
  }
}

type Facts = {
  needsReview: number;
  scheduledThisWeek: number;
  publishedThisWeek: number;
  needsUserAction: number;
  connectedAccounts: number;
  accountsNeedingAttention: number;
};

async function gatherFacts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  brandId: string
): Promise<Facts | null> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: needsReview }, { count: publishedThisWeek }, { count: needsUserAction }, { data: accounts }] =
    await Promise.all([
      supabase
        .from("content")
        .select("id", { count: "exact", head: true })
        .eq("brand_id", brandId)
        .eq("status", "NEEDS_REVIEW"),
      supabase
        .from("content_platforms")
        .select("id, content!inner(brand_id)", { count: "exact", head: true })
        .eq("content.brand_id", brandId)
        .eq("status", "PUBLISHED")
        .gte("published_at", weekAgo),
      supabase
        .from("content_platforms")
        .select("id, content!inner(brand_id)", { count: "exact", head: true })
        .eq("content.brand_id", brandId)
        .eq("status", "NEEDS_USER_ACTION"),
      supabase.from("social_accounts").select("status").eq("brand_id", brandId),
    ]);

  const { count: scheduledThisWeek } = await supabase
    .from("content_platforms")
    .select("id, content!inner(brand_id)", { count: "exact", head: true })
    .eq("content.brand_id", brandId)
    .in("status", ["QUEUED", "PENDING"])
    .gte("scheduled_at", new Date().toISOString())
    .lt("scheduled_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  const facts: Facts = {
    needsReview: needsReview ?? 0,
    scheduledThisWeek: scheduledThisWeek ?? 0,
    publishedThisWeek: publishedThisWeek ?? 0,
    needsUserAction: needsUserAction ?? 0,
    connectedAccounts: accounts?.length ?? 0,
    accountsNeedingAttention: (accounts ?? []).filter((a) => a.status !== "active").length,
  };

  const hasSignal =
    facts.needsReview > 0 ||
    facts.scheduledThisWeek > 0 ||
    facts.publishedThisWeek > 0 ||
    facts.needsUserAction > 0 ||
    facts.connectedAccounts > 0;

  return hasSignal ? facts : null;
}

async function callGroqForBriefing(
  facts: Facts
): Promise<{ text: string; inputTokens: number; outputTokens: number; model: string }> {
  if (!process.env.GROQ_API_KEY) return { text: "", inputTokens: 0, outputTokens: 0, model: FAST_MODEL };

  const lines = [
    `Onay bekleyen içerik: ${facts.needsReview}`,
    `Önümüzdeki 7 gün için planlanmış paylaşım: ${facts.scheduledThisWeek}`,
    `Son 7 günde yayınlanan: ${facts.publishedThisWeek}`,
    `Kullanıcı müdahalesi gereken başarısız yayın: ${facts.needsUserAction}`,
    `Bağlı hesap sayısı: ${facts.connectedAccounts}`,
    `Dikkat gereken hesap (bağlantı sorunu vb.): ${facts.accountsNeedingAttention}`,
  ];

  const system =
    "Sen Tentamark panosunun günlük özet yazarısın. Sana 6 satır ham veri vereceğim. " +
    'HER satır için ayrı bir madde üret — 6 madde olacak, "• " ile başlasın. Hiçbirini ' +
    "atlama, birleştirme veya özetleme; sıfır olan bir satır varsa onu da olduğu gibi " +
    '("... yok" gibi) yaz. Her maddede o satırdaki SAYIYI mutlaka aynen kullan — sayıyı ' +
    '"birkaç", "bazı" gibi belirsiz ifadelerle değiştirme. Tahmin veya tavsiye ekleme, ' +
    "selamlama veya giriş cümlesi yazma. Türkçe yaz, doğal cümleler kur ama her cümle " +
    "tek bir satırın karşılığı olsun.";

  const result = await callGroq(system, lines.join("\n"), {
    model: FAST_MODEL,
    temperature: 0.3,
    maxTokens: 300,
    jsonMode: false,
    reasoningEffort: "low",
  });
  return {
    text: cleanBriefing(result.content),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    model: result.model,
  };
}

function cleanBriefing(raw: string): string {
  if (!raw) return "";
  const text = raw.trim();
  const bulletIdx = text.indexOf("•");
  const trimmed = bulletIdx > 0 ? text.slice(bulletIdx) : text;
  return trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join("\n");
}

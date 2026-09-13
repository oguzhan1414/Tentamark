"use server";

import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

const PROMPT_VERSION = "suggest-post-idea-v1";

/*
  A single, concrete post idea proposed unprompted — Planable's own compose
  box does this (an AI suggestion sits in the text field before you've typed
  anything, with "Tekrar dene" / "Kabul etmek"). This is the topic-proposal
  half of that: ComposeForm calls it once on open, and again on "Tekrar
  Dene" — the caller decides whether to drop it straight into the idea
  field or just show it as a suggestion to accept.
*/
export async function suggestPostIdea(brandId: string): Promise<string> {
  const supabase = await createClient();

  const [brandCtx, { data: recentContent }] = await Promise.all([
    getBrandContext(brandId),
    supabase
      .from("content")
      .select("title")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const brandContext =
    brandCtx.formattedText || "Marka kimliği henüz tanımlanmadı, genel ve profesyonel bir ton kullan.";
  const recentTitles = (recentContent ?? []).map((c) => c.title).filter(Boolean);

  const systemPrompt = `Sen Tentamark için çalışan bir sosyal medya stratejistisin. Görevin: markanın DNA'sına ve içerik stratejisine uygun, TEK bir somut gönderi fikri önermek — kullanıcı bunu okuyup ya kabul edip düzenleyecek ya da yeni bir öneri isteyecek.

Kurallar:
- Türkçe, tek bir cümlede somut bir gönderi konusu öner (hazır bir taslak metin değil, "ne hakkında" olduğunu yaz — örn: "Yeni ürününüzün kullanım anını gösteren kısa bir video fikri, müşteri memnuniyetine vurgu yaparak").
- Genel/klişe olma — markanın gerçek ürün/hizmetine, hedef kitlesine ve içerik sütunlarına değin.
- Son paylaşılan konularla aynı şeyi tekrar önerme: ${recentTitles.join(" || ") || "yok"}
- SADECE öneri cümlesini yaz — tırnak işareti, markdown veya başka açıklama ekleme.

Marka Bağlamı:
${brandContext}`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let idea = "";

  try {
    const result = await callGroq(systemPrompt, "Bir gönderi fikri öner.", {
      temperature: 0.9,
      maxTokens: 200,
      jsonMode: false,
    });
    idea = result.content.trim().replace(/^["']|["']$/g, "");
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
  } catch (err) {
    status = "ERROR";
    errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "suggest_post_idea",
    prompt_version: PROMPT_VERSION,
    model: MODEL,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: 0,
    latency_ms: Date.now() - startedAt,
    status,
    error: errorMessage,
  });

  if (status === "ERROR") {
    throw new Error(errorMessage ?? "Fikir üretilemedi.");
  }
  return idea;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { FAST_MODEL, callGroq, estimateGroqCost } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

const PROMPT_VERSION = "post-suggestion-v1";

export type PostSuggestion = {
  tip: string;
  hashtags: string[];
};

/*
  Powers the Approvals detail modal's "Öneriler" tab — replaces what was a
  hardcoded fake tip ("%18 artırabilirsiniz") and demo-brand hashtags
  ("#JuscoFresh") with a real, brand-aware call so it says something true
  about this specific brand and this specific post, not a fabricated stat
  that would show up unchanged for every user regardless of caption.
*/
export async function suggestPostImprovement(
  brandId: string,
  caption: string,
  platform: string
): Promise<PostSuggestion> {
  const supabase = await createClient();
  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka kimliği henüz tanımlanmadı, genel ve profesyonel bir ton kullan.";

  const systemPrompt = `Sen bir sosyal medya editörüsün. Verilen gönderi metnini ve marka bağlamını incele, bu gönderiye ÖZEL somut bir iyileştirme ipucu ile uygun 3-5 hashtag öner.

Kurallar:
- Türkçe yaz.
- "tip": Tek cümle, bu gönderiye ve platforma özel somut bir öneri (genel/klişe tavsiye verme, gerçek bir sayı biliyormuş gibi uydurma istatistik yazma).
- "hashtags": markaya ve gönderinin konusuna uygun, gerçekçi hashtag'ler (uydurma marka adı kullanma).
- SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme: {"tip": "...", "hashtags": ["...", "..."]}

Platform: ${platform}

Marka Bağlamı:
${brandContext}`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let modelUsed: string = FAST_MODEL;
  let result: PostSuggestion = { tip: "", hashtags: [] };

  try {
    const res = await callGroq(systemPrompt, caption || "Bu gönderi için genel bir öneri ver.", {
      model: FAST_MODEL,
      temperature: 0.6,
      maxTokens: 300,
      reasoningEffort: "low",
    });
    const parsed = JSON.parse(res.content);
    result = {
      tip: String(parsed.tip || ""),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map((h: unknown) => String(h)).slice(0, 6) : [],
    };
    inputTokens = res.inputTokens;
    outputTokens = res.outputTokens;
    modelUsed = res.model;
  } catch (err) {
    status = "ERROR";
    errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "post_suggestion",
    prompt_version: PROMPT_VERSION,
    model: modelUsed,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: estimateGroqCost(modelUsed, inputTokens, outputTokens),
    latency_ms: Date.now() - startedAt,
    status,
    error: errorMessage,
  });

  if (status === "ERROR") {
    throw new Error(errorMessage ?? "Öneri üretilemedi.");
  }
  return result;
}

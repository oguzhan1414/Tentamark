"use server";

import { createClient } from "@/lib/supabase/server";
import { FAST_MODEL, callGroq, estimateGroqCost } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";
import { CONTENT_PURPOSES, CONTENT_PURPOSE_LABELS, type ContentPurpose } from "../cards/contentPurpose";

const PROMPT_VERSION = "classify-content-purpose-v1";

function isContentPurpose(value: unknown): value is ContentPurpose {
  return typeof value === "string" && (CONTENT_PURPOSES as string[]).includes(value);
}

/*
  Classifies a free-text content topic into one of the 10 Creative Studio
  purpose categories (see lib/cards/contentPurpose.ts) so the image dashboard
  can jump straight to 3 pre-picked template+variant suggestions instead of
  the user browsing all 23 templates manually. Deliberately narrow: this
  only picks a CATEGORY, it never writes card copy — that's a separate,
  much bigger "AI brief" feature, out of scope here.
*/
export async function classifyContentPurpose(topic: string, brandId: string): Promise<ContentPurpose> {
  const supabase = await createClient();
  const brandCtx = await getBrandContext(brandId);
  const brandContext = brandCtx.formattedText || "Marka kimliği henüz tanımlanmadı.";

  const categoryList = CONTENT_PURPOSES.map((key) => `- ${key}: ${CONTENT_PURPOSE_LABELS[key].tr}`).join("\n");

  const systemPrompt = `Sen Tentamark'ın görsel içerik stüdyosu için çalışan bir sınıflandırma asistanısın. Görevin: kullanıcının yazdığı içerik konusunu aşağıdaki 10 kategoriden TAM OLARAK BİRİNE atamak.

Kategoriler (sadece parantez içindeki anahtarı kullan):
${categoryList}

Kurallar:
- SADECE şu formatta JSON döndür: {"purpose": "<kategori-anahtarı>"}
- Anahtar yukarıdaki 10 değerden biri olmak ZORUNDA, başka bir şey uydurma.
- Emin değilsen konuya en yakın kategoriyi seç, asla boş bırakma.

Marka Bağlamı (belirsiz durumlarda ton/sektörü değerlendirmek için):
${brandContext}`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let modelUsed: string = FAST_MODEL;
  let purpose: ContentPurpose = "product_intro";

  try {
    const result = await callGroq(systemPrompt, topic, {
      model: FAST_MODEL,
      temperature: 0.2,
      maxTokens: 80,
      jsonMode: true,
      reasoningEffort: "low",
    });
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    modelUsed = result.model;
    const parsed = JSON.parse(result.content) as { purpose?: unknown };
    if (isContentPurpose(parsed.purpose)) {
      purpose = parsed.purpose;
    }
    // An unrecognized/missing value silently keeps the "product_intro"
    // default above rather than failing the request — a wrong category
    // still shows 3 usable suggestions, unlike a thrown error.
  } catch (err) {
    status = "ERROR";
    errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "classify_content_purpose",
    prompt_version: PROMPT_VERSION,
    model: modelUsed,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: estimateGroqCost(modelUsed, inputTokens, outputTokens),
    latency_ms: Date.now() - startedAt,
    status,
    error: errorMessage,
  });

  return purpose;
}

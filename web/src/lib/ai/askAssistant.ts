"use server";

import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";
import { ALL_PLATFORMS, PLATFORM_LABEL, type LaunchPlatform } from "./platforms";

const PROMPT_VERSION = "assistant-chat-v2";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ContentDraft = {
  title: string;
  category: string;
  dayOffset: number; // days from today: 0 = today, 1 = tomorrow, ... 6
  captions: Partial<Record<LaunchPlatform, string>>;
};

export type AssistantReply = {
  message: string;
  draft: ContentDraft | null;
};

function parseDraft(raw: unknown): ContentDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const title = String(obj.title ?? "").trim();
  if (!title) return null;

  const captionsRaw = obj.captions && typeof obj.captions === "object" ? (obj.captions as Record<string, unknown>) : {};
  const captions: Partial<Record<LaunchPlatform, string>> = {};
  for (const platform of ALL_PLATFORMS) {
    const value = captionsRaw[platform];
    if (typeof value === "string" && value.trim()) captions[platform] = value.trim();
  }

  const dayOffsetNum = Number(obj.day_offset);
  return {
    title: title.slice(0, 100),
    category: String(obj.category ?? "Genel").trim() || "Genel",
    dayOffset: Number.isInteger(dayOffsetNum) ? Math.max(0, Math.min(6, dayOffsetNum)) : 0,
    captions,
  };
}

/*
  Not a plain Q&A bot — the model decides, per turn, whether the
  conversation has become concrete enough to draft real content (returns a
  `draft`) or should stay conversational (`draft: null`). The caller (chat
  UI) shows a preview + Onayla/Reddet for any draft; nothing reaches
  content/content_platforms without that explicit confirmation.
*/
export async function askAssistant(
  brandId: string,
  history: ChatTurn[],
  question: string
): Promise<AssistantReply> {
  if (!question.trim()) {
    throw new Error("Lütfen bir soru veya konu yazın.");
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka henüz detaylı tanımlanmadı, genel ve profesyonel bir yaklaşım benimse.";
  const platformList = ALL_PLATFORMS.map((p) => PLATFORM_LABEL[p]).join(", ");

  const systemPrompt = `Sen Tentamark'ın uzman AI Pazarlama Danışmanısın. Kullanıcıyla doğal bir sohbet yürütürsün; sosyal medya stratejisi, kanca fikirleri, kitle büyümesi gibi konularda tavsiye verirsin.

Marka Bağlamı:
${brandContext}

Kullanılabilir platformlar: ${platformList}

En önemli görevin: kullanıcı SOMUT bir içerik isteği belirttiğinde (örn. "yarın için bir gönderi hazırla", "şu konuda bir paylaşım yaz", "bu hafta X hakkında bir içerik koy") sadece tavsiye vermekle kalma, gerçek bir içerik taslağı üret.

SADECE ve SADECE şu JSON formatında yanıt ver, başında/sonunda hiçbir açıklama veya markdown bloğu (\`\`\`) ekleme:
{
  "message": "Kullanıcıya gösterilecek doğal sohbet cevabı (Türkçe, gerekirse markdown)",
  "draft": null veya {
    "title": "İçerik başlığı",
    "category": "Kısa kategori/tema adı",
    "day_offset": 0-6 arası tam sayı — BUGÜNDEN itibaren kaç gün sonra (0=bugün, 1=yarın, 2=öbür gün...)",
    "captions": {"instagram": "...", "facebook": "...", "linkedin": "..."}
  }
}

Kurallar:
- draft'ı SADECE kullanıcı somut bir içerik/plan istediğinde doldur. Kullanıcı sadece genel soru/tavsiye istiyorsa (örn. "ne önerirsin", "trendler neler", "kancaları nasıl yazmalıyım") draft'ı null bırak, sadece message ile cevap ver.
- draft doldurduğunda, message alanında da bunu özetleyen kısa bir cümle olsun (örn. "İşte önerdiğim gönderi, aşağıda kontrol edip onaylayabilirsiniz.").
- captions SADECE yukarıdaki kullanılabilir platformlar için, her biri o platformun kendi tonuna uygun ayrı ayrı yazılsın — aynı metni kopyalama.
- Klişelerden kaçın ("merhaba arkadaşlar", "bugün sizlere" gibi), somut ve markaya özel ol.
- Önceki mesajları hatırla; kullanıcı bir önceki taslağı düzeltmeni isterse (örn. "daha kısa yaz", "başlığı değiştir") o bağlamda yeni bir draft üret.`;

  const startedAt = Date.now();
  const supabase = await createClient();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let result: AssistantReply = {
    message: "Yanıt oluşturulamadı, lütfen tekrar deneyin.",
    draft: null,
  };

  try {
    const groqRes = await callGroq(systemPrompt, question, {
      temperature: 0.7,
      maxTokens: 1500,
      history: history.map((h) => ({ role: h.role, content: h.content })),
    });
    inputTokens = groqRes.inputTokens;
    outputTokens = groqRes.outputTokens;

    const cleaned = groqRes.content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    result = {
      message: String(parsed.message ?? "").trim() || "Anlayamadım, tekrar açıklar mısınız?",
      draft: parseDraft(parsed.draft),
    };
  } catch (err) {
    status = "ERROR";
    errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "assistant_chat",
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
    throw new Error("Yanıt oluşturulurken bir hata oluştu.");
  }
  return result;
}

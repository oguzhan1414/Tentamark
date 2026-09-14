"use server";

import { callGroq } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

export type InboxSmartReply = {
  recommended: string;
  sentiment: string;
  options: {
    friendly: string;
    concise: string;
    converting: string;
  };
};

export async function generateInboxReply(
  brandId: string,
  customerMessage: string,
  authorName?: string,
  kind: "comment" | "dm" = "comment",
  platform: "instagram" | "facebook" | "telegram" = "instagram"
): Promise<InboxSmartReply> {
  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka genel ve profesyonel bir sosyal medya tonuna sahip.";

  const systemPrompt = `Sen Tentamark'ın Sosyal Medya Müşteri İletişim Uzmanısın.
Görevin: ${platform} üzerinden gelen bir ${kind === "comment" ? "gönderi yorumuna" : "direkt mesaja (DM)"} markanın kurumsal ses tonuna tam uyumlu, nazik, etkili yanıt taslakları üretmek.

Marka Bilgileri & Ses Tonu:
${brandContext}

Kurallar:
1. Yanıtlar Türkçe olsun.
2. Müşteri ismi (${authorName || "Kullanıcı"}) biliniyorsa doğal bir hitap kullan (örn. "Merhaba [İsim]!").
3. SADECE ve SADECE aşağıdaki JSON formatında yanıt üret, başında veya sonunda markdown bloğu (\`\`\`) veya açıklama ekleme:
{
  "sentiment": "positive | question | complaint | lead",
  "recommended": "En dengeli ve önerilen yanıt metni",
  "options": {
    "friendly": "Son derece samimi, sıcak ve emojili alternatif yanıt",
    "concise": "Kısa, net ve resmi alternatif yanıt",
    "converting": "Müşteriyi web sitesine, profile veya DM'e yönlendiren satış/aksiyon odaklı alternatif yanıt"
  }
}`;

  const userMessage = `Platform: ${platform}\nTür: ${kind}\nMüşteri: ${authorName || "Bilinmiyor"}\nGelen Mesaj: "${customerMessage}"`;

  const groqResult = await callGroq(systemPrompt, userMessage, {
    temperature: 0.6,
    maxTokens: 1500,
    jsonMode: true,
  });

  const cleaned = groqResult.content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const options = parsed.options && typeof parsed.options === "object" ? parsed.options : {};

  return {
    sentiment: String(parsed.sentiment ?? "neutral"),
    recommended: String(parsed.recommended ?? options.friendly ?? "Teşekkür ederiz!").trim(),
    options: {
      friendly: String(options.friendly ?? parsed.recommended ?? "").trim(),
      concise: String(options.concise ?? parsed.recommended ?? "").trim(),
      converting: String(options.converting ?? parsed.recommended ?? "").trim(),
    },
  };
}

"use server";

import { callGroq } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

export async function askAssistant(brandId: string, question: string): Promise<string> {
  if (!question.trim()) {
    throw new Error("Lütfen bir soru veya konu yazın.");
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext = brandCtx.formattedText || "Marka henüz detaylı tanımlanmadı, genel ve profesyonel bir yaklaşım benimse.";

  const systemPrompt = `Sen Tentamark'ın uzman AI Pazarlama Danışmanısın. Kullanıcıya sosyal medya stratejisi, kanca (hook) fikirleri, kitle büyümesi, kampanya kurguları ve viral içerik formatları konularında doğrudan, net, uygulanabilir tavsiyeler verirsin.

Marka Bağlamı:
${brandContext}

Kurallar:
- Türkçe, akıcı, enerjik ve profesyonel bir dille yanıt ver.
- Klişelerden kaçın. Maddeler halinde, net aksiyon adımları ve somut örnekler sun.
- Sosyal medya algoritmalarının güncel dinamiklerini (ilk 3 saniye kancası, kaydetme/paylaşım odaklı kurgu) göz önünde bulundur.
- Yanıtını Markdown formatında (kalın metinler, listeler) hazırla.`;

  const result = await callGroq(systemPrompt, question, {
    temperature: 0.7,
    maxTokens: 1000,
    jsonMode: false,
  });

  return result.content;
}

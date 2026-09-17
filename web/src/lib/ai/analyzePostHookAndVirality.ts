"use server";

import { callGroq } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

export type HookAlternative = { text: string; stopScore: number };

export type HookAnalysisResult = {
  score: number; // 0-100
  critique: string;
  alternativeHooks: HookAlternative[];
  optimizedCaption: string;
};

export async function analyzePostHookAndVirality(
  brandId: string,
  caption: string,
  platform: string = "instagram"
): Promise<HookAnalysisResult> {
  if (!caption.trim()) {
    throw new Error("Lütfen önce bir gönderi metni girin.");
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka genel ve profesyonel bir sosyal medya tonuna sahip.";

  const systemPrompt = `Sen sosyal medya algoritmaları ve viral kancalar (hooks) konusunda uzman kıdemli bir büyüme editörüsün.
Görevin: Verilen ${platform} gönderi metnini incelemek, ilk 2 saniyelik kanca gücünü ve algoritmada kaydetme/etkileşim getirme potansiyelini 0-100 arasında puanlamak.

Marka Bağlamı:
${brandContext}

Kurallar:
1. "score": 0 ile 100 arasında tam sayı. Metnin ilk cümlesi ne kadar merak uyandırıyor, soru soruyor veya değer vadediyor?
2. "critique": Kancanın güçlü ve zayıf yönünü anlatan tek net cümle (Türkçe).
3. "alternative_hooks": Metnin konusunu çok daha çarpıcı kılan, kaydetme ve yorum tetikleyecek 3 adet alternatif açılış kancası (tek cümle), her biri kendi tahmini "durdurma ihtimali" yüzdesiyle (0-100, kancanın scroll'u ne kadar durduracağının tahmini).
4. "optimized_caption": Orijinal metnin anlamını koruyarak, en güçlü kancayla başlayan ve okunabilirliği artıran tam optimize edilmiş metin.
5. SADECE ve SADECE aşağıdaki JSON formatında yanıt üret, başında veya sonunda markdown bloğu (\`\`\`) veya açıklama ekleme:
{
  "score": 85,
  "critique": "Açılış net ancak sonuna merak uyandıran bir soru eklenirse kaydetme oranı artar.",
  "alternative_hooks": [
    { "text": "Alternatif kanca 1...", "stop_score": 85 },
    { "text": "Alternatif kanca 2...", "stop_score": 78 },
    { "text": "Alternatif kanca 3...", "stop_score": 70 }
  ],
  "optimized_caption": "Optimize edilmiş tam gönderi metni..."
}`;

  const userMessage = `Platform: ${platform}\nGönderi Metni:\n"""\n${caption}\n"""`;

  const groqResult = await callGroq(systemPrompt, userMessage, {
    temperature: 0.5,
    maxTokens: 1500,
    jsonMode: true,
    reasoningEffort: "low",
  });

  const cleaned = groqResult.content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const scoreNum = Number(parsed.score);
  const validScore = Number.isFinite(scoreNum) ? Math.max(10, Math.min(99, Math.round(scoreNum))) : 75;

  const rawHooks = Array.isArray(parsed.alternative_hooks) ? parsed.alternative_hooks : [];
  const alternativeHooks: HookAlternative[] = rawHooks
    .map((h: unknown) => {
      const obj = h && typeof h === "object" ? (h as Record<string, unknown>) : { text: h };
      const text = String(obj.text ?? "").trim();
      const stopNum = Number(obj.stop_score);
      return { text, stopScore: Number.isFinite(stopNum) ? Math.max(1, Math.min(99, Math.round(stopNum))) : 70 };
    })
    .filter((h: HookAlternative) => h.text.length > 0)
    .slice(0, 3);

  return {
    score: validScore,
    critique: String(parsed.critique ?? "Kancanız iyi bir temele sahip.").trim(),
    alternativeHooks,
    optimizedCaption: String(parsed.optimized_caption ?? caption).trim(),
  };
}

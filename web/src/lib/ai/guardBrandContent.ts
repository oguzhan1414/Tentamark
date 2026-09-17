"use server";

import { callGroq, FAST_MODEL } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";
import type { BrandSafetyFixResult } from "./brandGuardianTypes";

export async function fixBrandSafetyIssues({
  brandId,
  caption,
  flaggedWords,
  toneOfVoice,
  platform = "instagram",
  isEn = false,
}: {
  brandId: string;
  caption: string;
  flaggedWords: string[];
  toneOfVoice?: string;
  platform?: string;
  isEn?: boolean;
}): Promise<BrandSafetyFixResult> {
  if (!caption?.trim()) {
    throw new Error(
      isEn
        ? "Please enter post caption to analyze."
        : "Lütfen analiz edilecek bir gönderi metni girin."
    );
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka profesyonel, güvenilir ve modern bir üsluba sahip.";
  const toneDesc =
    toneOfVoice || brandCtx.toneOfVoice || "Profesyonel, samimi ve ikna edici";

  const systemPrompt = `Sen dünyanın en iyi Marka Emniyeti ve İletişim Stratejisti (AI Brand Guardian) uzmanısın.
Görevin: Kullanıcının sosyal medya gönderisindeki tespit edilen YASAKLI / RİSKLİ kelimeleri ve rakip referanslarını, markanın ses tonuna ve kimliğine uygun, güvenilir, çekici ve doğal alternatiflerle değiştirmek.

Platform: ${platform}
Hedef Dil: ${isEn ? "İngilizce" : "Türkçe"}

Marka Kimliği:
${brandContext}

Marka Ses Tonu:
${toneDesc}

Tespit Edilen Sorunlu / Yasaklı Kelimeler:
${flaggedWords.join(", ")}

Katı Kurallar:
1. Gönderinin temel mesajını, akışını, kancasını ve yapısını bozma.
2. Sadece tespit edilen yasaklı kelimeleri ve o kelimelerin geçtiği cümle parçalarını markaya yakışan güvenli, güçlü ve doğal ifadelerle dönüştür (Örn: "en ucuz" yerine "bütçe dostu ve yüksek erişilebilir", "garanti ediyoruz" yerine "güvenle sunuyoruz / kanıtlanmış kalite" vb.).
3. Markanın ses tonuna ve platformun doğallığına sadık kal.
4. Yanıtı SADECE şu JSON şemasında ver:
{
  "fixedCaption": "Düzeltilmiş tam gönderi metni...",
  "changesSummary": "Nelerin güvenli alternatife dönüştürüldüğüne dair kısa özet (Türkçe veya İngilizce)"
}`;

  const userPrompt = `Orijinal Gönderi Metni:\n"""\n${caption}\n"""\n\nLütfen yasaklı ifadeleri (${flaggedWords.join(", ")}) güvenli ve etkileyici alternatiflerle değiştirip JSON döndür.`;

  try {
    const res = await callGroq(systemPrompt, userPrompt, {
      model: FAST_MODEL,
      temperature: 0.4,
      jsonMode: true,
      reasoningEffort: "low",
      maxTokens: 2000,
    });

    const cleaned = res.content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      fixedCaption?: string;
      changesSummary?: string;
    };

    if (!parsed.fixedCaption) {
      throw new Error("Missing fixedCaption in AI response");
    }

    return {
      fixedCaption: parsed.fixedCaption,
      changesSummary:
        parsed.changesSummary ||
        (isEn
          ? "Forbidden words replaced with brand-safe alternatives."
          : "Yasaklı ifadeler güvenli marka alternatifleriyle güncellendi."),
    };
  } catch (err) {
    console.error("[fixBrandSafetyIssues] Failed:", err);
    throw new Error(
      isEn
        ? "Could not auto-fix brand safety issues. Please try again."
        : "Marka emniyet düzeltmesi yapılamadı. Lütfen tekrar deneyin."
    );
  }
}

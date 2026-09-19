"use server";

import { callGroq, FAST_MODEL } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

export type RecycledVariant = {
  caption: string;
  hookSummary: string;
};

/**
 * Recycles an evergreen post by refreshing its opening hook and angle,
 * while preserving core value, key message, and brand voice.
 * This prevents social media algorithm spam penalties.
 */
export async function recycleContentHook({
  brandId,
  originalCaption,
  coreIdea,
  platform = "instagram",
  isEn = false,
}: {
  brandId: string;
  originalCaption: string;
  coreIdea?: string;
  platform?: string;
  isEn?: boolean;
}): Promise<RecycledVariant> {
  if (!originalCaption?.trim()) {
    throw new Error(isEn ? "Original caption is required to recycle." : "Yenilemek için orijinal metin gereklidir.");
  }

  let brandContextPrompt = "";
  try {
    const ctx = await getBrandContext(brandId);
    if (ctx) {
      brandContextPrompt = `
MARKA BİLGİSİ:
- Marka Adı: ${ctx.brandName}
- Sektör: ${ctx.industry || "Genel"}
- Marka Tonu: ${ctx.toneOfVoice || "Profesyonel, dinamik"}
- Hedef Kitle: ${ctx.targetAudience?.join(", ") || "Takipçiler"}
`;
    }
  } catch (err) {
    console.warn("recycleContentHook: brand context error (non-fatal):", err);
  }

  const systemPrompt = `Sen sosyal medya içerik algoritmalarında uzman bir Kıdemli Büyüme Editörüsün (Senior Growth Editor).
Görevin: Bir markanın yüksek performans göstermiş "Evergreen" (zamansız) bir gönderisini, mesajın ana değerini ve faydasını kaybetmeden, **TAMAMEN FARKLI VE TAZE BİR KANCA (HOOK)** ile yeniden açmaktır.

NEDEN BU GEREKLİ?
Instagram, LinkedIn ve X algoritmaları birebir aynı metnin tekrar paylaşılmasını spam olarak algılar ve erişimi kısar. 
Bu yüzden gönderinin ilk 1-2 cümlesini (merak kancasını) farklı bir psikolojik tetikleyici (örneğin: soru, şaşırtıcı istatistik, yaygın hata, doğrudan fayda) ile yeniden kurgulaman gerekir.

KURALLAR:
1. Gönderinin ana fikrini, aktardığı temel bilgiyi veya çözümü DEĞİŞTİRME.
2. Açılış kancasını (ilk 1-2 cümle) baştan yaz: daha taze, dikkat çekici ve merak uyandırıcı olsun.
3. Gövdedeki anlatımı akıcı ve doğal kıl, gereksiz şişirme yapma.
4. Hedef platformun (${platform}) formatına ve karakter dinamiklerine uygun kal.
5. Markdown kod bloğu KULLANMA. Sadece doğrudan gönderi metnini ver.
${brandContextPrompt}`;

  const userPrompt = `Aşağıdaki zamansız (evergreen) gönderiyi, açılış kancasını yenileyerek tekrar yayına hazır hale getir:

${coreIdea ? `İÇERİĞİN ANA TEMASI: ${coreIdea}\n` : ""}
ORİJİNAL GÖNDERİ:
"""
${originalCaption}
"""

Yalnızca yenilenmiş gönderi metnini yaz:`;

  try {
    const response = await callGroq(systemPrompt, userPrompt, {
      model: FAST_MODEL,
      temperature: 0.7,
      maxTokens: 1000,
      jsonMode: false,
    });

    const recycledText = (response.content || "").trim();
    const firstLine = recycledText.split("\n")[0] || "";

    return {
      caption: recycledText || originalCaption,
      hookSummary: firstLine.slice(0, 100),
    };
  } catch (error) {
    console.error("recycleContentHook AI hatası:", error);
    return {
      caption: originalCaption,
      hookSummary: originalCaption.slice(0, 100),
    };
  }
}

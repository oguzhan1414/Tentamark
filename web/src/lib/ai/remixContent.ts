"use server";

import { callGroq, FAST_MODEL } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";
import type { RemixTone } from "./remixConstants";

const TONE_DIRECTIVES: Record<RemixTone, { tr: string; en: string }> = {
  shorter: {
    tr: "Bu gönderideki tüm dolgu kelimeleri, gereksiz açıklamaları ve uzatmaları at. Mesajın özünü koruyarak tek nefeste okunan, maksimum 2-3 kısa, kancalı ve çok vurucu cümle haline getir.",
    en: "Eliminate all filler, fluff, and unnecessary explanations. Keep the core message but condense it into 2-3 ultra-punchy, high-impact sentences.",
  },
  casual: {
    tr: "Bu gönderiyi samimi, sıcak, hafif esprili ve sanki bir arkadaşınla kahve içerken sohbet ediyormuş gibi rahat bir dille yeniden yaz. Aşırı resmi kalıplardan kaçın, doğal ve dozunda emojiler kullan.",
    en: "Rewrite this post in a warm, witty, friendly tone like chatting with a close friend over coffee. Avoid corporate jargon and use natural, tasteful emojis.",
  },
  professional: {
    tr: "Bu gönderiyi kurumsal, sektöründe uzman ve otorite sahibi bir B2B düşünce lideri (thought leader) üslubuyla yeniden yaz. Güven, analitik içgörü ve profesyonel değer ön planda olsun.",
    en: "Rewrite this post in an authoritative, corporate B2B thought-leadership tone. Emphasize credibility, strategic insights, and professional impact.",
  },
  storytelling: {
    tr: "Bu gönderiyi sürükleyici bir mikro-hikaye kurgusuna dönüştür: Başta yaşanan can sıkıcı veya şaşırtıcı bir problem/durum → Yaşanan kırılma ve farkındalık anı → Elde edilen sonuç veya ders. Okuyucuyu ilk cümleden itibaren içine çek.",
    en: "Transform this post into a compelling micro-story: An initial frustrating problem or curiosity trigger → The turning point moment → The resulting breakthrough or lesson learned.",
  },
  action: {
    tr: "Bu gönderiyi yüksek dönüşüm ve satış odaklı bir kurguya çevir. Okuyucuda aciliyet ve değer hissi uyandır. Gönderinin sonunda çok net, spesifik ve harekete geçirici bir çağrı (CTA: 'Profili ziyaret edin', 'DM atın', 'Yorumlarda fikrinizi belirtin' vb.) yer alsın.",
    en: "Rewrite this post for maximum conversion and action. Create urgency and irresistible value. End with a crystal-clear, specific call-to-action (CTA).",
  },
};

export async function remixContent({
  brandId,
  content,
  tone,
  platform = "instagram",
  isEn = false,
}: {
  brandId: string;
  content: string;
  tone: RemixTone;
  platform?: string;
  isEn?: boolean;
}): Promise<{ rewritten: string; tone: RemixTone }> {
  if (!content?.trim()) {
    throw new Error(
      isEn
        ? "Please provide post text to remix."
        : "Lütfen remixlemek için bir gönderi metni yazın."
    );
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka genel ve profesyonel bir sosyal medya tonuna sahip.";

  const directive = TONE_DIRECTIVES[tone] || TONE_DIRECTIVES.shorter;
  const activeDirective = isEn ? directive.en : directive.tr;

  const systemPrompt = `Sen dünyanın en iyi sosyal medya metin yazarı ve içerik remiks uzmanısın (Content Remix DJ).
Görevin: Kullanıcının yazdığı mevcut gönderi metnini, seçilen üslup direktifine ve platform kurallarına göre mükemmel bir şekilde YENİDEN YAZMAK.

Platform: ${platform}
Hedef Dil: ${isEn ? "İngilizce" : "Türkçe"}

Marka Bağlamı:
${brandContext}

Remix Üslup Direktifi:
${activeDirective}

Katı Kurallar:
1. Gönderinin temel konusunu ve hakikatini asla değiştirme; sadece üslubu, kancayı, akışı ve ifade biçimini hedeflenen tona göre mükemmel şekilde remiksle.
2. Açılışı akışı durduracak (pattern interrupt) güçlü bir kanca ile yap.
3. ${platform} platformunun formatına uygun paragraflama ve okunabilirlik sağla.
4. Çıktıyı SADECE geçerli bir JSON formatında ver:
{
  "rewritten": "Remixlenmiş tam gönderi metni..."
}`;

  try {
    const res = await callGroq(systemPrompt, content, {
      model: FAST_MODEL,
      temperature: 0.7,
      maxTokens: 2000,
      jsonMode: true,
      reasoningEffort: "low",
    });

    const cleaned = res.content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    if (!parsed.rewritten || typeof parsed.rewritten !== "string") {
      throw new Error("Invalid response format from remix AI.");
    }

    return {
      rewritten: parsed.rewritten.trim(),
      tone,
    };
  } catch (err) {
    console.error("remixContent error:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : isEn
        ? "Failed to remix content."
        : "İçerik remikslenemedi."
    );
  }
}

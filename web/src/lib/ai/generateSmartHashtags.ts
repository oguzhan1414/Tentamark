"use server";

import { callGroq, FAST_MODEL } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";
import type {
  SmartHashtagGroup,
  SmartHashtagsResult,
} from "./smartHashtagsTypes";

const PLATFORM_TIPS: Record<string, { tr: string; en: string; recommended: number }> = {
  instagram: {
    tr: "Instagram algoritmasında 4-8 dengeli ve spesifik hashtag maksimum keşfet erişimi sağlar.",
    en: "On Instagram, 4-8 balanced, niche-focused hashtags yield the best organic reach.",
    recommended: 6,
  },
  linkedin: {
    tr: "LinkedIn'de en fazla 3-5 odaklı sektör etiketi önerilir; fazlası erişimi düşürebilir.",
    en: "On LinkedIn, 3-5 focused industry hashtags are recommended for thought-leadership.",
    recommended: 4,
  },
  twitter: {
    tr: "X/Twitter'da 1-2 hashtag idealdir; aşırı etiket tweet'in spam algılanmasına yol açabilir.",
    en: "On X/Twitter, 1-2 focused hashtags are ideal to avoid looking like spam.",
    recommended: 2,
  },
  facebook: {
    tr: "Facebook'ta hashtag kullanımı ölçülü olmalıdır (2-4 etiket tavsiye edilir).",
    en: "On Facebook, 2-4 targeted hashtags work best.",
    recommended: 3,
  },
  tiktok: {
    tr: "TikTok'ta 3-6 trend ve niş etiket 'Sizin İçin' (FYP) akışına çıkmayı kolaylaştırır.",
    en: "On TikTok, 3-6 trend and niche tags optimize FYP discoverability.",
    recommended: 5,
  },
  threads: {
    tr: "Threads'te konuya özel 1-3 etiket sohbet akışlarında öne çıkmanızı sağlar.",
    en: "On Threads, 1-3 topic tags help surface your post in topic feeds.",
    recommended: 2,
  },
};

export async function generateSmartHashtags({
  brandId,
  caption,
  platform = "instagram",
  isEn = false,
}: {
  brandId: string;
  caption: string;
  platform?: string;
  isEn?: boolean;
}): Promise<SmartHashtagsResult> {
  if (!caption?.trim()) {
    throw new Error(
      isEn
        ? "Please provide a caption to generate smart hashtags."
        : "Hashtag üretmek için lütfen bir gönderi metni yazın."
    );
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka genel ve profesyonel bir sosyal medya tonuna sahip.";

  const systemPrompt = `Sen bir sosyal medya algoritma ve hashtag büyüme stratejistisin (Smart Hashtag Engine).
Görevin: Verilen gönderi metnini ve marka bağlamını analiz ederek, ${platform} platformu için en yüksek etkileşim ve keşfet potansiyeli sağlayan 3 KATEGORİDE toplam 12-15 dengeli hashtag üretmek.

Kurallar:
1. "broad" (Trend & Geniş Hacim): Konuyla ilgili yüksek hacimli, keşfet ve geniş kitle odaklı 4-5 popüler etiket (Örn: #pazarlama, #girisimcilik, #yapayzeka).
2. "niche" (Niş & Hedef Kitle): Tam olarak bu gönderinin çözdüğü probleme ve hedef kitleye özel 4-5 düşük rekabetli nokta atışı etiket (Örn: #sosyalmedyastratejisi, #icerikuretici, #dijitalbuyume).
3. "industry" (Sektör & Topluluk): Markanın faaliyet alanına, sektörüne ve profesyonel topluluğuna özel 4-5 etiket (Örn: #eticaretturkiye, #b2bpazarlama, #dijitalajans).
4. Her etiketi # öneki ile, boşluksuz, küçük/büyük harf camelCase veya tek parça yaz.
5. Gönderinin dili ${isEn ? "İngilizce" : "Türkçe"} ise etiketleri o dilde oluştur.
6. Yanıtı SADECE ve SADECE şu JSON formatında üret:
{
  "broad": ["#etiket1", "#etiket2", "#etiket3", "#etiket4"],
  "niche": ["#etiket1", "#etiket2", "#etiket3", "#etiket4"],
  "industry": ["#etiket1", "#etiket2", "#etiket3", "#etiket4"]
}`;

  const userMessage = `Platform: ${platform}
Marka Bağlamı:
${brandContext}

Gönderi Metni:
"""
${caption}
"""`;

  try {
    const res = await callGroq(systemPrompt, userMessage, {
      model: FAST_MODEL,
      temperature: 0.6,
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

    function cleanTags(arr: unknown): string[] {
      if (!Array.isArray(arr)) return [];
      return Array.from(
        new Set(
          arr
            .map((item) => String(item).trim().replace(/^#+/, "").replace(/\s+/g, ""))
            .filter((tag) => /^[\p{L}\p{N}_]{2,40}$/u.test(tag))
            .map((tag) => `#${tag}`)
        )
      ).slice(0, 5);
    }

    const broadTags = cleanTags(parsed.broad);
    const nicheTags = cleanTags(parsed.niche);
    const industryTags = cleanTags(parsed.industry);

    const tipData = PLATFORM_TIPS[platform.toLowerCase()] || PLATFORM_TIPS.instagram;

    const groups: SmartHashtagGroup[] = [
      {
        category: "broad",
        label: "Trend & Keşfet",
        labelEn: "Broad & Viral",
        icon: "🔥",
        description: "Yüksek hacimli popüler etiketler, geniş kitleye ulaşmayı hedefler.",
        descriptionEn: "High-volume reach tags to boost initial viral discovery.",
        colorClass: {
          bg: "bg-rose-50/70",
          border: "border-rose-200/80",
          text: "text-rose-700",
          chipActive: "bg-rose-600 text-white shadow-xs border-rose-600",
          chipInactive: "bg-white text-rose-800 border-rose-200 hover:bg-rose-50",
        },
        tags: broadTags,
      },
      {
        category: "niche",
        label: "Niş & Hedef Kitle",
        labelEn: "Niche & Audience",
        icon: "🎯",
        description: "Daha az rekabetli, konuyu doğrudan arayan hedef kitle etiketleri.",
        descriptionEn: "Low-competition, highly targeted tags tailored to this specific topic.",
        colorClass: {
          bg: "bg-violet-50/70",
          border: "border-violet-200/80",
          text: "text-violet-700",
          chipActive: "bg-violet-600 text-white shadow-xs border-violet-600",
          chipInactive: "bg-white text-violet-800 border-violet-200 hover:bg-violet-50",
        },
        tags: nicheTags,
      },
      {
        category: "industry",
        label: "Sektör & Topluluk",
        labelEn: "Industry & Community",
        icon: "🏢",
        description: "Faaliyet alanınıza, markanıza ve sektör ekosistemine özel etiketler.",
        descriptionEn: "Professional industry and community ecosystem tags.",
        colorClass: {
          bg: "bg-emerald-50/70",
          border: "border-emerald-200/80",
          text: "text-emerald-700",
          chipActive: "bg-emerald-600 text-white shadow-xs border-emerald-600",
          chipInactive: "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50",
        },
        tags: industryTags,
      },
    ];

    const suggestedTags: string[] = [];
    const broadPart = broadTags.slice(0, 2);
    const nichePart = nicheTags.slice(0, 3);
    const industryPart = industryTags.slice(0, 2);
    for (const t of [...broadPart, ...nichePart, ...industryPart]) {
      if (!suggestedTags.includes(t)) {
        suggestedTags.push(t);
      }
    }

    return {
      groups,
      recommendedCount: tipData.recommended,
      platformTip: tipData.tr,
      platformTipEn: tipData.en,
      suggestedTags: suggestedTags.length > 0 ? suggestedTags : [...broadTags, ...nicheTags].slice(0, 6),
    };
  } catch (err) {
    console.error("generateSmartHashtags error:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : isEn
        ? "Could not generate smart hashtags."
        : "Akıllı hashtagler üretilemedi."
    );
  }
}

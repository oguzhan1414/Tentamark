"use server";

import { callGroq, MODEL } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

export interface CaptionLabVariant {
  id: "curiosity" | "educational" | "direct_cta";
  badge: string;
  title: string;
  hook: string;
  caption: string;
  overallScore: number;
  hookScore: number;
  ctaScore: number;
  brandMatchScore: number;
  savePotential: number;
  whyItWorks: string;
}

export interface CaptionLabResult {
  variants: CaptionLabVariant[];
  platform: string;
  analyzedAt: number;
}

export async function generateCaptionLab(
  brandId: string,
  content: string,
  platform: string = "instagram",
  format: string = "post"
): Promise<CaptionLabResult> {
  if (!content?.trim()) {
    throw new Error("Lütfen Caption Lab için bir gönderi metni veya fikir belirtin.");
  }

  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka genel ve profesyonel bir sosyal medya tonuna sahip.";

  const systemPrompt = `Sen dünyanın en iyi sosyal medya büyüme direktörü ve viral metin yazarlığı (copywriting) mimarısın.
Görevin: Verilen marka bağlamını ve gönderi konusunu/metnini inceleyerek ${platform} platformu (${format} formatı) için 3 FARKLI PSİKOLOJİK AÇIDAN (A/B Testi gibi) tam yayınlanabilir varyant üretmek ve her birini gerçekçi sosyal medya algoritma metrikleriyle puanlamak.

Marka Bağlamı:
${brandContext}

3 Zorunlu Varyant:
1. "curiosity" (Merak Kancası — Pattern Interrupt):
   - Merak boşluğu (curiosity gap), şaşırtıcı istatistik, ters köşe veya soru kancasıyla başlar.
   - Kullanıcıyı akışta durdurur, "daha fazlasını oku"ya tıklatır.
2. "educational" (Eğitici & Değer Odaklı — Bookmark Magnet):
   - Adım adım rehber, sektör sırrı, kontrol listesi veya nasıl yapılır ipucu sunar.
   - Doğrudan kaydetme (save) ve tekrar bakma potansiyelini maksimize eder.
3. "direct_cta" (Doğrudan Eylem & Satış — Conversion Driver):
   - Net, samimi ve harekete geçirici teklif veya eylem çağrısı.
   - Profil ziyareti, web sitesi tıklaması veya DM etkileşimi hedefler.

Puanlama Metrikleri (Her biri 60-98 arası gerçekçi tam sayılar):
- overall_score: Genel algoritma başarı puanı.
- hook_score: İlk 2 saniyelik kancanın akışı durdurma gücü.
- cta_score: Eyleme geçirme ve dönüşüm netliği.
- brand_match_score: Marka sesine ve tonuna uyum.
- save_potential: Kullanıcıların bu gönderiyi kaydetme olasılığı.

Kurallar:
- Metinler ${platform} formatına tam uygun olmalı (paragraflar, okunaklı boşluklar, abartısız şık emojiler).
- "why_it_works": Bu açının algoritma psikolojisinde neden tutacağını anlatan tek net cümle (Türkçe).
- SADECE geçerli JSON formatında yanıt üret, markdown (\`\`\`) veya fazladan metin ekleme:

{
  "variants": [
    {
      "id": "curiosity",
      "badge": "🏆 Merak Kancası",
      "title": "Merak & Durdurucu Kanca",
      "hook": "İlk açılış cümlesi...",
      "caption": "Tam yayınlanabilir gönderi metni (tüm paragraflar, emojiler, hashtagler dahil)...",
      "overall_score": 92,
      "hook_score": 95,
      "cta_score": 85,
      "brand_match_score": 90,
      "save_potential": 94,
      "why_it_works": "Merak boşluğu açılışı, akışta gezinmeyi anında durdurur ve kaydetmeyi tetikler."
    },
    {
      "id": "educational",
      "badge": "🥈 Eğitici & Değer",
      "title": "Bilgi & Kaydetme Odaklı",
      "hook": "...",
      "caption": "...",
      "overall_score": 86,
      "hook_score": 82,
      "cta_score": 84,
      "brand_match_score": 96,
      "save_potential": 95,
      "why_it_works": "Adım adım hap bilgi sunması takipçilerin gönderiyi arşivlemesini sağlar."
    },
    {
      "id": "direct_cta",
      "badge": "🥉 Doğrudan Eylem & Satış",
      "title": "Dönüşüm & Aksiyon",
      "hook": "...",
      "caption": "...",
      "overall_score": 79,
      "hook_score": 75,
      "cta_score": 95,
      "brand_match_score": 85,
      "save_potential": 68,
      "why_it_works": "Net teklif ve doğrudan yönlendirme, kararsız kitleyi anında eyleme geçirir."
    }
  ]
}`;

  const userMessage = `Hedef Platform: ${platform}
Format: ${format}
Girdi Metni / Fikir:
"""
${content}
"""`;

  const groqResult = await callGroq(systemPrompt, userMessage, {
    model: MODEL,
    temperature: 0.6,
    maxTokens: 2500,
    jsonMode: true,
    reasoningEffort: "low",
  });

  const cleaned = groqResult.content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const rawVariants = Array.isArray(parsed.variants) ? parsed.variants : [];
  const defaultBadges: Record<string, { badge: string; title: string }> = {
    curiosity: { badge: "🏆 Merak Kancası", title: "Merak & Durdurucu Kanca" },
    educational: { badge: "🥈 Eğitici & Değer", title: "Bilgi & Kaydetme Odaklı" },
    direct_cta: { badge: "🥉 Doğrudan Eylem", title: "Dönüşüm & Aksiyon" },
  };

  const variants: CaptionLabVariant[] = rawVariants.map((v: any, index: number) => {
    const rawId = v.id || (index === 0 ? "curiosity" : index === 1 ? "educational" : "direct_cta");
    const validId = rawId === "curiosity" || rawId === "educational" || rawId === "direct_cta" ? rawId : "curiosity";
    const defaults = defaultBadges[validId] || defaultBadges.curiosity;

    return {
      id: validId,
      badge: String(v.badge || defaults.badge).trim(),
      title: String(v.title || defaults.title).trim(),
      hook: String(v.hook || v.caption?.split("\n")[0] || "").trim(),
      caption: String(v.caption || content).trim(),
      overallScore: clampScore(v.overall_score, 85),
      hookScore: clampScore(v.hook_score, 80),
      ctaScore: clampScore(v.cta_score, 82),
      brandMatchScore: clampScore(v.brand_match_score, 90),
      savePotential: clampScore(v.save_potential, 85),
      whyItWorks: String(v.why_it_works || "Algoritmada yüksek durdurma ve etkileşim performansı vaat eder.").trim(),
    };
  });

  return {
    variants,
    platform,
    analyzedAt: Date.now(),
  };
}

function clampScore(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? Math.max(10, Math.min(99, Math.round(n))) : fallback;
}

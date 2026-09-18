"use server";

import { callGroq, MODEL, estimateGroqCost } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";
import { createClient } from "@/lib/supabase/server";

export interface CarouselSlide {
  slideNumber: number;
  title: string;
  content: string;
}

export interface MultipliedContentResult {
  sourceText: string;
  generatedAt: number;
  formats: {
    instagram_carousel: {
      slides: CarouselSlide[];
      caption: string;
      hashtags: string[];
      fullText: string;
    };
    linkedin_post: {
      hook: string;
      body: string;
      cta: string;
      fullText: string;
    };
    twitter_thread: {
      tweets: string[];
      fullText: string;
    };
    tiktok_script: {
      visualHook: string;
      spokenScript: string;
      cta: string;
      caption: string;
      fullText: string;
    };
    facebook_post: {
      hook: string;
      body: string;
      fullText: string;
    };
    threads_post: {
      text: string;
      fullText: string;
    };
    pinterest_pin: {
      title: string;
      description: string;
      fullText: string;
    };
  };
}

const PROMPT_VERSION = "multiplier-1to7-v1";

export async function multiplyContent(
  brandId: string,
  sourceText: string,
  toneOverride?: string
): Promise<MultipliedContentResult> {
  if (!sourceText || !sourceText.trim()) {
    throw new Error("Lütfen çoğaltılacak bir içerik veya fikir belirtin.");
  }

  const cleanSource = sourceText.trim();
  if (cleanSource.length > 10000) throw new Error("Kaynak metin en fazla 10.000 karakter olabilir.");
  if (toneOverride && toneOverride.length > 500) throw new Error("Ses tonu notu çok uzun.");
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Oturum açmanız gerekiyor.");
  const { data: brand, error: brandError } = await supabase.from("brands").select("id").eq("id", brandId).maybeSingle();
  if (brandError || !brand) throw new Error("Bu markaya erişiminiz yok.");
  const brandCtx = await getBrandContext(brandId);
  const brandContext =
    brandCtx.formattedText || "Marka genel ve profesyonel bir sosyal medya tonuna sahip.";

  const startedAt = Date.now();

  const systemPrompt = `Sen dünyanın en yetenekli ve kıdemli Sosyal Medya Büyüme ve İçerik Dönüştürme (Content Repurposing) Direktörüsün.
Görevin: Verilen kaynak metni/fikri inceleyerek, her sosyal medya platformunun kendi özgün kültürüne, algoritma dinamiklerine ve kitle beklentilerine uygun 7 FARKLI SPESİFİK İÇERİK FORMATINA dönüştürmektir.

Marka Bağlamı:
${brandContext}
${toneOverride ? `Ek Ses Tonu Notu: ${toneOverride}` : ""}

7 HEDEF FORMAT VE KURALLARI:

1. "instagram_carousel":
   - 4-5 slaytlık görsel kaydırmalı (carousel) içerik.
   - Slayt 1: Akışı durduran güçlü büyük başlık/kanca.
   - Slayt 2-4: Adım adım değer, maddeler veya ipuçları (her slayt kısa ve öz olmalı).
   - Slayt 5: Kaydet ve Paylaş çağrısı (CTA).
   - caption: Carousel'in altına yazılacak açıklama metni.
   - hashtags: 5-8 adet sektörel niş etiket.

2. "linkedin_post":
   - B2B ve düşünce liderliği (thought leadership) formatı.
   - hook: İlk 1-2 satırlık merak uyandıran, boşluklu kanca.
   - body: Tek-iki cümlelik ferah satır aralıkları, hikaye anlatımı, somut iş dersi.
   - cta: Gönderi sonunda tartışma ve yorum daveti sorusu.
   - Asla hashtag çöplüğü yapma (en fazla 2-3 profesyonel etiket).

3. "twitter_thread":
   - 3-4 tweetlik akıcı zincir.
   - Her tweet 240 karakteri geçmemeli ve 1/4, 2/4, 3/4, 4/4 şeklinde numaralandırılmalı.
   - 1. tweet viral açılış kancası, son tweet RT ve takip çağrısı olmalı.

4. "tiktok_script":
   - Dikey video (Reels / TikTok / Shorts) için konuşma senaryosu.
   - visualHook: [0-3 saniye] ekranda görünecek metin ve oyuncunun/sunucunun yapacağı görsel hareket.
   - spokenScript: [3-25 saniye] kameraya konuşulacak tempolu, doğal, enerjik metin.
   - cta: [Son 5 saniye] profil ziyareti veya kaydetme çağrısı.
   - caption: Videoyla birlikte paylaşılacak kısa sosyal medya açıklaması. Senaryo yönergelerini bu alana yazma.

5. "facebook_post":
   - Topluluk ve sıcak sohbet odaklı.
   - Samimi, soru soran, yorum yapmaya ve paylaşmaya teşvik eden bir dil.

6. "threads_post":
   - Threads ve Bluesky için kısa, nüktedan, sohbet tonunda, doğal ve kasmayan mikro-gönderi (1-2 paragraf).

7. "pinterest_pin":
   - title: Yüksek arama niyetine (SEO) sahip pin başlığı.
   - description: Anahtar kelime zengin, faydalı ve tıklama odaklı pin açıklaması.

KESİN KURAL: Sadece ve sadece geçerli bir JSON nesnesi döndür. Markdown (\`\`\`) veya açıklama ekleme.

JSON Formatı:
{
  "instagram_carousel": {
    "slides": [
      { "slideNumber": 1, "title": "...", "content": "..." },
      { "slideNumber": 2, "title": "...", "content": "..." },
      { "slideNumber": 3, "title": "...", "content": "..." },
      { "slideNumber": 4, "title": "...", "content": "..." },
      { "slideNumber": 5, "title": "...", "content": "..." }
    ],
    "caption": "...",
    "hashtags": ["#etiket1", "#etiket2"]
  },
  "linkedin_post": {
    "hook": "...",
    "body": "...",
    "cta": "..."
  },
  "twitter_thread": {
    "tweets": ["1/4 ...", "2/4 ...", "3/4 ...", "4/4 ..."]
  },
  "tiktok_script": {
    "visualHook": "...",
    "spokenScript": "...",
    "cta": "...",
    "caption": "..."
  },
  "facebook_post": {
    "hook": "...",
    "body": "..."
  },
  "threads_post": {
    "text": "..."
  },
  "pinterest_pin": {
    "title": "...",
    "description": "..."
  }
}`;

  const userMessage = `Kaynak İçerik / Fikir:\n"${cleanSource}"\n\nLütfen bu içeriği yukarıdaki 7 özgün formata dönüştürerek JSON çıktısı ver.`;

  try {
    const groqRes = await callGroq(systemPrompt, userMessage, {
      temperature: 0.35,
      maxTokens: 4000,
    });

    const cleaned = groqRes.content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object" || !parsed.instagram_carousel ||
        !parsed.linkedin_post || !parsed.twitter_thread || !parsed.tiktok_script ||
        !parsed.facebook_post || !parsed.threads_post || !parsed.pinterest_pin) {
      throw new Error("AI eksik format döndürdü. Lütfen yeniden deneyin.");
    }

    // Instagram Carousel fullText
    const igSlides = Array.isArray(parsed.instagram_carousel?.slides)
      ? parsed.instagram_carousel.slides.map((value: unknown, idx: number) => {
          const slide = value && typeof value === "object" ? value as Record<string, unknown> : {};
          return {
            slideNumber: Number(slide.slideNumber) || idx + 1,
            title: String(slide.title || "").trim(),
            content: String(slide.content || "").trim(),
          };
        })
      : [];

    const igSlidesFormatted = igSlides
      .map((s: CarouselSlide) => `📄 [Slayt ${s.slideNumber}] ${s.title}\n${s.content}`)
      .join("\n\n");

    const igHashtags = Array.isArray(parsed.instagram_carousel?.hashtags)
      ? parsed.instagram_carousel.hashtags.map((value: unknown) =>
          String(value).startsWith("#") ? String(value) : `#${String(value)}`
        )
      : [];

    const igCaption = String(parsed.instagram_carousel?.caption || "").trim();
    const igFullText = [igCaption, igSlidesFormatted, igHashtags.join(" ")]
      .filter(Boolean)
      .join("\n\n");

    // LinkedIn FullText
    const liHook = String(parsed.linkedin_post?.hook || "").trim();
    const liBody = String(parsed.linkedin_post?.body || "").trim();
    const liCta = String(parsed.linkedin_post?.cta || "").trim();
    const liFullText = [liHook, liBody, liCta].filter(Boolean).join("\n\n");

    // Twitter Thread FullText
    const twTweets = Array.isArray(parsed.twitter_thread?.tweets)
      ? parsed.twitter_thread.tweets.map(String)
      : [];
    const twFullText = twTweets.join("\n\n---\n\n");

    // TikTok Script FullText
    const ttVisual = String(parsed.tiktok_script?.visualHook || "").trim();
    const ttSpoken = String(parsed.tiktok_script?.spokenScript || "").trim();
    const ttCta = String(parsed.tiktok_script?.cta || "").trim();
    const ttCaption = String(parsed.tiktok_script?.caption || "").trim();
    if (!ttCaption || !igCaption || igSlides.length === 0 || twTweets.length === 0) {
      throw new Error("AI eksik içerik döndürdü. Lütfen yeniden deneyin.");
    }
    const ttFullText = `🎬 [Görsel Kanca / 0-3sn]:\n${ttVisual}\n\n🎙️ [Konuşma Metni]:\n${ttSpoken}\n\n👉 [Bitiş / CTA]:\n${ttCta}`;

    // Facebook FullText
    const fbHook = String(parsed.facebook_post?.hook || "").trim();
    const fbBody = String(parsed.facebook_post?.body || "").trim();
    const fbFullText = [fbHook, fbBody].filter(Boolean).join("\n\n");

    // Threads FullText
    const thrText = String(parsed.threads_post?.text || "").trim();

    // Pinterest FullText
    const pinTitle = String(parsed.pinterest_pin?.title || "").trim();
    const pinDesc = String(parsed.pinterest_pin?.description || "").trim();
    const pinFullText = `📌 Başlık: ${pinTitle}\n\n${pinDesc}`;

    const latency = Date.now() - startedAt;

    // Log to ai_runs table
    try {
      await supabase.from("ai_runs").insert({
        brand_id: brandId,
        stage: "content_multiplier_1to7",
        prompt_version: PROMPT_VERSION,
        model: MODEL,
        input_tokens: groqRes.inputTokens,
        output_tokens: groqRes.outputTokens,
        cost_estimate_usd: estimateGroqCost(
          groqRes.model,
          groqRes.inputTokens,
          groqRes.outputTokens
        ),
        latency_ms: latency,
        status: "SUCCESS",
      });
    } catch {
      // Non-blocking log
    }

    return {
      sourceText: cleanSource,
      generatedAt: Date.now(),
      formats: {
        instagram_carousel: {
          slides: igSlides,
          caption: igCaption,
          hashtags: igHashtags,
          fullText: igFullText,
        },
        linkedin_post: {
          hook: liHook,
          body: liBody,
          cta: liCta,
          fullText: liFullText,
        },
        twitter_thread: {
          tweets: twTweets,
          fullText: twFullText,
        },
        tiktok_script: {
          visualHook: ttVisual,
          spokenScript: ttSpoken,
          cta: ttCta,
          caption: ttCaption,
          fullText: ttFullText,
        },
        facebook_post: {
          hook: fbHook,
          body: fbBody,
          fullText: fbFullText,
        },
        threads_post: {
          text: thrText,
          fullText: thrText,
        },
        pinterest_pin: {
          title: pinTitle,
          description: pinDesc,
          fullText: pinFullText,
        },
      },
    };
  } catch (err: unknown) {
    console.error("Content multiplier error:", err);
    throw new Error(
      err instanceof Error
        ? `İçerik çoğaltılamadı: ${err.message}`
        : "İçerik çoğaltılırken bir hata oluştu."
    );
  }
}

"use server";

import { lookup } from "node:dns/promises";
import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq } from "@/lib/ai/groqModel";

const PROMPT_VERSION = "brand-autofill-v1";
const FETCH_TIMEOUT_MS = 10000;
const MAX_EXTRACT_CHARS = 15000;

export type AutofillResult = {
  brandName: string;
  website: string;
  industry: string;
  valueProposition: string;
  toneOfVoice: string;
  brandTraits: string[];
  targetAudience: string[];
  competitors: string[];
  rawNotes: string;
};

function isPrivateIp(ip: string): boolean {
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata 169.254.169.254
    return false;
  }
  const lower = ip.toLowerCase();
  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
}

async function resolveAndValidateUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Geçersiz URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Sadece http/https adresleri desteklenir.");
  }
  if (url.hostname.toLowerCase() === "localhost") {
    throw new Error("Bu adres desteklenmiyor.");
  }

  let address: string;
  try {
    address = (await lookup(url.hostname)).address;
  } catch {
    throw new Error("Adres çözümlenemedi.");
  }
  if (isPrivateIp(address)) {
    throw new Error("Bu adres desteklenmiyor.");
  }
  return url;
}

function extractTag(html: string, pattern: RegExp): string {
  return pattern.exec(html)?.[1]?.trim() ?? "";
}

function extractSignals(html: string) {
  const title = extractTag(html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = extractTag(
    html,
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const ogTitle = extractTag(
    html,
    /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const ogDescription = extractTag(
    html,
    /<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const ogSiteName = extractTag(
    html,
    /<meta\s+[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const lang = extractTag(html, /<html[^>]*\slang=["']([a-zA-Z-]+)["']/i);

  // Extract application/ld+json blocks
  const ldMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const ldJsonText = ldMatches
    .map((m) => m[1].trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 3000);

  // Extract body content and strip scripts/styles/SVGs/tags
  let bodyContent = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) bodyContent = bodyMatch[1];

  const cleanedBody = bodyContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_EXTRACT_CHARS);

  return { title, description, ogTitle, ogDescription, ogSiteName, lang, ldJsonText, cleanedBody };
}

/*
  URL → Deep Brand DNA autofill.
  Fetches HTML, extracts meta signals + ld+json + real body text, then
  runs one comprehensive Groq call to extract:
  - brand_name (actual name of the brand/business)
  - industry (accurate industry category)
  - value_proposition (core offer/benefit)
  - tone_of_voice
  - brand_traits
  - target_audience
  - competitors
  - raw_notes (packages, discounts, key product specs)
*/
export async function autofillFromWebsite(brandId: string, rawUrl: string): Promise<AutofillResult> {
  const url = await resolveAndValidateUrl(rawUrl);

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let result: AutofillResult = {
    brandName: "",
    website: url.toString(),
    industry: "",
    valueProposition: "",
    toneOfVoice: "",
    brandTraits: [],
    targetAudience: [],
    competitors: [],
    rawNotes: "",
  };

  const supabase = await createClient();

  try {
    let signals: ReturnType<typeof extractSignals> | null = null;
    let scrapeBlocked = false;

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
        },
      });

      if (res.ok) {
        const fullHtml = await res.text();
        signals = extractSignals(fullHtml);

        // Check if page returned a Cloudflare block challenge inside a 200 response
        if (
          signals.title.includes("Just a moment") ||
          signals.title.includes("Attention Required") ||
          signals.cleanedBody.includes("enable JavaScript and cookies to continue")
        ) {
          scrapeBlocked = true;
        }
      } else {
        scrapeBlocked = true;
      }
    } catch {
      scrapeBlocked = true;
    }

    let system = "";
    let userMessage = "";

    if (!scrapeBlocked && signals && (signals.title || signals.description || signals.cleanedBody.length >= 50)) {
      // Full deep scrape succeeded!
      system = `Sen Tentamark AI için çalışan kıdemli bir marka analisti ve pazar araştırmacısısın.
Verilen web sitesi başlıklarını, meta verilerini ve sayfa metnini derinlemesine inceleyerek markanın kimliğini eksiksiz çıkaracaksın.

Kesin kurallar:
- SADECE ve SADECE geçerli bir JSON nesnesi döndür. Başında veya sonunda hiçbir açıklama veya markdown bloğu (\`\`\`) ekleme.
- JSON formatı tam olarak şu anahtarlara sahip olmalıdır:
{
  "brand_name": "Web sitesinde geçen gerçek ve resmi marka/ürün adı (örn: FoodShopPass, F&S Pass)",
  "industry": "Markanın faaliyet gösterdiği net sektör (Türkçe, örn: Turizm & Yeme-İçme / Dijital Şehir Kartı)",
  "value_proposition": "Markanın müşterilerine sunduğu en temel değer önerisi ve avantaj (tek-iki net cümle)",
  "tone_of_voice": "Markanın iletişim ve ses tonu tanımı (Türkçe, örn: Samimi, dinamik, güven veren ve keşif odaklı)",
  "brand_traits": ["3-5 adet ayırt edici marka özelliği / niteliği"],
  "target_audience": ["2-4 adet net hedef kitle segmenti (Türkçe)"],
  "competitors": ["Bu sektörde bilinen alternatifler veya doğrudan rakip olabilecek 2-4 marka"],
  "raw_notes": "Sayfadan çıkarılan kritik ürün detayları, paketler, fiyatlandırma veya kullanım bilgileri (örn: 1, 3 ve 7 günlük dijital pass, 50+ anlaşmalı restoran ve kafe, ortalama %40 tasarruf)"
}`;

      userMessage = [
        `Site URL: ${url.toString()}`,
        signals.ogSiteName && `Site Adı (OG): ${signals.ogSiteName}`,
        signals.title && `Sayfa Başlığı: ${signals.title}`,
        signals.ogTitle && `OG Başlık: ${signals.ogTitle}`,
        signals.description && `Açıklama: ${signals.description}`,
        signals.ogDescription && `OG Açıklama: ${signals.ogDescription}`,
        signals.lang && `Sayfa Dili: ${signals.lang}`,
        signals.ldJsonText && `Yapılandırılmış Veri (LD+JSON):\n${signals.ldJsonText}`,
        signals.cleanedBody && `Sayfa İçeriği ve Metinleri:\n${signals.cleanedBody}`,
      ]
        .filter(Boolean)
        .join("\n\n");
    } else {
      // Fallback to domain & market intelligence analysis!
      const domain = url.hostname.replace(/^www\./, "");
      system = `Sen Tentamark AI için çalışan kıdemli bir marka analisti ve pazar araştırmacısısın.
Kullanıcının girdiği web sitesi (${url.toString()}) kurumsal güvenlik duvarı veya bot koruması (Cloudflare/WAF) nedeniyle ham HTML olarak taranamadı.
Görevin: Bu domain (${domain}), URL ve markanın sektördeki konumu hakkındaki derin pazar bilgin doğrultusunda bu markanın kurumsal kimliğini eksiksiz çıkaracaksın.

Kesin kurallar:
- SADECE ve SADECE geçerli bir JSON nesnesi döndür. Başında veya sonunda hiçbir açıklama veya markdown bloğu (\`\`\`) ekleme.
- JSON formatı tam olarak şu anahtarlara sahip olmalıdır:
{
  "brand_name": "Resmi veya yaygın kullanılan marka adı (örn: Mavi, Trendyol, Apple)",
  "industry": "Markanın faaliyet gösterdiği net sektör (Türkçe, örn: Moda & Hazır Giyim / Denim)",
  "value_proposition": "Markanın müşterilerine sunduğu en temel değer önerisi ve avantaj (tek-iki net cümle)",
  "tone_of_voice": "Markanın iletişim ve ses tonu tanımı (Türkçe, örn: Dinamik, genç, samimi ve kaliteli)",
  "brand_traits": ["3-5 adet ayırt edici marka özelliği / niteliği"],
  "target_audience": ["2-4 adet net hedef kitle segmenti (Türkçe)"],
  "competitors": ["Bu sektörde bilinen alternatifler veya doğrudan rakip olabilecek 2-4 marka"],
  "raw_notes": "Marka hakkında bilinen kritik detaylar, ürün grupları, e-ticaret yapısı veya öne çıkan özellikler"
}`;

      userMessage = `Web Sitesi URL: ${url.toString()}\nDomain: ${domain}\nLütfen bu markayı ve sektörü analiz ederek JSON nesnesini üret.`;
    }

    const groqResult = await callGroq(system, userMessage, { temperature: 0.3 });
    inputTokens = groqResult.inputTokens;
    outputTokens = groqResult.outputTokens;

    const cleanedJson = groqResult.content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedJson);
    result = {
      brandName: String(parsed.brand_name ?? "").trim(),
      website: url.toString(),
      industry: String(parsed.industry ?? "").trim(),
      valueProposition: String(parsed.value_proposition ?? "").trim(),
      toneOfVoice: String(parsed.tone_of_voice ?? "").trim(),
      brandTraits: Array.isArray(parsed.brand_traits) ? parsed.brand_traits.map(String) : [],
      targetAudience: Array.isArray(parsed.target_audience) ? parsed.target_audience.map(String) : [],
      competitors: Array.isArray(parsed.competitors) ? parsed.competitors.map(String) : [],
      rawNotes: String(parsed.raw_notes ?? "").trim(),
    };
  } catch (err) {
    status = "ERROR";
    errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "brand_autofill",
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
    throw new Error(errorMessage ?? "Marka analiz edilemedi.");
  }
  return result;
}

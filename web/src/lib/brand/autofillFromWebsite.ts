"use server";

import { lookup } from "node:dns/promises";
import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq } from "@/lib/ai/groqModel";
import { TRAIT_KEYS, type TraitScores, type TonePosition } from "./traits";

const PROMPT_VERSION = "brand-autofill-v1";
const FETCH_TIMEOUT_MS = 10000;
const MAX_EXTRACT_CHARS = 15000;

export type CompetitorSocials = {
  instagram: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  x: string;
};

export type CompetitorInsight = {
  name: string;
  website: string;
  socials: CompetitorSocials;
  positioning: string;
  strength: string;
  weakness: string;
  differentiation: string;
  // AI-estimated 0-100 per dimension in MarketComparison.dimensions — a
  // market-knowledge guess, not measured data. Same honesty boundary as
  // positioning/strength/weakness.
  scores: Record<string, number>;
};

export type MarketComparison = {
  dimensions: string[];
  brandScores: Record<string, number>;
  competitiveGap: string;
  opportunity: string;
};

export type AudiencePersona = {
  label: string;
  age: string;
  location: string;
  language: string;
  career: string;
  goal: string;
  painPoint: string;
};

export type AutofillResult = {
  brandName: string;
  website: string;
  industry: string;
  valueProposition: string;
  toneOfVoice: string;
  brandTraits: string[];
  targetAudience: string[];
  competitors: string[];
  competitorAnalysis: CompetitorInsight[];
  marketComparison: MarketComparison;
  traitScores: TraitScores;
  tonePosition: TonePosition;
  audiencePersona: AudiencePersona;
  audiencePainPoints: string[];
  audienceMotivations: string[];
  rawNotes: string;
  // Deterministic, not AI-guessed — see extractBrandColors(). Empty when the
  // page exposes no theme-color/CSS hex signal; never a hallucinated hex.
  colorPalette: string[];
};

function clamp100(n: unknown, fallback = 50): number {
  const num = Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function clampSigned100(n: unknown): number {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(-100, Math.min(100, Math.round(num)));
}

function parseTraitScores(raw: unknown): TraitScores {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const result = {} as TraitScores;
  for (const key of TRAIT_KEYS) {
    result[key] = clamp100(obj[key]);
  }
  return result;
}

function parseTonePosition(raw: unknown): TonePosition {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return { x: clampSigned100(obj.x), y: clampSigned100(obj.y) };
}

function parseAudiencePersona(raw: unknown): AudiencePersona {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    label: String(obj.label ?? "").trim(),
    age: String(obj.age ?? "").trim(),
    location: String(obj.location ?? "").trim(),
    language: String(obj.language ?? "").trim(),
    career: String(obj.career ?? "").trim(),
    goal: String(obj.goal ?? "").trim(),
    painPoint: String(obj.pain_point ?? "").trim(),
  };
}

function parseStringList(raw: unknown, max = 5): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, max);
}

function parseScoreRecord(raw: unknown): Record<string, number> {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = clamp100(value);
  }
  return result;
}

function parseSocials(raw: unknown): CompetitorSocials {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    instagram: String(obj.instagram ?? "").trim(),
    tiktok: String(obj.tiktok ?? "").trim(),
    youtube: String(obj.youtube ?? "").trim(),
    linkedin: String(obj.linkedin ?? "").trim(),
    x: String(obj.x ?? "").trim(),
  };
}

function parseCompetitorAnalysis(raw: unknown): CompetitorInsight[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): CompetitorInsight | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const name = String(obj.name ?? "").trim();
      if (!name) return null;
      return {
        name,
        website: String(obj.website ?? "").trim(),
        socials: parseSocials(obj.socials),
        positioning: String(obj.positioning ?? "").trim(),
        strength: String(obj.strength ?? "").trim(),
        weakness: String(obj.weakness ?? "").trim(),
        differentiation: String(obj.differentiation ?? "").trim(),
        scores: parseScoreRecord(obj.scores),
      };
    })
    .filter((x): x is CompetitorInsight => x !== null)
    .slice(0, 4);
}

function parseMarketComparison(raw: unknown): MarketComparison {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    dimensions: parseStringList(obj.comparison_dimensions, 5),
    brandScores: parseScoreRecord(obj.brand_scores),
    competitiveGap: String(obj.competitive_gap ?? "").trim(),
    opportunity: String(obj.opportunity ?? "").trim(),
  };
}

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

function normalizeHex(raw: string): string {
  const clean = raw.toUpperCase();
  if (clean.length === 3) {
    return "#" + clean.split("").map((c) => c + c).join("");
  }
  return "#" + clean;
}

// Near-gray/black/white hex codes are almost always UI chrome (borders,
// body text, backgrounds), not a distinctive brand color — low saturation
// (max-min channel spread) filters those out.
function isNearGrayOrMonochrome(hex: string): boolean {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return Math.max(r, g, b) - Math.min(r, g, b) < 12;
}

/*
  Deterministic (regex-based) color extraction — deliberately NOT asked of
  the AI, which has no way to actually see the page and would just be
  inventing plausible-sounding hex codes. Pulls from signals already present
  in the raw HTML we fetch anyway: the theme-color meta tag (the strongest,
  most deliberate signal a site publishes) plus hex literals inside <style>
  blocks and inline style="" attributes. Ranked by frequency, capped at 5;
  returns [] when a site exposes none of these (common for JS-rendered
  sites whose real stylesheet is a separate, unfetched request) rather than
  guessing.
*/
function extractBrandColors(html: string): string[] {
  const counts = new Map<string, number>();

  const record = (raw: string, weight = 1) => {
    if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return;
    const hex = normalizeHex(raw);
    if (isNearGrayOrMonochrome(hex)) return;
    counts.set(hex, (counts.get(hex) ?? 0) + weight);
  };

  const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
  if (themeColorMatch) {
    const hexMatch = themeColorMatch[1].match(/[0-9a-fA-F]{3,6}/);
    if (hexMatch) record(hexMatch[0], 20);
  }

  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join(" ");
  const inlineStyles = [...html.matchAll(/style=["']([^"']+)["']/gi)].map((m) => m[1]).join(" ");
  for (const source of [styleBlocks, inlineStyles]) {
    for (const m of source.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
      record(m[1]);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex]) => hex);
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
    competitorAnalysis: [],
    marketComparison: { dimensions: [], brandScores: {}, competitiveGap: "", opportunity: "" },
    traitScores: parseTraitScores(null),
    tonePosition: { x: 0, y: 0 },
    audiencePersona: parseAudiencePersona(null),
    audiencePainPoints: [],
    audienceMotivations: [],
    rawNotes: "",
    colorPalette: [],
  };

  const supabase = await createClient();

  try {
    let signals: ReturnType<typeof extractSignals> | null = null;
    let scrapeBlocked = false;
    let extractedColors: string[] = [];

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
        extractedColors = extractBrandColors(fullHtml);

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
  "competitor_analysis": [
    {
      "name": "Rakip marka adı",
      "website": "Biliniyorsa rakibin web sitesi (https://...), bilinmiyorsa boş bırak",
      "socials": {
        "instagram": "Biliniyorsa Instagram kullanıcı adı (@olmadan), bilinmiyorsa boş",
        "tiktok": "Biliniyorsa TikTok kullanıcı adı, bilinmiyorsa boş",
        "youtube": "Biliniyorsa YouTube kanal adı, bilinmiyorsa boş",
        "linkedin": "Biliniyorsa LinkedIn sayfası, bilinmiyorsa boş",
        "x": "Biliniyorsa X/Twitter kullanıcı adı, bilinmiyorsa boş"
      },
      "positioning": "Bu rakibin pazardaki konumlanışı, tek net cümle",
      "strength": "En güçlü / dikkat çekici yönü, somut",
      "weakness": "Zayıf noktası veya boşluğu — bu bir fırsat alanı",
      "differentiation": "Analiz edilen markanın bu rakibe karşı nasıl öne çıkabileceği, somut ve aksiyon alınabilir",
      "scores": {"<comparison_dimensions içindeki her boyut adı>": "0-100 arası, bu rakip için tahmini skor"}
    }
  ],
  "comparison_dimensions": ["Bu sektöre özel 4-5 karşılaştırma boyutu, örn: Fiyat/Değer, Ürün Kalitesi, Marka Bilinirliği, Müşteri Deneyimi, Dijital Varlık"],
  "brand_scores": {"<comparison_dimensions içindeki her boyut adı>": "0-100 arası, analiz edilen markanın tahmini skoru"},
  "competitive_gap": "Rakiplerin pazarda ortak olarak nerede yoğunlaştığı, nerede boşluk bıraktıkları (1-2 cümle)",
  "opportunity": "Analiz edilen markanın bu boşluktan somut olarak nasıl faydalanabileceği (1-2 cümle, aksiyon alınabilir)",
  "trait_scores": {
    "samimi": "0-100 arası, marka ne kadar samimi/sıcak?",
    "profesyonel": "0-100 arası, marka ne kadar resmi/profesyonel?",
    "teknolojik": "0-100 arası, marka ne kadar teknoloji odaklı/yenilikçi?",
    "enerjik": "0-100 arası, marka ne kadar dinamik/enerjik?",
    "destekleyici": "0-100 arası, marka ne kadar destekleyici/yardımsever bir izlenim veriyor?",
    "luks": "0-100 arası, marka ne kadar premium/lüks konumlanıyor?"
  },
  "tone_position": {
    "x": "-100 (tamamen resmi/profesyonel) ile 100 (tamamen rahat/gündelik) arası tam sayı",
    "y": "-100 (sakin/ölçülü) ile 100 (enerjik/coşkulu) arası tam sayı"
  },
  "audience_persona": {
    "label": "Kısa persona adı (örn. 'Genç Profesyonel', 'Yerel Aile')",
    "age": "Yaş aralığı (örn. 22-35)",
    "location": "Konum (örn. Türkiye / Global, veya şehir)",
    "language": "Konuştuğu dil(ler) (örn. Türkçe, Türkçe / İngilizce)",
    "career": "Meslek veya sektör alanı",
    "goal": "Bu kişinin ulaşmaya çalıştığı ana hedef",
    "pain_point": "Bu kişinin önündeki en büyük engel / acı nokta"
  },
  "audience_pain_points": ["3-4 madde, hedef kitlenin somut sorunları"],
  "audience_motivations": ["3-4 madde, hedef kitleyi harekete geçiren motivasyonlar"],
  "raw_notes": "Sayfadan çıkarılan kritik ürün detayları, paketler, fiyatlandırma veya kullanım bilgileri (örn: 1, 3 ve 7 günlük dijital pass, 50+ anlaşmalı restoran ve kafe, ortalama %40 tasarruf)"
}

competitor_analysis kuralları:
- En az 2, en fazla 4 rakip içersin — competitors listesindeki markalarla tutarlı olsun.
- Her alan somut ve spesifik olsun; "kaliteli hizmet sunuyor" gibi jenerik/boş cümleler yazma.
- differentiation alanı gerçekten uygulanabilir bir öneri olsun, genel geçer tavsiye değil.
- Rakip tanınmış/bilinen bir marka ise (büyük uygulamalar, global veya ülke çapında bilinen şirketler), gerçek website adresini ve sosyal medya kullanıcı adlarını doldurmaktan ÇEKİNME — bu senin genel bilgin dahilinde, kullan. Sadece gerçekten hiç bilmediğin, çok küçük/yerel/niş bir rakip için o alanları boş bırak. Ama asla var olmadığından emin olmadığın bir kullanıcı adı UYDURMA.

comparison_dimensions / scores kuralları:
- Tüm comparison_scores (brand_scores ve her rakibin scores'u) TAM OLARAK aynı boyut adlarını anahtar olarak kullanmalı.
- Skorlar senin pazar bilgine dayalı bir TAHMİN — ölçülmüş veri değil, bunu abartılı kesinlikte sunma (uçlara çok gitmeden, gerçekçi bir dağılım kullan).

trait_scores ve tone_position kuralları:
- Sayfadan çıkardığın gerçek izlenime göre skorla, hepsini 50'ye yakın verme — marka gerçekten öyleyse uçlara git.
- tone_of_voice metniyle tutarlı olsun (örn. tone_of_voice "samimi ve enerjik" diyorsa x ve y de pozitif olmalı).

audience_persona / pain_points / motivations kuralları:
- target_audience listesindeki en baskın segmenti temsil eden TEK bir persona oluştur.
- Somut ve spesifik yaz, "kaliteli hizmet arıyor" gibi jenerik ifadeler kullanma.`;

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
  "competitor_analysis": [
    {
      "name": "Rakip marka adı",
      "website": "Biliniyorsa rakibin web sitesi (https://...), bilinmiyorsa boş bırak",
      "socials": {
        "instagram": "Biliniyorsa Instagram kullanıcı adı (@olmadan), bilinmiyorsa boş",
        "tiktok": "Biliniyorsa TikTok kullanıcı adı, bilinmiyorsa boş",
        "youtube": "Biliniyorsa YouTube kanal adı, bilinmiyorsa boş",
        "linkedin": "Biliniyorsa LinkedIn sayfası, bilinmiyorsa boş",
        "x": "Biliniyorsa X/Twitter kullanıcı adı, bilinmiyorsa boş"
      },
      "positioning": "Bu rakibin pazardaki konumlanışı, tek net cümle",
      "strength": "En güçlü / dikkat çekici yönü, somut",
      "weakness": "Zayıf noktası veya boşluğu — bu bir fırsat alanı",
      "differentiation": "Analiz edilen markanın bu rakibe karşı nasıl öne çıkabileceği, somut ve aksiyon alınabilir",
      "scores": {"<comparison_dimensions içindeki her boyut adı>": "0-100 arası, bu rakip için tahmini skor"}
    }
  ],
  "comparison_dimensions": ["Bu sektöre özel 4-5 karşılaştırma boyutu, örn: Fiyat/Değer, Ürün Kalitesi, Marka Bilinirliği, Müşteri Deneyimi, Dijital Varlık"],
  "brand_scores": {"<comparison_dimensions içindeki her boyut adı>": "0-100 arası, analiz edilen markanın tahmini skoru"},
  "competitive_gap": "Rakiplerin pazarda ortak olarak nerede yoğunlaştığı, nerede boşluk bıraktıkları (1-2 cümle)",
  "opportunity": "Analiz edilen markanın bu boşluktan somut olarak nasıl faydalanabileceği (1-2 cümle, aksiyon alınabilir)",
  "trait_scores": {
    "samimi": "0-100 arası, marka ne kadar samimi/sıcak?",
    "profesyonel": "0-100 arası, marka ne kadar resmi/profesyonel?",
    "teknolojik": "0-100 arası, marka ne kadar teknoloji odaklı/yenilikçi?",
    "enerjik": "0-100 arası, marka ne kadar dinamik/enerjik?",
    "destekleyici": "0-100 arası, marka ne kadar destekleyici/yardımsever bir izlenim veriyor?",
    "luks": "0-100 arası, marka ne kadar premium/lüks konumlanıyor?"
  },
  "tone_position": {
    "x": "-100 (tamamen resmi/profesyonel) ile 100 (tamamen rahat/gündelik) arası tam sayı",
    "y": "-100 (sakin/ölçülü) ile 100 (enerjik/coşkulu) arası tam sayı"
  },
  "audience_persona": {
    "label": "Kısa persona adı (örn. 'Genç Profesyonel', 'Yerel Aile')",
    "age": "Yaş aralığı (örn. 22-35)",
    "location": "Konum (örn. Türkiye / Global, veya şehir)",
    "language": "Konuştuğu dil(ler) (örn. Türkçe, Türkçe / İngilizce)",
    "career": "Meslek veya sektör alanı",
    "goal": "Bu kişinin ulaşmaya çalıştığı ana hedef",
    "pain_point": "Bu kişinin önündeki en büyük engel / acı nokta"
  },
  "audience_pain_points": ["3-4 madde, hedef kitlenin somut sorunları"],
  "audience_motivations": ["3-4 madde, hedef kitleyi harekete geçiren motivasyonlar"],
  "raw_notes": "Marka hakkında bilinen kritik detaylar, ürün grupları, e-ticaret yapısı veya öne çıkan özellikler"
}

competitor_analysis kuralları:
- En az 2, en fazla 4 rakip içersin — competitors listesindeki markalarla tutarlı olsun.
- Her alan somut ve spesifik olsun; "kaliteli hizmet sunuyor" gibi jenerik/boş cümleler yazma.
- differentiation alanı gerçekten uygulanabilir bir öneri olsun, genel geçer tavsiye değil.
- Rakip tanınmış/bilinen bir marka ise (büyük uygulamalar, global veya ülke çapında bilinen şirketler), gerçek website adresini ve sosyal medya kullanıcı adlarını doldurmaktan ÇEKİNME — bu senin genel bilgin dahilinde, kullan. Sadece gerçekten hiç bilmediğin, çok küçük/yerel/niş bir rakip için o alanları boş bırak. Ama asla var olmadığından emin olmadığın bir kullanıcı adı UYDURMA.

comparison_dimensions / scores kuralları:
- Tüm comparison_scores (brand_scores ve her rakibin scores'u) TAM OLARAK aynı boyut adlarını anahtar olarak kullanmalı.
- Skorlar senin pazar bilgine dayalı bir TAHMİN — ölçülmüş veri değil, bunu abartılı kesinlikte sunma (uçlara çok gitmeden, gerçekçi bir dağılım kullan).

trait_scores ve tone_position kuralları:
- Bilinen marka algısına göre skorla, hepsini 50'ye yakın verme — marka gerçekten öyleyse uçlara git.
- tone_of_voice metniyle tutarlı olsun (örn. tone_of_voice "samimi ve enerjik" diyorsa x ve y de pozitif olmalı).

audience_persona / pain_points / motivations kuralları:
- target_audience listesindeki en baskın segmenti temsil eden TEK bir persona oluştur.
- Somut ve spesifik yaz, "kaliteli hizmet arıyor" gibi jenerik ifadeler kullanma.`;

      userMessage = `Web Sitesi URL: ${url.toString()}\nDomain: ${domain}\nLütfen bu markayı ve sektörü analiz ederek JSON nesnesini üret.`;
    }

    const groqResult = await callGroq(system, userMessage, { temperature: 0.3, maxTokens: 4500 });
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
      competitorAnalysis: parseCompetitorAnalysis(parsed.competitor_analysis),
      marketComparison: parseMarketComparison(parsed),
      traitScores: parseTraitScores(parsed.trait_scores),
      tonePosition: parseTonePosition(parsed.tone_position),
      audiencePersona: parseAudiencePersona(parsed.audience_persona),
      audiencePainPoints: parseStringList(parsed.audience_pain_points),
      audienceMotivations: parseStringList(parsed.audience_motivations),
      rawNotes: String(parsed.raw_notes ?? "").trim(),
      colorPalette: extractedColors,
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

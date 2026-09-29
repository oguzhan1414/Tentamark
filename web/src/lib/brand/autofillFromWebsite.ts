"use server";

import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq } from "@/lib/ai/groqModel";
import { TRAIT_KEYS, type TraitScores, type TonePosition } from "./traits";
import { resolveAndValidateUrl, extractSignals } from "./htmlSignals";

const PROMPT_VERSION = "brand-autofill-v1";
const FETCH_TIMEOUT_MS = 10000;

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

export type BrandClaim = {
  text: string;
  sourceUrl: string;
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
  // Deterministic, not AI-guessed — see extractLogoUrl(). Null when the page
  // exposes none of apple-touch-icon/og:image/icon; never a guessed URL.
  logoUrl: string | null;
  // AI's subjective read (short phrase, e.g. "minimal ve pastel") — same
  // trust tier as trait_scores/tone_position, editable, not a hard claim.
  visualStyle: string;
  // Only ever populated from the real-scrape branch — the fallback branch
  // (site blocked/unreachable) has no actual page text to ground a claim in,
  // so treating its guesses as "verified claims" would defeat the whole
  // point of the ledger. Empty on fallback, always.
  claims: BrandClaim[];
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

function parseClaims(raw: unknown, sourceUrl: string): BrandClaim[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((text) => ({ text, sourceUrl }));
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

const VERIFY_TIMEOUT_MS = 7000;
const VERIFY_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// The competitor prompt tells the model it's fine to fill in a well-known
// brand's website/handles from its own training knowledge (§ below) — which
// means every one of those is an unverified guess, right or wrong, with no
// way to tell which from the app's side. A real request is the only honest
// check: if it doesn't resolve to something real, it doesn't get shown.
// Best-effort by nature (a genuinely real profile can still fail this if the
// platform blocks non-browser traffic), but a false "hide it" is the safe
// failure direction here, not a false "show it".
async function verifyUrlExists(rawUrl: string): Promise<boolean> {
  let url: URL;
  try {
    url = await resolveAndValidateUrl(rawUrl);
  } catch {
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      headers: { "User-Agent": VERIFY_USER_AGENT, Accept: "text/html,*/*;q=0.8" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Checked live against real accounts AND obviously-fake handles before
// trusting this: Instagram, TikTok and X all serve a generic 200-status SPA
// shell for literally any handle, real or not (the actual "does this exist"
// check happens client-side, in JS this fetch never runs) — a byte-for-byte
// near-identical response either way. A status check there is decoration,
// not verification, and would let every hallucinated handle straight
// through while looking like it did something. LinkedIn and YouTube, by
// contrast, genuinely 404 a nonexistent company/channel — verifiable for
// real. Platforms in the first group are just never populated below;
// showing an unverifiable guess and showing a hallucinated one are the same
// failure from the user's side, and the whole point here was to stop doing
// that.
const VERIFIABLE_SOCIAL_PLATFORMS: (keyof CompetitorSocials)[] = ["linkedin", "youtube"];

function socialProfileUrl(platform: keyof CompetitorSocials, handle: string): string | null {
  const h = handle.replace(/^@/, "").trim();
  if (!h) return null;
  switch (platform) {
    case "linkedin":
      return `https://www.linkedin.com/company/${h}`;
    case "youtube":
      return `https://www.youtube.com/@${h}`;
    default:
      return null;
  }
}

// Verifies every website + verifiable social handle across all competitors
// in parallel — sequential would mean dozens of checks at up to 7s each.
// Unverifiable fields come back blank, not removed from the object, so the
// rest of a competitor's real analysis (positioning, strength, scores)
// still shows.
async function verifyCompetitorLinks(competitors: CompetitorInsight[]): Promise<CompetitorInsight[]> {
  return Promise.all(
    competitors.map(async (c) => {
      const [websiteOk, socialResults] = await Promise.all([
        c.website ? verifyUrlExists(c.website) : Promise.resolve(false),
        Promise.all(
          (Object.entries(c.socials) as [keyof CompetitorSocials, string][]).map(async ([platform, handle]) => {
            if (!VERIFIABLE_SOCIAL_PLATFORMS.includes(platform)) return [platform, ""] as const;
            const profileUrl = handle ? socialProfileUrl(platform, handle) : null;
            const ok = profileUrl ? await verifyUrlExists(profileUrl) : false;
            return [platform, ok ? handle : ""] as const;
          })
        ),
      ]);

      return {
        ...c,
        website: websiteOk ? c.website : "",
        socials: Object.fromEntries(socialResults) as CompetitorSocials,
      };
    })
  );
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

// Third-party widget/icon colors that showed up in real output looking like
// brand colors — #25D366 (WhatsApp's exact green) came from a "Chat on
// WhatsApp" button's CSS on a site that had nothing to do with WhatsApp,
// ranked into the top 5 by raw frequency same as any real brand color. Not
// an exhaustive list, just the confirmed offender plus its obvious siblings
// (other chat-widget/social-share brand colors that get embedded the same
// way) — a blocklist can't catch everything frequency-ranking gets wrong,
// but it catches the specific failure mode that was actually observed.
const KNOWN_WIDGET_COLORS = new Set([
  "#25D366", // WhatsApp
  "#1877F2", // Facebook / Messenger
  "#1DA1F2", // Twitter/X (legacy blue)
  "#0A66C2", // LinkedIn
  "#FF0000", // YouTube
  // Confirmed live on tentamark.com's own "connected platforms" icon row —
  // Shopify/Google/Instagram/Pinterest badges outranked the site's real
  // #FA5252 brand color 1:0 in the saved palette before this was added.
  "#95BF47", // Shopify
  "#4285F4", "#EA4335", "#FBBC05", "#34A853", // Google (G logo's 4 colors)
  "#E4405F", "#F09433", "#E6683C", "#DC2743", "#CC2366", "#BC1888", // Instagram (icon + gradient stops)
  "#BD081C", "#E60023", // Pinterest (legacy + current red)
]);

/*
  Deterministic (regex-based) color extraction — deliberately NOT asked of
  the AI, which has no way to actually see the page and would just be
  inventing plausible-sounding hex codes. Pulls from signals already present
  in the raw HTML we fetch anyway, in priority order:
  1. theme-color meta tag — the single most deliberate signal a site publishes.
  2. CSS custom properties whose name suggests an intentional design-system
     choice (--brand-primary, --color-accent, etc.), AND Tailwind
     arbitrary-value color classes (bg-[#hex], border-[#hex]/40, ...) — both
     are a hex a developer chose and typed on purpose, a much stronger
     signal than a hex that just happens to appear many times, which raw
     frequency alone can't tell apart from a third-party widget's color
     repeated across many elements.
  3. Everything else in <style> blocks / inline style="" attributes, ranked
     by frequency as a fallback.
  Known widget colors (WhatsApp green, Facebook blue, Shopify green, Google
  blue, Instagram's gradient, Pinterest red, ...) are excluded at every tier
  — confirmed live on tentamark.com's own site: small "connected platform"
  icon SVGs (inline style="color:...") otherwise outrank the real brand
  color, which historically only showed up via Tailwind classes invisible to
  tier 2. Returns [] when a site exposes none of these (common for
  JS-rendered sites whose real stylesheet is a separate, unfetched request)
  rather than guessing.
*/
function extractBrandColors(html: string): string[] {
  const tiers = [new Map<string, number>(), new Map<string, number>(), new Map<string, number>()];

  const record = (tier: number, raw: string, weight = 1) => {
    if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return;
    const hex = normalizeHex(raw);
    if (isNearGrayOrMonochrome(hex)) return;
    if (KNOWN_WIDGET_COLORS.has(hex)) return;
    tiers[tier].set(hex, (tiers[tier].get(hex) ?? 0) + weight);
  };

  const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
  if (themeColorMatch) {
    const hexMatch = themeColorMatch[1].match(/[0-9a-fA-F]{3,6}/);
    if (hexMatch) record(0, hexMatch[0], 1);
  }

  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join(" ");
  const inlineStyles = [...html.matchAll(/style=["']([^"']+)["']/gi)].map((m) => m[1]).join(" ");
  const allStyle = `${styleBlocks} ${inlineStyles}`;

  // CSS custom properties: --anything-brand-anything, --anything-color-anything,
  // --anything-primary-anything, --anything-accent-anything: value.
  for (const m of allStyle.matchAll(
    /--[\w-]*(?:brand|primary|accent|color)[\w-]*\s*:\s*#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/gi
  )) {
    record(1, m[1], 10);
  }

  // Tailwind arbitrary-value color classes, e.g. class="bg-[#FA5252]" or
  // "hover:border-[#FA5252]/40" — invisible to the two extractions above,
  // since they live in class="" attributes, never in <style>/style="". This
  // is exactly as deliberate a color choice as a CSS custom property (a
  // developer typed that literal hex on purpose, repeatedly, across many
  // elements) so it gets the same tier weight. Confirmed live: Tentamark's
  // own real brand color (#FA5252, used 29x this way) was completely
  // invisible to the extractor before this, while small platform-icon SVGs
  // using inline style="color:..." won by default.
  const classAttrs = [...html.matchAll(/class=["']([^"']+)["']/gi)].map((m) => m[1]).join(" ");
  for (const m of classAttrs.matchAll(
    /(?:bg|text|border|ring|shadow|from|via|to|fill|stroke|accent|caret|decoration|outline|divide)-\[#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\]/gi
  )) {
    record(1, m[1], 10);
  }

  for (const m of allStyle.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    record(2, m[1]);
  }

  const merged = new Map<string, number>();
  tiers.forEach((tier, idx) => {
    const tierWeight = idx === 0 ? 1000 : idx === 1 ? 100 : 1; // keeps tiers from mixing by raw count
    for (const [hex, count] of tier) merged.set(hex, (merged.get(hex) ?? 0) + count * tierWeight);
  });

  return [...merged.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex]) => hex);
}

// Priority order: apple-touch-icon is almost always a clean square brand
// mark (that's its whole purpose — a home-screen icon), og:image is usually
// a social-preview banner (better than nothing, but often not a logo), plain
// favicon is the last resort. Relative hrefs resolved against the page's
// own origin — most sites serve these from a CDN subdomain, not the page URL.
function extractLogoUrl(html: string, pageUrl: URL): string | null {
  const candidates: { pattern: RegExp; priority: number }[] = [
    { pattern: /<link[^>]*rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]*href=["']([^"']+)["']/i, priority: 0 },
    { pattern: /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i, priority: 1 },
    { pattern: /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["']/i, priority: 2 },
  ];
  let best: { href: string; priority: number } | null = null;
  for (const { pattern, priority } of candidates) {
    const match = pattern.exec(html);
    if (match?.[1] && (!best || priority < best.priority)) {
      best = { href: match[1], priority };
    }
  }
  if (!best) return null;
  try {
    return new URL(best.href, pageUrl).toString();
  } catch {
    return null;
  }
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
    logoUrl: null,
    visualStyle: "",
    claims: [],
  };

  const supabase = await createClient();

  try {
    let signals: ReturnType<typeof extractSignals> | null = null;
    let scrapeBlocked = false;
    let extractedColors: string[] = [];
    let extractedLogoUrl: string | null = null;

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
        extractedLogoUrl = extractLogoUrl(fullHtml, url);

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
  "visual_style": "Markanın görsel estetiğini 2-4 kelimeyle tanımla (örn: 'minimal ve pastel', 'maksimalist ve enerjik renkli', 'lüks ve sade', 'el yapımı ve sıcak')",
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
  "raw_notes": "Sayfadan çıkarılan kritik ürün detayları, paketler, fiyatlandırma veya kullanım bilgileri (örn: 1, 3 ve 7 günlük dijital pass, 50+ anlaşmalı restoran ve kafe, ortalama %40 tasarruf)",
  "claims": ["Sayfa içeriğinde GERÇEKTEN YAZILI olan somut, doğrulanabilir iddialar — rakamlar, süreler, garantiler, sertifikalar, politika detayları (örn: '24 saat içinde kargo', '2 yıl garanti', '%100 organik sertifikalı'). En fazla 10 madde."]
}

claims kuralı — bu en kesin kural, ihlal etme:
- claims dizisine SADECE sayfa içeriğinde (başlık, açıklama, LD+JSON veya gövde metninde) gerçekten geçen somut iddiaları ekle.
- Tahmin, genel pazar bilgisi veya "muhtemelen böyledir" türü bir şey EKLEME — sayfada yazmıyorsa listeye girmesin.
- Sayfada böyle somut bir iddia yoksa boş dizi döndür, uydurma.

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
  "visual_style": "Markanın görsel estetiğini 2-4 kelimeyle tanımla (örn: 'minimal ve pastel', 'maksimalist ve enerjik renkli', 'lüks ve sade', 'el yapımı ve sıcak')",
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
    // The model was told it's fine to fill in a well-known competitor's
    // website/handles from its own training knowledge — every one of those
    // is an unverified guess until something actually checks it. Real HTTP
    // requests, not more AI, decide what's shown (see verifyCompetitorLinks).
    const verifiedCompetitorAnalysis = await verifyCompetitorLinks(parseCompetitorAnalysis(parsed.competitor_analysis));
    result = {
      brandName: String(parsed.brand_name ?? "").trim(),
      website: url.toString(),
      industry: String(parsed.industry ?? "").trim(),
      valueProposition: String(parsed.value_proposition ?? "").trim(),
      toneOfVoice: String(parsed.tone_of_voice ?? "").trim(),
      brandTraits: Array.isArray(parsed.brand_traits) ? parsed.brand_traits.map(String) : [],
      targetAudience: Array.isArray(parsed.target_audience) ? parsed.target_audience.map(String) : [],
      competitors: Array.isArray(parsed.competitors) ? parsed.competitors.map(String) : [],
      competitorAnalysis: verifiedCompetitorAnalysis,
      marketComparison: parseMarketComparison(parsed),
      traitScores: parseTraitScores(parsed.trait_scores),
      tonePosition: parseTonePosition(parsed.tone_position),
      audiencePersona: parseAudiencePersona(parsed.audience_persona),
      audiencePainPoints: parseStringList(parsed.audience_pain_points),
      audienceMotivations: parseStringList(parsed.audience_motivations),
      rawNotes: String(parsed.raw_notes ?? "").trim(),
      colorPalette: extractedColors,
      logoUrl: extractedLogoUrl,
      visualStyle: String(parsed.visual_style ?? "").trim(),
      // undefined on the fallback branch (that prompt has no claims key at
      // all) — parseClaims([]) there by construction, never AI-guessed.
      claims: parseClaims(parsed.claims, url.toString()),
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

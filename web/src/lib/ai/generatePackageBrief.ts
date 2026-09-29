import type { createClient } from "@/lib/supabase/server";
import { callGroq, MODEL, estimateGroqCost } from "./groqModel";

// Request-scoped (cookie-based) client, not the admin client — this runs
// synchronously inside POST /api/packages, which has a real user session,
// same convention api/cards/[type]/route.ts and api/video/jobs/route.ts
// already use for their own foreground work. Only prepareVideoDraft()'s
// fire-and-forget background leg needs (and internally creates) an admin
// client — see createContentPackage.ts.
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PackageBrief = {
  title: string; // content.title for all 4 rows
  coreIdea: string; // content.core_idea + the video job's topic
  quoteText: string; // feed + story card (same text, two formats — this IS the "mesaj tutarlılığı")
  carousel: { title: string; items: string[]; ctaLabel?: string };
};

const FALLBACK_ITEMS = ["Fikri netleştir.", "Markana uygun bir ton seç.", "Tek bir mesajda birleştir."];

// Single Groq call producing everything a content package needs — one call
// instead of four keeps cost down AND is what actually guarantees "mesaj
// tutarlılığı" (message consistency) across feed/story/carousel/video,
// since every output is generated from the exact same brief object rather
// than four independent AI calls that could each drift in a different
// direction. Mirrors generateSceneCopy()'s one-call-multiple-JSON-fields
// pattern in buildVideoInputProps.ts.
export async function generatePackageBrief(
  topic: string,
  brandId: string,
  brandContextText: string,
  brandName: string,
  supabase: SupabaseServerClient
): Promise<PackageBrief> {
  const systemPrompt = `Sen ${brandName} markası için tek bir fikri dört farklı içerik formatına uyarlayan bir içerik stratejistisin.

Marka bağlamı: ${brandContextText}

Aşağıdaki JSON alanlarını üret. Türkçe, doğal, klişe AI ifadelerinden uzak yaz. Dört formatın hepsi AYNI mesajı taşımalı — sadece uzunluk/biçim değişsin, ana fikir asla değişmesin.
{
  "title": "iç kullanım için kısa bir başlık (en fazla 60 karakter)",
  "coreIdea": "tek paragraflık, video ve görsel üretiminin temel alacağı ana fikir",
  "quoteText": "feed ve story kartında kullanılacak tek, çarpıcı, en fazla 200 karakterlik bir cümle",
  "carousel": {
    "title": "carousel kapak başlığı (en fazla 80 karakter)",
    "items": ["3-5 kısa madde, her biri en fazla 100 karakter"],
    "ctaLabel": "en fazla 40 karakterlik kapanış çağrısı"
  }
}

Sadece bu JSON'u döndür, başka metin ekleme.`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let error: string | null = null;
  let model = MODEL;
  let inputTokens = 0;
  let outputTokens = 0;
  let parsed: Record<string, unknown> = {};

  try {
    const result = await callGroq(systemPrompt, topic || `${brandName} için yeni bir içerik paketi fikri üret.`);
    model = result.model;
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    parsed = JSON.parse(result.content);
  } catch (err) {
    status = "ERROR";
    error = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "content_package_brief",
    prompt_version: "package-v1",
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: estimateGroqCost(model, inputTokens, outputTokens),
    latency_ms: Date.now() - startedAt,
    status,
    error,
  });

  const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 60) : topic.slice(0, 60) || "Yeni İçerik Paketi";
  const coreIdea = typeof parsed.coreIdea === "string" && parsed.coreIdea.trim() ? parsed.coreIdea.trim() : topic;
  const quoteText = typeof parsed.quoteText === "string" && parsed.quoteText.trim() ? parsed.quoteText.trim().slice(0, 280) : coreIdea.slice(0, 200);

  const carouselRaw = parsed.carousel && typeof parsed.carousel === "object" ? (parsed.carousel as Record<string, unknown>) : {};
  const carouselItems = Array.isArray(carouselRaw.items)
    ? carouselRaw.items.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 8)
    : [];
  const carousel = {
    title: typeof carouselRaw.title === "string" && carouselRaw.title.trim() ? carouselRaw.title.trim().slice(0, 80) : title,
    items: carouselItems.length > 0 ? carouselItems : FALLBACK_ITEMS,
    ctaLabel: typeof carouselRaw.ctaLabel === "string" && carouselRaw.ctaLabel.trim() ? carouselRaw.ctaLabel.trim().slice(0, 40) : undefined,
  };

  return { title, coreIdea, quoteText, carousel };
}

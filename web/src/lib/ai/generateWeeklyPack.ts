"use server";

import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq, estimateGroqCost } from "./groqModel";
import { PLATFORM_LABEL, PLATFORM_RULE, type LaunchPlatform } from "./platforms";

import { MAX_ITEM_COUNT } from "./weeklyPackConstants";

const PROMPT_VERSION = "weekly-pack-v3-day-picker";
const DEFAULT_ITEM_COUNT = 5;

export type WeeklyPackItem = {
  title: string;
  category: string;
  pillar: string;
  hook: string;
  visualPrompt: string;
  dayOffset: number;
  captions: Partial<Record<LaunchPlatform, string>>;
};

function jsonShapeExample(platforms: LaunchPlatform[]): string {
  const captionFields = platforms.map((p) => `"${p}": "..."`).join(", ");
  return `{"items": [{"title": "...", "pillar": "...", "hook": "...", "visual_prompt": "...", "day_offset": 0, "captions": {${captionFields}}}, ...]}`;
}

function parsePack(
  raw: string,
  platforms: LaunchPlatform[],
  itemCount: number,
  validOffsets: number[] | null
): WeeklyPackItem[] {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: { items?: unknown[] } = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Model geçerli bir JSON yanıtı döndüremedi.");
    }
  }

  let rawItems = Array.isArray(parsed.items) ? parsed.items : [];
  if (rawItems.length === 0) {
    throw new Error("Model içerik listesi döndüremedi.");
  }

  // If the model returns more than asked for, keep only the first itemCount.
  if (rawItems.length > itemCount) {
    rawItems = rawItems.slice(0, itemCount);
  }

  return rawItems.map((itemObj: unknown, index: number) => {
    const item = (itemObj && typeof itemObj === "object" ? itemObj : {}) as Record<string, unknown>;
    const itemCaptions = (item.captions && typeof item.captions === "object" ? item.captions : {}) as Record<string, unknown>;

    const title = String(item.title ?? `İçerik ${index + 1}`);
    const anyAvailableText = Object.values(itemCaptions).find(
      (v) => typeof v === "string" && v.trim().length > 0
    ) as string | undefined;

    const captions: Partial<Record<LaunchPlatform, string>> = {};
    for (const platform of platforms) {
      const value = itemCaptions[platform];
      captions[platform] =
        typeof value === "string" && value.trim().length > 0
          ? value
          : (anyAvailableText ?? title);
    }

    const pillar = String(item.pillar ?? item.category ?? "Genel");
    const rawOffset = Number.isInteger(item.day_offset) ? Number(item.day_offset) : index;
    // Models don't always honor an "only use these offsets" instruction
    // perfectly — snap to the nearest actually-valid day (e.g. a weekend
    // offset the model slipped in) rather than silently scheduling on a
    // day the user explicitly excluded.
    const dayOffset = validOffsets ? nearestValid(rawOffset, validOffsets) : rawOffset;
    return {
      title,
      category: pillar,
      pillar,
      hook: String(item.hook ?? ""),
      visualPrompt: String(item.visual_prompt ?? item.visualPrompt ?? ""),
      dayOffset,
      captions,
    };
  });
}

function nearestValid(value: number, validOffsets: number[]): number {
  if (validOffsets.includes(value)) return value;
  return validOffsets.reduce((closest, candidate) =>
    Math.abs(candidate - value) < Math.abs(closest - value) ? candidate : closest
  );
}

import { getBrandContext } from "../brand/getBrandContext";

export type WeeklyPackRange = {
  // The campaign's real start date and inclusive day span — dayOffset in
  // each returned item is 0..(daySpan-1) from this start, not always the
  // default "next Monday, 0..4".
  start: Date;
  daySpan: number;
  // The exact day offsets (0..daySpan-1) the user picked in the day-by-day
  // selector — replaces an earlier blanket "skip weekends" toggle with real
  // per-day control: the user decides exactly which days get a post,
  // instead of an inferred pacing guess deciding it for them.
  selectedDayOffsets?: number[];
};

// null return = no restriction (every offset 0..daySpan-1 is valid).
function computeValidOffsets(range?: WeeklyPackRange): number[] | null {
  if (!range?.selectedDayOffsets || range.selectedDayOffsets.length === 0) return null;
  const unique = Array.from(new Set(range.selectedDayOffsets)).filter(
    (o) => Number.isInteger(o) && o >= 0 && o < range.daySpan
  );
  return unique.length > 0 ? unique.sort((a, b) => a - b) : null;
}

function resolveItemCount(range: WeeklyPackRange | undefined, validOffsets: number[] | null): number {
  if (!range) return DEFAULT_ITEM_COUNT;
  // The user picked exact days in the selector — one item per selected day,
  // not a pacing estimate layered on top of a choice they already made.
  if (validOffsets) return Math.max(1, Math.min(MAX_ITEM_COUNT, validOffsets.length));
  // No explicit day picks (the plain, non-campaign weekly flow) — roughly
  // one post every 2-3 days is a sane baseline cadence, floors at 3, ceils
  // at MAX_ITEM_COUNT.
  const estimate = Math.round((range.daySpan / 7) * 3);
  return Math.max(1, Math.min(MAX_ITEM_COUNT, Math.min(range.daySpan, Math.max(3, estimate))));
}

export type CampaignContext = { name: string; objective?: string | null; instructions?: string };

export async function generateWeeklyPack(
  brandId: string,
  platforms: LaunchPlatform[],
  range?: WeeklyPackRange,
  campaignContext?: CampaignContext,
  // MCP callers (no browser session) must pass an admin client — see
  // getBrandContext's comment for why this can't default to createClient().
  client?: Awaited<ReturnType<typeof createClient>>
): Promise<WeeklyPackItem[]> {
  if (platforms.length === 0) {
    throw new Error("En az bir platform seçilmeli.");
  }

  const validOffsets = computeValidOffsets(range);
  const itemCount = resolveItemCount(range, validOffsets);
  const daySpan = range?.daySpan ?? 5;
  const supabase = client ?? (await createClient());

  const [brandCtx, { data: recentContent }] = await Promise.all([
    getBrandContext(brandId, { client: supabase }),
    supabase
      .from("content")
      .select("title")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const brandContext =
    brandCtx.formattedText || "Marka kimliği henüz tanımlanmadı, genel ve profesyonel bir ton kullan.";

  const recentTitles = (recentContent ?? []).map((c) => c.title).filter(Boolean);

  const platformList = platforms.map((p) => PLATFORM_LABEL[p]).join(", ");
  const platformRules = platforms.map((p) => `- ${PLATFORM_RULE[p]}`).join("\n");

  const spanDescription = range
    ? `${daySpan} günlük bir kampanya dönemi (gün 0'dan gün ${daySpan - 1}'e kadar)`
    : `önümüzdeki hafta (Pazartesi'den Cuma'ya)`;

  const offsetRule = validOffsets
    ? `"day_offset" SADECE şu değerlerden biri olmalı (kullanıcının paylaşım yapılmasını istediği günler bunlar, listede olmayan bir gün asla kullanma): ${validOffsets.join(", ")}.`
    : `"day_offset": 0 ile ${daySpan - 1} arasında bir tam sayı — içeriği bu ${daySpan} günlük dönem içinde makul, dengeli bir şekilde yay (hepsini başa yığma).`;

  const campaignBlock = campaignContext
    ? `\nBU İÇERİK PAKETİ GENEL BİR HAFTALIK PAKET DEĞİL, ÖZEL BİR KAMPANYA İÇİN ÜRETİLİYOR:\nKampanya Adı: "${campaignContext.name}"${
        campaignContext.objective ? `\nKampanya Hedefi: ${campaignContext.objective}` : ""
      }${
        campaignContext.instructions
          ? `\nKullanıcının Bu Paket İçin Verdiği Özel Talimat: ${campaignContext.instructions}\nBu talimatı birebir dikkate al — içerik konuları, ürünler ve mesajlar bu talimata göre şekillenmeli.`
          : ""
      }\nÜreteceğin HER İÇERİK bu kampanyanın adına, hedefine${
        campaignContext.instructions ? " ve yukarıdaki özel talimata" : ""
      } doğrudan hizmet etmeli — genel marka içeriği üretme, her fikir bu kampanyayla açıkça ilişkili olmalı.\n`
    : "";

  const systemPrompt = `Sen Tentamark için çalışan kıdemli bir sosyal medya stratejisti ve yaratıcı içerik direktörüsün.
Görevin: Verilen Marka DNA'sı ve İçerik Stratejisi Sütunlarına tam olarak sadık kalarak, ${spanDescription} için tam olarak ${itemCount} FARKLI, yüksek etkileşimli içerik fikri üretmek.
${campaignBlock}
Her bir içerik için:
1. "title": Net, profesyonel içerik başlığı.
2. "pillar": Eşleştiği strateji içerik sütunu adı (markanın içerik stratejisindeki sütunlardan biri olmalı).
3. "hook": Sosyal medyada ilk 2 saniyede durduran dikkat çekici kanca cümle.
4. "visual_prompt": Gönderi için detaylı fotoğraf/video çekim konsepti veya görsel promptu (stüdyo, ışık, model, renkler, sahne tarifi, Türkçe).
5. ${offsetRule}
6. "captions": Seçilen platformlar (${platformList}) için özel olarak yazılmış, platform kurallarına uygun, doğal, etkileşimi artıran metin ve hashtag'ler.

Kurallar:
- Türkçe yaz, doğal, akıcı ve markanın ses tonuna uygun.
${platformRules}
- Klişe AI ifadelerinden ("merhaba arkadaşlar", "bugün sizlere...", "hey sen!") kesinlikle kaçın.
- Marka kimliğine, hedef kitlesine ve yasaklı kelimelerine %100 sadık kal.
- items dizisi içinde TAM OLARAK ${itemCount} adet nesne olmalı, day_offset değerleri birbirinden farklı olmalı. ${itemCount}'ten az veya fazla üretme.
- Son yayınlanan başlıklarla aynı konuyu tekrar etme: ${recentTitles.join(" || ") || "yok"}
${campaignContext ? `- Her içerik "${campaignContext.name}" kampanyasına açıkça bağlı olmalı, jenerik/marka-genel bir gönderi gibi durmamalı.` : ""}

Marka ve Strateji Bağlamı:
${brandContext}

SADECE ve SADECE şu JSON formatında yanıt ver, başka hiçbir metin veya markdown wrap (\`\`\`) ekleme:
${jsonShapeExample(platforms)}`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let modelUsed: string = MODEL;
  let items: WeeklyPackItem[] = [];

  try {
    const result = await callGroq(
      systemPrompt,
      `Lütfen ${brandCtx.brandName} markası için${
        campaignContext ? ` "${campaignContext.name}" kampanyasına özel olarak` : ""
      } ${spanDescription} kapsayan içerik paketini (items dizisinde TAM OLARAK ${itemCount} adet öğe olacak şekilde) yukarıdaki JSON şemasıyla üret.`,
      {
        temperature: 0.7,
        // Up to MAX_ITEM_COUNT items × every selected platform's caption is
        // a genuinely large JSON body — 4000 was cutting the reasoning
        // model off mid-output on anything but the smallest packs (see
        // groqModel.ts's reasoningEffort doc comment for why).
        maxTokens: 8000,
        reasoningEffort: "low",
      }
    );
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    modelUsed = result.model;
    items = parsePack(result.content, platforms, itemCount, validOffsets);
  } catch (err) {
    status = "ERROR";
    errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "weekly_pack",
    prompt_version: PROMPT_VERSION,
    model: modelUsed,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: estimateGroqCost(modelUsed, inputTokens, outputTokens),
    latency_ms: Date.now() - startedAt,
    status,
    error: errorMessage,
  });

  if (status === "ERROR") {
    throw new Error(errorMessage ?? "Haftalık paket üretilemedi.");
  }
  return items;
}

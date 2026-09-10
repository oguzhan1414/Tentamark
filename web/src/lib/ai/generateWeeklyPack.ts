"use server";

import { createClient } from "@/lib/supabase/server";
import { MODEL, callGroq } from "./groqModel";
import { PLATFORM_LABEL, PLATFORM_RULE, type LaunchPlatform } from "./platforms";

const PROMPT_VERSION = "weekly-pack-v1";
const ITEM_COUNT = 5;

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

function parsePack(raw: string, platforms: LaunchPlatform[]): WeeklyPackItem[] {
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

  // If model returns more than ITEM_COUNT (e.g. 7 or 9), slice the first 5 (Monday to Friday)
  if (rawItems.length > ITEM_COUNT) {
    rawItems = rawItems.slice(0, ITEM_COUNT);
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
    return {
      title,
      category: pillar,
      pillar,
      hook: String(item.hook ?? ""),
      visualPrompt: String(item.visual_prompt ?? item.visualPrompt ?? ""),
      dayOffset: Number.isInteger(item.day_offset) ? Number(item.day_offset) : index,
      captions,
    };
  });
}

import { getBrandContext } from "../brand/getBrandContext";

export async function generateWeeklyPack(
  brandId: string,
  platforms: LaunchPlatform[]
): Promise<WeeklyPackItem[]> {
  if (platforms.length === 0) {
    throw new Error("En az bir platform seçilmeli.");
  }

  const supabase = await createClient();

  const [brandCtx, { data: recentContent }] = await Promise.all([
    getBrandContext(brandId),
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

  const systemPrompt = `Sen Tentamark için çalışan kıdemli bir sosyal medya stratejisti ve yaratıcı içerik direktörüsün.
Görevin: Verilen Marka DNA'sı ve İçerik Stratejisi Sütunlarına tam olarak sadık kalarak, önümüzdeki hafta için (Pazartesi'den Cuma'ya) tam olarak ${ITEM_COUNT} FARKLI, yüksek etkileşimli içerik fikri üretmek.

Her bir içerik için:
1. "title": Net, profesyonel içerik başlığı.
2. "pillar": Eşleştiği strateji içerik sütunu adı (markanın içerik stratejisindeki sütunlardan biri olmalı).
3. "hook": Sosyal medyada ilk 2 saniyede durduran dikkat çekici kanca cümle.
4. "visual_prompt": Gönderi için detaylı fotoğraf/video çekim konsepti veya görsel promptu (stüdyo, ışık, model, renkler, sahne tarifi, Türkçe).
5. "day_offset": 0=Pazartesi, 1=Salı, 2=Çarşamba, 3=Perşembe, 4=Cuma.
6. "captions": Seçilen platformlar (${platformList}) için özel olarak yazılmış, platform kurallarına uygun, doğal, etkileşimi artıran metin ve hashtag'ler.

Kurallar:
- Türkçe yaz, doğal, akıcı ve markanın ses tonuna uygun.
${platformRules}
- Klişe AI ifadelerinden ("merhaba arkadaşlar", "bugün sizlere...", "hey sen!") kesinlikle kaçın.
- Marka kimliğine, hedef kitlesine ve yasaklı kelimelerine %100 sadık kal.
- items dizisi içinde TAM OLARAK 5 adet nesne olmalı (Pazartesi'den Cuma'ya day_offset 0..4). 5'ten az veya fazla üretme.
- Son yayınlanan başlıklarla aynı konuyu tekrar etme: ${recentTitles.join(" || ") || "yok"}

Marka ve Strateji Bağlamı:
${brandContext}

SADECE ve SADECE şu JSON formatında yanıt ver, başka hiçbir metin veya markdown wrap (\`\`\`) ekleme:
${jsonShapeExample(platforms)}`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let errorMessage: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let items: WeeklyPackItem[] = [];

  try {
    const result = await callGroq(
      systemPrompt,
      `Lütfen ${brandCtx.brandName} markası için bu haftanın 5 günlük içerik paketini (items dizisinde TAM OLARAK 5 adet öğe olacak şekilde) yukarıdaki JSON şemasıyla üret.`,
      {
        temperature: 0.7,
        maxTokens: 4000,
      }
    );
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    items = parsePack(result.content, platforms);
  } catch (err) {
    status = "ERROR";
    errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await supabase.from("ai_runs").insert({
    brand_id: brandId,
    stage: "weekly_pack",
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
    throw new Error(errorMessage ?? "Haftalık paket üretilemedi.");
  }
  return items;
}

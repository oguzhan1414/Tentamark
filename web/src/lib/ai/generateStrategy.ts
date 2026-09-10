"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MODEL, callGroq } from "./groqModel";
import { getBrandContext } from "../brand/getBrandContext";

const PROMPT_VERSION = "brand-strategy-v1";

export type ContentPillar = {
  name: string;
  percentage: number;
  description: string;
  examples: string[];
};

export type BrandStrategyPayload = {
  positioning: {
    core_message: string;
    target_audience_summary: string;
    value_proposition: string;
    differentiators: string[];
  };
  content_pillars: ContentPillar[];
  weekly_cadence: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
  };
  tone_guardrails: {
    dos: string[];
    donts: string[];
  };
};

export type BrandStrategyRecord = {
  id: string;
  version: number;
  payload: BrandStrategyPayload;
  generated_at: string;
};

export async function getLatestStrategy(brandId: string): Promise<BrandStrategyRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_strategy")
    .select("id, version, payload, generated_at")
    .eq("brand_id", brandId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    version: data.version,
    payload: data.payload as BrandStrategyPayload,
    generated_at: data.generated_at,
  };
}

export async function generateBrandStrategy(brandId: string): Promise<BrandStrategyRecord> {
  const brandCtx = await getBrandContext(brandId, { excludeStrategy: true });
  const supabase = await createClient();

  const systemPrompt = `Sen Tentamark AI için çalışan kıdemli bir sosyal medya stratejisti ve marka danışmanısın.
Görevin: Verilen Marka DNA'sını derinlemesine incelemek ve bu markanın sosyal medyada organik büyümesini, topluluk oluşturmasını ve satışa dönüşmesini sağlayacak profesyonel bir "İçerik Stratejisi" (Brand Strategy) oluşturmak.

Kurallar:
- Yanıtı SADECE ve SADECE geçerli bir JSON nesnesi olarak ver. Başında veya sonunda hiçbir açıklama veya markdown bloğu (backtick) ekleme.
- JSON şeması tam olarak şu yapıda olmalıdır:
{
  "positioning": {
    "core_message": "Markanın tek cümlelik en vurucu ana mesajı",
    "target_audience_summary": "Hedef kitlenin acı noktalarını ve arayışlarını özetleyen net cümle",
    "value_proposition": "Neden rakipler yerine bu marka tercih edilmeli?",
    "differentiators": ["Fark 1", "Fark 2", "Fark 3"]
  },
  "content_pillars": [
    {
      "name": "Sütun Başlığı (örn: Yerel Keşifler & Lezzet Rehberi)",
      "percentage": 35,
      "description": "Bu sütunun amacı ve hedef kitleye faydası",
      "examples": ["Format/Konu Örneği 1", "Format/Konu Örneği 2"]
    },
    {
      "name": "Tasarruf & Akıllı Harcama Taktikleri",
      "percentage": 25,
      "description": "...",
      "examples": ["..."]
    },
    {
      "name": "Topluluk & Gerçek Deneyimler",
      "percentage": 25,
      "description": "...",
      "examples": ["..."]
    },
    {
      "name": "Fırsatlar & Dijital Pass Ayrıcalıkları",
      "percentage": 15,
      "description": "...",
      "examples": ["..."]
    }
  ],
  "weekly_cadence": {
    "monday": "Pazartesi paylaşım odağı (örn: Haftalık Şehir İlhamı & Yeni Mekanlar)",
    "tuesday": "Salı paylaşım odağı (örn: Gizli Kalmış Lezzet Noktası / Carousel)",
    "wednesday": "Çarşamba paylaşım odağı (örn: Akıllı Gezgin Tüyosu & İndirim Hesabı)",
    "thursday": "Perşembe paylaşım odağı (örn: Kullanıcı Deneyimi / Reel & Vaka)",
    "friday": "Cuma paylaşım odağı (örn: Hafta Sonu Rotaları & Dijital Pass Fırsatı)"
  },
  "tone_guardrails": {
    "dos": ["Mutlaka yapılması gereken 3-4 kural"],
    "donts": ["Kesinlikle kaçınılması gereken 3-4 klişe/hata"]
  }
}

Notlar:
- content_pillars toplam yüzdesi tam olarak 100 olmalıdır (örn. 35 + 25 + 25 + 15).
- Markaya özgü ol; verilen marka adı, sektörü ve hedef kitlesine %100 sadık kal. Eski veya alakasız marka isimlerini asla karıştırma.`;

  const userPrompt = `Aşağıdaki Marka DNA'sını inceleyip yukarıdaki JSON formatında "${brandCtx.brandName}" markası için tamamen özgün ve sektöre özel bir İçerik Stratejisi üret:\n\n${brandCtx.formattedText}`;

  const startedAt = Date.now();
  let rawJson = "";
  try {
    const groqRes = await callGroq(systemPrompt, userPrompt);
    rawJson = groqRes.content;
    const latency = Date.now() - startedAt;

    // Clean any accidental markdown wrap
    const cleaned = rawJson
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const payload = JSON.parse(cleaned) as BrandStrategyPayload;

    const admin = createAdminClient();

    // Get current latest version to increment
    const { data: latest } = await admin
      .from("brand_strategy")
      .select("version")
      .eq("brand_id", brandId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latest?.version ?? 0) + 1;

    // Insert new strategy version
    const { data: inserted, error: insertError } = await admin
      .from("brand_strategy")
      .insert({
        brand_id: brandId,
        version: nextVersion,
        payload,
      })
      .select("id, version, payload, generated_at")
      .single();

    if (insertError || !inserted) {
      throw new Error(`Strateji kaydedilemedi: ${insertError?.message}`);
    }

    // Log to ai_runs table
    await admin.from("ai_runs").insert({
      brand_id: brandId,
      stage: "positioning_and_strategy",
      prompt_version: PROMPT_VERSION,
      model: MODEL,
      input_tokens: groqRes.inputTokens,
      output_tokens: groqRes.outputTokens,
      latency_ms: latency,
      status: "SUCCESS",
    });

    return {
      id: inserted.id,
      version: inserted.version,
      payload: inserted.payload as BrandStrategyPayload,
      generated_at: inserted.generated_at,
    };
  } catch (err) {
    // Log failure to ai_runs table
    await supabase.from("ai_runs").insert({
      brand_id: brandId,
      stage: "positioning_and_strategy",
      prompt_version: PROMPT_VERSION,
      model: MODEL,
      status: "FAILED",
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

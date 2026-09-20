"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MODEL, callGroq, estimateGroqCost } from "./groqModel";
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

export type InputSnapshot = {
  industry: string;
  tone_of_voice: string;
  brand_traits: string[];
  target_audience: string[];
  competitors: string[];
};

export type PillarDiff = {
  name: string;
  oldPercentage: number | null; // null = new pillar, didn't exist before
  newPercentage: number | null; // null = removed pillar, doesn't exist now
};

export type ChangeNotes = {
  changedInputs: string[];
  pillarDiffs: PillarDiff[];
  isManualRevert?: boolean;
  revertedToVersion?: number;
};

export type BrandStrategyRecord = {
  id: string;
  version: number;
  payload: BrandStrategyPayload;
  changeNotes: ChangeNotes;
  generated_at: string;
};

export type StrategyVersionSummary = {
  id: string;
  version: number;
  generated_at: string;
  changeNotes: ChangeNotes;
};

function parseChangeNotes(raw: unknown): ChangeNotes {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const changedInputs = Array.isArray(obj.changed_inputs) ? obj.changed_inputs.map(String) : [];
  const pillarDiffsRaw = Array.isArray(obj.pillar_diffs) ? obj.pillar_diffs : [];
  const pillarDiffs: PillarDiff[] = pillarDiffsRaw.map((d) => {
    const item = (d && typeof d === "object" ? d : {}) as Record<string, unknown>;
    return {
      name: String(item.name ?? ""),
      oldPercentage: item.old_percentage === null || item.old_percentage === undefined ? null : Number(item.old_percentage),
      newPercentage: item.new_percentage === null || item.new_percentage === undefined ? null : Number(item.new_percentage),
    };
  });
  return {
    changedInputs,
    pillarDiffs,
    isManualRevert: Boolean(obj.is_manual_revert),
    revertedToVersion: typeof obj.reverted_to_version === "number" ? obj.reverted_to_version : undefined,
  };
}

function computePillarDiffs(oldPillars: ContentPillar[], newPillars: ContentPillar[]): PillarDiff[] {
  const oldMap = new Map(oldPillars.map((p) => [p.name, p.percentage]));
  const newMap = new Map(newPillars.map((p) => [p.name, p.percentage]));
  const names = new Set([...oldMap.keys(), ...newMap.keys()]);
  const diffs: PillarDiff[] = [];
  for (const name of names) {
    const oldPct = oldMap.has(name) ? oldMap.get(name)! : null;
    const newPct = newMap.has(name) ? newMap.get(name)! : null;
    if (oldPct !== newPct) {
      diffs.push({ name, oldPercentage: oldPct, newPercentage: newPct });
    }
  }
  return diffs;
}

function computeChangedInputs(prev: InputSnapshot | null, current: InputSnapshot): string[] {
  if (!prev) return ["İlk strateji — karşılaştırılacak önceki versiyon yok"];
  const changes: string[] = [];
  if (prev.industry !== current.industry) changes.push("Sektör bilgisi güncellendi");
  if (prev.tone_of_voice !== current.tone_of_voice) changes.push("Ses tonu güncellendi");
  if (JSON.stringify(prev.brand_traits) !== JSON.stringify(current.brand_traits)) {
    changes.push("Marka nitelikleri güncellendi");
  }
  if (JSON.stringify(prev.target_audience) !== JSON.stringify(current.target_audience)) {
    changes.push("Hedef kitle güncellendi");
  }
  if (JSON.stringify(prev.competitors) !== JSON.stringify(current.competitors)) {
    changes.push("Rakip listesi güncellendi");
  }
  if (changes.length === 0) changes.push("Girdilerde değişiklik yok — manuel olarak yeniden üretildi");
  return changes;
}

export async function getLatestStrategy(
  brandId: string,
  client?: Awaited<ReturnType<typeof createClient>>
): Promise<BrandStrategyRecord | null> {
  const supabase = client ?? (await createClient());
  const { data } = await supabase
    .from("brand_strategy")
    .select("id, version, payload, change_notes, generated_at")
    .eq("brand_id", brandId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    version: data.version,
    payload: data.payload as BrandStrategyPayload,
    changeNotes: parseChangeNotes(data.change_notes),
    generated_at: data.generated_at,
  };
}

export async function listStrategyVersions(brandId: string): Promise<StrategyVersionSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_strategy")
    .select("id, version, change_notes, generated_at")
    .eq("brand_id", brandId)
    .order("version", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => ({
    id: row.id,
    version: row.version,
    generated_at: row.generated_at,
    changeNotes: parseChangeNotes(row.change_notes),
  }));
}

export async function generateBrandStrategy(brandId: string): Promise<BrandStrategyRecord> {
  const brandCtx = await getBrandContext(brandId, { excludeStrategy: true });
  const supabase = await createClient();

  const currentSnapshot: InputSnapshot = {
    industry: brandCtx.industry,
    tone_of_voice: brandCtx.toneOfVoice,
    brand_traits: brandCtx.brandTraits,
    target_audience: brandCtx.targetAudience,
    competitors: brandCtx.competitors,
  };

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

    // Get previous version to increment from AND diff against
    const { data: previous } = await admin
      .from("brand_strategy")
      .select("version, payload, input_snapshot")
      .eq("brand_id", brandId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (previous?.version ?? 0) + 1;
    const previousSnapshot = previous?.input_snapshot && Object.keys(previous.input_snapshot).length > 0
      ? (previous.input_snapshot as InputSnapshot)
      : null;
    const changeNotes: ChangeNotes = {
      changedInputs: computeChangedInputs(previousSnapshot, currentSnapshot),
      pillarDiffs: previous?.payload
        ? computePillarDiffs((previous.payload as BrandStrategyPayload).content_pillars ?? [], payload.content_pillars ?? [])
        : [],
    };

    // Insert new strategy version
    const { data: inserted, error: insertError } = await admin
      .from("brand_strategy")
      .insert({
        brand_id: brandId,
        version: nextVersion,
        payload,
        input_snapshot: currentSnapshot,
        change_notes: {
          changed_inputs: changeNotes.changedInputs,
          pillar_diffs: changeNotes.pillarDiffs.map((d) => ({
            name: d.name,
            old_percentage: d.oldPercentage,
            new_percentage: d.newPercentage,
          })),
        },
      })
      .select("id, version, payload, change_notes, generated_at")
      .single();

    if (insertError || !inserted) {
      throw new Error(`Strateji kaydedilemedi: ${insertError?.message}`);
    }

    // Log to ai_runs table
    await admin.from("ai_runs").insert({
      brand_id: brandId,
      stage: "positioning_and_strategy",
      prompt_version: PROMPT_VERSION,
      model: groqRes.model,
      input_tokens: groqRes.inputTokens,
      output_tokens: groqRes.outputTokens,
      cost_estimate_usd: estimateGroqCost(groqRes.model, groqRes.inputTokens, groqRes.outputTokens),
      latency_ms: latency,
      status: "SUCCESS",
    });

    return {
      id: inserted.id,
      version: inserted.version,
      payload: inserted.payload as BrandStrategyPayload,
      changeNotes: parseChangeNotes(inserted.change_notes),
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

// "Reddet" in spirit: not a draft/approval queue (strategies apply
// immediately, same as before), but a real, honest way back — copies an
// older version's payload forward as a new version, so history stays intact
// and nothing is silently overwritten.
export async function revertToStrategyVersion(brandId: string, targetVersion: number): Promise<BrandStrategyRecord> {
  const admin = createAdminClient();

  const { data: target, error: targetError } = await admin
    .from("brand_strategy")
    .select("version, payload, input_snapshot")
    .eq("brand_id", brandId)
    .eq("version", targetVersion)
    .maybeSingle();

  if (targetError || !target) {
    throw new Error("Geri dönülecek versiyon bulunamadı.");
  }

  const { data: latest } = await admin
    .from("brand_strategy")
    .select("version")
    .eq("brand_id", brandId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version ?? 0) + 1;

  const { data: inserted, error: insertError } = await admin
    .from("brand_strategy")
    .insert({
      brand_id: brandId,
      version: nextVersion,
      payload: target.payload,
      input_snapshot: target.input_snapshot,
      change_notes: {
        changed_inputs: [`v${targetVersion}'a manuel olarak geri dönüldü`],
        pillar_diffs: [],
        is_manual_revert: true,
        reverted_to_version: targetVersion,
      },
    })
    .select("id, version, payload, change_notes, generated_at")
    .single();

  if (insertError || !inserted) {
    throw new Error(`Geri dönülemedi: ${insertError?.message}`);
  }

  return {
    id: inserted.id,
    version: inserted.version,
    payload: inserted.payload as BrandStrategyPayload,
    changeNotes: parseChangeNotes(inserted.change_notes),
    generated_at: inserted.generated_at,
  };
}

import { createClient } from "@/lib/supabase/server";
import { TRAIT_KEYS, describeTone, type TraitKey, type TraitScores, type TonePosition } from "./traits";

const TRAIT_LABELS: Record<TraitKey, string> = {
  samimi: "Samimi",
  profesyonel: "Profesyonel",
  teknolojik: "Teknolojik",
  enerjik: "Enerjik",
  destekleyici: "Destekleyici",
  luks: "Lüks",
};

function parseTraitScores(raw: unknown): TraitScores | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const result = {} as TraitScores;
  let any = false;
  for (const key of TRAIT_KEYS) {
    const n = Number(obj[key]);
    if (Number.isFinite(n)) {
      result[key] = Math.max(0, Math.min(100, Math.round(n)));
      any = true;
    } else {
      result[key] = 50;
    }
  }
  return any ? result : null;
}

function parseTonePosition(raw: unknown): TonePosition | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const x = Number(obj.x);
  const y = Number(obj.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

export type BrandContext = {
  brandName: string;
  website: string | null;
  industry: string;
  toneOfVoice: string;
  brandTraits: string[];
  targetAudience: string[];
  forbiddenWords: string[];
  colorPalette: string[];
  competitors: string[];
  rawNotes: string | null;
  strategy?: Record<string, unknown> | null;
  founderName: string | null;
  founderVoice: string | null;
  formattedText: string;
};

export async function getBrandContext(
  brandId: string,
  options?: { excludeStrategy?: boolean }
): Promise<BrandContext> {
  const supabase = await createClient();

  const [{ data: brandRow }, { data: dnaRow }, { data: strategyRow }] = await Promise.all([
    supabase.from("brands").select("name, website").eq("id", brandId).maybeSingle(),
    supabase
      .from("brand_dna")
      .select(
        "industry, tone_of_voice, brand_traits, forbidden_words, color_palette, target_audience, competitors, raw_notes, trait_scores, tone_position, founder_name, founder_voice"
      )
      .eq("brand_id", brandId)
      .maybeSingle(),
    supabase
      .from("brand_strategy")
      .select("version, payload")
      .eq("brand_id", brandId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const brandName = brandRow?.name ?? "Marka";
  const website = brandRow?.website ?? null;
  const industry = dnaRow?.industry || "Teknoloji / Dijital";
  const toneOfVoice = dnaRow?.tone_of_voice || "Doğal, samimi, profesyonel ve güven veren";
  const brandTraits = Array.isArray(dnaRow?.brand_traits) ? dnaRow.brand_traits.map(String) : [];
  const targetAudience = Array.isArray(dnaRow?.target_audience) ? dnaRow.target_audience.map(String) : [];
  const forbiddenWords = Array.isArray(dnaRow?.forbidden_words) ? dnaRow.forbidden_words.map(String) : [];
  const colorPalette = Array.isArray(dnaRow?.color_palette) ? dnaRow.color_palette.map(String) : [];
  const competitors = Array.isArray(dnaRow?.competitors) ? dnaRow.competitors.map(String) : [];
  const rawNotes = dnaRow?.raw_notes || null;
  const strategy = (strategyRow?.payload as Record<string, unknown>) ?? null;

  // trait_scores (0-100 character sliders) and tone_position (drag-quadrant)
  // used to be saved but never read by any AI generation function — wired in
  // here so every one of getBrandContext's 6 consumers actually reflects them.
  const traitScores = parseTraitScores(dnaRow?.trait_scores);
  const tonePosition = parseTonePosition(dnaRow?.tone_position);

  // Build a concise, rich system prompt fragment
  const lines: string[] = [
    `Marka Adı: ${brandName}`,
    website ? `Web Sitesi: ${website}` : "",
    `Sektör: ${industry}`,
    `Ses Tonu: ${toneOfVoice}`,
    tonePosition ? `Ses Tonu Konumu: ${describeTone(tonePosition)}` : "",
    traitScores
      ? `Marka Karakter Dengesi (0-100): ${TRAIT_KEYS.map((k) => `${TRAIT_LABELS[k]} ${traitScores[k]}`).join(", ")}`
      : "",
    brandTraits.length ? `Marka Nitelikleri: ${brandTraits.join(", ")}` : "",
    targetAudience.length ? `Hedef Kitle: ${targetAudience.join(", ")}` : "",
    forbiddenWords.length ? `YASAKLI KELİMELER / KAÇINILACAKLAR: ${forbiddenWords.join(", ")}` : "",
    colorPalette.length ? `Marka Renk Paleti: ${colorPalette.join(", ")}` : "",
    competitors.length ? `Rakipler: ${competitors.join(", ")}` : "",
    rawNotes ? `Özel Notlar: ${rawNotes}` : "",
  ].filter(Boolean);

  if (strategy && !options?.excludeStrategy) {
    const pillars = strategy.content_pillars as Array<{ name: string; percentage: number }> | undefined;
    if (Array.isArray(pillars) && pillars.length) {
      lines.push(
        `İçerik Stratejisi Sütunları: ${pillars.map((p) => `${p.name} (%${p.percentage})`).join(", ")}`
      );
    }
    const cadence = strategy.weekly_cadence as Record<string, string> | undefined;
    if (cadence) {
      lines.push(`Haftalık Ritim: ${JSON.stringify(cadence)}`);
    }
    const guardrails = strategy.tone_guardrails as { dos?: string[]; donts?: string[] } | undefined;
    if (guardrails?.dos?.length) {
      lines.push(`Marka Sesi — Yapılacaklar: ${guardrails.dos.join(", ")}`);
    }
    if (guardrails?.donts?.length) {
      lines.push(`Marka Sesi — KAÇINILACAKLAR: ${guardrails.donts.join(", ")}`);
    }
  }

  return {
    brandName,
    website,
    industry,
    toneOfVoice,
    brandTraits,
    targetAudience,
    forbiddenWords,
    colorPalette,
    competitors,
    rawNotes,
    strategy,
    // Not folded into formattedText/lines on purpose — the founder's voice
    // only matters when a caller explicitly asks to write as the founder
    // (see generateDrafts' voiceMode). Every other consumer of this context
    // (image prompts, hook analysis, the assistant chat...) should keep
    // reading the brand's own voice, not silently pick up a person's.
    founderName: (dnaRow?.founder_name as string | null) ?? null,
    founderVoice: (dnaRow?.founder_voice as string | null) ?? null,
    formattedText: lines.join("\n"),
  };
}

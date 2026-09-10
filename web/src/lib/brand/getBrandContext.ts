import { createClient } from "@/lib/supabase/server";

export type BrandContext = {
  brandName: string;
  website: string | null;
  industry: string;
  toneOfVoice: string;
  brandTraits: string[];
  targetAudience: string[];
  forbiddenWords: string[];
  competitors: string[];
  rawNotes: string | null;
  strategy?: Record<string, unknown> | null;
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
      .select("industry, tone_of_voice, brand_traits, forbidden_words, target_audience, competitors, raw_notes")
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
  const competitors = Array.isArray(dnaRow?.competitors) ? dnaRow.competitors.map(String) : [];
  const rawNotes = dnaRow?.raw_notes || null;
  const strategy = (strategyRow?.payload as Record<string, unknown>) ?? null;

  // Build a concise, rich system prompt fragment
  const lines: string[] = [
    `Marka Adı: ${brandName}`,
    website ? `Web Sitesi: ${website}` : "",
    `Sektör: ${industry}`,
    `Ses Tonu: ${toneOfVoice}`,
    brandTraits.length ? `Marka Nitelikleri: ${brandTraits.join(", ")}` : "",
    targetAudience.length ? `Hedef Kitle: ${targetAudience.join(", ")}` : "",
    forbiddenWords.length ? `YASAKLI KELİMELER / KAÇINILACAKLAR: ${forbiddenWords.join(", ")}` : "",
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
  }

  return {
    brandName,
    website,
    industry,
    toneOfVoice,
    brandTraits,
    targetAudience,
    forbiddenWords,
    competitors,
    rawNotes,
    strategy,
    formattedText: lines.join("\n"),
  };
}

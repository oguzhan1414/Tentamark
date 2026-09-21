import { createAdminClient } from "@/lib/supabase/admin";
import { getBrandContext } from "@/lib/brand/getBrandContext";
import { callGroq, MODEL, estimateGroqCost } from "@/lib/ai/groqModel";
import { planScenes, type SceneSlot } from "./scenePlan";
import type { ScenePlanItem, VideoFormat, VideoDuration, VideoInputProps } from "./types";

type AdminClient = ReturnType<typeof createAdminClient>;

type VideoRenderJobRow = {
  id: string;
  brand_id: string;
  format: VideoFormat;
  duration_seconds: VideoDuration;
  source_type: "existing_content" | "custom_topic";
  source_content_id: string | null;
  topic: string | null;
  selected_media_ids: string[];
};

type MediaRow = { id: string; file_url: string; file_type: string };
type ResolvedSource = { text: string; imageUrls: string[] };

function onlyImages(ids: string[], rows: MediaRow[] | null): string[] {
  return ids
    .map((id) => rows?.find((m) => m.id === id))
    .filter((m): m is MediaRow => Boolean(m && m.file_type.startsWith("image/")))
    .map((m) => m.file_url);
}

async function resolveSource(job: VideoRenderJobRow, admin: AdminClient): Promise<ResolvedSource> {
  if (job.source_type === "existing_content") {
    const { data: content, error } = await admin
      .from("content")
      .select("title, core_idea, content_platforms(caption)")
      .eq("id", job.source_content_id as string)
      .maybeSingle();
    if (error || !content) throw new Error("Kaynak içerik bulunamadı.");

    const { data: mediaLinks } = await admin
      .from("content_media")
      .select("media_id, position")
      .eq("content_id", job.source_content_id as string)
      .order("position", { ascending: true });
    const mediaIds = (mediaLinks ?? []).map((m) => m.media_id as string);
    const { data: mediaRows } =
      mediaIds.length > 0 ? await admin.from("media").select("id, file_url, file_type").in("id", mediaIds) : { data: [] as MediaRow[] };

    const platforms = content.content_platforms as { caption: string }[] | null;
    const text = (platforms && platforms.length > 0 ? platforms[0].caption : null) || content.core_idea || content.title;
    return { text, imageUrls: onlyImages(mediaIds, mediaRows as MediaRow[] | null) };
  }

  const mediaIds = job.selected_media_ids;
  const { data: mediaRows } =
    mediaIds.length > 0 ? await admin.from("media").select("id, file_url, file_type").in("id", mediaIds) : { data: [] as MediaRow[] };
  return { text: job.topic ?? "", imageUrls: onlyImages(mediaIds, mediaRows as MediaRow[] | null) };
}

function slotCopyInstruction(slot: SceneSlot, index: number): string {
  switch (slot.archetype) {
    case "hook":
      return `${index}: "hook" -> {"lines": ["kısa çarpıcı cümle", "vurgulu kapanış cümlesi"], "highlightWord": "ikinci satırdaki en vurucu tek kelime"} (tam 2 satır, her biri en fazla 5-6 kelime)`;
    case "feature":
      return `${index}: "feature" -> {"eyebrow": "01", "title": "en fazla 4 kelimelik başlık", "description": "tek cümlelik açıklama", "badges": ["2 kelimelik avantaj 1", "2 kelimelik avantaj 2"] (kart üstünde yüzecek rozetler, örn: '⚡ Hızlı Teslimat', '★ %100 Doğal')}`;
    case "stat":
      return `${index}: "stat" -> {"headline": "en fazla 4 kelimelik büyük sayı veya oran vurgusu (örn: '%100 Orijinal', '10.000+ Mutlu Müşteri', '3 Kat Hızlı')", "supporting": "tek cümlelik destek metni"}`;
    case "carousel":
      return `${index}: "carousel" -> {"caption": "tek kısa cümlelik altyazı"}`;
    case "outro":
      return `${index}: "outro" -> {"tagline": "kısa marka kapanış cümlesi, örn. 'Fark yaratmaya hemen başla.'", "ctaLabel": "2-3 kelimelik harekete geçirici çağrı, örn. 'Hemen Keşfet'"}`;
  }
}

async function generateSceneCopy(
  slots: SceneSlot[],
  source: ResolvedSource,
  brandId: string,
  brandContextText: string,
  brandName: string,
  admin: AdminClient
): Promise<Record<string, Record<string, unknown>>> {
  const systemPrompt = `Sen ${brandName} markası için 10-20 saniyelik kısa bir tanıtım videosunun metnini yazan bir reklam metin yazarısın.

Marka bağlamı: ${brandContextText}

Aşağıdaki her sahne için tam olarak istenen JSON alanlarını üret. Türkçe, doğal, klişe AI ifadelerinden uzak, kısa ve çarpıcı yaz. Video kısa olduğu için her metin de kısa olmalı.

ÖNEMLİ: Hiçbir alanı boş string ("") veya null bırakma — her sahne, özellikle SON sahne (kapanış), video kadar özenli ve dolu olmalı. Son sahneyi asla eksik/yarım bırakma.
${slots.map(slotCopyInstruction).join("\n")}

Sadece şu JSON formatında yanıt ver: {"0": {...}, "1": {...}, ...} — anahtarlar yukarıdaki sahne index'leri. Her sahnenin TÜM alanları gerçek, anlamlı metinle dolu olmalı.`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let error: string | null = null;
  let model = MODEL;
  let inputTokens = 0;
  let outputTokens = 0;
  let parsed: Record<string, Record<string, unknown>> = {};

  try {
    const result = await callGroq(systemPrompt, source.text || `${brandName} için kısa bir tanıtım videosu yaz.`);
    model = result.model;
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    parsed = JSON.parse(result.content);
  } catch (err) {
    status = "ERROR";
    error = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await admin.from("ai_runs").insert({
    brand_id: brandId,
    stage: "video_scene_copy",
    prompt_version: "video-v1",
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: estimateGroqCost(model, inputTokens, outputTokens),
    latency_ms: Date.now() - startedAt,
    status,
    error,
  });

  return parsed;
}

/*
  Resolves everything a Remotion render needs for one video_render_jobs row:
  brand voice/colors/logo, the source content's text+images (or a custom
  topic+picked media), the scene STRUCTURE (planScenes — no brand data
  involved there), and per-scene copy from one Groq call shaped to match
  that exact structure. Falls back to plain source text if the Groq call
  fails, rather than failing the whole render over a copy-generation error.
*/
export async function buildVideoInputProps(jobId: string, admin: AdminClient): Promise<VideoInputProps> {
  const { data: job, error: jobError } = await admin.from("video_render_jobs").select("*").eq("id", jobId).single();
  if (jobError || !job) throw new Error("Video render job bulunamadı.");

  const [brandContext, brandRow, source] = await Promise.all([
    getBrandContext(job.brand_id, { client: admin }),
    admin.from("brands").select("logo_url").eq("id", job.brand_id).single(),
    resolveSource(job as VideoRenderJobRow, admin),
  ]);

  const slots = planScenes({
    durationSeconds: job.duration_seconds,
    imageCount: source.imageUrls.length,
    seed: job.id,
  });

  const copyBySlot = await generateSceneCopy(slots, source, job.brand_id, brandContext.formattedText, brandContext.brandName, admin);

  // The model complying with the JSON schema doesn't guarantee it filled
  // every field with real content — seen live: a well-written hook next to
  // an outro with tagline:"" — so every field goes through this instead of
  // a bare typeof check, which would happily accept an empty string.
  function nonEmpty(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim().length > 0 ? value : fallback;
  }

  let imageCursor = 0;
  const scenePlan: ScenePlanItem[] = slots.map((slot, index): ScenePlanItem => {
    const copy = copyBySlot[String(index)] ?? {};
    switch (slot.archetype) {
      case "hook": {
        const lines = Array.isArray(copy.lines) ? copy.lines.map(String).filter((l) => l.trim().length > 0) : [];
        const highlightWord = typeof copy.highlightWord === "string" && copy.highlightWord.trim().length > 0 ? copy.highlightWord.trim() : undefined;
        return {
          archetype: "hook",
          frames: slot.frames,
          lines: lines.length > 0 ? lines : [source.text.slice(0, 40) || brandContext.brandName],
          highlightWord,
        };
      }
      case "feature": {
        const imageUrl = source.imageUrls[imageCursor % Math.max(source.imageUrls.length, 1)] ?? "";
        imageCursor += 1;
        const badges = Array.isArray(copy.badges) && copy.badges.length > 0
          ? copy.badges.map(String).filter((b) => b.trim().length > 0).slice(0, 2)
          : ["⚡ Premium", "✓ Güvenilir"];
        return {
          archetype: "feature",
          frames: slot.frames,
          reverse: slot.reverse,
          eyebrow: nonEmpty(copy.eyebrow, "01"),
          title: nonEmpty(copy.title, brandContext.brandName),
          description: nonEmpty(copy.description, source.text.slice(0, 120) || brandContext.formattedText.slice(0, 120)),
          imageUrl,
          badges,
        };
      }
      case "stat":
        return {
          archetype: "stat",
          frames: slot.frames,
          headline: nonEmpty(copy.headline, brandContext.brandName),
          supporting: nonEmpty(copy.supporting, source.text.slice(0, 80)),
        };
      case "carousel":
        return {
          archetype: "carousel",
          frames: slot.frames,
          imageUrls: source.imageUrls.slice(0, 4),
          caption: nonEmpty(copy.caption, source.text.slice(0, 80)),
        };
      case "outro":
        return {
          archetype: "outro",
          frames: slot.frames,
          brandName: brandContext.brandName,
          logoUrl: brandRow.data?.logo_url ?? null,
          tagline: nonEmpty(copy.tagline, `${brandContext.brandName} ile fark yaratın.`),
          ctaLabel: nonEmpty(copy.ctaLabel, "Hemen Keşfet"),
        };
    }
  });

  return {
    format: job.format,
    durationSeconds: job.duration_seconds,
    fps: 30,
    accentColors: brandContext.colorPalette,
    brandName: brandContext.brandName,
    scenePlan,
  };
}

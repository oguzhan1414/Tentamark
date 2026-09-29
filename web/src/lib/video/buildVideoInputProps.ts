import { createAdminClient } from "@/lib/supabase/admin";
import { getBrandContext } from "@/lib/brand/getBrandContext";
import { callGroq, MODEL, estimateGroqCost } from "@/lib/ai/groqModel";
import { planScenes, getRenderedDurationInFrames, rescaleSlotsToDuration, type SceneSlot, type VideoRecipeId } from "./scenePlan";
import { scrapeProductUrl } from "./scrapeProductUrl";
import { ingestRemoteImage } from "@/lib/media/ingestRemoteImage";
import { estimateFocalOffset } from "@/lib/media/focalPoint";
import { generateVoiceover } from "./generateVoiceover";
import { updateSceneCopy } from "./scenePlanEditor";
import { OPENAI_TTS_VOICES, type OpenAIVoice, type ScenePlanItem, type VideoFormat, type VideoDuration, type VideoInputProps, type VideoMusicTrack } from "./types";
import type { Caption } from "@remotion/captions";

const FPS = 30;

type AdminClient = ReturnType<typeof createAdminClient>;

type VideoRenderJobRow = {
  id: string;
  brand_id: string;
  format: VideoFormat;
  duration_seconds: VideoDuration;
  source_type: "existing_content" | "custom_topic" | "product_url" | "user_upload";
  source_content_id: string | null;
  topic: string | null;
  product_url: string | null;
  source_media_id: string | null;
  selected_media_ids: string[];
  scene_plan: unknown;
};

type MediaRow = { id: string; file_url: string; file_type: string };
type ResolvedProduct = {
  title: string;
  price: string | null;
  description: string;
  review: { quote: string; author: string; rating: number } | null;
};
type ResolvedSource = {
  text: string;
  imageUrls: string[];
  product?: ResolvedProduct;
  userClip?: {
    videoUrl: string;
    trimBeforeFrames: number;
    trimAfterFrames: number;
    objectPositionX: string;
    objectPositionY: string;
  };
};

type VideoRenderSettings = {
  recipeId: VideoRecipeId | "auto";
  videoBackgroundUrl?: string;
  musicTrack: VideoMusicTrack;
  trimStartSeconds?: number;
  trimEndSeconds?: number;
  voiceoverScript?: string;
  voiceoverVoice?: OpenAIVoice;
};

// The draft's resolved plan — everything AI-costly (scene copy, voice-over +
// transcription) already ran once here. prepareVideoDraft.ts writes this
// into video_render_jobs.scene_plan (alongside `settings`) and flips
// status to 'draft'; the storyboard editor then edits `scenes` in place
// (drag/reorder/delete/duplicate/duration/text/media, or a single-scene AI
// regen via regenerateSceneCopy below) with ZERO further AI calls needed
// until the user explicitly asks to regenerate one scene. `resolvedSourceText`/
// `resolvedProduct` are cached specifically so a single-scene regen never
// needs to re-scrape a product_url or re-resolve anything — see
// regenerateSceneCopy().
export type DraftScenePlan = {
  recipeId: VideoRecipeId;
  scenes: ScenePlanItem[];
  voiceoverAudio?: string;
  captions?: Caption[];
  resolvedSourceText: string;
  resolvedProduct?: ResolvedProduct;
};

export function readRenderSettings(value: unknown): VideoRenderSettings {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>).settings : null;
  const settings = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const recipeId = ["auto", "quick_promo", "product_spotlight", "content_story", "user_clip_reel"].includes(String(settings.recipeId))
    ? (String(settings.recipeId) as VideoRecipeId | "auto")
    : "auto";
  const videoBackgroundUrl = typeof settings.videoBackgroundUrl === "string" && settings.videoBackgroundUrl.trim()
    ? settings.videoBackgroundUrl.trim()
    : undefined;
  const trimStartSeconds = typeof settings.trimStartSeconds === "number" && settings.trimStartSeconds >= 0
    ? settings.trimStartSeconds
    : undefined;
  const trimEndSeconds = typeof settings.trimEndSeconds === "number" && settings.trimEndSeconds > 0
    ? settings.trimEndSeconds
    : undefined;
  const voiceoverScript = typeof settings.voiceoverScript === "string" && settings.voiceoverScript.trim()
    ? settings.voiceoverScript.trim().slice(0, 1000) // defensive re-cap even though the API route already validates
    : undefined;
  const voiceoverVoice = (OPENAI_TTS_VOICES as readonly string[]).includes(String(settings.voiceoverVoice))
    ? (settings.voiceoverVoice as OpenAIVoice)
    : "alloy";
  return {
    recipeId,
    videoBackgroundUrl,
    musicTrack: settings.musicTrack === "none" ? "none" : "lofi",
    trimStartSeconds,
    trimEndSeconds,
    voiceoverScript,
    voiceoverVoice,
  };
}

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
      .eq("brand_id", job.brand_id)
      .maybeSingle();
    if (error || !content) throw new Error("Kaynak içerik bulunamadı.");

    const { data: mediaLinks } = await admin
      .from("content_media")
      .select("media_id, position")
      .eq("content_id", job.source_content_id as string)
      .order("position", { ascending: true });
    const mediaIds = (mediaLinks ?? []).map((m) => m.media_id as string);
    const { data: mediaRows } =
      mediaIds.length > 0
        ? await admin.from("media").select("id, file_url, file_type").eq("brand_id", job.brand_id).in("id", mediaIds)
        : { data: [] as MediaRow[] };

    const platforms = content.content_platforms as { caption: string }[] | null;
    const text = (platforms && platforms.length > 0 ? platforms[0].caption : null) || content.core_idea || content.title;
    return { text, imageUrls: onlyImages(mediaIds, mediaRows as MediaRow[] | null) };
  }

  if (job.source_type === "product_url") {
    const product = await scrapeProductUrl(job.product_url as string);

    // Re-host every scraped image into the brand's own media library before
    // handing URLs to Remotion — a live product CDN can rate-limit, expire,
    // or just be slow, none of which a render (or a later re-render of the
    // same job) should depend on. Best-effort per image; a couple of failed
    // ingests still leaves a usable video.
    const ingested = await Promise.all(product.imageUrls.map((url) => ingestRemoteImage(url, job.brand_id, admin)));
    const imageUrls = ingested.filter((m) => m !== null).map((m) => m.file_url);

    const text = [product.title, product.price ? `Fiyat: ${product.price}` : "", product.description]
      .filter(Boolean)
      .join("\n\n");
    return {
      text,
      imageUrls,
      product: {
        title: product.title,
        price: product.price,
        description: product.description,
        review: product.review,
      },
    };
  }

  if (job.source_type === "user_upload") {
    const { data: mediaRow, error: mediaError } = await admin
      .from("media")
      .select("file_url, poster_url, duration_seconds")
      .eq("id", job.source_media_id as string)
      .eq("brand_id", job.brand_id)
      .maybeSingle();
    if (mediaError || !mediaRow) throw new Error("Yüklenen video bulunamadı.");

    const settings = readRenderSettings(job.scene_plan);
    const clipDurationSeconds = mediaRow.duration_seconds ?? job.duration_seconds;
    const trimStart = Math.max(0, settings.trimStartSeconds ?? 0);
    const trimEnd = Math.min(settings.trimEndSeconds ?? clipDurationSeconds, clipDurationSeconds);

    // Best-effort smart focal point off the poster frame generated at
    // upload time (see videoUploadMeta.ts) — falls back to a centered crop
    // if the poster is missing or unreachable, never blocks the render.
    let objectPositionX = "50%";
    let objectPositionY = "50%";
    if (mediaRow.poster_url) {
      try {
        const posterRes = await fetch(mediaRow.poster_url);
        const posterBuffer = Buffer.from(await posterRes.arrayBuffer());
        const targetAspect = job.format === "vertical" ? 9 / 16 : 16 / 9;
        const focal = await estimateFocalOffset(posterBuffer, targetAspect);
        objectPositionX = focal.objectPositionX;
        objectPositionY = focal.objectPositionY;
      } catch {
        // centered fallback above
      }
    }

    return {
      text: job.topic ?? "",
      imageUrls: [],
      userClip: {
        videoUrl: mediaRow.file_url,
        trimBeforeFrames: Math.round(trimStart * FPS),
        trimAfterFrames: Math.round(trimEnd * FPS),
        objectPositionX,
        objectPositionY,
      },
    };
  }

  const mediaIds = job.selected_media_ids;
  const { data: mediaRows } =
    mediaIds.length > 0
      ? await admin.from("media").select("id, file_url, file_type").eq("brand_id", job.brand_id).in("id", mediaIds)
      : { data: [] as MediaRow[] };
  return { text: job.topic ?? "", imageUrls: onlyImages(mediaIds, mediaRows as MediaRow[] | null) };
}

function slotCopyInstruction(slot: SceneSlot, index: number): string {
  switch (slot.archetype) {
    case "hook":
      return `${index}: "hook" -> {"lines": ["kısa çarpıcı cümle", "vurgulu kapanış cümlesi"], "highlightWord": "ikinci satırdaki en vurucu tek kelime"} (tam 2 satır, her biri en fazla 5-6 kelime)`;
    case "feature":
      return `${index}: "feature" -> {"eyebrow": "01", "title": "en fazla 4 kelimelik başlık", "description": "tek cümlelik açıklama", "badges": ["2 kelimelik avantaj 1", "2 kelimelik avantaj 2"] (kart üstünde yüzecek rozetler, örn: '⚡ Hızlı Teslimat', '★ %100 Doğal')}`;
    case "product":
      return `${index}: "product" -> {"title": "ürünün gerçek ve kısa adı", "price": "kaynakta bulunan fiyat veya Fiyatı keşfet", "oldPrice": "yalnız kaynakta varsa eski fiyat", "discountBadge": "yalnız kaynakta doğrulanabiliyorsa indirim", "rating": "yalnız kaynakta varsa puan", "badges": ["kısa gerçek fayda 1", "kısa gerçek fayda 2"]}. Kaynakta olmayan fiyat, indirim veya puan UYDURMA.`;
    case "review":
      return `${index}: "review" -> {"quote": "kaynakta bulunan müşteri yorumu", "authorName": "yorum sahibi", "ratingStars": 5}. Kaynakta yorum yoksa iddia veya sahte müşteri yorumu UYDURMA.`;
    case "wrapped":
      return `${index}: "wrapped" -> {"headline": "kısa özet başlığı", "metricValue": "doğrulanabilir kısa değer veya 1 Fikir", "metricLabel": "değerin açıklaması", "comparisonText": "tek cümlelik sonuç"}. Kaynakta olmayan performans metriği UYDURMA.`;
    case "ugc_split":
      return `${index}: "ugc_split" -> {"badgeText": "kısa üst rozet", "title": "en fazla 4 kelimelik başlık", "price": "kaynakta bulunan fiyat veya Keşfet", "oldPrice": "yalnız kaynakta varsa", "discountBadge": "yalnız kaynakta varsa", "rating": "yalnız kaynakta varsa", "bullets": ["gerçek fayda 1", "gerçek fayda 2"], "ctaLabel": "2-3 kelimelik CTA"}. Kaynakta olmayan fiyat, puan veya indirim UYDURMA.`;
    case "stat":
      return `${index}: "stat" -> {"headline": "en fazla 4 kelimelik büyük sayı veya oran vurgusu (örn: '%100 Orijinal', '10.000+ Mutlu Müşteri', '3 Kat Hızlı')", "supporting": "tek cümlelik destek metni"}`;
    case "carousel":
      return `${index}: "carousel" -> {"caption": "tek kısa cümlelik altyazı"}`;
    case "user_clip":
      // No AI copy needed — this scene is just the user's own footage.
      // generateSceneCopy() filters these out of the prompt entirely; this
      // case only exists to satisfy the exhaustive switch.
      return "";
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
${slots
  .map((slot, index) => (slot.archetype === "user_clip" ? "" : slotCopyInstruction(slot, index)))
  .filter((line) => line.length > 0)
  .join("\n")}

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

// The model complying with the JSON schema doesn't guarantee it filled every
// field with real content — seen live: a well-written hook next to an
// outro with tagline:"" — so every field goes through this instead of a
// bare typeof check, which would happily accept an empty string.
function nonEmpty(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

// Guards against a pathological voice-over script (near-empty, or one that
// transcribes far longer than expected) producing a wildly short/long
// render — clamps the audio-derived target to a sane multiple of what
// planScenes() originally allocated for this duration bucket.
export function clampTargetFrames(rawFrames: number, currentRenderedFrames: number): number {
  return Math.max(Math.round(currentRenderedFrames * 0.5), Math.min(rawFrames, Math.round(currentRenderedFrames * 2.5)));
}

function assembleScenePlan(
  finalSlots: SceneSlot[],
  copyBySlot: Record<string, Record<string, unknown>>,
  source: ResolvedSource,
  brandName: string,
  logoUrl: string | null,
  videoBackgroundUrl: string | undefined
): ScenePlanItem[] {
  let imageCursor = 0;
  return finalSlots.map((slot, index): ScenePlanItem => {
    const copy = copyBySlot[String(index)] ?? {};
    switch (slot.archetype) {
      case "hook": {
        const lines = Array.isArray(copy.lines) ? copy.lines.map(String).filter((l) => l.trim().length > 0) : [];
        const highlightWord = typeof copy.highlightWord === "string" && copy.highlightWord.trim().length > 0 ? copy.highlightWord.trim() : undefined;
        return {
          archetype: "hook",
          frames: slot.frames,
          lines: lines.length > 0 ? lines : [source.text.slice(0, 40) || brandName],
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
          title: nonEmpty(copy.title, brandName),
          description: nonEmpty(copy.description, source.text.slice(0, 120)),
          imageUrl,
          badges,
        };
      }
      case "product": {
        const imageUrl = source.imageUrls[imageCursor % Math.max(source.imageUrls.length, 1)] ?? "";
        imageCursor += 1;
        const badges = Array.isArray(copy.badges)
          ? copy.badges.map(String).filter((badge) => badge.trim()).slice(0, 2)
          : [];
        return {
          archetype: "product",
          frames: slot.frames,
          title: source.product?.title || nonEmpty(copy.title, brandName),
          price: source.product?.price || "Fiyatı keşfet",
          imageUrl,
          rating: source.product?.review ? `★ ${source.product.review.rating.toFixed(1)}` : undefined,
          badges: badges.length > 0 ? badges : ["✓ Marka seçimi", "⚡ Hemen keşfet"],
        };
      }
      case "review": {
        const review = source.product?.review;
        return {
          archetype: "review",
          frames: slot.frames,
          quote: review?.quote || nonEmpty(copy.quote, source.text.slice(0, 140)),
          authorName: review?.author || nonEmpty(copy.authorName, "Müşteri görüşü"),
          ratingStars: review?.rating || Math.max(1, Math.min(5, Number(copy.ratingStars) || 5)),
          verifiedBuyer: Boolean(review),
          productThumbnail: source.imageUrls[0],
        };
      }
      case "wrapped":
        return {
          archetype: "wrapped",
          frames: slot.frames,
          headline: nonEmpty(copy.headline, "Kısaca neden farklı?"),
          metricValue: nonEmpty(copy.metricValue, "1 Fikir"),
          metricLabel: nonEmpty(copy.metricLabel, "tek yaratıcı hikâye"),
          comparisonText: nonEmpty(copy.comparisonText, source.text.slice(0, 90) || brandName),
        };
      case "ugc_split":
        return {
          archetype: "ugc_split",
          frames: slot.frames,
          topVideoUrl: videoBackgroundUrl,
          badgeText: nonEmpty(copy.badgeText, "ÖNE ÇIKAN"),
          title: source.product?.title || nonEmpty(copy.title, brandName),
          price: source.product?.price || nonEmpty(copy.price, "Hemen keşfet"),
          rating: source.product?.review ? `★ ${source.product.review.rating.toFixed(1)}` : undefined,
          bullets: Array.isArray(copy.bullets)
            ? copy.bullets.map(String).filter((bullet) => bullet.trim()).slice(0, 2)
            : ["Markana özel", "Yayına hazır"],
          ctaLabel: nonEmpty(copy.ctaLabel, "Hemen İncele"),
        };
      case "stat":
        return {
          archetype: "stat",
          frames: slot.frames,
          headline: nonEmpty(copy.headline, brandName),
          supporting: nonEmpty(copy.supporting, source.text.slice(0, 80)),
        };
      case "carousel":
        return {
          archetype: "carousel",
          frames: slot.frames,
          imageUrls: source.imageUrls.slice(0, 4),
          caption: nonEmpty(copy.caption, source.text.slice(0, 80)),
        };
      case "user_clip": {
        const clip = source.userClip;
        if (!clip) throw new Error("Video klibi verisi bulunamadı.");
        return {
          archetype: "user_clip",
          frames: slot.frames,
          videoUrl: clip.videoUrl,
          trimBeforeFrames: clip.trimBeforeFrames,
          trimAfterFrames: clip.trimAfterFrames,
          objectPositionX: clip.objectPositionX,
          objectPositionY: clip.objectPositionY,
        };
      }
      case "outro":
        return {
          archetype: "outro",
          frames: slot.frames,
          brandName,
          logoUrl,
          tagline: nonEmpty(copy.tagline, `${brandName} ile fark yaratın.`),
          ctaLabel: nonEmpty(copy.ctaLabel, "Hemen Keşfet"),
        };
    }
  });
}

/*
  Runs every AI-costly / network-costly step for a video_render_jobs row
  EXACTLY ONCE: brand voice/colors/logo, source content/images/product/clip
  resolution, scene STRUCTURE (planScenes — no brand data involved there),
  per-scene copy (one Groq call), and voice-over+transcription if requested.
  Called by prepareVideoDraft.ts right after job creation — the result lands
  in scene_plan and the job becomes 'draft'. Nothing past this point (editing,
  reordering, deleting, regenerating one scene, or the eventual render) needs
  to re-run any of this except regenerateSceneCopy()'s narrow single-scene
  call below.
*/
export async function buildDraftScenePlan(jobId: string, admin: AdminClient): Promise<DraftScenePlan> {
  const { data: job, error: jobError } = await admin.from("video_render_jobs").select("*").eq("id", jobId).single();
  if (jobError || !job) throw new Error("Video render job bulunamadı.");

  const [brandContext, brandRow, source] = await Promise.all([
    getBrandContext(job.brand_id, { client: admin }),
    admin.from("brands").select("logo_url").eq("id", job.brand_id).single(),
    resolveSource(job as VideoRenderJobRow, admin),
  ]);

  const renderSettings = readRenderSettings(job.scene_plan);
  const planned = planScenes({
    durationSeconds: job.duration_seconds,
    imageCount: source.imageUrls.length,
    seed: job.id,
    sourceType: job.source_type,
    requestedRecipe: renderSettings.recipeId,
    hasVideoBackground: Boolean(renderSettings.videoBackgroundUrl),
    hasReview: Boolean(source.product?.review),
  });
  const slots = planned.slots;

  // Voice-over is off for user_upload — UserClipShowcase.tsx deliberately
  // keeps the uploaded clip's own audio, and layering AI narration on top
  // would produce two overlapping voices. The API route already rejects
  // this combination; this is defense-in-depth only.
  const wantsVoiceover = Boolean(renderSettings.voiceoverScript) && job.source_type !== "user_upload";

  const [copyBySlot, voiceover] = await Promise.all([
    generateSceneCopy(slots, source, job.brand_id, brandContext.formattedText, brandContext.brandName, admin),
    wantsVoiceover
      ? generateVoiceover(renderSettings.voiceoverScript as string, renderSettings.voiceoverVoice ?? "alloy", job.brand_id, admin)
      : Promise.resolve(null),
  ]);

  // Rescale scene frames to the REAL voice-over length once we know it —
  // getRenderedDurationInFrames/rescaleSlotsToDuration mirror each other's
  // math exactly, and Root.tsx's calculateMetadata derives the actual
  // render duration purely from the final scenePlan, never from
  // job.duration_seconds — so this needs no schema/type change at all.
  const finalSlots = voiceover
    ? rescaleSlotsToDuration(
        slots,
        clampTargetFrames(Math.round(voiceover.durationSeconds * FPS), getRenderedDurationInFrames(slots))
      )
    : slots;

  const scenes = assembleScenePlan(
    finalSlots,
    copyBySlot,
    source,
    brandContext.brandName,
    brandRow.data?.logo_url ?? null,
    renderSettings.videoBackgroundUrl
  );

  return {
    recipeId: planned.recipeId,
    scenes,
    voiceoverAudio: voiceover?.audioUrl,
    captions: voiceover?.captions,
    resolvedSourceText: source.text,
    resolvedProduct: source.product,
  };
}

// Render-time assembly — NO AI calls. The draft (built once by
// buildDraftScenePlan/prepareVideoDraft.ts) already has every scene's copy,
// voice-over URL, and captions resolved and possibly user-edited via the
// storyboard editor; this just re-reads brand accentColors/brandName/format
// (cheap DB lookups, intentionally re-fetched live so a brand-color change
// between draft and render is reflected) and wraps the already-final
// `scenes` into the shape Remotion's renderer expects.
export async function assembleVideoInputProps(jobId: string, admin: AdminClient): Promise<VideoInputProps> {
  const { data: job, error: jobError } = await admin.from("video_render_jobs").select("*").eq("id", jobId).single();
  if (jobError || !job) throw new Error("Video render job bulunamadı.");

  const draftPlan = job.scene_plan && typeof job.scene_plan === "object" ? (job.scene_plan as Record<string, unknown>) : {};
  const scenes = Array.isArray(draftPlan.scenes) ? (draftPlan.scenes as ScenePlanItem[]) : [];
  if (scenes.length === 0) throw new Error("Taslak sahne planı bulunamadı.");

  const renderSettings = readRenderSettings(job.scene_plan);
  const brandContext = await getBrandContext(job.brand_id, { client: admin });

  return {
    format: job.format,
    durationSeconds: job.duration_seconds,
    fps: 30,
    accentColors: brandContext.colorPalette,
    visualStyle: brandContext.visualStyle,
    traitScores: brandContext.traitScores,
    industry: brandContext.industry,
    brandName: brandContext.brandName,
    recipeId: typeof draftPlan.recipeId === "string" ? (draftPlan.recipeId as VideoRecipeId) : undefined,
    videoBackgroundUrl: renderSettings.videoBackgroundUrl,
    musicTrack: renderSettings.musicTrack,
    voiceoverAudio: typeof draftPlan.voiceoverAudio === "string" ? draftPlan.voiceoverAudio : undefined,
    captions: Array.isArray(draftPlan.captions) ? (draftPlan.captions as Caption[]) : undefined,
    scenePlan: scenes,
  };
}

function extractCopyPatch(scene: ScenePlanItem, copy: Record<string, unknown>): Partial<ScenePlanItem> {
  function str(key: string): string | undefined {
    const v = copy[key];
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
  }
  function strArr(key: string, max: number): string[] | undefined {
    const v = copy[key];
    if (!Array.isArray(v)) return undefined;
    const arr = v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, max);
    return arr.length > 0 ? arr : undefined;
  }
  function put<T>(obj: Partial<ScenePlanItem>, key: string, value: T | undefined) {
    if (value !== undefined) (obj as Record<string, unknown>)[key] = value;
  }

  const patch: Partial<ScenePlanItem> = { archetype: scene.archetype };
  switch (scene.archetype) {
    case "hook":
      put(patch, "lines", strArr("lines", 2));
      put(patch, "highlightWord", str("highlightWord"));
      break;
    case "feature":
      put(patch, "eyebrow", str("eyebrow"));
      put(patch, "title", str("title"));
      put(patch, "description", str("description"));
      put(patch, "badges", strArr("badges", 2));
      break;
    case "product":
      put(patch, "title", str("title"));
      put(patch, "badges", strArr("badges", 2));
      break;
    case "review":
      put(patch, "quote", str("quote"));
      put(patch, "authorName", str("authorName"));
      break;
    case "wrapped":
      put(patch, "headline", str("headline"));
      put(patch, "metricValue", str("metricValue"));
      put(patch, "metricLabel", str("metricLabel"));
      put(patch, "comparisonText", str("comparisonText"));
      break;
    case "ugc_split":
      put(patch, "badgeText", str("badgeText"));
      put(patch, "title", str("title"));
      put(patch, "bullets", strArr("bullets", 2));
      put(patch, "ctaLabel", str("ctaLabel"));
      break;
    case "stat":
      put(patch, "headline", str("headline"));
      put(patch, "supporting", str("supporting"));
      break;
    case "carousel":
      put(patch, "caption", str("caption"));
      break;
    case "outro":
      put(patch, "tagline", str("tagline"));
      put(patch, "ctaLabel", str("ctaLabel"));
      break;
    case "user_clip":
      break;
  }
  return patch;
}

// Single-scene regeneration — a small, isolated Groq call reusing
// slotCopyInstruction() for exactly one scene, instead of re-running the
// whole-video generateSceneCopy() prompt. Any field the model leaves empty
// simply isn't included in the patch, so updateSceneCopy()'s shallow merge
// keeps the scene's CURRENT value for it — a regen can only add/replace
// text, never silently blank a field back to a generic filler string.
// resolvedSourceText/resolvedProduct come from the cached draft (see
// DraftScenePlan) specifically so this never re-scrapes a product_url.
export async function regenerateSceneCopy(
  scene: ScenePlanItem,
  resolvedSourceText: string,
  resolvedProduct: ResolvedProduct | undefined,
  brandId: string,
  brandContextText: string,
  brandName: string,
  admin: AdminClient
): Promise<ScenePlanItem> {
  if (scene.archetype === "user_clip") {
    throw new Error("Bu sahne türü yapay zeka ile yeniden üretilemez.");
  }

  const fakeSlot: SceneSlot =
    scene.archetype === "feature"
      ? { archetype: "feature", frames: scene.frames, reverse: scene.reverse }
      : ({ archetype: scene.archetype, frames: scene.frames } as SceneSlot);

  const systemPrompt = `Sen ${brandName} markası için kısa bir tanıtım videosunun TEK bir sahnesinin metnini yeniden yazan bir reklam metin yazarısın.

Marka bağlamı: ${brandContextText}
${resolvedProduct ? `Ürün bilgisi: ${JSON.stringify(resolvedProduct)}` : ""}

Aşağıdaki sahne için tam olarak istenen JSON alanlarını üret. Türkçe, doğal, klişe AI ifadelerinden uzak, önceki versiyondan farklı ve daha çarpıcı yaz. Kaynakta olmayan veri UYDURMA.
${slotCopyInstruction(fakeSlot, 0)}

Sadece şu JSON formatında yanıt ver: {"0": {...}}.`;

  const startedAt = Date.now();
  let status: "SUCCESS" | "ERROR" = "SUCCESS";
  let error: string | null = null;
  let model = MODEL;
  let inputTokens = 0;
  let outputTokens = 0;
  let copy: Record<string, unknown> = {};

  try {
    const result = await callGroq(systemPrompt, resolvedSourceText || `${brandName} için kısa bir tanıtım videosu yaz.`);
    model = result.model;
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
    const parsed = JSON.parse(result.content);
    copy = (parsed["0"] ?? parsed) as Record<string, unknown>;
  } catch (err) {
    status = "ERROR";
    error = err instanceof Error ? err.message : "Bilinmeyen hata";
  }

  await admin.from("ai_runs").insert({
    brand_id: brandId,
    stage: "video_scene_copy_single",
    prompt_version: "video-v1",
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_estimate_usd: estimateGroqCost(model, inputTokens, outputTokens),
    latency_ms: Date.now() - startedAt,
    status,
    error,
  });

  if (status === "ERROR") throw new Error(error ?? "Sahne yeniden üretilemedi.");

  const patch = extractCopyPatch(scene, copy);
  return updateSceneCopy([scene], 0, patch)[0];
}

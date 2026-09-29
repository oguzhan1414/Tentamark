import type { createClient } from "@/lib/supabase/server";
import { getBrandContext } from "@/lib/brand/getBrandContext";
import { deriveBrandDesignTokens } from "@/lib/brand/designTokens";
import { getCardType } from "@/lib/cards/typeRegistry";
import { persistCardImage } from "@/lib/cards/persistCardImage";
import { generateDrafts } from "@/lib/ai/generateDrafts";
import { generatePackageBrief } from "@/lib/ai/generatePackageBrief";
import type { LaunchPlatform } from "@/lib/ai/platforms";
import { resolveContentPackageStatus } from "./contentPackageStatus";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Graph API's carousel media type is Instagram/Facebook-specific — this
// isn't a style choice like feed/story/video's platform list (which stays
// as permissive as Compose already is), it's a hard publish-path
// constraint, so it's the one output that gets filtered.
const CAROUSEL_CAPABLE_PLATFORMS: LaunchPlatform[] = ["instagram", "facebook"];

async function createReadyContentRow(
  supabase: SupabaseServerClient,
  brandId: string,
  packageId: string,
  format: "post" | "story",
  title: string,
  coreIdea: string,
  mediaIds: string[],
  platforms: LaunchPlatform[]
): Promise<void> {
  const { data: contentRow, error: contentError } = await supabase
    .from("content")
    .insert({ brand_id: brandId, package_id: packageId, title, core_idea: coreIdea, format, status: "GENERATING", ai_generated: true })
    .select("id")
    .single();
  if (contentError || !contentRow) throw new Error(contentError?.message ?? "İçerik kaydı oluşturulamadı.");

  if (mediaIds.length > 0) {
    const { error } = await supabase
      .from("content_media")
      .insert(mediaIds.map((mediaId, position) => ({ content_id: contentRow.id, media_id: mediaId, position })));
    if (error) throw new Error(`İçerik medyası bağlanamadı: ${error.message}`);
  }

  if (platforms.length > 0) {
    const drafts = await generateDrafts(brandId, coreIdea, platforms, format === "story" ? "story" : "post", undefined, "brand", supabase);
    const platformRows = platforms.map((platform) => ({
      content_id: contentRow.id,
      platform,
      caption: drafts[platform] ?? coreIdea.slice(0, 200),
      status: "PENDING",
    }));
    const { error } = await supabase.from("content_platforms").insert(platformRows);
    if (error) throw new Error(`Platform taslakları kaydedilemedi: ${error.message}`);
  }

  const { error: readyError } = await supabase.from("content").update({ status: "NEEDS_REVIEW" }).eq("id", contentRow.id);
  if (readyError) throw new Error(`İçerik incelemeye alınamadı: ${readyError.message}`);
}

/*
  The Faz 7 orchestrator: one idea -> feed image + story image + carousel
  post + video draft, all tagged with the same package_id. Runs
  synchronously inside POST /api/packages (card rendering is fast, same
  reasoning api/cards/[type]/route.ts already relies on) — only the video's
  AI-costly draft prep continues in the background via prepareVideoDraft's
  own after()-triggered call, exactly like a normal video job.

  Best-effort per output: if one card fails to render or one Groq call
  errors, that output is skipped (logged) rather than failing the whole
  package — matches generateVoiceover()'s null-on-failure philosophy.
*/
export async function createContentPackage(
  brandId: string,
  topic: string,
  platforms: LaunchPlatform[],
  supabase: SupabaseServerClient
): Promise<{ packageId: string; videoJobId: string | null }> {
  const { data: packageRow, error: packageError } = await supabase
    .from("content_packages")
    .insert({ brand_id: brandId, title: topic.slice(0, 60) || "Yeni İçerik Paketi", core_idea: topic, status: "generating" })
    .select("id")
    .single();
  if (packageError || !packageRow) throw new Error(packageError?.message ?? "Paket oluşturulamadı.");
  const packageId = packageRow.id as string;
  let successfulOutputs = 0;
  let videoJobId: string | null = null;

  try {
    const [brandContext, brandRow] = await Promise.all([
      getBrandContext(brandId, { client: supabase }),
      supabase.from("brands").select("logo_url").eq("id", brandId).single(),
    ]);
    const tokens = deriveBrandDesignTokens(brandContext);
    const common = {
      brandName: brandContext.brandName,
      logoUrl: brandRow.data?.logo_url ?? null,
      accentColor: brandContext.colorPalette[0],
    };

    const brief = await generatePackageBrief(topic, brandId, brandContext.formattedText, brandContext.brandName, supabase);

    // Feed (square) + story (vertical) — same quoteText, two formats. This
    // is the deliberate Faz 7 scope trim: reusing the single-field `quote`
    // card type rather than the full 23-type AI classifier, which also
    // trivially guarantees message consistency across the two.
    const quoteType = getCardType("quote");
    if (quoteType) {
      for (const format of ["square", "story"] as const) {
        try {
          const props = await quoteType.parseBody({ quote: brief.quoteText }, { ...common, format });
          const buffers = await quoteType.render(props, undefined, tokens);
          const dimensions = quoteType.dimensions(format);
          const { mediaId } = await persistCardImage(supabase, brandId, buffers[0], dimensions, `${quoteType.fileNamePrefix}-${format}`);
          await createReadyContentRow(
            supabase,
            brandId,
            packageId,
            format === "square" ? "post" : "story",
            brief.title,
            brief.coreIdea,
            [mediaId],
            platforms
          );
          successfulOutputs += 1;
        } catch (err) {
          console.error(`createContentPackage: ${format} card failed`, err);
        }
      }
    }

    // Carousel — rendered, then attached to a REAL carousel-capable
    // content_platforms row (per the user's confirmed decision: this output
    // must be genuinely publishable, not just rendered images sitting in
    // the media library).
    const carouselType = getCardType("carousel");
    if (carouselType) {
      try {
        const props = await carouselType.parseBody(
          { title: brief.carousel.title, items: brief.carousel.items, ctaLabel: brief.carousel.ctaLabel },
          { ...common, format: "square" }
        );
        const buffers = await carouselType.render(props, undefined, tokens);
        const dimensions = carouselType.dimensions("square");
        const mediaIds: string[] = [];
        for (let i = 0; i < buffers.length; i++) {
          const { mediaId } = await persistCardImage(supabase, brandId, buffers[i], dimensions, `${carouselType.fileNamePrefix}-${i + 1}`);
          mediaIds.push(mediaId);
        }
        const carouselPlatforms = platforms.filter((p) => CAROUSEL_CAPABLE_PLATFORMS.includes(p));
        await createReadyContentRow(supabase, brandId, packageId, "post", brief.carousel.title, brief.coreIdea, mediaIds, carouselPlatforms);
        successfulOutputs += 1;
      } catch (err) {
        console.error("createContentPackage: carousel failed", err);
      }
    }

    // Video — a placeholder content row (no media yet, filled in by
    // renderVideoJob.ts once rendering completes) + a normal video job
    // going through the EXISTING draft/storyboard/render pipeline
    // unchanged, seeded with the same core idea.
    try {
      const { data: videoContentRow, error: videoContentError } = await supabase
        .from("content")
        .insert({ brand_id: brandId, package_id: packageId, title: brief.title, core_idea: brief.coreIdea, format: "reel", status: "GENERATING", ai_generated: true })
        .select("id")
        .single();
      if (videoContentError || !videoContentRow) throw new Error(videoContentError?.message ?? "Video içerik kaydı oluşturulamadı.");

      const { data: videoJob, error: videoJobError } = await supabase
        .from("video_render_jobs")
        .insert({
          brand_id: brandId,
          package_id: packageId,
          format: "vertical",
          duration_seconds: 15,
          source_type: "custom_topic",
          topic: brief.coreIdea,
          scene_plan: { settings: { recipeId: "auto", musicTrack: "lofi" } },
        })
        .select("id")
        .single();
      if (videoJobError || !videoJob) throw new Error(videoJobError?.message ?? "Video işi oluşturulamadı.");
      videoJobId = videoJob.id;
      successfulOutputs += 1;
    } catch (err) {
      console.error("createContentPackage: video job creation failed", err);
    }

    const packageStatus = resolveContentPackageStatus(successfulOutputs);
    const { error: statusError } = await supabase.from("content_packages").update({ status: packageStatus }).eq("id", packageId);
    if (statusError) throw new Error(`Paket durumu güncellenemedi: ${statusError.message}`);
    return { packageId, videoJobId };
  } catch (err) {
    await supabase.from("content_packages").update({ status: "failed" }).eq("id", packageId);
    throw err;
  }
}

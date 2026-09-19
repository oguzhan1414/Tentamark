import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { recycleContentHook } from "@/lib/ai/recycleContentHook";

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  // Allow secret bearer token OR internal cron verification
  const expected = process.env.SCHEDULER_WEBHOOK_SECRET || process.env.CRON_SECRET;
  if (!expected) {
    // If not configured, allow in development
    return process.env.NODE_ENV === "development";
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const cronHeader = req.headers.get("x-cron-secret") ?? "";

  if (cronHeader && cronHeader === expected) return true;

  const prefix = "Bearer ";
  if (authHeader.startsWith(prefix)) {
    const provided = authHeader.slice(prefix.length);
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  try {
    // 1. Fetch active evergreen content candidates
    const { data: candidates, error: candidateError } = await supabase
      .from("content")
      .select(
        "id, brand_id, title, core_idea, category, format, tags, is_evergreen, evergreen_interval_days, evergreen_max_recycles, evergreen_recycle_count, evergreen_last_recycled_at, evergreen_auto_remix, content_platforms(id, platform, caption, hashtags, hashtags_as_first_comment, media_override_id), content_media(media_id, position)"
      )
      .eq("is_evergreen", true);

    if (candidateError) {
      return NextResponse.json({ error: candidateError.message }, { status: 500 });
    }

    const itemsToRecycle = (candidates ?? []).filter((item) => {
      // Check maximum recycles limit if specified
      if (
        item.evergreen_max_recycles !== null &&
        item.evergreen_max_recycles !== undefined &&
        item.evergreen_recycle_count >= item.evergreen_max_recycles
      ) {
        return false;
      }

      // Check interval elapsed
      const lastDate = item.evergreen_last_recycled_at
        ? new Date(item.evergreen_last_recycled_at)
        : null;

      if (!lastDate) {
        // Has never been recycled: check if interval has passed since original creation
        return true;
      }

      const daysPassed = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysPassed >= (item.evergreen_interval_days || 30);
    });

    const results: Array<{ id: string; title: string; newContentId?: string }> = [];

    for (const item of itemsToRecycle) {
      try {
        const primaryPlatform = item.content_platforms?.[0];
        let refreshedCaption = primaryPlatform?.caption || item.core_idea;

        // 2. Refresh hook using AI if auto-remix is enabled
        if (item.evergreen_auto_remix && primaryPlatform?.caption) {
          try {
            const aiVariant = await recycleContentHook({
              brandId: item.brand_id,
              originalCaption: primaryPlatform.caption,
              coreIdea: item.core_idea,
              platform: primaryPlatform.platform,
            });
            if (aiVariant?.caption) {
              refreshedCaption = aiVariant.caption;
            }
          } catch (remixErr) {
            console.warn(`Evergreen AI remix failed for post ${item.id}, using original:`, remixErr);
          }
        }

        // 3. Create fresh clone in NEEDS_REVIEW status for safe editorial review
        const { data: newContent, error: insertError } = await supabase
          .from("content")
          .insert({
            brand_id: item.brand_id,
            title: `[🌱 Evergreen] ${item.title}`,
            core_idea: refreshedCaption,
            category: item.category,
            format: item.format,
            tags: Array.isArray(item.tags) ? [...item.tags, "evergreen-recycle"] : ["evergreen-recycle"],
            status: "NEEDS_REVIEW",
            is_evergreen: false, // The clone itself isn't evergreen; master record controls lifecycle
          })
          .select("id")
          .single();

        if (insertError || !newContent) {
          console.error(`Failed to create clone for evergreen item ${item.id}:`, insertError?.message);
          continue;
        }

        // 4. Attach media assets
        if (item.content_media && item.content_media.length > 0) {
          const mediaRows = item.content_media.map((cm: { media_id: string; position: number }) => ({
            content_id: newContent.id,
            media_id: cm.media_id,
            position: cm.position,
          }));
          await supabase.from("content_media").insert(mediaRows);
        }

        // 5. Clone platform variants with refreshed text
        if (item.content_platforms && item.content_platforms.length > 0) {
          const platformRows = item.content_platforms.map((cp: {
            platform: string;
            caption: string;
            hashtags?: string[];
            hashtags_as_first_comment?: boolean;
            media_override_id?: string | null;
          }) => ({
            content_id: newContent.id,
            platform: cp.platform,
            caption: refreshedCaption,
            status: "PENDING",
            hashtags: cp.hashtags ?? [],
            hashtags_as_first_comment: cp.hashtags_as_first_comment ?? false,
            media_override_id: cp.media_override_id ?? null,
          }));
          await supabase.from("content_platforms").insert(platformRows);
        }

        // 6. Update master evergreen record counters
        await supabase
          .from("content")
          .update({
            evergreen_recycle_count: (item.evergreen_recycle_count || 0) + 1,
            evergreen_last_recycled_at: now.toISOString(),
          })
          .eq("id", item.id);

        results.push({
          id: item.id,
          title: item.title,
          newContentId: newContent.id,
        });
      } catch (itemErr) {
        console.error(`Error recycling item ${item.id}:`, itemErr);
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      recycled: results,
      checkedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("Evergreen scheduler general error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

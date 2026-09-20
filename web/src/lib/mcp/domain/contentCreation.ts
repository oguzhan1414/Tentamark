import { createAdminClient } from "@/lib/supabase/admin";
import { assertBrandAccess, assertScopes, type McpActorContext } from "../actorContext";
import { McpErrors } from "../contracts/errors";
import { recordAuditEvent } from "../audit";
import { executeAiOperation } from "../aiOperationRunner";
import { generateDrafts, type ContentFormat, type LaunchPlatform } from "@/lib/ai/generateDrafts";
import { generateWeeklyPack, type WeeklyPackItem } from "@/lib/ai/generateWeeklyPack";

function extractHashtags(text: string): string[] {
  return Array.from(new Set(text.match(/#[\p{L}0-9_]+/gu) ?? []));
}

/*
  create_content_brief — deliberately never touches the database. It's the
  same generateDrafts call create_post_draft makes, just discarded after
  being shown to the caller, for exploring an idea before committing to a
  real draft. Scoped to a single platform (the caller's choice, or
  "instagram" as a reasonable default) since a brief is meant to be read,
  not published — the multi-platform fan-out is create_post_draft's job.
*/
export async function createContentBrief(
  actor: McpActorContext,
  params: { brandId?: string; topic: string; platform?: string; idempotencyKey: string }
): Promise<{ platform: string; brief: string }> {
  assertScopes(actor, ["draft:create"]);
  const brandId = assertBrandAccess(actor, params.brandId);
  const platform = (params.platform || "instagram") as LaunchPlatform;
  const admin = createAdminClient();

  const brief = await executeAiOperation({
    actor,
    brandId,
    operation: "create_content_brief:generate",
    idempotencyKey: params.idempotencyKey,
    input: params,
    selfLogs: true, // generateDrafts logs its own ai_runs row
    run: async () => {
      const drafts = await generateDrafts(brandId, params.topic, [platform], "post", undefined, "brand", admin);
      return drafts[platform] ?? "";
    },
  });

  return { platform, brief };
}

export type CreatedDraft = { contentId: string; title: string; platforms: { platform: string; caption: string }[] };

/*
  create_post_draft — the MCP equivalent of ComposeForm's submit("DRAFT")
  path, minus media attachment (no MCP tool accepts a file upload) and minus
  scheduling (reschedule_draft sets that afterward). Mirrors the same
  content/content_platforms insert shape so this draft is indistinguishable
  from one a human created in Compose — same status guards, same trigger
  behavior apply to it from here on.
*/
export async function createPostDraft(
  actor: McpActorContext,
  params: { brandId?: string; idea: string; platforms: LaunchPlatform[]; format?: ContentFormat; idempotencyKey: string }
): Promise<CreatedDraft> {
  assertScopes(actor, ["draft:create"]);
  const brandId = assertBrandAccess(actor, params.brandId);
  if (params.platforms.length === 0) throw McpErrors.validationError("At least one platform is required.");
  const admin = createAdminClient();

  const drafts = await executeAiOperation({
    actor,
    brandId,
    operation: "create_post_draft:generate",
    idempotencyKey: params.idempotencyKey,
    input: params,
    selfLogs: true,
    run: () => generateDrafts(brandId, params.idea, params.platforms, params.format ?? "post", undefined, "brand", admin),
  });

  const title = params.idea.trim().slice(0, 80) || "Untitled";

  const { data: content, error: contentError } = await admin
    .from("content")
    .insert({
      brand_id: brandId,
      title,
      core_idea: params.idea.trim(),
      status: "DRAFT",
      format: params.format ?? "post",
      tags: [],
      ai_generated: true,
      created_by: actor.userId || null,
    })
    .select("id, title")
    .single();
  if (contentError || !content) throw McpErrors.temporarilyUnavailable(contentError?.message ?? "Could not create content.");

  const platformRows = params.platforms.map((platform) => {
    const caption = drafts[platform] ?? "";
    return {
      content_id: content.id,
      platform,
      caption,
      hashtags: extractHashtags(caption),
      status: "PENDING",
    };
  });

  const { error: platformsError } = await admin.from("content_platforms").insert(platformRows);
  if (platformsError) {
    await admin.from("content").delete().eq("id", content.id);
    throw McpErrors.temporarilyUnavailable(platformsError.message);
  }

  await recordAuditEvent({
    actor,
    action: "CONTENT_DRAFT_CREATED",
    entityType: "content",
    entityId: content.id,
    outcome: "success",
    afterState: { title: content.title, platforms: params.platforms },
  });

  return {
    contentId: content.id,
    title: content.title,
    platforms: platformRows.map((p) => ({ platform: p.platform, caption: p.caption })),
  };
}

/*
  generate_weekly_plan — same generateWeeklyPack a human triggers from
  Compose's "7 Günlük Haftalık Paket Üret" button, but every returned item
  is immediately persisted as its own DRAFT content row (one createPostDraft-
  shaped insert per item) rather than requiring a second tool call per day.
  A partial failure (item 3 of 5 fails to insert) does not roll back items
  1-2 — the caller gets back exactly which days succeeded and which didn't,
  same as a human retrying just the failed day would.
*/
export async function generateWeeklyPlanDrafts(
  actor: McpActorContext,
  params: { brandId?: string; platforms: LaunchPlatform[]; weekStart?: string; idempotencyKey: string }
): Promise<{ created: CreatedDraft[]; failed: { title: string; error: string }[] }> {
  assertScopes(actor, ["draft:create"]);
  const brandId = assertBrandAccess(actor, params.brandId);
  if (params.platforms.length === 0) throw McpErrors.validationError("At least one platform is required.");

  const weekStartDate = params.weekStart ? new Date(`${params.weekStart}T00:00:00Z`) : (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7)); // next Monday
    return d;
  })();
  if (Number.isNaN(weekStartDate.getTime())) throw McpErrors.validationError("weekStart must be a valid ISO date.");
  const admin = createAdminClient();

  const items = await executeAiOperation({
    actor,
    brandId,
    operation: "generate_weekly_plan:generate",
    idempotencyKey: params.idempotencyKey,
    input: params,
    selfLogs: true, // generateWeeklyPack logs its own ai_runs row
    run: () => generateWeeklyPack(brandId, params.platforms, { start: weekStartDate, daySpan: 5 }, undefined, admin),
  });

  const created: CreatedDraft[] = [];
  const failed: { title: string; error: string }[] = [];

  for (const item of items as WeeklyPackItem[]) {
    try {
      const { data: content, error: contentError } = await admin
        .from("content")
        .insert({
          brand_id: brandId,
          title: item.title.slice(0, 80),
          core_idea: [item.hook, item.visualPrompt].filter(Boolean).join("\n\n") || item.title,
          category: item.pillar,
          status: "DRAFT",
          format: "post",
          tags: [],
          ai_generated: true,
          created_by: actor.userId || null,
        })
        .select("id, title")
        .single();
      if (contentError || !content) throw new Error(contentError?.message ?? "Insert failed.");

      const platformRows = params.platforms.map((platform) => {
        const caption = item.captions[platform] ?? "";
        return { content_id: content.id, platform, caption, hashtags: extractHashtags(caption), status: "PENDING" };
      });
      const { error: platformsError } = await admin.from("content_platforms").insert(platformRows);
      if (platformsError) {
        await admin.from("content").delete().eq("id", content.id);
        throw new Error(platformsError.message);
      }

      created.push({
        contentId: content.id,
        title: content.title,
        platforms: platformRows.map((p) => ({ platform: p.platform, caption: p.caption })),
      });
    } catch (err) {
      failed.push({ title: item.title, error: err instanceof Error ? err.message : String(err) });
    }
  }

  await recordAuditEvent({
    actor,
    action: "WEEKLY_PLAN_GENERATED",
    entityType: "content",
    entityId: brandId,
    outcome: failed.length === 0 ? "success" : "failed",
    afterState: { createdCount: created.length, failedCount: failed.length },
  });

  return { created, failed };
}

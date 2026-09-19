import { createAdminClient } from "@/lib/supabase/admin";
import { assertBrandAccess, assertScopes, type McpActorContext } from "../actorContext";
import { McpErrors } from "../contracts/errors";
import { recordAuditEvent } from "../audit";
import { assertNotStale } from "../idempotency";

/*
  Server-only equivalents of the mutations posts/page.tsx and
  approvalItems.ts already run — for MCP tool handlers, which have no
  browser session/RLS to lean on and so use the admin client plus an
  explicit actor.brandIds check instead. Deliberately mirrors each existing
  status guard exactly (same status lists, same .eq/.in filters) rather than
  inventing new rules, per docs/mcp-entegrasyon-plani.md's warning that
  Calendar and Gönderiler already drifted once from having separate copies
  of this logic.

  Scope note (see the chat response this was built from): the existing
  browser-client UI paths in posts/page.tsx / calendar/page.tsx /
  approvalItems.ts are NOT changed by this file. Consolidating them to call
  through this same module via a Server Action is real, worthwhile follow-up
  work, but doing it in the same pass as building brand-new MCP
  infrastructure would mean touching live, already-shipped UI code paths
  without dedicated test coverage for that specific refactor — kept as a
  deliberately separate future change instead.
*/

async function loadContentPlatformWithBrand(admin: ReturnType<typeof createAdminClient>, contentPlatformId: string) {
  const { data, error } = await admin
    .from("content_platforms")
    .select("id, content_id, status, scheduled_at, updated_at, content:content_id(id, brand_id, status)")
    .eq("id", contentPlatformId)
    .maybeSingle();
  if (error) throw McpErrors.temporarilyUnavailable(error.message);
  return data as
    | {
        id: string;
        content_id: string;
        status: string;
        scheduled_at: string | null;
        updated_at: string;
        content: { id: string; brand_id: string; status: string } | null;
      }
    | null;
}

const RESCHEDULABLE_STATUSES = ["DRAFT", "NEEDS_REVIEW", "PENDING", "NEEDS_USER_ACTION", "FAILED"];

export async function rescheduleContentPlatform(
  actor: McpActorContext,
  params: { brandId?: string; contentPlatformId: string; newScheduledAt: string; expectedUpdatedAt: string }
): Promise<{ id: string; scheduledAt: string; updatedAt: string }> {
  assertScopes(actor, ["schedule:update"]);
  const brandId = assertBrandAccess(actor, params.brandId);

  const admin = createAdminClient();
  const row = await loadContentPlatformWithBrand(admin, params.contentPlatformId);
  if (!row || !row.content) throw McpErrors.notFound("content_platform", params.contentPlatformId);
  if (row.content.brand_id !== brandId) {
    throw McpErrors.forbidden("This content does not belong to the granted brand.");
  }
  if (!RESCHEDULABLE_STATUSES.includes(row.status)) {
    throw McpErrors.conflict(`Platform variant is ${row.status} and can no longer be rescheduled.`, { status: row.status });
  }
  assertNotStale({
    expected: params.expectedUpdatedAt,
    current: row.updated_at,
    entityType: "content_platform",
    entityId: row.id,
  });
  // Mirrors posts/page.tsx's savePlatform(): an already-APPROVED post must
  // keep a future publish time, never a past/immediate one snuck in via a
  // reschedule call.
  if (row.content.status === "APPROVED" && new Date(params.newScheduledAt).getTime() <= Date.now()) {
    throw McpErrors.validationError("An approved post must be rescheduled to a future time.");
  }

  const { data, error } = await admin
    .from("content_platforms")
    .update({ scheduled_at: params.newScheduledAt })
    .eq("id", row.id)
    .eq("updated_at", row.updated_at)
    .in("status", RESCHEDULABLE_STATUSES)
    .select("id, scheduled_at, updated_at")
    .single();

  if (error || !data) {
    throw McpErrors.conflict("Platform variant changed status before this update could apply — read it again.");
  }

  await recordAuditEvent({
    actor,
    action: "SCHEDULE_UPDATED",
    entityType: "content_platform",
    entityId: row.id,
    outcome: "success",
    beforeState: { scheduledAt: row.scheduled_at },
    afterState: { scheduledAt: data.scheduled_at },
  });

  return { id: data.id, scheduledAt: data.scheduled_at, updatedAt: data.updated_at };
}

export async function submitContentForApproval(
  actor: McpActorContext,
  params: { brandId?: string; contentId: string; expectedUpdatedAt: string }
): Promise<{ id: string; status: string; updatedAt: string }> {
  assertScopes(actor, ["approval:request"]);
  const brandId = assertBrandAccess(actor, params.brandId);

  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin
    .from("content")
    .select("id, brand_id, status, updated_at")
    .eq("id", params.contentId)
    .maybeSingle();
  if (readError) throw McpErrors.temporarilyUnavailable(readError.message);
  if (!existing) throw McpErrors.notFound("content", params.contentId);
  if (existing.brand_id !== brandId) throw McpErrors.forbidden("This content does not belong to the granted brand.");
  assertNotStale({
    expected: params.expectedUpdatedAt,
    current: existing.updated_at,
    entityType: "content",
    entityId: existing.id,
  });

  const { data, error } = await admin
    .from("content")
    .update({ status: "NEEDS_REVIEW" })
    .eq("id", params.contentId)
    .eq("updated_at", existing.updated_at)
    .eq("status", "DRAFT")
    .select("id, status, updated_at")
    .single();

  if (error || !data) {
    throw McpErrors.conflict(`Content is ${existing.status}, not DRAFT — only a draft can be submitted for review.`, {
      status: existing.status,
    });
  }

  await recordAuditEvent({
    actor,
    action: "CONTENT_SUBMITTED_FOR_REVIEW",
    entityType: "content",
    entityId: data.id,
    outcome: "success",
    beforeState: { status: existing.status },
    afterState: { status: data.status },
  });

  return { id: data.id, status: data.status, updatedAt: data.updated_at };
}

/*
  Not wired to an MCP tool in the frozen Aşama-0 tool list (see
  contracts/tools/writeTools.ts) — approval:decide exists as a scope but no
  connection is granted it yet, on purpose: deciding an approval is exactly
  the kind of action docs/mcp-entegrasyon-plani.md's "insan onayı" section
  argues should stay behind a human clicking inside Tentamark, not an agent
  tool call, at least for this first release. Built anyway because Approvals
  UI work already needs a server-side equivalent of approveContentRow/
  rejectContentRow for other reasons, and it's the same guard shape as the
  two functions above.
*/
export async function decideContentApproval(
  actor: McpActorContext,
  params: { brandId?: string; contentId: string; expectedUpdatedAt: string; decision: "approve" | "reject" }
): Promise<{ id: string; status: string; updatedAt: string }> {
  assertScopes(actor, ["approval:decide"]);
  const brandId = assertBrandAccess(actor, params.brandId);

  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin
    .from("content")
    .select("id, brand_id, status, updated_at")
    .eq("id", params.contentId)
    .maybeSingle();
  if (readError) throw McpErrors.temporarilyUnavailable(readError.message);
  if (!existing) throw McpErrors.notFound("content", params.contentId);
  if (existing.brand_id !== brandId) throw McpErrors.forbidden("This content does not belong to the granted brand.");
  assertNotStale({
    expected: params.expectedUpdatedAt,
    current: existing.updated_at,
    entityType: "content",
    entityId: existing.id,
  });

  const nextStatus = params.decision === "approve" ? "APPROVED" : "DRAFT";
  // require_approval_schedule (patches/0043) rejects this update at the DB
  // level if any content_platforms row is missing scheduled_at — that
  // exception is allowed to propagate rather than being pre-checked here,
  // same as approveAll() in posts/page.tsx today.
  const { data, error } = await admin
    .from("content")
    .update({ status: nextStatus })
    .eq("id", params.contentId)
    .eq("updated_at", existing.updated_at)
    .eq("status", "NEEDS_REVIEW")
    .select("id, status, updated_at")
    .single();

  if (error || !data) {
    throw McpErrors.conflict(
      error?.message ?? `Content is ${existing.status}, not NEEDS_REVIEW — nothing to decide.`,
      { status: existing.status }
    );
  }

  await recordAuditEvent({
    actor,
    action: params.decision === "approve" ? "CONTENT_APPROVED" : "CONTENT_REJECTED",
    entityType: "content",
    entityId: data.id,
    outcome: "success",
    beforeState: { status: existing.status },
    afterState: { status: data.status },
  });

  return { id: data.id, status: data.status, updatedAt: data.updated_at };
}

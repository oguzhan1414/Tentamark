import { createAdminClient } from "@/lib/supabase/admin";
import { assertBrandAccess, assertScopes, type McpActorContext } from "../actorContext";
import { McpErrors } from "../contracts/errors";

/*
  Server-only read queries for the calendar/media/approvals tool group —
  fetchContentRows (web/src/lib/content/approvalItems.ts) takes a browser
  Supabase client and leans on RLS, so it isn't reusable here (no session,
  no cookies). These mirror its shape closely enough that the two haven't
  diverged in what they consider a "pending approval" or a "post", but each
  is deliberately smaller (only the fields the MCP tool actually returns),
  not a shim over the same query.
*/

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function clampLimit(limit?: number): number {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

// Cursor is just the last row's created_at — simple, sufficient for a
// created_at-ordered feed, and avoids needing a separate opaque-token
// encoding scheme for this first tool surface.
function decodeCursor(cursor?: string): string | null {
  if (!cursor) return null;
  const parsed = new Date(cursor);
  return Number.isNaN(parsed.getTime()) ? null : cursor;
}

export type CalendarEntry = {
  contentId: string;
  title: string;
  status: string;
  platform: string;
  caption: string;
  scheduledAt: string | null;
  publishedAt: string | null;
};

export async function getWeeklyCalendar(
  actor: McpActorContext,
  params: { brandId?: string; weekStart: string }
): Promise<CalendarEntry[]> {
  assertScopes(actor, ["calendar:read"]);
  const brandId = assertBrandAccess(actor, params.brandId);

  const start = new Date(`${params.weekStart}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) throw McpErrors.validationError("weekStart must be a valid ISO date.");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("content_platforms")
    .select("platform, caption, scheduled_at, published_at, content:content_id!inner(id, title, status, brand_id)")
    .eq("content.brand_id", brandId)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  return (data ?? []).map((row) => {
      const content = Array.isArray(row.content) ? row.content[0] : row.content;
      return {
        contentId: content!.id,
        title: content!.title,
        status: content!.status,
        platform: row.platform,
        caption: row.caption,
        scheduledAt: row.scheduled_at,
        publishedAt: row.published_at,
      };
    });
}

export type PendingApproval = { contentId: string; title: string; createdAt: string; platforms: string[] };

export async function getPendingApprovals(
  actor: McpActorContext,
  params: { brandId?: string; cursor?: string; limit?: number }
): Promise<{ items: PendingApproval[]; nextCursor: string | null }> {
  assertScopes(actor, ["calendar:read"]);
  const brandId = assertBrandAccess(actor, params.brandId);
  const limit = clampLimit(params.limit);
  const cursor = decodeCursor(params.cursor);

  const admin = createAdminClient();
  let query = admin
    .from("content")
    .select("id, title, created_at, content_platforms(platform)")
    .eq("brand_id", brandId)
    .eq("status", "NEEDS_REVIEW")
    .order("created_at", { ascending: true })
    .limit(limit + 1);
  if (cursor) query = query.gt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  const rows = data ?? [];
  const page = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? page[page.length - 1]?.created_at ?? null : null;

  return {
    items: page.map((r) => ({
      contentId: r.id,
      title: r.title,
      createdAt: r.created_at,
      platforms: (r.content_platforms ?? []).map((p: { platform: string }) => p.platform),
    })),
    nextCursor,
  };
}

export type PostDetail = {
  contentId: string;
  title: string;
  coreIdea: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  platforms: { id: string; platform: string; caption: string; hashtags: string[]; status: string; scheduledAt: string | null }[];
  comments: { authorId: string | null; body: string; createdAt: string }[];
};

export async function getPostDetails(
  actor: McpActorContext,
  params: { brandId?: string; contentId: string }
): Promise<PostDetail> {
  assertScopes(actor, ["calendar:read"]);
  const brandId = assertBrandAccess(actor, params.brandId);

  const admin = createAdminClient();
  const { data: content, error } = await admin
    .from("content")
    .select(
      "id, title, core_idea, status, created_at, updated_at, brand_id, content_platforms(id, platform, caption, hashtags, status, scheduled_at), content_comments(author_id, body, created_at)"
    )
    .eq("id", params.contentId)
    .maybeSingle();
  if (error) throw McpErrors.temporarilyUnavailable(error.message);
  if (!content) throw McpErrors.notFound("content", params.contentId);
  if (content.brand_id !== brandId) throw McpErrors.forbidden("This content does not belong to the granted brand.");

  return {
    contentId: content.id,
    title: content.title,
    coreIdea: content.core_idea,
    status: content.status,
    createdAt: content.created_at,
    updatedAt: content.updated_at,
    platforms: (content.content_platforms ?? []).map((p) => ({
      id: p.id,
      platform: p.platform,
      caption: p.caption,
      hashtags: p.hashtags ?? [],
      status: p.status,
      scheduledAt: p.scheduled_at,
    })),
    comments: (content.content_comments ?? []).map((c) => ({
      authorId: c.author_id,
      body: c.body,
      createdAt: c.created_at,
    })),
  };
}

export type MediaSearchResult = { id: string; fileName: string; fileUrl: string; fileType: string; createdAt: string };

export async function searchMedia(
  actor: McpActorContext,
  params: { brandId?: string; query?: string; cursor?: string; limit?: number }
): Promise<{ items: MediaSearchResult[]; nextCursor: string | null }> {
  assertScopes(actor, ["media:read"]);
  const brandId = assertBrandAccess(actor, params.brandId);
  const limit = clampLimit(params.limit);
  const cursor = decodeCursor(params.cursor);

  const admin = createAdminClient();
  let dbQuery = admin
    .from("media")
    .select("id, file_name, file_url, file_type, created_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);
  if (params.query?.trim()) dbQuery = dbQuery.ilike("file_name", `%${params.query.trim()}%`);
  if (cursor) dbQuery = dbQuery.lt("created_at", cursor);

  const { data, error } = await dbQuery;
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  const rows = data ?? [];
  const page = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? page[page.length - 1]?.created_at ?? null : null;

  return {
    items: page.map((m) => ({ id: m.id, fileName: m.file_name, fileUrl: m.file_url, fileType: m.file_type, createdAt: m.created_at })),
    nextCursor,
  };
}

export async function findCalendarGaps(
  actor: McpActorContext,
  params: { brandId?: string; fromDate: string; toDate: string }
): Promise<string[]> {
  assertScopes(actor, ["calendar:read"]);
  const brandId = assertBrandAccess(actor, params.brandId);

  const from = new Date(`${params.fromDate}T00:00:00Z`);
  const to = new Date(`${params.toDate}T00:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    throw McpErrors.validationError("fromDate must be a valid date before toDate.");
  }
  const spanDays = Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
  if (spanDays > 90) throw McpErrors.validationError("Date range must be 90 days or fewer.");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("content_platforms")
    .select("scheduled_at, content:content_id!inner(brand_id)")
    .eq("content.brand_id", brandId)
    .gte("scheduled_at", from.toISOString())
    .lt("scheduled_at", to.toISOString());
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  const scheduledDates = new Set(
    (data ?? []).map((row) => new Date(row.scheduled_at!).toISOString().slice(0, 10))
  );

  const gaps: string[] = [];
  for (let d = new Date(from); d < to; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    if (!scheduledDates.has(iso)) gaps.push(iso);
  }
  return gaps;
}

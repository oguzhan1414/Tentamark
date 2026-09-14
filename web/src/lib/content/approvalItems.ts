import type { createClient } from "@/lib/supabase/client";
import type { PlatformName } from "@/components/PlatformIcon";
import type { ApprovalComment, ApprovalItem } from "@/components/dashboard/approvals/types";
import type { UIStatus } from "@/lib/contentStatus";

/*
  Shared between Gönderiler (posts/page.tsx) and Takvim (calendar/page.tsx) —
  both need "every piece of content for this brand, as an ApprovalItem" and
  used to fetch/map it independently. That's exactly how Calendar ended up
  showing content in a way that drifted from Gönderiler/the approval modal
  (a rejected item looked unchanged, "published" still read "scheduled") —
  one fetch+mapping, used by both, so a fix here can't happen in only one
  place again.
*/

type SupabaseBrowserClient = ReturnType<typeof createClient>;

export type PlatformRow = {
  id?: string;
  platform: PlatformName;
  status: string;
  scheduled_at: string | null;
  caption?: string | null;
  hashtags?: string[] | null;
  permalink_url?: string | null;
};

export type ContentRow = {
  id: string;
  title: string;
  body?: string | null;
  status: string;
  created_at: string;
  imageUrl?: string | null;
  imageIsVideo?: boolean;
  metadata?: {
    hook?: string;
    visualPrompt?: string;
    pillar?: string;
  } | null;
  tags: string[];
  format: string;
  content_platforms: PlatformRow[];
  campaignName?: string | null;
  assignedTo?: { id: string; name: string } | null;
  comments: ApprovalComment[];
};

export function firstMedia(contentMedia: unknown): { url: string; isVideo: boolean } | null {
  const rows = Array.isArray(contentMedia) ? contentMedia : contentMedia ? [contentMedia] : [];
  for (const row of rows as { media?: unknown }[]) {
    const media = Array.isArray(row.media) ? row.media[0] : row.media;
    const typed = media as { file_url?: string; file_type?: string } | undefined;
    if (typed?.file_url) {
      return { url: typed.file_url, isVideo: (typed.file_type ?? "").startsWith("video/") };
    }
  }
  return null;
}

export function parseCoreIdea(coreIdea?: string | null): { hook: string | null; visualPrompt: string | null } {
  if (!coreIdea) return { hook: null, visualPrompt: null };
  const hookMatch = coreIdea.match(/Kanca(?:\s*\(Hook\))?:\s*([^\n]+)/i);
  const visualMatch = coreIdea.match(/Görsel\/Video Konsepti:\s*([\s\S]+)/i);
  return {
    hook: hookMatch ? hookMatch[1].trim() : null,
    visualPrompt: visualMatch ? visualMatch[1].trim() : (!hookMatch ? coreIdea : null),
  };
}

// Coarse, whole-content status (any platform failed / overall published /
// overall approved / draft / else review) — what the approval modal's
// single status pill means, across every platform at once. Calendar's own
// per-chip status uses the finer deriveStatus(contentStatus, cpStatus) per
// platform instead — a specific platform can be PUBLISHED while another on
// the same content still hasn't gone out.
export function overallStatus(row: ContentRow): UIStatus {
  const platforms = row.content_platforms ?? [];
  if (platforms.some((p) => p.status === "NEEDS_USER_ACTION" || p.status === "FAILED")) return "failed";
  if (row.status === "PUBLISHED" || row.status === "PARTIALLY_PUBLISHED") return "published";
  if (row.status === "APPROVED" || row.status === "SCHEDULED") return "scheduled";
  if (row.status === "DRAFT" || row.status === "IDEA" || row.status === "GENERATING") return "draft";
  return "review";
}

export function rowToApprovalItem(row: ContentRow, brandName: string): ApprovalItem {
  const firstPlatform = row.content_platforms[0];
  const hasComments = row.comments.length > 0;
  const kanbanStatus: "NEEDS_REVIEW" | "FEEDBACK_GIVEN" | "APPROVED" =
    row.status === "APPROVED" ? "APPROVED" : hasComments ? "FEEDBACK_GIVEN" : "NEEDS_REVIEW";
  const createdDate = new Date(row.created_at);

  return {
    id: row.id,
    title: row.title,
    accountName: brandName || "Marka",
    handle: (brandName || "marka").toLowerCase().replace(/\s+/g, ""),
    timeLabel: createdDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    fullDateLabel: createdDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    imageUrl: row.imageUrl || "",
    imageIsVideo: row.imageIsVideo ?? false,
    caption: firstPlatform?.caption || row.title,
    status: kanbanStatus,
    statusLabel: kanbanStatus === "APPROVED" ? "Onaylı" : "Askıda olması",
    campaignName: row.campaignName ?? null,
    tags: row.tags,
    platform: firstPlatform?.platform || "instagram",
    comments: row.comments,
    isDemo: false,
    assignedTo: row.assignedTo ?? null,
    realStatus: overallStatus(row),
    platforms: row.content_platforms.map((p) => ({
      platform: p.platform,
      caption: p.caption || "",
      hashtags: p.hashtags ?? undefined,
      scheduledAt: p.scheduled_at,
      permalinkUrl: p.permalink_url ?? null,
    })),
    hook: row.metadata?.hook,
    visualPrompt: row.metadata?.visualPrompt,
    format: row.format,
  };
}

// Low-level mutations, shared so "reject means status back to DRAFT" (etc.)
// is defined exactly once — Gönderiler and Takvim both call these instead of
// each inlining their own supabase.from("content")... call, which is how
// Takvim ended up silently diverging from Gönderiler's behavior before.
export async function approveContentRow(supabase: SupabaseBrowserClient, id: string) {
  return supabase.from("content").update({ status: "APPROVED" }).eq("id", id);
}

export async function rejectContentRow(supabase: SupabaseBrowserClient, id: string) {
  return supabase.from("content").update({ status: "DRAFT" }).eq("id", id);
}

export async function deleteContentRow(supabase: SupabaseBrowserClient, id: string) {
  return supabase.from("content").delete().eq("id", id);
}

export async function setContentApproval(
  supabase: SupabaseBrowserClient,
  id: string,
  nextStatus: "NEEDS_REVIEW" | "APPROVED"
) {
  return supabase.from("content").update({ status: nextStatus }).eq("id", id);
}

export async function setContentTags(supabase: SupabaseBrowserClient, id: string, tags: string[]) {
  return supabase.from("content").update({ tags }).eq("id", id);
}

export async function assignContentRow(supabase: SupabaseBrowserClient, id: string, userId: string | null) {
  return supabase.from("content").update({ assigned_to: userId }).eq("id", id);
}

export async function insertContentComment(
  supabase: SupabaseBrowserClient,
  contentId: string,
  authorId: string | null,
  text: string
) {
  return supabase.from("content_comments").insert({ content_id: contentId, author_id: authorId, body: text });
}

export async function fetchContentRows(supabase: SupabaseBrowserClient, brandId: string): Promise<ContentRow[]> {
  const { data, error } = await supabase
    .from("content")
    .select(
      "id, title, core_idea, category, status, created_at, tags, format, assigned_to, assignee:profiles!assigned_to(full_name, email), campaigns(name), content_media(media(file_url, file_type)), content_platforms(id, platform, caption, hashtags, status, scheduled_at, permalink_url)"
    )
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("İçerikler yüklenemedi:", error.message);
    return [];
  }

  const list = data as unknown as Array<Record<string, unknown>>;
  const ids = list.map((r) => String(r.id));
  const commentsByContent = new Map<string, ApprovalComment[]>();

  if (ids.length > 0) {
    const { data: comments } = await supabase
      .from("content_comments")
      .select("id, content_id, body, created_at, is_external, author:profiles(full_name, email)")
      .in("content_id", ids)
      .order("created_at", { ascending: true });

    for (const c of (comments ?? []) as unknown as Array<{
      id: string;
      content_id: string;
      body: string;
      created_at: string;
      is_external?: boolean;
      author?: { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[];
    }>) {
      const authorRow = Array.isArray(c.author) ? c.author[0] : c.author;
      const authorName = c.is_external ? "Dış Paylaşım" : authorRow?.full_name || authorRow?.email?.split("@")[0] || "Ekip Üyesi";
      const commList = commentsByContent.get(c.content_id) ?? [];
      commList.push({
        id: c.id,
        authorName,
        avatarText: c.is_external ? "🔗" : authorName.charAt(0).toUpperCase(),
        timeAgo: new Date(c.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        text: c.body,
        isExternal: c.is_external,
      });
      commentsByContent.set(c.content_id, commList);
    }
  }

  return list.map((r) => {
    const { hook, visualPrompt } = parseCoreIdea(r.core_idea as string | null);
    const media = firstMedia(r.content_media);
    const campaign = r.campaigns as { name?: string } | { name?: string }[] | null;
    const campaignName = Array.isArray(campaign) ? campaign[0]?.name : campaign?.name;
    const assigneeRow = r.assignee as { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[] | null;
    const assignee = Array.isArray(assigneeRow) ? assigneeRow[0] : assigneeRow;
    const assignedTo =
      r.assigned_to && assignee
        ? { id: String(r.assigned_to), name: assignee.full_name || assignee.email?.split("@")[0] || "Üye" }
        : null;

    return {
      id: String(r.id),
      title: String(r.title || "(Başlıksız)"),
      body: (r.core_idea as string) ?? null,
      status: String(r.status),
      created_at: String(r.created_at),
      imageUrl: media?.url ?? null,
      imageIsVideo: media?.isVideo ?? false,
      metadata: {
        hook: hook ?? undefined,
        visualPrompt: visualPrompt ?? undefined,
        pillar: (r.category as string) ?? undefined,
      },
      tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
      format: String(r.format || "post"),
      content_platforms: (r.content_platforms ?? []) as PlatformRow[],
      campaignName: campaignName ?? null,
      assignedTo,
      comments: commentsByContent.get(String(r.id)) ?? [],
    };
  });
}

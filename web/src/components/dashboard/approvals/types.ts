import type { PlatformName } from "@/components/PlatformIcon";
import type { UIStatus } from "@/lib/contentStatus";

export type ApprovalComment = {
  id: string;
  authorName: string;
  avatarText: string;
  timeAgo: string;
  text: string;
  isCurrentUser?: boolean;
  isExternal?: boolean;
};

export type ApprovalItem = {
  id: string;
  title: string;
  accountName: string;
  handle: string;
  timeLabel: string;
  fullDateLabel: string;
  dateKind?: "scheduled" | "created";
  createdAt?: string;
  imageUrl: string;
  imageIsVideo?: boolean;
  isCarousel?: boolean;
  caption: string;
  status: "NEEDS_REVIEW" | "FEEDBACK_GIVEN" | "APPROVED";
  statusLabel?: string;
  campaignName?: string | null;
  tags: string[];
  platform: PlatformName;
  comments: ApprovalComment[];
  isDemo?: boolean;
  assignedTo?: { id: string; name: string } | null;
  // Populated when this item comes from the merged Gönderiler view (which
  // covers every content status, not just the review/approved slice
  // Onaylarım used to be scoped to) — lets ApprovalDetailModal hide the
  // approve/reject toggle for content that's already past that decision
  // (published, scheduled, still a draft, or failed) instead of always
  // assuming "this is either pending or approved".
  realStatus?: UIStatus;
  // Full per-platform breakdown — Gönderiler's old inspector drawer showed
  // every platform's caption/hashtags, not just one. Optional because
  // Onaylarım's own fetch never populated this and doesn't need to.
  platforms?: {
    id?: string;
    platform: PlatformName;
    status?: UIStatus;
    rawStatus?: string;
    lastError?: string | null;
    caption: string;
    hashtags?: string[];
    scheduledAt?: string | null;
    permalinkUrl?: string | null;
  }[];
  hook?: string;
  visualPrompt?: string;
  format?: string;
};

export type TeamMemberOption = { userId: string; name: string };

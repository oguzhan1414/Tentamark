import type { PlatformName } from "@/components/PlatformIcon";

export type CalendarPost = {
  id: string;
  title: string;
  accountName: string;
  handle: string;
  timeLabel: string;
  date: string; // YYYY-MM-DD
  // Only set for real posts — the content_platforms row this card actually
  // represents, and its full scheduled_at, so drag-and-drop can move just
  // this one platform's schedule (preserving time-of-day) instead of
  // guessing at an id shape or losing the time when the date changes.
  contentPlatformId?: string;
  scheduledAtIso?: string;
  imageUrl: string;
  imageIsVideo?: boolean;
  isCarousel?: boolean;
  caption: string;
  tags: string[];
  // Real brand_strategy pillar name this content was tagged with (see
  // generateWeeklyPack.ts) — used by analyzeContentBalance.ts as its
  // strongest classification signal, not just guessed from title/caption text.
  category?: string | null;
  campaignName?: string | null;
  platform: PlatformName;
  approvalStatus: "PENDING" | "APPROVED" | "FEEDBACK";
  postStatus: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  commentCount: number;
  isDemo?: boolean;
  analytics?: {
    views: string;
    reach: string;
    engagement: string;
    videoPlays?: {
      threeSec: number;
      oneMin: number;
      avgMinutes: string;
    };
    reactions: {
      like: number;
      love: number;
      haha: number;
      wow: number;
      sad: number;
      angry: number;
      total: number;
    };
    comments: number;
    shares: number;
    linkClicks: number;
    otherClicks: number;
  };
};

export type CalendarCampaign = {
  id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
};

export type CalendarNote = {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  color: string;
};

export type CalendarMeeting = {
  id: string;
  title: string;
  time: string;
  date: string;
};

export type CalendarFilterState = {
  searchQuery: string;
  sortBy: "last_created" | "scheduled_date";
  approvalStatus: "all" | "PENDING" | "APPROVED" | "FEEDBACK";
  postStatus: "all" | "DRAFT" | "SCHEDULED" | "PUBLISHED";
  campaign: string; // "all" or a campaign name
  platform: string; // "all" or a PlatformName
};

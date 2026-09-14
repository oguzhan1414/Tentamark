/*
  Resolves the connector interface left open in 12-backend-logic.md §12.16.
  Capability-farkında design (§12.7): platform APIs aren't equal, so instead
  of one fixed method set every provider must fully implement, each provider
  declares what it actually supports and callers check before calling.

  MVP method set only (publish, verifyConnection, refreshToken, getAnalytics,
  validateMedia) — deletePost/getPost/authorize are added when a feature
  actually needs them, per the doc's explicit YAGNI note.
*/

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "threads" | "tiktok" | "pinterest" | "telegram";

export type SocialAccountRecord = {
  id: string;
  brand_id: string;
  platform: SocialPlatform;
  external_account_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  // Free-form per-platform extras. Currently only Pinterest uses this — a
  // Pin has no "post to my profile" concept like Instagram, every Pin
  // requires a board_id, so the board picked/created at connect time
  // (see connections/pinterest/callback) lives here as { defaultBoardId }.
  metadata?: Record<string, unknown> | null;
};

// permalinkUrl is best-effort — cheap for Facebook (derivable from the post
// id directly), needs a follow-up API call for Instagram/Threads (real
// shortcode, not derivable from the numeric media id), and unavailable for
// TikTok until moderation clears. Absent rather than a guessed/broken link.
export type PublishResult = { remoteId: string; permalinkUrl?: string };
export type ConnectionHealth = { healthy: boolean; reason?: string };
export type MediaValidation = { valid: boolean; reason?: string };

// Ordered — position in this array is the carousel/album order for
// providers that support more than one item (currently Instagram and
// Facebook). Providers without carousel capability just read media[0] and
// ignore the rest.
export type PublishMediaItem = { url: string; type: "image" | "video" };

export interface SocialProvider {
  readonly platform: SocialPlatform;

  readonly capabilities: {
    publishing: boolean;
    analytics: boolean;
    deletion: boolean;
    video: boolean;
    image: boolean;
    carousel: boolean;
  };

  /** Publisher never stores tokens itself — the caller passes the freshly
   *  decrypted token in on every call (OpenPost's pattern, §12.7).
   *  media is optional/empty because not every platform needs it (Threads
   *  and Facebook both accept text-only), but Instagram requires at least
   *  one item — its provider throws if the array is empty rather than
   *  silently posting nothing. Order matters: it's the carousel/album order
   *  for providers that declare capabilities.carousel; other providers use
   *  only media[0] and ignore the rest. */
  publish(args: {
    account: SocialAccountRecord;
    freshToken: string;
    caption: string;
    media?: PublishMediaItem[];
  }): Promise<PublishResult>;

  verifyConnection(args: { account: SocialAccountRecord; freshToken: string }): Promise<ConnectionHealth>;

  /** refreshToken is returned when the platform rotates it on every refresh
   *  call (TikTok) — callers must persist it if present. Platforms without a
   *  separate refresh token (Threads, Instagram) simply omit it. */
  refreshToken(args: {
    account: SocialAccountRecord;
    freshToken: string;
  }): Promise<{ token: string; expiresAt: Date | null; refreshToken?: string } | null>;

  getAnalytics(args: { account: SocialAccountRecord; freshToken: string; remoteId: string }): Promise<unknown>;

  validateMedia(args: { mimeType: string; sizeBytes: number }): Promise<MediaValidation>;
}

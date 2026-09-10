/*
  Resolves the connector interface left open in 12-backend-logic.md §12.16.
  Capability-farkında design (§12.7): platform APIs aren't equal, so instead
  of one fixed method set every provider must fully implement, each provider
  declares what it actually supports and callers check before calling.

  MVP method set only (publish, verifyConnection, refreshToken, getAnalytics,
  validateMedia) — deletePost/getPost/authorize are added when a feature
  actually needs them, per the doc's explicit YAGNI note.
*/

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "threads" | "tiktok";

export type SocialAccountRecord = {
  id: string;
  brand_id: string;
  platform: SocialPlatform;
  external_account_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
};

export type PublishResult = { remoteId: string };
export type ConnectionHealth = { healthy: boolean; reason?: string };
export type MediaValidation = { valid: boolean; reason?: string };

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
   *  mediaUrl is optional because not every platform needs it (Threads and
   *  Facebook both accept text-only), but Instagram requires one — its
   *  provider throws if it's missing rather than silently posting nothing. */
  publish(args: {
    account: SocialAccountRecord;
    freshToken: string;
    caption: string;
    mediaUrl?: string;
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

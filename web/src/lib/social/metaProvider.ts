import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

/*
  Facebook Pages only. Instagram used to share this file (same Graph API,
  same app) but moved to its own provider (instagramProvider.ts) once testing
  surfaced that the Page-based flow requires a linked Facebook Page — exactly
  the onboarding friction 02-platform-research.md flagged, and confirmed as a
  real failure (`no-pages`) with an Instagram account that had none.
  "Instagram API with Instagram Login" needs no Page at all.

  Not yet exercised end to end: publish/getAnalytics are real implementations
  against Meta's documented endpoints (02-platform-research.md §2.2), but
  nothing calls them until checklist phase 7 (scheduler) exists. Treat them
  as reviewed-but-untested until then. Also unverified: this app's Login
  Configuration didn't offer pages_read_engagement/pages_manage_posts as
  selectable permissions (see docs/13-build-checklist.md phase 5 notes) —
  publish() below may fail on a permissions error that hasn't been hit yet.
*/

const GRAPH = "https://graph.facebook.com/v21.0";

export const facebookProvider: SocialProvider = {
  platform: "facebook",

  capabilities: {
    publishing: true,
    analytics: true,
    deletion: true,
    video: true,
    image: true,
    carousel: false,
  },

  async verifyConnection({ freshToken }) {
    const res = await fetch(`${GRAPH}/me?access_token=${encodeURIComponent(freshToken)}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { healthy: false, reason: body?.error?.message ?? `HTTP ${res.status}` } satisfies ConnectionHealth;
    }
    return { healthy: true };
  },

  async refreshToken() {
    // Page tokens derived from a long-lived user token don't expire on a
    // fixed schedule the way OAuth refresh tokens do elsewhere — they stay
    // valid until the user revokes access or changes their password. There
    // is no refresh call; token health is checked via verifyConnection
    // instead (12-backend-logic.md §12.6, job 3).
    return null;
  },

  async publish({ account, freshToken, caption, mediaUrl, mediaType }): Promise<PublishResult> {
    // Photos and videos are entirely different endpoints on the Graph API,
    // not a param on /feed — posting mediaUrl there silently gets dropped,
    // which is exactly how this shipped as a text-only publisher despite
    // declaring image/video capability above.
    if (mediaUrl && mediaType === "video") {
      const res = await fetch(`${GRAPH}/${account.external_account_id}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ file_url: mediaUrl, description: caption, access_token: freshToken }),
      });
      const json = await res.json();
      if (!res.ok || !json.id) {
        throw new Error(json?.error?.message ?? `Facebook video publish başarısız (HTTP ${res.status})`);
      }
      return {
        remoteId: json.id as string,
        permalinkUrl: `https://www.facebook.com/${account.external_account_id}/videos/${json.id}`,
      };
    }

    if (mediaUrl) {
      const res = await fetch(`${GRAPH}/${account.external_account_id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url: mediaUrl, caption, access_token: freshToken }),
      });
      const json = await res.json();
      if (!res.ok || !(json.post_id || json.id)) {
        throw new Error(json?.error?.message ?? `Facebook fotoğraf publish başarısız (HTTP ${res.status})`);
      }
      const remoteId = (json.post_id ?? json.id) as string;
      return { remoteId, permalinkUrl: `https://www.facebook.com/${remoteId}` };
    }

    const res = await fetch(`${GRAPH}/${account.external_account_id}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ message: caption, access_token: freshToken }),
    });
    const json = await res.json();
    if (!res.ok || !json.id) {
      throw new Error(json?.error?.message ?? `Facebook publish başarısız (HTTP ${res.status})`);
    }
    return { remoteId: json.id as string, permalinkUrl: `https://www.facebook.com/${json.id}` };
  },

  async getAnalytics({ freshToken, remoteId }) {
    const res = await fetch(
      `${GRAPH}/${remoteId}/insights?metric=post_impressions,post_engaged_users&access_token=${encodeURIComponent(freshToken)}`
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message ?? `Insights alınamadı (HTTP ${res.status})`);
    }
    return json;
  },

  async validateMedia({ mimeType, sizeBytes }): Promise<MediaValidation> {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(mimeType)) return { valid: false, reason: `Desteklenmeyen dosya türü: ${mimeType}` };
    if (sizeBytes > 8 * 1024 * 1024) return { valid: false, reason: "Görsel 8MB sınırını aşıyor" };
    return { valid: true };
  },
};

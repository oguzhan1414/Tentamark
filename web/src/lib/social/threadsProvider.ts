import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

/*
  Threads has its own API entirely, verified against Meta's current Threads
  docs rather than assumed from the Graph API shape: separate OAuth host
  (threads.net / graph.threads.net, not facebook.com), separate app
  credentials (THREADS_APP_ID/SECRET, not META_APP_ID/SECRET), and a token
  that genuinely expires (60 days, refreshable) — unlike a Meta Page token,
  which doesn't expire on a schedule. Enabled per user's explicit choice in
  the Meta app wizard; 02-platform-research.md §2.7 had deferred this to
  V2/V3, which is worth knowing if the "why is Threads here" question comes
  up again later.
*/

const GRAPH = "https://graph.threads.net/v1.0";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyConnection(freshToken: string): Promise<ConnectionHealth> {
  const res = await fetch(`${GRAPH}/me?fields=id&access_token=${encodeURIComponent(freshToken)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { healthy: false, reason: body?.error?.message ?? `HTTP ${res.status}` };
  }
  return { healthy: true };
}

export const threadsProvider: SocialProvider = {
  platform: "threads",

  capabilities: {
    publishing: true, // Threads supports text-only posts — no media pipeline needed, unlike Instagram
    analytics: true,
    deletion: false, // no delete-post endpoint in the current Threads API docs
    video: true,
    image: true,
    carousel: false,
  },

  async verifyConnection({ freshToken }) {
    return verifyConnection(freshToken);
  },

  async refreshToken({ freshToken }) {
    // Real, unlike Meta's: Threads long-lived tokens expire in 60 days and
    // must be refreshed while at least 24h old and not yet expired, or the
    // connection dies permanently (12-backend-logic.md §12.6 job 3 territory).
    const res = await fetch(
      `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(freshToken)}`
    );
    const json = await res.json();
    if (!res.ok || !json.access_token) return null;
    const expiresAt = json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null;
    return { token: json.access_token as string, expiresAt };
  },

  async publish({ account, freshToken, caption }): Promise<PublishResult> {
    const createRes = await fetch(`${GRAPH}/${account.external_account_id}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ media_type: "TEXT", text: caption, access_token: freshToken }),
    });
    const createJson = await createRes.json();
    if (!createRes.ok || !createJson.id) {
      throw new Error(createJson?.error?.message ?? `Threads container oluşturulamadı (HTTP ${createRes.status})`);
    }

    // Meta's own docs recommend ~30s before publishing so the container
    // finishes server-side processing. Fine here: this runs inside the
    // scheduler's background job (checklist phase 7), never a live request.
    await sleep(30_000);

    const publishRes = await fetch(`${GRAPH}/${account.external_account_id}/threads_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: createJson.id, access_token: freshToken }),
    });
    const publishJson = await publishRes.json();
    if (!publishRes.ok || !publishJson.id) {
      throw new Error(publishJson?.error?.message ?? `Threads publish başarısız (HTTP ${publishRes.status})`);
    }
    return { remoteId: publishJson.id as string };
  },

  async getAnalytics({ freshToken, remoteId }) {
    const res = await fetch(
      `${GRAPH}/${remoteId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${encodeURIComponent(freshToken)}`
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message ?? `Threads insights alınamadı (HTTP ${res.status})`);
    }
    return json;
  },

  async validateMedia({ mimeType, sizeBytes }): Promise<MediaValidation> {
    // Text-only posts don't touch this path; kept for when image/video support lands.
    const allowed = ["image/jpeg", "image/png", "video/mp4"];
    if (!allowed.includes(mimeType)) return { valid: false, reason: `Desteklenmeyen dosya türü: ${mimeType}` };
    if (sizeBytes > 8 * 1024 * 1024) return { valid: false, reason: "Dosya 8MB sınırını aşıyor" };
    return { valid: true };
  },
};

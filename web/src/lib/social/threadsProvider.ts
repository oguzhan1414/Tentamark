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

// A blind 30s sleep here previously left a real publish stuck mid-flight
// (content_platforms parked at PUBLISHING forever, no retry path) — almost
// certainly the serverless function getting killed for running too long.
// Polling the container's own status is both what Meta's docs actually
// recommend and finishes early for text/image instead of always waiting
// the full 30s.
//
// The container's real field is `status` (FINISHED/IN_PROGRESS/ERROR/
// EXPIRED/PUBLISHED) — `status_code` doesn't exist on this object at all.
// Requesting a nonexistent field makes the WHOLE call fail (verified live:
// `{"error":{"message":"Tried accessing nonexisting field (status_code)"}}`,
// no `status` back either), so the very first version of this function
// always polled a response with neither field present and burned the full
// timeout on every single publish, image or not.
async function waitForThreadsContainer(id: string, token: string): Promise<void> {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const res = await fetch(`${GRAPH}/${id}?fields=status,error_message&access_token=${encodeURIComponent(token)}`);
    const json = await res.json();
    if (json.status === "FINISHED") return;
    if (json.status === "ERROR" || json.status === "EXPIRED") {
      throw new Error(`Threads içeriği işlenirken hata oluştu: ${json.error_message ?? json.status}`);
    }
    await sleep(3_000);
  }
  throw new Error("Threads içeriği 45 saniye içinde hazır olmadı.");
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
    publishing: true, // Threads supports text-only posts, but also image/video when mediaUrl is given
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

  async publish({ account, freshToken, caption, media }): Promise<PublishResult> {
    // Threads doesn't support carousels yet (capabilities.carousel: false
    // above) — only the first item is ever used. A multi-image post that
    // also targets Threads still publishes fine here, just with one image.
    const first = media?.[0];
    const containerParams: Record<string, string> = { text: caption, access_token: freshToken };
    if (first) {
      containerParams.media_type = first.type === "video" ? "VIDEO" : "IMAGE";
      containerParams[first.type === "video" ? "video_url" : "image_url"] = first.url;
    } else {
      containerParams.media_type = "TEXT";
    }

    const createRes = await fetch(`${GRAPH}/${account.external_account_id}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(containerParams),
    });
    const createJson = await createRes.json();
    if (!createRes.ok || !createJson.id) {
      throw new Error(createJson?.error?.message ?? `Threads container oluşturulamadı (HTTP ${createRes.status})`);
    }

    await waitForThreadsContainer(createJson.id as string, freshToken);

    const publishRes = await fetch(`${GRAPH}/${account.external_account_id}/threads_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: createJson.id, access_token: freshToken }),
    });
    const publishJson = await publishRes.json();
    if (!publishRes.ok || !publishJson.id) {
      throw new Error(publishJson?.error?.message ?? `Threads publish başarısız (HTTP ${publishRes.status})`);
    }

    const remoteId = publishJson.id as string;
    // The numeric media id isn't the shortcode threads.net URLs use — a
    // real permalink needs this follow-up call. Best-effort: a failure here
    // shouldn't fail a publish that already succeeded.
    let permalinkUrl: string | undefined;
    try {
      const permalinkRes = await fetch(
        `${GRAPH}/${remoteId}?fields=permalink&access_token=${encodeURIComponent(freshToken)}`
      );
      const permalinkJson = await permalinkRes.json();
      if (permalinkRes.ok && permalinkJson.permalink) permalinkUrl = permalinkJson.permalink as string;
    } catch {
      // best-effort — publish already succeeded, no permalink is not fatal
    }

    return { remoteId, permalinkUrl };
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

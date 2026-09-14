import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

/*
  "Instagram API with Instagram Login" — a distinct product from the Page-
  based flow in metaProvider.ts. Verified against Meta's current docs, not
  assumed: no linked Facebook Page required, its own app credentials
  (INSTAGRAM_APP_ID/SECRET, separate from META_APP_ID/SECRET), its own OAuth
  host (instagram.com, not facebook.com), and — critically — its own content
  API host (graph.instagram.com, not graph.facebook.com). A token from this
  login flow does not work against graph.facebook.com endpoints.

  Adopted instead of the Page-based flow specifically because it drops the
  "connect a Facebook Page first" requirement that 02-platform-research.md
  already flagged as onboarding friction — confirmed as real friction when
  testing (`no-pages` error) with an Instagram account that had no Page.
*/

const GRAPH = "https://graph.instagram.com";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// publish() used to call media_publish immediately after creating the
// container — real testing hit "Media ID is not available" on media_publish
// even though a status check moments later already showed FINISHED, i.e. a
// genuine create-then-immediately-publish race against Meta's backend.
// status_code (unlike on Threads' container object, where this exact field
// name doesn't exist — verified live) is real here, confirmed against a
// live test container.
async function waitForInstagramContainer(id: string, token: string): Promise<void> {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const res = await fetch(`${GRAPH}/v21.0/${id}?fields=status_code&access_token=${encodeURIComponent(token)}`);
    const json = await res.json();
    if (json.status_code === "FINISHED") return;
    if (json.status_code === "ERROR" || json.status_code === "EXPIRED") {
      throw new Error(`Instagram içeriği işlenirken hata oluştu (${json.status_code}).`);
    }
    await sleep(2_000);
  }
  throw new Error("Instagram içeriği 45 saniye içinde hazır olmadı.");
}

async function createContainer(accountId: string, token: string, params: Record<string, string>): Promise<string> {
  const res = await fetch(`${GRAPH}/v21.0/${accountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...params, access_token: token }),
  });
  const json = await res.json();
  if (!res.ok || !json.id) {
    throw new Error(json?.error?.message ?? `Instagram container oluşturulamadı (HTTP ${res.status})`);
  }
  return json.id as string;
}

async function verifyConnection(freshToken: string): Promise<ConnectionHealth> {
  const res = await fetch(`${GRAPH}/v21.0/me?fields=id&access_token=${encodeURIComponent(freshToken)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { healthy: false, reason: body?.error?.message ?? `HTTP ${res.status}` };
  }
  return { healthy: true };
}

export const instagramProvider: SocialProvider = {
  platform: "instagram",

  capabilities: {
    publishing: true, // real API support confirmed; blocked in practice only by
    // our own missing media hosting (12-backend-logic.md §12.8, still open)
    analytics: true,
    deletion: false,
    video: true,
    image: true,
    carousel: true,
  },

  async verifyConnection({ freshToken }) {
    return verifyConnection(freshToken);
  },

  async refreshToken({ freshToken }) {
    // Like Threads, an Instagram Login token genuinely expires — 60 days,
    // refreshable while at least 24h old and not yet expired.
    const res = await fetch(
      `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(freshToken)}`
    );
    const json = await res.json();
    if (!res.ok || !json.access_token) return null;
    const expiresAt = json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null;
    return { token: json.access_token as string, expiresAt };
  },

  async publish({ account, freshToken, caption, media }): Promise<PublishResult> {
    if (!media || media.length === 0) {
      throw new Error(
        "Instagram bir medya URL'i olmadan paylaşım yapamaz — metin yeterli değil. content_media/Storage hattı henüz yok (12-backend-logic.md §12.8)."
      );
    }

    let creationId: string;

    if (media.length === 1) {
      creationId = await createContainer(account.external_account_id, freshToken, {
        image_url: media[0].url,
        caption,
      });
      await waitForInstagramContainer(creationId, freshToken);
    } else {
      // Carousel: Meta requires 2-10 children, each created WITHOUT its own
      // caption (only the parent CAROUSEL container carries one), then a
      // parent container referencing all child ids, and that parent needs
      // its own FINISHED wait too before media_publish will accept it.
      // ComposeForm only ever builds a carousel out of images (validated
      // client-side, mixing in a video is blocked before this is reached),
      // but the video branch below is real Graph API behavior, not a guess,
      // kept here so a future caller doesn't get a silently-wrong
      // image_url=<video file> request instead of a clear path.
      if (media.length > 10) {
        throw new Error("Instagram carousel en fazla 10 medya öğesi destekliyor.");
      }
      const childIds = await Promise.all(
        media.map(async (item) => {
          const id = await createContainer(account.external_account_id, freshToken, {
            is_carousel_item: "true",
            ...(item.type === "video" ? { media_type: "VIDEO", video_url: item.url } : { image_url: item.url }),
          });
          await waitForInstagramContainer(id, freshToken);
          return id;
        })
      );

      creationId = await createContainer(account.external_account_id, freshToken, {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption,
      });
      await waitForInstagramContainer(creationId, freshToken);
    }

    const publishRes = await fetch(`${GRAPH}/v21.0/${account.external_account_id}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: creationId, access_token: freshToken }),
    });
    const publishJson = await publishRes.json();
    if (!publishRes.ok || !publishJson.id) {
      throw new Error(publishJson?.error?.message ?? `Instagram publish başarısız (HTTP ${publishRes.status})`);
    }

    const remoteId = publishJson.id as string;
    // Same reasoning as Threads: the numeric media id isn't the shortcode
    // instagram.com URLs use. Best-effort — a failure here shouldn't fail a
    // publish that already succeeded.
    let permalinkUrl: string | undefined;
    try {
      const permalinkRes = await fetch(
        `${GRAPH}/v21.0/${remoteId}?fields=permalink&access_token=${encodeURIComponent(freshToken)}`
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
      `${GRAPH}/v21.0/${remoteId}/insights?metric=impressions,reach,engagement&access_token=${encodeURIComponent(freshToken)}`
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message ?? `Instagram insights alınamadı (HTTP ${res.status})`);
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

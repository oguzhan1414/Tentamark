import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

/*
  Pinterest API v5. Two real differences from every other provider here:

  1. OAuth2 token exchange uses HTTP Basic Auth (Authorization: Basic
     base64(client_id:client_secret)) instead of client_id/secret in the
     form body — Meta/Threads/TikTok all do the latter, Pinterest's v5 docs
     are explicit about Basic Auth being required here. See
     connections/pinterest/start and callback for the matching PKCE dance
     (code_challenge/code_verifier) Pinterest's v5 authorize endpoint also
     requires, unlike the others.

  2. A Pin has no "post to my profile" concept — every Pin belongs to a
     board, so the board id isn't something publish() can invent from
     nothing. account.metadata.defaultBoardId (set once, at connect time —
     see connections/pinterest/callback, which reuses an existing board or
     creates one) is what publish() reads instead of a hardcoded id.

  Deliberately NOT implemented: video Pins. Pinterest's documented video
  flow is a real upload (register a media_id, multipart-POST the file bytes
  to a returned URL, poll until "succeeded", then reference media_id in the
  Pin) — a materially different shape than every other provider's "just
  hand over a hosted URL" pattern, and one we can't live-verify without a
  real Pinterest app (unlike the image_url path below, which is Pinterest's
  oldest, most stable pin-creation shape). Pinterest is image-first anyway —
  ComposeForm's media picker is already images-only outside the TikTok
  video slot, so this only matters for the rare "drag an existing video
  from Calendar's panel" edge case. publish() throws a clear, honest error
  instead of shipping a guessed multi-step upload that could silently be
  wrong in a field name, the exact class of bug this session has hit before
  (Threads' status_code, Instagram's media_publish race).
*/

const API = "https://api.pinterest.com/v5";

function basicAuthHeader(): string | null {
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function verifyConnection(freshToken: string): Promise<ConnectionHealth> {
  const res = await fetch(`${API}/user_account`, { headers: { Authorization: `Bearer ${freshToken}` } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { healthy: false, reason: body?.message ?? `HTTP ${res.status}` };
  }
  return { healthy: true };
}

export const pinterestProvider: SocialProvider = {
  platform: "pinterest",

  capabilities: {
    publishing: true,
    analytics: true,
    deletion: true,
    video: false, // see file header — deliberately not implemented yet
    image: true,
    carousel: false, // one image per Pin; Pinterest's own multi-image "Idea Pin" format is a separate, unbuilt thing
  },

  async verifyConnection({ freshToken }) {
    return verifyConnection(freshToken);
  },

  async refreshToken({ freshToken }) {
    const auth = basicAuthHeader();
    if (!auth) return null;

    const res = await fetch(`${API}/oauth/token`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: freshToken }),
    });
    const json = await res.json();
    if (!res.ok || !json.access_token) return null;

    return {
      token: json.access_token as string,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null,
      // Undocumented whether Pinterest rotates this on every refresh (unlike
      // TikTok, which explicitly does) — persist a new one if given, keep
      // the existing one otherwise, same defensive shape as TikTok's.
      refreshToken: json.refresh_token as string | undefined,
    };
  },

  async publish({ account, caption, freshToken, media }): Promise<PublishResult> {
    if (!media || media.length === 0) {
      throw new Error("Pinterest bir görsel olmadan Pin oluşturamaz — metin yeterli değil.");
    }
    const item = media[0];
    if (item.type === "video") {
      throw new Error("Pinterest video Pin desteği bu sürümde yok — şimdilik yalnızca görsel Pin paylaşabilirsin.");
    }

    const boardId = account.metadata?.defaultBoardId as string | undefined;
    if (!boardId) {
      throw new Error("Bu Pinterest hesabı için bir pano (board) bulunamadı — bağlantıyı yeniden kurman gerekebilir.");
    }

    // Pins have a short title (Pinterest truncates well past this in the
    // UI anyway) plus a longer description — caption is the one text field
    // ComposeForm produces, so it becomes the description in full and a
    // trimmed title.
    const title = caption.trim().slice(0, 100);

    const res = await fetch(`${API}/pins`, {
      method: "POST",
      headers: { Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        board_id: boardId,
        title,
        description: caption,
        media_source: { source_type: "image_url", url: item.url },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.id) {
      throw new Error(json?.message ?? `Pinterest Pin oluşturulamadı (HTTP ${res.status})`);
    }

    return { remoteId: json.id as string, permalinkUrl: typeof json.link === "string" ? json.link : undefined };
  },

  async getAnalytics({ freshToken, remoteId }) {
    // Pin Analytics requires an explicit date range — last 30 days, same
    // window Pinterest's own dashboard defaults to.
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const res = await fetch(
      `${API}/pins/${remoteId}/analytics?start_date=${fmt(start)}&end_date=${fmt(end)}&metric_types=IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE`,
      { headers: { Authorization: `Bearer ${freshToken}` } }
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.message ?? `Pinterest analitiği alınamadı (HTTP ${res.status})`);
    }
    return json;
  },

  async validateMedia({ mimeType, sizeBytes }): Promise<MediaValidation> {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(mimeType)) return { valid: false, reason: `Desteklenmeyen dosya türü: ${mimeType}` };
    // Pinterest documents a 20MB cap on standard image Pins.
    if (sizeBytes > 20 * 1024 * 1024) return { valid: false, reason: "Görsel 20MB sınırını aşıyor" };
    return { valid: true };
  },
};

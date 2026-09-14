import { decryptToken } from "../crypto/tokenCipher";
import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

/*
  YouTube Data API v3. The one real structural difference from every other
  provider here: every other platform accepts a hosted media URL directly
  (image_url/video_url params they fetch themselves) — YouTube's upload
  endpoint wants the actual video bytes streamed to it via a two-step
  resumable upload (init session -> PUT the bytes), the same shape
  tiktokProvider.ts already uses for exactly the same reason (Direct Post
  has no "just give me a URL" option either). That means downloading our
  own hosted video into memory first — see validateMedia's size cap, same
  "single chunk fits in a serverless function's memory" reasoning as
  TikTok's.

  Deliberately NOT implemented: image-only posts (YouTube Community posts
  are a different, much less accessible API) and YouTube Analytics API
  (a separate OAuth scope) — getAnalytics here uses videos.list's own
  statistics field instead, real numbers, just not the full breakdown.
*/

const API = "https://www.googleapis.com/youtube/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/youtube/v3/videos";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

async function verifyConnection(freshToken: string): Promise<ConnectionHealth> {
  const res = await fetch(`${API}/channels?part=id&mine=true`, {
    headers: { Authorization: `Bearer ${freshToken}` },
  });
  const json = await res.json();
  if (!res.ok) return { healthy: false, reason: json?.error?.message ?? `HTTP ${res.status}` };
  if (!json.items || json.items.length === 0) {
    return { healthy: false, reason: "Bu Google hesabına bağlı bir YouTube kanalı yok." };
  }
  return { healthy: true };
}

export const youtubeProvider: SocialProvider = {
  platform: "youtube",

  capabilities: {
    publishing: true,
    analytics: true, // basic view/like/comment counts via videos.list, not the separate YouTube Analytics API
    deletion: true,
    video: true,
    image: false, // Community posts (image-only) are a different, unimplemented API
    carousel: false,
  },

  async verifyConnection({ freshToken }) {
    return verifyConnection(freshToken);
  },

  async refreshToken({ account }) {
    // freshToken (the caller's decrypted access_token_encrypted) isn't what
    // a refresh call needs — same shape as tiktokProvider's refreshToken():
    // decrypt the REFRESH token straight from the account record here.
    if (!account.refresh_token_encrypted) return null;
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const refreshTokenPlain = decryptToken(account.refresh_token_encrypted, account.brand_id);
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshTokenPlain,
        grant_type: "refresh_token",
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.access_token) return null;

    // Google doesn't rotate the refresh token on a normal refresh call —
    // omitting it here means the caller keeps whatever it already stored.
    return {
      token: json.access_token as string,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null,
    };
  },

  async publish({ freshToken, caption, media }): Promise<PublishResult> {
    if (!media || media.length === 0) {
      throw new Error("YouTube bir video olmadan paylaşım yapamaz.");
    }
    const item = media[0];
    if (item.type !== "video") {
      throw new Error("YouTube yalnızca video kabul ediyor — fotoğrafla paylaşım yapamıyor.");
    }

    const videoRes = await fetch(item.url);
    if (!videoRes.ok) throw new Error(`Video indirilemedi (HTTP ${videoRes.status})`);
    const videoBuf = Buffer.from(await videoRes.arrayBuffer());

    // caption doubles as both title and description — YouTube's title cap
    // (100 chars) is far tighter than a real caption, so it's truncated to
    // the first line (or first 100 chars) while the description carries
    // the caption in full.
    const firstLine = caption.split("\n")[0]?.trim() || caption.trim();
    const title = firstLine.slice(0, 100);

    const initRes = await fetch(`${UPLOAD_API}?uploadType=resumable&part=snippet,status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${freshToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": String(videoBuf.length),
      },
      body: JSON.stringify({
        snippet: { title, description: caption, categoryId: "22" }, // 22 = People & Blogs, no category picker exists yet
        status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
      }),
    });
    if (!initRes.ok) {
      const errJson = await initRes.json().catch(() => null);
      throw new Error(errJson?.error?.message ?? `YouTube upload oturumu açılamadı (HTTP ${initRes.status})`);
    }
    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) throw new Error("YouTube upload oturumu bir adres döndürmedi.");

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "video/mp4", "Content-Length": String(videoBuf.length) },
      body: videoBuf,
    });
    const uploadJson = await uploadRes.json().catch(() => null);
    if (!uploadRes.ok || !uploadJson?.id) {
      throw new Error(uploadJson?.error?.message ?? `YouTube video yüklenemedi (HTTP ${uploadRes.status})`);
    }

    return { remoteId: uploadJson.id as string, permalinkUrl: `https://www.youtube.com/watch?v=${uploadJson.id}` };
  },

  async getAnalytics({ freshToken, remoteId }) {
    const res = await fetch(`${API}/videos?part=statistics&id=${remoteId}`, {
      headers: { Authorization: `Bearer ${freshToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? `YouTube istatistikleri alınamadı (HTTP ${res.status})`);
    return json.items?.[0]?.statistics ?? {};
  },

  async validateMedia({ mimeType, sizeBytes }): Promise<MediaValidation> {
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(mimeType)) return { valid: false, reason: `Desteklenmeyen dosya türü: ${mimeType}` };
    // YouTube itself allows far larger files — this cap exists because the
    // whole video gets buffered in memory for the re-upload (no chunked
    // streaming implemented), same reasoning as TikTok's 128MB cap.
    if (sizeBytes > 128 * 1024 * 1024) return { valid: false, reason: "Video 128MB sınırını aşıyor" };
    return { valid: true };
  },
};

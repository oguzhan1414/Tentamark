import { decryptToken } from "../crypto/tokenCipher";
import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

const API = "https://open.tiktokapis.com/v2";

type TikTokError = { code?: string; message?: string };

async function verifyConnection(freshToken: string): Promise<ConnectionHealth> {
  const res = await fetch(`${API}/user/info/?fields=open_id,display_name`, {
    headers: { Authorization: `Bearer ${freshToken}` },
  });
  const json = await res.json();
  const error = json?.error as TikTokError | undefined;
  if (!res.ok || (error && error.code !== "ok")) {
    return { healthy: false, reason: error?.message ?? `HTTP ${res.status}` };
  }
  return { healthy: true };
}

export const tiktokProvider: SocialProvider = {
  platform: "tiktok",

  capabilities: {
    publishing: true,
    analytics: false,
    deletion: false,
    video: true,
    image: false,
    carousel: false,
  },

  async verifyConnection({ freshToken }) {
    return verifyConnection(freshToken);
  },

  async refreshToken({ account }) {
    if (!account.refresh_token_encrypted) return null;
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    if (!clientKey || !clientSecret) return null;

    const refreshTokenPlain = decryptToken(account.refresh_token_encrypted, account.brand_id);
    const res = await fetch(`${API}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshTokenPlain,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.access_token) return null;

    return {
      token: json.access_token as string,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : null,
      // TikTok rotates the refresh token on every use — always persist the new one.
      refreshToken: json.refresh_token as string | undefined,
    };
  },

  async publish({ freshToken, caption, mediaUrl }): Promise<PublishResult> {
    if (!mediaUrl) {
      throw new Error("TikTok bir video URL'i olmadan paylaşım yapamaz.");
    }

    // Mandatory before every post — TikTok documents skipping this as a
    // reliable audit failure, not just a caching nicety.
    const creatorRes = await fetch(`${API}/post/publish/creator_info/query/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json; charset=UTF-8" },
      body: "{}",
    });
    const creator = await creatorRes.json();
    if (!creatorRes.ok || !creator.data) {
      throw new Error(creator?.error?.message ?? `TikTok creator info alınamadı (HTTP ${creatorRes.status})`);
    }

    const privacyOptions: string[] = creator.data.privacy_level_options ?? [];
    // Pre-audit apps are forced to SELF_ONLY regardless of what's requested —
    // requesting it explicitly (when offered) keeps the request honest about that.
    const privacyLevel = privacyOptions.includes("SELF_ONLY") ? "SELF_ONLY" : privacyOptions[0];
    if (!privacyLevel) {
      throw new Error("TikTok bu hesap için hiçbir gizlilik seviyesi sunmadı.");
    }

    const videoRes = await fetch(mediaUrl);
    if (!videoRes.ok) throw new Error(`Video indirilemedi (HTTP ${videoRes.status})`);
    const videoBuf = Buffer.from(await videoRes.arrayBuffer());

    const initRes = await fetch(`${API}/post/publish/video/init/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        post_info: { title: caption, privacy_level: privacyLevel },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoBuf.length,
          chunk_size: videoBuf.length,
          total_chunk_count: 1,
        },
      }),
    });
    const init = await initRes.json();
    if (!initRes.ok || !init.data?.publish_id || !init.data?.upload_url) {
      throw new Error(init?.error?.message ?? `TikTok video init başarısız (HTTP ${initRes.status})`);
    }

    const uploadRes = await fetch(init.data.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(videoBuf.length),
        "Content-Range": `bytes 0-${videoBuf.length - 1}/${videoBuf.length}`,
      },
      body: videoBuf,
    });
    if (!uploadRes.ok) {
      throw new Error(`TikTok video yüklenemedi (HTTP ${uploadRes.status})`);
    }

    // status/fetch can legitimately take hours for moderation — don't block
    // publish() on it. remoteId is the publish_id; final status is a
    // separate, later check (not built in this pass).
    return { remoteId: init.data.publish_id as string };
  },

  async getAnalytics() {
    throw new Error("TikTok analitiği henüz desteklenmiyor — ayrı bir API onayı gerekiyor.");
  },

  async validateMedia({ mimeType, sizeBytes }): Promise<MediaValidation> {
    const allowed = ["video/mp4", "video/webm"];
    if (!allowed.includes(mimeType)) return { valid: false, reason: `Desteklenmeyen dosya türü: ${mimeType}` };
    // 128MB is the largest size TikTok allows as a single "final" chunk —
    // true multi-chunk upload (up to their 4GB cap) is future work.
    if (sizeBytes > 128 * 1024 * 1024) return { valid: false, reason: "Video 128MB sınırını aşıyor" };
    return { valid: true };
  },
};

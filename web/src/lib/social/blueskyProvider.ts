import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

/*
  Bluesky (AT Protocol) has no OAuth here either — same shape as Telegram:
  a plain credential (an "app password", generated in Bluesky's own account
  settings, deliberately separate from the real account password and
  independently revocable) instead of an authorize redirect. See
  connections/bluesky/connect for the form-based connect flow.

  freshToken carries the decrypted app password, not a session token —
  AAT Protocol sessions (accessJwt) expire in a couple of hours and juggling
  refresh would add real complexity for no benefit, since app passwords are
  explicitly designed to be reused like this. Every publish just logs in
  fresh via createSession right before it's needed.

  Only supports accounts on the default bsky.social PDS (the overwhelming
  majority of real users, including everyone who signs up at bsky.app) —
  a self-hosted PDS would need resolving the account's real host from its
  DID document first, not built here.
*/

const HOST = "https://bsky.social";

type Session = { accessJwt: string; did: string; handle: string };
type Blob = { $type: "blob"; ref: { $link: string }; mimeType: string; size: number };

async function createSession(identifier: string, password: string): Promise<Session> {
  const res = await fetch(`${HOST}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.accessJwt) {
    throw new Error(json?.message ?? "Bluesky oturumu açılamadı — handle veya app password hatalı olabilir.");
  }
  return { accessJwt: json.accessJwt, did: json.did, handle: json.handle };
}

async function uploadBlob(accessJwt: string, bytes: ArrayBuffer, mimeType: string): Promise<Blob> {
  const res = await fetch(`${HOST}/xrpc/com.atproto.repo.uploadBlob`, {
    method: "POST",
    headers: { "Content-Type": mimeType, Authorization: `Bearer ${accessJwt}` },
    body: bytes,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.blob) {
    throw new Error(json?.message ?? "Görsel Bluesky'a yüklenemedi.");
  }
  return json.blob as Blob;
}

async function createPostRecord(
  session: Session,
  record: Record<string, unknown>
): Promise<{ uri: string; cid: string }> {
  const res = await fetch(`${HOST}/xrpc/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessJwt}` },
    body: JSON.stringify({ repo: session.did, collection: "app.bsky.feed.post", record }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.uri) {
    throw new Error(json?.message ?? "Bluesky gönderisi paylaşılamadı.");
  }
  return { uri: json.uri, cid: json.cid };
}

// at://<did>/app.bsky.feed.post/<rkey> — the rkey is the last path segment,
// and it's what the real bsky.app permalink is keyed on (not the DID-scoped
// at:// URI itself, which only resolves inside AT Protocol clients).
function permalinkFrom(uri: string, handle: string): string | undefined {
  const rkey = uri.split("/").pop();
  return rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined;
}

export const blueskyProvider: SocialProvider = {
  platform: "bluesky",

  capabilities: {
    publishing: true,
    analytics: false, // no stable, simple per-post metrics endpoint for third-party apps
    deletion: true,
    video: false, // AT Protocol video posting needs a separate, more involved upload flow — not built here
    image: true,
    carousel: true, // up to 4 images in one post
  },

  async verifyConnection({ account, freshToken }): Promise<ConnectionHealth> {
    const handle = account.metadata?.handle as string | undefined;
    if (!handle) return { healthy: false, reason: "Hesap bilgisi eksik (handle)." };
    try {
      await createSession(handle, freshToken);
      return { healthy: true };
    } catch (err) {
      return { healthy: false, reason: err instanceof Error ? err.message : "Bağlantı doğrulanamadı." };
    }
  },

  async refreshToken() {
    // App passwords don't expire or rotate — same shape as Telegram's bot
    // token and Facebook's Page token.
    return null;
  },

  async publish({ account, freshToken, caption, media }): Promise<PublishResult> {
    const handle = account.metadata?.handle as string | undefined;
    if (!handle) throw new Error("Bluesky hesap bilgisi eksik (handle).");

    const session = await createSession(handle, freshToken);

    const images = media?.filter((m) => m.type === "image").slice(0, 4) ?? [];
    let embed: Record<string, unknown> | undefined;
    if (images.length > 0) {
      const blobs = await Promise.all(
        images.map(async (item) => {
          const fileRes = await fetch(item.url);
          if (!fileRes.ok) throw new Error("Görsel indirilemedi (Bluesky'a yüklemek için).");
          const bytes = await fileRes.arrayBuffer();
          const mimeType = fileRes.headers.get("content-type") || "image/jpeg";
          const blob = await uploadBlob(session.accessJwt, bytes, mimeType);
          return { image: blob, alt: "" };
        })
      );
      embed = { $type: "app.bsky.embed.images", images: blobs };
    }

    const record = {
      $type: "app.bsky.feed.post",
      text: caption,
      createdAt: new Date().toISOString(),
      ...(embed ? { embed } : {}),
    };

    const result = await createPostRecord(session, record);
    return { remoteId: result.uri, permalinkUrl: permalinkFrom(result.uri, session.handle) };
  },

  async getAnalytics() {
    throw new Error("Bluesky analitiği desteklenmiyor.");
  },

  async validateMedia({ mimeType, sizeBytes }): Promise<MediaValidation> {
    if (!mimeType.startsWith("image/")) return { valid: false, reason: "Bluesky sadece görsel destekliyor." };
    if (sizeBytes > 2_000_000) return { valid: false, reason: "Görsel 2MB sınırını aşıyor." };
    return { valid: true };
  },
};

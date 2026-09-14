import type { ConnectionHealth, MediaValidation, PublishResult, SocialProvider } from "./types";

/*
  Telegram has no OAuth at all — unlike every other provider here, there's
  no authorize redirect or refreshable token. The "token" is a bot token
  created once via @BotFather (see connections/telegram/connect, a plain
  form-based connect flow instead of a start/callback pair), and identity
  is the channel the bot was added to as an admin — account.external_account_id
  is that channel's own "@username" (validated at connect time), not
  anything derived from a redirect.

  Real multi-image/video albums exist here (sendMediaGroup, 2-10 items),
  so unlike Threads/TikTok/Pinterest this one gets a genuine carousel —
  Telegram's Bot API is unusually well suited to exactly what ComposeForm
  already builds.
*/

const API_BASE = "https://api.telegram.org";

type TelegramApiResult<T> = { ok: boolean; result?: T; description?: string };
type TelegramMessage = { message_id: number };

async function call<T>(token: string, method: string, body: Record<string, unknown>): Promise<TelegramApiResult<T>> {
  const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as TelegramApiResult<T>;
}

// Only resolvable for a public channel (an "@username") — a private
// channel's numeric chat_id has no universally-reachable public URL.
function permalink(chatId: string, messageId: number): string | undefined {
  if (!chatId.startsWith("@")) return undefined;
  return `https://t.me/${chatId.slice(1)}/${messageId}`;
}

export const telegramProvider: SocialProvider = {
  platform: "telegram",

  capabilities: {
    publishing: true,
    analytics: false, // Bot API exposes no post-view/engagement stats endpoint
    deletion: true,
    video: true,
    image: true,
    carousel: true,
  },

  async verifyConnection({ account, freshToken }): Promise<ConnectionHealth> {
    const me = await call<{ id: number }>(freshToken, "getMe", {});
    if (!me.ok) return { healthy: false, reason: me.description ?? "Bot token geçersiz." };

    const chat = await call<{ id: number }>(freshToken, "getChat", { chat_id: account.external_account_id });
    if (!chat.ok) return { healthy: false, reason: chat.description ?? "Kanal bulunamadı." };

    return { healthy: true };
  },

  async refreshToken() {
    // Bot tokens don't expire and have no refresh concept — same shape as
    // Facebook's Page tokens.
    return null;
  },

  async publish({ account, freshToken, caption, media }): Promise<PublishResult> {
    const chatId = account.external_account_id;

    if (!media || media.length === 0) {
      const res = await call<TelegramMessage>(freshToken, "sendMessage", { chat_id: chatId, text: caption });
      if (!res.ok || !res.result) throw new Error(res.description ?? "Telegram mesajı gönderilemedi.");
      return { remoteId: String(res.result.message_id), permalinkUrl: permalink(chatId, res.result.message_id) };
    }

    if (media.length === 1) {
      const item = media[0];
      const method = item.type === "video" ? "sendVideo" : "sendPhoto";
      const field = item.type === "video" ? "video" : "photo";
      const res = await call<TelegramMessage>(freshToken, method, { chat_id: chatId, [field]: item.url, caption });
      if (!res.ok || !res.result) throw new Error(res.description ?? "Telegram gönderisi paylaşılamadı.");
      return { remoteId: String(res.result.message_id), permalinkUrl: permalink(chatId, res.result.message_id) };
    }

    if (media.length > 10) {
      throw new Error("Telegram albümü en fazla 10 medya öğesi destekliyor.");
    }

    // sendMediaGroup — the caption belongs to the FIRST item only, the rest
    // are captionless; that's how a real Telegram album post reads (one
    // caption under the whole group, not repeated per photo).
    const mediaGroup = media.map((item, index) => ({
      type: item.type === "video" ? "video" : "photo",
      media: item.url,
      ...(index === 0 ? { caption } : {}),
    }));
    const res = await call<TelegramMessage[]>(freshToken, "sendMediaGroup", { chat_id: chatId, media: mediaGroup });
    if (!res.ok || !res.result || res.result.length === 0) {
      throw new Error(res.description ?? "Telegram albümü paylaşılamadı.");
    }
    const first = res.result[0];
    return { remoteId: String(first.message_id), permalinkUrl: permalink(chatId, first.message_id) };
  },

  async getAnalytics() {
    throw new Error("Telegram analitiği Bot API üzerinden desteklenmiyor.");
  },

  async validateMedia({ mimeType, sizeBytes }): Promise<MediaValidation> {
    const allowed = ["image/jpeg", "image/png", "video/mp4"];
    if (!allowed.includes(mimeType)) return { valid: false, reason: `Desteklenmeyen dosya türü: ${mimeType}` };
    // Sending by URL (not a direct upload) has a real, conservative ceiling
    // here on purpose — no chunked/multipart upload path is built.
    if (sizeBytes > 20 * 1024 * 1024) return { valid: false, reason: "Dosya 20MB sınırını aşıyor" };
    return { valid: true };
  },
};

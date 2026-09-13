"use server";

import { createClient } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/crypto/tokenCipher";

/*
  Sends a reply to an inbound Social Inbox comment/DM and records it as an
  outbound row. Uses the session-respecting server client (not the admin
  client the webhook receiver uses) — this is a real user action scoped to
  their own brand, so RLS on social_messages/social_accounts is the right
  gate, same as every other write in this app.

  No orchestration layer existed anywhere for "decrypt this brand's stored
  token and call a provider" before this — every SocialProvider method sits
  unused by a real caller (the scheduler is still a documented mock). This
  is the first real caller, built directly against Meta's REST endpoints
  rather than through SocialProvider, since neither `publish()` nor any
  other existing provider method models "reply to a specific comment/DM".
*/
export async function sendInboxReply(messageId: string, replyText: string): Promise<void> {
  const text = replyText.trim();
  if (!text) throw new Error("Yanıt boş olamaz.");

  const supabase = await createClient();

  const { data: message, error: msgError } = await supabase
    .from("social_messages")
    .select("id, brand_id, social_account_id, platform, kind, external_id, external_thread_id")
    .eq("id", messageId)
    .single();
  if (msgError || !message) throw new Error("Mesaj bulunamadı.");
  if (!message.social_account_id) throw new Error("Bu mesajın bağlı bir hesabı bulunamadı.");

  const { data: account, error: accError } = await supabase
    .from("social_accounts")
    .select("id, brand_id, external_account_id, access_token_encrypted, status")
    .eq("id", message.social_account_id)
    .single();
  if (accError || !account) throw new Error("Bağlı hesap bulunamadı.");
  if (account.status !== "active" || !account.access_token_encrypted) {
    throw new Error("Bağlı hesap aktif değil — Bağlantılar sayfasından yeniden bağlanması gerekebilir.");
  }

  const token = decryptToken(account.access_token_encrypted, account.brand_id);
  let remoteId: string;

  if (message.platform === "instagram") {
    if (message.kind === "comment") {
      const res = await fetch(`https://graph.instagram.com/v21.0/${message.external_id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ message: text, access_token: token }),
      });
      const json = await res.json();
      if (!res.ok || !json.id) {
        throw new Error(json?.error?.message ?? `Instagram yanıtı gönderilemedi (HTTP ${res.status})`);
      }
      remoteId = json.id as string;
    } else {
      if (!message.external_thread_id) throw new Error("Bu DM için alıcı bilgisi eksik.");
      const res = await fetch(`https://graph.instagram.com/v21.0/${account.external_account_id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: message.external_thread_id },
          message: { text },
          access_token: token,
        }),
      });
      const json = await res.json();
      if (!res.ok || (!json.message_id && !json.id)) {
        throw new Error(json?.error?.message ?? `Instagram DM gönderilemedi (HTTP ${res.status})`);
      }
      remoteId = (json.message_id ?? json.id) as string;
    }
  } else {
    if (message.kind === "comment") {
      const res = await fetch(`https://graph.facebook.com/v21.0/${message.external_id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ message: text, access_token: token }),
      });
      const json = await res.json();
      if (!res.ok || !json.id) {
        throw new Error(json?.error?.message ?? `Facebook yanıtı gönderilemedi (HTTP ${res.status})`);
      }
      remoteId = json.id as string;
    } else {
      if (!message.external_thread_id) throw new Error("Bu DM için alıcı bilgisi eksik.");
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${account.external_account_id}/messages?access_token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: message.external_thread_id },
            messaging_type: "RESPONSE",
            message: { text },
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.message_id) {
        throw new Error(json?.error?.message ?? `Messenger yanıtı gönderilemedi (HTTP ${res.status})`);
      }
      remoteId = json.message_id as string;
    }
  }

  await supabase.from("social_messages").insert({
    brand_id: message.brand_id,
    social_account_id: message.social_account_id,
    platform: message.platform,
    kind: message.kind,
    direction: "outbound",
    external_id: remoteId,
    external_thread_id: message.external_thread_id,
    body: text,
    status: "done",
  });

  await supabase.from("social_messages").update({ status: "done" }).eq("id", messageId);
}

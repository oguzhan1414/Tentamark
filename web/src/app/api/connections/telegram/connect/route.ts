import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

const API_BASE = "https://api.telegram.org";

/*
  Telegram has no OAuth — there's no authorize redirect to send someone
  through, so this is a plain form POST instead of the start/callback pair
  every other platform uses (see TelegramConnectCard in settings/page.tsx).
  The bot token itself IS the credential; the only real work here is
  proving, before saving anything, that the token is real AND the bot can
  actually post to the given channel — both checked directly against
  Telegram's own API rather than trusted at face value.
*/
export async function POST(request: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rawToken = typeof body?.botToken === "string" ? body.botToken.trim() : "";
  const rawChannel = typeof body?.channelUsername === "string" ? body.channelUsername.trim() : "";
  if (!rawToken || !rawChannel) {
    return NextResponse.json({ error: "Bot token ve kanal kullanıcı adı gerekli." }, { status: 400 });
  }
  // A bot token's own format ("<digits>:<35 chars>") never starts with an
  // @ — an easy accidental swap of the two fields otherwise fails much
  // less clearly, inside the getMe call below.
  const channelId = rawChannel.startsWith("@") ? rawChannel : `@${rawChannel}`;

  const meRes = await fetch(`${API_BASE}/bot${rawToken}/getMe`);
  const me = await meRes.json();
  if (!me.ok) {
    return NextResponse.json({ error: "Bot token geçersiz." }, { status: 400 });
  }

  const chatRes = await fetch(`${API_BASE}/bot${rawToken}/getChat?chat_id=${encodeURIComponent(channelId)}`);
  const chat = await chatRes.json();
  if (!chat.ok) {
    return NextResponse.json(
      { error: "Kanal bulunamadı — kullanıcı adını kontrol et ve botun kanala eklendiğinden emin ol." },
      { status: 400 }
    );
  }

  // getChat succeeding only proves the bot can SEE the channel — a regular
  // member (or, for a public channel, arguably no membership at all) can
  // still resolve it. getChatMember is what actually confirms posting
  // rights, catching the single most likely setup mistake (added the bot
  // but never made it an admin) here instead of on the first real publish.
  const botId = me.result.id;
  const memberRes = await fetch(
    `${API_BASE}/bot${rawToken}/getChatMember?chat_id=${encodeURIComponent(channelId)}&user_id=${botId}`
  );
  const member = await memberRes.json();
  const canPost = member?.result?.status === "administrator" && member.result.can_post_messages !== false;
  if (!member.ok || !canPost) {
    return NextResponse.json(
      { error: "Bot bu kanalda yönetici değil veya mesaj gönderme izni yok — kanal ayarlarından botu yönetici yap." },
      { status: 400 }
    );
  }

  // A random per-connection secret Telegram echoes back on every webhook
  // POST (as X-Telegram-Bot-Api-Secret-Token) — the receiver checks it
  // against this stored value before trusting a payload, same role
  // X-Hub-Signature-256 plays for Meta's webhook, just a static compare
  // instead of an HMAC since that's what Telegram's own API offers.
  const webhookSecret = randomBytes(24).toString("hex");

  const supabase = await createClient();
  const { data: accountRow, error: saveError } = await supabase
    .from("social_accounts")
    .upsert(
      {
        brand_id: brand.id,
        platform: "telegram",
        external_account_id: channelId,
        username: channelId,
        display_name: chat.result?.title ?? channelId,
        avatar_url: null,
        access_token_encrypted: encryptToken(rawToken, brand.id),
        refresh_token_encrypted: null,
        token_expires_at: null,
        status: "active",
        last_health_check_at: new Date().toISOString(),
        metadata: { webhookSecret },
      },
      { onConflict: "brand_id,platform,external_account_id" }
    )
    .select("id")
    .single();
  if (saveError || !accountRow) {
    console.error("social_accounts upsert (telegram) failed:", saveError?.message);
    return NextResponse.json({ error: "Doğrulandı ama veritabanına kaydedilemedi." }, { status: 500 });
  }

  // Registers Gelen Kutu for this bot — DMs sent to it start showing up in
  // the inbox. Best-effort on purpose: publishing (the core feature) is
  // already saved and working regardless of whether this succeeds, so a
  // Telegram-side hiccup here shouldn't fail the whole connection.
  const origin = new URL(request.url).origin;
  const webhookRes = await fetch(`${API_BASE}/bot${rawToken}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `${origin}/api/webhooks/telegram/${accountRow.id}`,
      secret_token: webhookSecret,
      allowed_updates: ["message"],
    }),
  });
  const webhookJson = await webhookRes.json().catch(() => null);
  if (!webhookJson?.ok) {
    console.error("Telegram setWebhook failed:", webhookJson?.description);
  }

  return NextResponse.json({ ok: true });
}

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

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("social_accounts").upsert(
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
    },
    { onConflict: "brand_id,platform,external_account_id" }
  );
  if (saveError) {
    console.error("social_accounts upsert (telegram) failed:", saveError.message);
    return NextResponse.json({ error: "Doğrulandı ama veritabanına kaydedilemedi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

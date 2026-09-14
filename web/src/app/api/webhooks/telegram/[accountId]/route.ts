import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  Real-time event receiver for Telegram DMs — the Gelen Kutu equivalent of
  /api/webhooks/meta, but Telegram's shape forces a different routing
  scheme: Meta signs one shared callback URL per app with X-Hub-Signature-256
  over the whole payload; Telegram has no per-payload signature at all, so
  each connected bot gets its OWN webhook URL (this [accountId] segment,
  set once via setWebhook — see connections/telegram/connect) plus a
  secret_token Telegram echoes back on every request, checked against the
  matching social_accounts.metadata.webhookSecret below.

  Server-to-server, no user session — admin client throughout, same
  reasoning as the Meta webhook and the deauthorize callbacks.
*/

type TelegramUser = { id: number; username?: string; first_name?: string };
type TelegramMessage = {
  message_id: number;
  date: number;
  from?: TelegramUser;
  chat: { id: number; type: string };
  text?: string;
  caption?: string;
};
type TelegramUpdate = { message?: TelegramMessage };

export async function POST(request: NextRequest, { params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  const supabase = createAdminClient();
  const { data: account } = await supabase
    .from("social_accounts")
    .select("id, brand_id, metadata")
    .eq("id", accountId)
    .eq("platform", "telegram")
    .eq("status", "active")
    .maybeSingle();

  // Acknowledge even for an unknown/disconnected account — a non-200
  // response makes Telegram keep retrying the same update indefinitely.
  if (!account) return NextResponse.json({ ok: true });

  const expectedSecret = (account.metadata as Record<string, unknown> | null)?.webhookSecret;
  const providedSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "invalid secret" }, { status: 403 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const message = update?.message;

  // Only private DMs to the bot land in the inbox — the bot's own posts to
  // the channel also flow through as updates (chat.type "channel"), and
  // recording those as inbound would show our own publishes as customer
  // messages. Comments on a channel post need a linked discussion group,
  // a separate concept this pass doesn't handle.
  if (message && message.chat.type === "private" && (message.text || message.caption)) {
    // Telegram's message_id is only unique WITHIN one chat, not globally —
    // unlike Meta's comment_id/mid, so external_id has to be composite to
    // satisfy social_messages' real unique(platform, external_id).
    const { error } = await supabase.from("social_messages").upsert(
      {
        brand_id: account.brand_id,
        social_account_id: account.id,
        platform: "telegram",
        kind: "dm",
        external_id: `${message.chat.id}:${message.message_id}`,
        external_thread_id: String(message.chat.id),
        author_name: message.from?.username ?? message.from?.first_name ?? null,
        author_external_id: message.from ? String(message.from.id) : null,
        body: message.text ?? message.caption ?? null,
        external_created_at: new Date(message.date * 1000).toISOString(),
      },
      { onConflict: "platform,external_id", ignoreDuplicates: true }
    );
    if (error) console.error("social_messages upsert (telegram) failed:", error.message);
  }

  return NextResponse.json({ ok: true });
}

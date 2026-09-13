import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMetaWebhookSignature } from "@/lib/social/webhookSignature";

/*
  Real-time event webhook receiver for Instagram comments/DMs and Facebook
  Page feed comments/Messenger DMs — one shared callback URL for both apps
  (payload.object tells them apart), verified against Meta's current docs:

  - GET: the one-time subscribe handshake. Echo hub.challenge back verbatim
    when hub.verify_token matches what we configured in the dashboard.
  - POST: the actual event delivery. Signed via X-Hub-Signature-256 over the
    raw body (see webhookSignature.ts) — a different scheme from
    signedRequest.ts's form-field signing used by the deauthorize callbacks.

  Server-to-server, no user session — service-role client throughout, same
  reasoning as the connections deauthorize routes.
*/
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (verifyToken && mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

type MetaChange = { field: string; value: Record<string, unknown> };
type MetaMessagingEvent = {
  sender: { id: string };
  recipient: { id: string };
  message?: { mid: string; text?: string; is_echo?: boolean };
};
type MetaEntry = { id: string; changes?: MetaChange[]; messaging?: MetaMessagingEvent[] };
type MetaWebhookPayload = { object: string; entry?: MetaEntry[] };

export async function POST(request: Request) {
  const rawBody = await request.text();

  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Two separate Meta apps in this project (Instagram uses "Instagram API
  // with Instagram Login", Facebook Page uses "Facebook Login for
  // Business") — each signs its own events with its own app secret.
  const platform = payload.object === "instagram" ? "instagram" : "facebook";
  const secret = platform === "instagram" ? process.env.INSTAGRAM_APP_SECRET : process.env.META_APP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!verifyMetaWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  const supabase = createAdminClient();

  for (const entry of payload.entry ?? []) {
    const { data: account } = await supabase
      .from("social_accounts")
      .select("id, brand_id")
      .eq("platform", platform)
      .eq("external_account_id", String(entry.id))
      .eq("status", "active")
      .maybeSingle();

    if (!account) continue; // event for an account we don't have connected — ignore

    const rows: Record<string, unknown>[] = [];

    for (const change of entry.changes ?? []) {
      if (platform === "instagram" && change.field === "comments") {
        const v = change.value as { id: string; text?: string; from?: { id: string; username?: string }; media?: { id: string } };
        rows.push({
          brand_id: account.brand_id,
          social_account_id: account.id,
          platform,
          kind: "comment",
          external_id: String(v.id),
          external_thread_id: v.media?.id ? String(v.media.id) : null,
          author_name: v.from?.username ?? null,
          author_external_id: v.from?.id ? String(v.from.id) : null,
          body: v.text ?? null,
        });
      }

      if (platform === "facebook" && change.field === "feed") {
        const v = change.value as {
          item?: string;
          verb?: string;
          comment_id?: string;
          message?: string;
          from?: { id: string; name?: string };
          post_id?: string;
        };
        // Only new comments — Meta also fires "feed" for edits/removals/likes
        // and for the page's own posts, none of which belong in an inbox.
        if (v.item !== "comment" || v.verb !== "add" || !v.comment_id) continue;
        rows.push({
          brand_id: account.brand_id,
          social_account_id: account.id,
          platform,
          kind: "comment",
          external_id: String(v.comment_id),
          external_thread_id: v.post_id ? String(v.post_id) : null,
          author_name: v.from?.name ?? null,
          author_external_id: v.from?.id ? String(v.from.id) : null,
          body: v.message ?? null,
        });
      }
    }

    for (const m of entry.messaging ?? []) {
      // Echoes are Meta re-delivering our own sent messages back to us —
      // recording them as inbound would show our own replies as customer
      // messages.
      if (!m.message?.text || !m.message?.mid || m.message.is_echo) continue;
      rows.push({
        brand_id: account.brand_id,
        social_account_id: account.id,
        platform,
        kind: "dm",
        external_id: String(m.message.mid),
        external_thread_id: String(m.sender.id),
        author_external_id: String(m.sender.id),
        body: m.message.text,
      });
    }

    if (rows.length > 0) {
      await supabase.from("social_messages").upsert(rows, { onConflict: "platform,external_id", ignoreDuplicates: true });
    }
  }

  return NextResponse.json({ success: true });
}

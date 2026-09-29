import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/crypto/tokenCipher";
import { createSession, listConvos, getMessages, type ConvoView } from "@/lib/social/blueskyChat";

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.RENDER_WORKER_SECRET || process.env.SCHEDULER_WEBHOOK_SECRET || process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV === "development";
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// No webhook/push exists for AT Protocol DMs (unlike Meta/Telegram), so this
// is polled on a cron instead — see supabase/patches/0068. Every fetched
// message upserts through social_messages' existing unique(platform,
// external_id) key with ignoreDuplicates, so re-fetching the same recent
// messages on every run is harmless rather than needing a per-convo cursor.
function otherMember(convo: ConvoView, selfDid: string) {
  return convo.members.find((m) => m.did !== selfDid);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: accounts, error } = await admin
    .from("social_accounts")
    .select("id, brand_id, access_token_encrypted, metadata, status")
    .eq("platform", "bluesky")
    .eq("status", "active");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let messagesWritten = 0;
  const errors: string[] = [];

  for (const account of accounts ?? []) {
    const handle = (account.metadata as Record<string, unknown> | null)?.handle as string | undefined;
    if (!handle || !account.access_token_encrypted) continue;

    try {
      const appPassword = decryptToken(account.access_token_encrypted, account.brand_id);
      const session = await createSession(handle, appPassword);

      const { convos } = await listConvos(session.accessJwt);
      for (const convo of convos) {
        if (convo.unreadCount === 0) continue; // nothing new since Bluesky's own read state
        const { messages } = await getMessages(session.accessJwt, convo.id);
        const inbound = messages.filter((m) => m.sender.did !== session.did);
        if (inbound.length === 0) continue;

        const other = otherMember(convo, session.did);
        const rows = inbound.map((m) => ({
          brand_id: account.brand_id,
          social_account_id: account.id,
          platform: "bluesky",
          kind: "dm",
          direction: "inbound",
          external_id: m.id,
          external_thread_id: convo.id,
          author_name: other?.displayName || other?.handle || "Bluesky kullanıcısı",
          author_external_id: other?.did,
          body: m.text,
          status: "open",
          external_created_at: m.sentAt,
        }));

        const { error: upsertError } = await admin
          .from("social_messages")
          .upsert(rows, { onConflict: "platform,external_id", ignoreDuplicates: true });
        if (upsertError) errors.push(`${account.id}/${convo.id}: ${upsertError.message}`);
        else messagesWritten += rows.length;
      }
    } catch (err) {
      errors.push(`${account.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ accountsPolled: (accounts ?? []).length, messagesWritten, errors });
}

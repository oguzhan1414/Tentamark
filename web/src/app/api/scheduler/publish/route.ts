import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptToken, encryptToken } from "@/lib/crypto/tokenCipher";
import { getProviderFor } from "@/lib/social/registry";
import type { SocialAccountRecord, SocialPlatform } from "@/lib/social/types";

/*
  The real publisher — replaces the MOCK PUBLISHER block that used to live
  inside process_publish_queue() (supabase/schema.sql). Postgres can't run
  the TypeScript connectors in src/lib/social/*Provider.ts, so
  process_publish_queue() now fires an async pg_net POST here (see
  supabase/patches/0029_real_publisher.sql) once a content_platforms row is
  claimed as PUBLISHING, and this route does the actual publish() call plus
  the PUBLISHED/FAILED/retry state transition that used to be faked in SQL.

  Server-to-server call, no user session — authenticated with a shared
  bearer secret (SCHEDULER_WEBHOOK_SECRET) instead of RLS/cookies, same
  reasoning as createAdminClient()'s other server-to-server callers.
*/

const MAX_ATTEMPTS = 5;

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.SCHEDULER_WEBHOOK_SECRET;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const provided = header.slice(prefix.length);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content_platform_id: contentPlatformId } = await req.json().catch(() => ({}));
  if (!contentPlatformId || typeof contentPlatformId !== "string") {
    return NextResponse.json({ error: "content_platform_id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: cp, error: cpError } = await supabase
    .from("content_platforms")
    .select(
      "id, content_id, platform, caption, attempt_count, content:content!inner(brand_id, content_media(position, media(file_url)))"
    )
    .eq("id", contentPlatformId)
    .single();

  if (cpError || !cp) {
    return NextResponse.json({ error: "content_platforms row not found" }, { status: 404 });
  }

  const content = Array.isArray(cp.content) ? cp.content[0] : cp.content;
  const brandId = content?.brand_id as string | undefined;
  if (!brandId) {
    return NextResponse.json({ error: "content row missing brand_id" }, { status: 404 });
  }

  const mediaRows = (content?.content_media ?? []) as Array<{
    position: number;
    media: { file_url: string } | { file_url: string }[] | null;
  }>;
  const sortedMedia = [...mediaRows].sort((a, b) => a.position - b.position);
  const firstMedia = sortedMedia[0]?.media;
  const mediaUrl = (Array.isArray(firstMedia) ? firstMedia[0]?.file_url : firstMedia?.file_url) || undefined;

  const { data: account, error: accountError } = await supabase
    .from("social_accounts")
    .select(
      "id, brand_id, platform, external_account_id, access_token_encrypted, refresh_token_encrypted, token_expires_at"
    )
    .eq("brand_id", brandId)
    .eq("platform", cp.platform)
    .eq("status", "active")
    .maybeSingle();

  if (accountError || !account || !account.access_token_encrypted) {
    await recordFailure(supabase, cp.id, cp.content_id, cp.attempt_count ?? 0, {
      failureCode: "TOKEN_EXPIRED",
      message: `Bağlı, aktif bir ${cp.platform} hesabı bulunamadı.`,
    });
    return NextResponse.json({ error: "no active social account" }, { status: 200 });
  }

  try {
    const provider = getProviderFor(cp.platform as SocialPlatform);
    const accountRecord: SocialAccountRecord = {
      id: account.id,
      brand_id: account.brand_id,
      platform: account.platform as SocialPlatform,
      external_account_id: account.external_account_id,
      access_token_encrypted: account.access_token_encrypted,
      refresh_token_encrypted: account.refresh_token_encrypted,
      token_expires_at: account.token_expires_at,
    };

    let freshToken = decryptToken(account.access_token_encrypted, account.brand_id);

    // Refresh proactively if the token expires within the next 5 minutes —
    // matches "publisher never stores tokens itself, fetches fresh at
    // publish time" (12-backend-logic.md §12.7).
    const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
    if (expiresAt && expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      const refreshed = await provider.refreshToken({ account: accountRecord, freshToken });
      if (refreshed) {
        freshToken = refreshed.token;
        await supabase
          .from("social_accounts")
          .update({
            access_token_encrypted: encryptToken(refreshed.token, account.brand_id),
            refresh_token_encrypted: refreshed.refreshToken
              ? encryptToken(refreshed.refreshToken, account.brand_id)
              : account.refresh_token_encrypted,
            token_expires_at: refreshed.expiresAt ? refreshed.expiresAt.toISOString() : null,
          })
          .eq("id", account.id);
      }
    }

    const result = await provider.publish({
      account: accountRecord,
      freshToken,
      caption: cp.caption,
      mediaUrl,
    });

    await supabase
      .from("content_platforms")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
        platform_post_id: result.remoteId,
        last_error: null,
      })
      .eq("id", cp.id);

    await supabase.from("publish_attempts").insert({ content_platform_id: cp.id, status: "SUCCESS" });
    await supabase.rpc("recompute_content_status", { p_content_id: cp.content_id });

    return NextResponse.json({ ok: true, remoteId: result.remoteId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen yayın hatası";
    await recordFailure(supabase, cp.id, cp.content_id, cp.attempt_count ?? 0, {
      failureCode: "PLATFORM_ERROR",
      message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}

// Mirrors the retry/backoff logic the old SQL mock block used to own:
// exponential backoff (2, 4, 8, 16... minutes), gives up after
// MAX_ATTEMPTS with NEEDS_USER_ACTION.
async function recordFailure(
  supabase: ReturnType<typeof createAdminClient>,
  contentPlatformId: string,
  contentId: string,
  currentAttemptCount: number,
  info: { failureCode: string; message: string }
) {
  const newAttemptCount = currentAttemptCount + 1;

  if (newAttemptCount >= MAX_ATTEMPTS) {
    await supabase
      .from("content_platforms")
      .update({
        status: "NEEDS_USER_ACTION",
        attempt_count: newAttemptCount,
        failure_code: info.failureCode,
        last_error: `${info.message} (deneme sayısı ${MAX_ATTEMPTS} aşıldı)`,
      })
      .eq("id", contentPlatformId);
  } else {
    const backoffMinutes = 2 ** newAttemptCount;
    await supabase
      .from("content_platforms")
      .update({
        status: "QUEUED",
        attempt_count: newAttemptCount,
        next_retry_at: new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString(),
        failure_code: info.failureCode,
        last_error: `${info.message} (deneme ${newAttemptCount}/${MAX_ATTEMPTS})`,
      })
      .eq("id", contentPlatformId);
  }

  await supabase.from("publish_attempts").insert({
    content_platform_id: contentPlatformId,
    status: "FAILED",
    failure_code: info.failureCode,
    error_detail: info.message,
  });

  await supabase.rpc("recompute_content_status", { p_content_id: contentId });
}

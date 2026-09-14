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

// Threads' container can take a while to finish processing (polled below,
// up to 45s) — the previous blind 30s sleep left a real publish stuck
// mid-flight, almost certainly the function hitting Vercel's default
// duration limit. Give this route real headroom instead of guessing.
export const maxDuration = 60;

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
      "id, content_id, platform, caption, attempt_count, content:content!inner(brand_id, content_media(position, media(file_url, file_type)))"
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
    media: { file_url: string; file_type: string } | { file_url: string; file_type: string }[] | null;
  }>;
  const sortedMedia = [...mediaRows].sort((a, b) => a.position - b.position);
  const firstMediaRaw = sortedMedia[0]?.media;
  const firstMedia = Array.isArray(firstMediaRaw) ? firstMediaRaw[0] : firstMediaRaw;
  const mediaUrl = firstMedia?.file_url || undefined;
  const mediaType: "image" | "video" | undefined = firstMedia
    ? firstMedia.file_type?.startsWith("video/")
      ? "video"
      : "image"
    : undefined;

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
    // "no active account" was masking a real query error behind the exact
    // same generic message as a genuinely missing/inactive account,
    // impossible to tell apart after the fact — this at least gets the
    // real reason into the logs when there is one.
    if (accountError) console.error("social_accounts sorgusu başarısız:", accountError.message);
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
        const { error: refreshUpdateError } = await supabase
          .from("social_accounts")
          .update({
            access_token_encrypted: encryptToken(refreshed.token, account.brand_id),
            refresh_token_encrypted: refreshed.refreshToken
              ? encryptToken(refreshed.refreshToken, account.brand_id)
              : account.refresh_token_encrypted,
            token_expires_at: refreshed.expiresAt ? refreshed.expiresAt.toISOString() : null,
          })
          .eq("id", account.id);
        if (refreshUpdateError) console.error("Token yenileme kaydedilemedi:", refreshUpdateError.message);
      }
    }

    const result = await provider.publish({
      account: accountRecord,
      freshToken,
      caption: cp.caption,
      mediaUrl,
      mediaType,
    });

    // Deliberately NOT thrown into the catch block below on failure here —
    // the platform-side publish already happened and can't be undone; a
    // caught "failure" here would call recordFailure() believing the
    // publish itself failed and let a retry post the same content twice.
    // Found live: this exact update failed silently once (unchecked error,
    // real Facebook post created, content_platforms never left PUBLISHING)
    // with no reproducible cause — logging is what actually matters here.
    const { error: publishedUpdateError } = await supabase
      .from("content_platforms")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
        platform_post_id: result.remoteId,
        permalink_url: result.permalinkUrl ?? null,
        last_error: null,
      })
      .eq("id", cp.id);
    if (publishedUpdateError) {
      console.error(
        `PUBLISHED durumu kaydedilemedi (cp.id=${cp.id}, remoteId=${result.remoteId}):`,
        publishedUpdateError.message
      );
    }

    const { error: attemptInsertError } = await supabase
      .from("publish_attempts")
      .insert({ content_platform_id: cp.id, status: "SUCCESS" });
    if (attemptInsertError) console.error("publish_attempts kaydı eklenemedi:", attemptInsertError.message);

    await recomputeContentStatus(supabase, cp.content_id);

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
    const { error } = await supabase
      .from("content_platforms")
      .update({
        status: "NEEDS_USER_ACTION",
        attempt_count: newAttemptCount,
        failure_code: info.failureCode,
        last_error: `${info.message} (deneme sayısı ${MAX_ATTEMPTS} aşıldı)`,
      })
      .eq("id", contentPlatformId);
    if (error) console.error(`NEEDS_USER_ACTION kaydedilemedi (cp.id=${contentPlatformId}):`, error.message);
  } else {
    const backoffMinutes = 2 ** newAttemptCount;
    const { error } = await supabase
      .from("content_platforms")
      .update({
        status: "QUEUED",
        attempt_count: newAttemptCount,
        next_retry_at: new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString(),
        failure_code: info.failureCode,
        last_error: `${info.message} (deneme ${newAttemptCount}/${MAX_ATTEMPTS})`,
      })
      .eq("id", contentPlatformId);
    if (error) console.error(`Yeniden deneme kaydedilemedi (cp.id=${contentPlatformId}):`, error.message);
  }

  const { error: attemptInsertError } = await supabase.from("publish_attempts").insert({
    content_platform_id: contentPlatformId,
    status: "FAILED",
    failure_code: info.failureCode,
    error_detail: info.message,
  });
  if (attemptInsertError) console.error("publish_attempts (FAILED) kaydı eklenemedi:", attemptInsertError.message);

  await recomputeContentStatus(supabase, contentId);
}

// Same logic as private.recompute_content_status() in schema.sql, done
// directly against the tables via the admin client instead of an RPC call.
// The RPC needs a Postgres grant to service_role AND a PostgREST schema
// cache reload to be callable from outside the DB (supabase/patches/0029) —
// real, but silent, failure mode: every publish succeeded while this
// follow-up step failed unnoticed, since the original rpc() call's error
// was never even checked, so content.status stayed stuck on APPROVED for
// every single real publish. This has zero extra moving parts to misfire.
async function recomputeContentStatus(supabase: ReturnType<typeof createAdminClient>, contentId: string) {
  const { data: platforms, error } = await supabase
    .from("content_platforms")
    .select("status")
    .eq("content_id", contentId);

  if (error || !platforms) {
    console.error("İçerik durumu hesaplanamadı:", error?.message);
    return;
  }

  const total = platforms.length;
  const published = platforms.filter((p) => p.status === "PUBLISHED").length;
  const needsAction = platforms.filter((p) => p.status === "NEEDS_USER_ACTION").length;
  if (total === 0 || published + needsAction < total) return; // something still in flight

  const nextStatus = published === total ? "PUBLISHED" : published > 0 ? "PARTIALLY_PUBLISHED" : null;
  if (!nextStatus) return; // every platform NEEDS_USER_ACTION — leave content.status as-is

  const { error: updateError } = await supabase.from("content").update({ status: nextStatus }).eq("id", contentId);
  if (updateError) console.error("İçerik durumu güncellenemedi:", updateError.message);
}

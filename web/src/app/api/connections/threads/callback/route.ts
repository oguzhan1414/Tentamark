import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

type ThreadsTokenResponse = { access_token?: string; user_id?: string; error_message?: string };
type ThreadsLongTokenResponse = { access_token?: string; expires_in?: number };
type ThreadsProfile = { id: string; username?: string; threads_profile_picture_url?: string };

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/dashboard/connections?connect_error=threads_${reason}`, origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const deniedByUser = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("threads_oauth_state")?.value;
  cookieStore.delete("threads_oauth_state");

  if (deniedByUser) return fail(origin, "denied");
  if (!code || !state || state !== expectedState) return fail(origin, "state");

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.redirect(new URL("/giris", origin));

  const appId = process.env.THREADS_APP_ID;
  const appSecret = process.env.THREADS_APP_SECRET;
  if (!appId || !appSecret) return fail(origin, "config");

  const redirectUri = `${origin}/api/connections/threads/callback`;

  // 1) authorization code -> short-lived token
  const tokenRes = await fetch("https://graph.threads.net/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const tokenJson = (await tokenRes.json()) as ThreadsTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token || !tokenJson.user_id) {
    console.error("Threads token exchange failed:", tokenJson.error_message);
    return fail(origin, "token");
  }

  // 2) short-lived -> long-lived (60 days, refreshable — unlike Meta Page tokens)
  const longRes = await fetch(
    `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${tokenJson.access_token}`
  );
  const longJson = (await longRes.json()) as ThreadsLongTokenResponse;
  const finalToken = longJson.access_token ?? tokenJson.access_token;
  const tokenExpiresAt = longJson.expires_in
    ? new Date(Date.now() + longJson.expires_in * 1000).toISOString()
    : null;

  // 3) profile, for display in Settings
  const profileRes = await fetch(
    `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${encodeURIComponent(finalToken)}`
  );
  const profile = (await profileRes.json()) as ThreadsProfile;

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("social_accounts").upsert(
    {
      brand_id: brand.id,
      platform: "threads",
      external_account_id: tokenJson.user_id,
      username: profile.username ?? tokenJson.user_id,
      display_name: profile.username ?? tokenJson.user_id,
      avatar_url: profile.threads_profile_picture_url ?? null,
      access_token_encrypted: encryptToken(finalToken, brand.id),
      token_expires_at: tokenExpiresAt,
      status: "active",
      last_health_check_at: new Date().toISOString(),
    },
    { onConflict: "brand_id,platform,external_account_id" }
  );
  if (saveError) {
    console.error("social_accounts upsert (threads) failed:", saveError.message);
    return fail(origin, "save");
  }

  return NextResponse.redirect(new URL("/dashboard/connections?connected=threads", origin));
}

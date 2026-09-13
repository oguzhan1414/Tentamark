import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

type IGTokenResponse = { access_token?: string; user_id?: string; error_message?: string };
type IGLongTokenResponse = { access_token?: string; expires_in?: number };
type IGProfile = { id: string; username?: string; profile_picture_url?: string };

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/settings?tab=baglantilar&connect_error=instagram_${reason}`, origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const deniedByUser = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("instagram_oauth_state")?.value;
  cookieStore.delete("instagram_oauth_state");

  if (deniedByUser) return fail(origin, "denied");
  if (!code || !state || state !== expectedState) return fail(origin, "state");

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.redirect(new URL("/giris", origin));

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) return fail(origin, "config");

  const redirectUri = `${origin}/api/connections/instagram/callback`;

  // 1) authorization code -> short-lived token. Note the host: api.instagram.com,
  // not graph.facebook.com or graph.instagram.com — this step specifically
  // uses yet another host, verified against Meta's current docs.
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });
  const tokenJson = (await tokenRes.json()) as IGTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token || !tokenJson.user_id) {
    console.error("Instagram token exchange failed:", tokenJson.error_message);
    return fail(origin, "token");
  }

  // 2) short-lived -> long-lived (60 days, refreshable)
  const longRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${tokenJson.access_token}`
  );
  const longJson = (await longRes.json()) as IGLongTokenResponse;
  const finalToken = longJson.access_token ?? tokenJson.access_token;
  const tokenExpiresAt = longJson.expires_in
    ? new Date(Date.now() + longJson.expires_in * 1000).toISOString()
    : null;

  // 3) profile, for display in Settings
  const profileRes = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=id,username,profile_picture_url&access_token=${encodeURIComponent(finalToken)}`
  );
  const profile = (await profileRes.json()) as IGProfile;

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("social_accounts").upsert(
    {
      brand_id: brand.id,
      platform: "instagram",
      external_account_id: tokenJson.user_id,
      username: profile.username ?? tokenJson.user_id,
      display_name: profile.username ?? tokenJson.user_id,
      avatar_url: profile.profile_picture_url ?? null,
      access_token_encrypted: encryptToken(finalToken, brand.id),
      token_expires_at: tokenExpiresAt,
      status: "active",
      last_health_check_at: new Date().toISOString(),
    },
    { onConflict: "brand_id,platform,external_account_id" }
  );
  if (saveError) {
    console.error("social_accounts upsert (instagram) failed:", saveError.message);
    return fail(origin, "save");
  }

  return NextResponse.redirect(new URL("/settings?tab=baglantilar&connected=instagram", origin));
}

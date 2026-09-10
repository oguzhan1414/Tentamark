import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

type TikTokTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  open_id?: string;
  error?: string;
  error_description?: string;
};
type TikTokProfile = {
  data?: { user?: { open_id: string; display_name?: string; avatar_url?: string } };
};

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/dashboard/connections?connect_error=tiktok_${reason}`, origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const deniedByUser = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("tiktok_oauth_state")?.value;
  cookieStore.delete("tiktok_oauth_state");

  if (deniedByUser) return fail(origin, "denied");
  if (!code || !state || state !== expectedState) return fail(origin, "state");

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.redirect(new URL("/giris", origin));

  // TEMP: matches start/route.ts — Sandbox credentials until audit is approved.
  const clientKey = process.env.TIKTOK_CLIENT_SANDBOX_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SANDBOX_SECRET;
  if (!clientKey || !clientSecret) return fail(origin, "config");

  const redirectUri = `${origin}/api/connections/tiktok/callback`;

  // Authorization code -> access token + refresh token in one call — unlike
  // Threads/Meta there's no separate short-lived/long-lived exchange step.
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const tokenJson = (await tokenRes.json()) as TikTokTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token || !tokenJson.open_id) {
    console.error("TikTok token exchange failed:", tokenJson.error_description ?? tokenJson.error);
    return fail(origin, "token");
  }

  const tokenExpiresAt = tokenJson.expires_in
    ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString()
    : null;

  // Profile, for display in Bağlantılar — auth via Bearer header, not a
  // query-string token like Threads/Graph.
  const profileRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
    { headers: { Authorization: `Bearer ${tokenJson.access_token}` } }
  );
  const profile = (await profileRes.json()) as TikTokProfile;
  const profileUser = profile.data?.user;

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("social_accounts").upsert(
    {
      brand_id: brand.id,
      platform: "tiktok",
      external_account_id: tokenJson.open_id,
      username: profileUser?.display_name ?? tokenJson.open_id,
      display_name: profileUser?.display_name ?? tokenJson.open_id,
      avatar_url: profileUser?.avatar_url ?? null,
      access_token_encrypted: encryptToken(tokenJson.access_token, brand.id),
      refresh_token_encrypted: tokenJson.refresh_token
        ? encryptToken(tokenJson.refresh_token, brand.id)
        : null,
      token_expires_at: tokenExpiresAt,
      status: "active",
      last_health_check_at: new Date().toISOString(),
    },
    { onConflict: "brand_id,platform,external_account_id" }
  );
  if (saveError) {
    console.error("social_accounts upsert (tiktok) failed:", saveError.message);
    return fail(origin, "save");
  }

  return NextResponse.redirect(new URL("/dashboard/connections?connected=tiktok", origin));
}

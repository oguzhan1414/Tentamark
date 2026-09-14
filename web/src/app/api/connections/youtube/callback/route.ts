import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};
type YouTubeChannel = { id: string; snippet?: { title?: string; thumbnails?: { default?: { url?: string } } } };
type YouTubeChannelsResponse = { items?: YouTubeChannel[] };

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/settings?tab=baglantilar&connect_error=youtube_${reason}`, origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const deniedByUser = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("youtube_oauth_state")?.value;
  cookieStore.delete("youtube_oauth_state");

  if (deniedByUser) return fail(origin, "denied");
  if (!code || !state || state !== expectedState) return fail(origin, "state");

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.redirect(new URL("/giris", origin));

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(origin, "config");

  const redirectUri = `${origin}/api/connections/youtube/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token) {
    console.error("YouTube token exchange failed:", tokenJson.error_description ?? tokenJson.error);
    return fail(origin, "token");
  }
  // access_type=offline+prompt=consent (see start/route.ts) should always
  // return one, but a returning user who somehow bypassed prompt=consent
  // wouldn't get one — fail clearly instead of silently storing a
  // connection that dies the moment the ~1h access token expires.
  if (!tokenJson.refresh_token) {
    console.error("YouTube token exchange succeeded but returned no refresh_token.");
    return fail(origin, "no-refresh-token");
  }

  const tokenExpiresAt = tokenJson.expires_in ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString() : null;

  const channelRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const channelJson = (await channelRes.json()) as YouTubeChannelsResponse;
  const channel = channelJson.items?.[0];
  if (!channelRes.ok || !channel) {
    console.error("YouTube channels.list returned no channel for this account.");
    return fail(origin, "no-channel");
  }

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("social_accounts").upsert(
    {
      brand_id: brand.id,
      platform: "youtube",
      external_account_id: channel.id,
      username: channel.snippet?.title ?? channel.id,
      display_name: channel.snippet?.title ?? channel.id,
      avatar_url: channel.snippet?.thumbnails?.default?.url ?? null,
      access_token_encrypted: encryptToken(tokenJson.access_token, brand.id),
      refresh_token_encrypted: encryptToken(tokenJson.refresh_token, brand.id),
      token_expires_at: tokenExpiresAt,
      status: "active",
      last_health_check_at: new Date().toISOString(),
    },
    { onConflict: "brand_id,platform,external_account_id" }
  );
  if (saveError) {
    console.error("social_accounts upsert (youtube) failed:", saveError.message);
    return fail(origin, "save");
  }

  return NextResponse.redirect(new URL("/settings?tab=baglantilar&connected=youtube", origin));
}

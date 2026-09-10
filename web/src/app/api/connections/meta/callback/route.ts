import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

const META_OAUTH_VERSION = "v21.0";

type MetaTokenResponse = { access_token?: string; expires_in?: number; error?: { message: string } };
type MetaPage = { id: string; name: string; access_token: string };
type MetaPagesResponse = { data?: MetaPage[]; error?: { message: string } };

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/dashboard/connections?connect_error=${reason}`, origin));
}

/*
  Facebook Pages only now. This used to also pick up a Page's linked
  Instagram Business Account, but Instagram moved to its own dedicated flow
  (instagram/start + instagram/callback, instagramProvider.ts) that needs no
  Page at all — keeping both paths would let the same real Instagram account
  end up as two rows with two different tokens under the unique constraint's
  nose (Page-derived external_account_id vs. Instagram Login's own user_id).
*/
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const deniedByUser = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("meta_oauth_state")?.value;
  cookieStore.delete("meta_oauth_state");

  if (deniedByUser) return fail(origin, "denied");
  if (!code || !state || state !== expectedState) return fail(origin, "state");

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.redirect(new URL("/giris", origin));

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return fail(origin, "config");

  const redirectUri = `${origin}/api/connections/meta/callback`;

  // 1) authorization code -> short-lived user token
  const tokenRes = await fetch(
    `https://graph.facebook.com/${META_OAUTH_VERSION}/oauth/access_token` +
      `?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  );
  const tokenJson = (await tokenRes.json()) as MetaTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token) {
    console.error("Meta token exchange failed:", tokenJson.error?.message);
    return fail(origin, "token");
  }

  // 2) short-lived -> long-lived user token (weeks, not hours)
  const longRes = await fetch(
    `https://graph.facebook.com/${META_OAUTH_VERSION}/oauth/access_token` +
      `?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenJson.access_token}`
  );
  const longJson = (await longRes.json()) as MetaTokenResponse;
  const userToken = longJson.access_token ?? tokenJson.access_token;
  const tokenExpiresAt = longJson.expires_in
    ? new Date(Date.now() + longJson.expires_in * 1000).toISOString()
    : null;

  // 3) the user's Facebook Pages, each with its own (effectively non-expiring) page access token
  const pagesRes = await fetch(
    `https://graph.facebook.com/${META_OAUTH_VERSION}/me/accounts` +
      `?fields=id,name,access_token&access_token=${encodeURIComponent(userToken)}`
  );
  const pagesJson = (await pagesRes.json()) as MetaPagesResponse;
  if (!pagesRes.ok || !pagesJson.data) {
    console.error("Meta pages fetch failed:", pagesJson.error?.message);
    return fail(origin, "pages");
  }

  if (pagesJson.data.length === 0) {
    return fail(origin, "no-pages");
  }

  const supabase = await createClient();

  for (const page of pagesJson.data) {
    const { error: fbError } = await supabase.from("social_accounts").upsert(
      {
        brand_id: brand.id,
        platform: "facebook",
        external_account_id: page.id,
        username: page.name,
        display_name: page.name,
        access_token_encrypted: encryptToken(page.access_token, brand.id),
        token_expires_at: tokenExpiresAt,
        status: "active",
        last_health_check_at: new Date().toISOString(),
      },
      { onConflict: "brand_id,platform,external_account_id" }
    );
    if (fbError) {
      console.error("social_accounts upsert (facebook) failed:", fbError.message);
      return fail(origin, "save");
    }
  }

  return NextResponse.redirect(new URL("/dashboard/connections?connected=meta", origin));
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

const API = "https://api.pinterest.com/v5";

type PinterestTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  message?: string;
};
type PinterestProfile = {
  username?: string;
  profile_image?: string;
  business_name?: string;
};
type PinterestBoard = { id: string; name: string };

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/settings?tab=baglantilar&connect_error=pinterest_${reason}`, origin));
}

// A Pin always belongs to a board — Pinterest has no "post to my profile"
// concept. Reuses the account's first existing board rather than making
// the user pick one (no board-selection UI exists yet); creates a fresh
// one only if they truly have none. Best-effort by design: publish() just
// throws a clear error later if this never resolved to an id, rather than
// failing the whole connection over it.
async function resolveDefaultBoardId(token: string, brandName: string): Promise<string | null> {
  const listRes = await fetch(`${API}/boards?page_size=1`, { headers: { Authorization: `Bearer ${token}` } });
  const listJson = await listRes.json().catch(() => null);
  const existing = (listJson?.items as PinterestBoard[] | undefined)?.[0];
  if (existing?.id) return existing.id;

  const createRes = await fetch(`${API}/boards`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${brandName} Pinleri`,
      description: `${brandName} içeriklerinin otomatik paylaşıldığı pano.`,
      privacy: "PUBLIC",
    }),
  });
  const createJson = await createRes.json().catch(() => null);
  return createRes.ok && createJson?.id ? (createJson.id as string) : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const deniedByUser = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("pinterest_oauth_state")?.value;
  const codeVerifier = cookieStore.get("pinterest_oauth_verifier")?.value;
  cookieStore.delete("pinterest_oauth_state");
  cookieStore.delete("pinterest_oauth_verifier");

  if (deniedByUser) return fail(origin, "denied");
  if (!code || !state || state !== expectedState || !codeVerifier) return fail(origin, "state");

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.redirect(new URL("/giris", origin));

  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(origin, "config");

  const redirectUri = `${origin}/api/connections/pinterest/callback`;
  const basicAuth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;

  const tokenRes = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { Authorization: basicAuth, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });
  const tokenJson = (await tokenRes.json()) as PinterestTokenResponse;
  if (!tokenRes.ok || !tokenJson.access_token) {
    console.error("Pinterest token exchange failed:", tokenJson.message);
    return fail(origin, "token");
  }

  const tokenExpiresAt = tokenJson.expires_in ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString() : null;

  const profileRes = await fetch(`${API}/user_account`, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const profile = (await profileRes.json().catch(() => ({}))) as PinterestProfile;
  // Pinterest's v5 /user_account response doesn't expose a numeric account
  // id the way Meta's /me or TikTok's user/info do — username is the
  // stable identifier it actually returns, so it doubles as
  // external_account_id here (unlike every other provider, where that
  // field is a real numeric id).
  if (!profile.username) {
    console.error("Pinterest /user_account'tan username alınamadı.");
    return fail(origin, "token");
  }

  const defaultBoardId = await resolveDefaultBoardId(tokenJson.access_token, brand.name);
  if (!defaultBoardId) {
    console.error("Pinterest için pano bulunamadı/oluşturulamadı.");
    return fail(origin, "no-board");
  }

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("social_accounts").upsert(
    {
      brand_id: brand.id,
      platform: "pinterest",
      external_account_id: profile.username,
      username: profile.username,
      display_name: profile.business_name || profile.username,
      avatar_url: profile.profile_image ?? null,
      access_token_encrypted: encryptToken(tokenJson.access_token, brand.id),
      refresh_token_encrypted: tokenJson.refresh_token ? encryptToken(tokenJson.refresh_token, brand.id) : null,
      token_expires_at: tokenExpiresAt,
      status: "active",
      last_health_check_at: new Date().toISOString(),
      metadata: { defaultBoardId },
    },
    { onConflict: "brand_id,platform,external_account_id" }
  );
  if (saveError) {
    console.error("social_accounts upsert (pinterest) failed:", saveError.message);
    return fail(origin, "save");
  }

  return NextResponse.redirect(new URL("/settings?tab=baglantilar&connected=pinterest", origin));
}

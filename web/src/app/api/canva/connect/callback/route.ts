import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForToken, fetchCanvaIdentity } from "@/lib/canva/client";

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/settings?tab=baglantilar&connect_error=canva_${reason}`, origin));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const deniedByUser = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("canva_oauth_state")?.value;
  const codeVerifier = cookieStore.get("canva_oauth_verifier")?.value;
  cookieStore.delete("canva_oauth_state");
  cookieStore.delete("canva_oauth_verifier");

  if (deniedByUser) return fail(origin, "denied");
  if (!code || !state || state !== expectedState || !codeVerifier) return fail(origin, "state");

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.redirect(new URL("/giris", origin));

  let tokens;
  try {
    tokens = await exchangeCodeForToken({
      code,
      codeVerifier,
      redirectUri: `${origin}/api/canva/connect/callback`,
    });
  } catch (err) {
    console.error("Canva token exchange failed:", err instanceof Error ? err.message : err);
    return fail(origin, "token");
  }

  let identity;
  try {
    identity = await fetchCanvaIdentity(tokens.access_token);
  } catch (err) {
    console.error("Canva identity fetch failed:", err instanceof Error ? err.message : err);
    return fail(origin, "token");
  }

  const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in ?? 14400) * 1000).toISOString();

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("canva_connections").upsert(
    {
      brand_id: brand.id,
      canva_user_id: identity.userId,
      canva_team_id: identity.teamId,
      access_token_encrypted: encryptToken(tokens.access_token, brand.id),
      refresh_token_encrypted: encryptToken(tokens.refresh_token, brand.id),
      token_expires_at: tokenExpiresAt,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "brand_id" }
  );
  if (saveError) {
    console.error("canva_connections upsert failed:", saveError.message);
    return fail(origin, "save");
  }

  return NextResponse.redirect(new URL("/settings?tab=baglantilar&connected=canva", origin));
}

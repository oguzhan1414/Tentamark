import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// youtube.upload alone only covers managing videos — reading the account's
// own channel via channels.list?mine=true (see callback/route.ts) needs
// youtube.readonly too. Missing it doesn't surface as a clean permission
// error: Google just returns an empty items array, which is exactly why
// this looked like "no channel exists" for a real, channel-having account.
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");

/*
  Standard Google OAuth2 — confidential server-side client, no PKCE
  required (unlike Pinterest). The two params that actually matter here:
  access_type=offline (without it Google never issues a refresh_token at
  all) and prompt=consent (forces the consent screen — and the
  refresh_token with it — even if this Google account already granted the
  same scope before; silently reusing a prior grant is exactly the case
  that comes back with no refresh_token).
*/
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin = new URL(request.url).origin;
  if (!user) {
    return NextResponse.redirect(new URL("/giris", origin));
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "YOUTUBE_CLIENT_ID is not configured." }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("youtube_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${origin}/api/connections/youtube/callback`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}

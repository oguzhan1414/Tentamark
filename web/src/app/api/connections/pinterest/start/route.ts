import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SCOPES = ["boards:read", "boards:write", "pins:read", "pins:write", "user_accounts:read"].join(",");

/*
  Pinterest's v5 authorize endpoint requires PKCE for every client type,
  confidential (server-side) apps included — unlike Meta/Threads/TikTok
  here, where PKCE is only for public clients. Skipping it isn't an option;
  including it is harmless even if a given app type didn't strictly need
  it, so this always generates and sends a challenge.
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

  const clientId = process.env.PINTEREST_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "PINTEREST_CLIENT_ID is not configured." }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  // 32 raw bytes -> 43-char base64url string, right in PKCE's required
  // 43-128 char range with only unreserved characters.
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const cookieStore = await cookies();
  const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  cookieStore.set("pinterest_oauth_state", state, cookieOpts);
  cookieStore.set("pinterest_oauth_verifier", codeVerifier, cookieOpts);

  const redirectUri = `${origin}/api/connections/pinterest/callback`;
  const authUrl = new URL("https://www.pinterest.com/oauth/");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authUrl.toString());
}

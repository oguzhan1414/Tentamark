import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SCOPES = ["instagram_business_basic", "instagram_business_content_publish"].join(",");

/*
  "Instagram API with Instagram Login" — instagram.com, not facebook.com.
  Separate app credentials (INSTAGRAM_APP_ID/SECRET), and this one genuinely
  accepts a plain `scope` param (unlike the Facebook Login for Business flow,
  which needed config_id). `enable_fb_login=false` hides the Facebook option
  from the authorize screen entirely — the whole reason this flow exists
  instead of reusing metaProvider's Page-based one: no Facebook Page
  requirement, no detour through facebook.com.
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

  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "INSTAGRAM_APP_ID is not configured." }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${origin}/api/connections/instagram/callback`;
  const authUrl = new URL("https://www.instagram.com/oauth/authorize");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("enable_fb_login", "false");

  return NextResponse.redirect(authUrl.toString());
}

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const META_OAUTH_VERSION = "v21.0";

/*
  Redirects to Meta's OAuth dialog. Requires signing in first — there's
  nothing to attach the connection to otherwise (getCurrentBrand needs a
  session), so an unauthenticated hit just bounces to /giris rather than
  starting an OAuth flow that would fail at the callback anyway.

  Uses config_id, not scope: the app dashboard set this app up on "Facebook
  Login for Business", a different product from classic Facebook Login.
  It rejects a raw `scope` param ("Invalid Scopes" — confirmed against a real
  attempt, not assumed) — permissions are bundled into a "Login Configuration"
  created in the dashboard instead, and the authorize call references it by
  id. Verified against Meta's current docs rather than training data, per
  02-platform-research.md's own warning that Meta's permission model changes.

  The configuration actually granted: pages_show_list, business_management,
  instagram_business_basic, instagram_business_content_publish.
  instagram_basic/instagram_content_publish were deprecated 2025-01-27,
  replaced by the instagram_business_* names above (also confirmed live, not
  assumed). pages_read_engagement and pages_manage_posts were NOT selectable
  in this configuration's permission picker — unresolved why, so
  facebookProvider.publish()'s pages_manage_posts-shaped call is unverified
  until phase 7 actually exercises it. instagram_business_content_publish
  being granted means Instagram publish may now be viable too, despite
  metaProvider.ts currently hard-stubbing it — worth revisiting then, not now.
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

  const appId = process.env.META_APP_ID;
  const configId = process.env.META_LOGIN_CONFIG_ID;
  if (!appId || !configId) {
    return NextResponse.json(
      {
        error:
          "META_APP_ID / META_LOGIN_CONFIG_ID is not configured. Create a Login Configuration under Facebook Login for Business → Configurations. See docs/13-build-checklist.md phase 5.",
      },
      { status: 500 }
    );
  }

  // CSRF nonce, not a carrier of brand/user info — the callback re-resolves
  // the brand from the session itself rather than trusting anything in state.
  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${origin}/api/connections/meta/callback`;
  const authUrl = new URL(`https://www.facebook.com/${META_OAUTH_VERSION}/dialog/oauth`);
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("config_id", configId);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}

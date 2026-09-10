import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SCOPES = ["threads_basic", "threads_content_publish", "threads_manage_insights"].join(",");

/*
  Separate app credentials from Meta's (THREADS_APP_ID/SECRET, not
  META_APP_ID/SECRET) and a separate OAuth host (threads.net, not
  facebook.com) — Threads is not part of the Graph API despite sharing a
  parent company. Verified against Meta's current Threads docs, not assumed.
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

  const appId = process.env.THREADS_APP_ID;
  if (!appId) {
    return NextResponse.json(
      { error: "THREADS_APP_ID is not configured." },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("threads_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${origin}/api/connections/threads/callback`;
  const authUrl = new URL("https://threads.net/oauth/authorize");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAuthorizeUrl } from "@/lib/canva/client";

// Same PKCE shape as Pinterest's start route — Canva's authorize endpoint
// requires it for every client type, confidential apps included.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin = new URL(request.url).origin;
  if (!user) {
    return NextResponse.redirect(new URL("/giris", origin));
  }

  if (!process.env.CANVA_CLIENT_ID) {
    return NextResponse.json({ error: "CANVA_CLIENT_ID is not configured." }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const cookieStore = await cookies();
  const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  cookieStore.set("canva_oauth_state", state, cookieOpts);
  cookieStore.set("canva_oauth_verifier", codeVerifier, cookieOpts);

  const redirectUri = `${origin}/api/canva/connect/callback`;
  const authUrl = buildAuthorizeUrl({ redirectUri, state, codeChallenge });

  return NextResponse.redirect(authUrl);
}

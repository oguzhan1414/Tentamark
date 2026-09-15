import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";

const HOST = "https://bsky.social";

/*
  Bluesky has no OAuth here — same shape as Telegram's connect route: a
  plain form POST with a credential instead of an authorize redirect. The
  credential is an "app password" (generated in Bluesky's own account
  settings, independently revocable from the real login password), proven
  real by actually logging in with it before anything gets saved.
*/
export async function POST(request: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rawHandle = typeof body?.handle === "string" ? body.handle.trim().replace(/^@/, "") : "";
  const rawPassword = typeof body?.appPassword === "string" ? body.appPassword.trim() : "";
  if (!rawHandle || !rawPassword) {
    return NextResponse.json({ error: "Handle ve app password gerekli." }, { status: 400 });
  }

  const sessionRes = await fetch(`${HOST}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: rawHandle, password: rawPassword }),
  });
  const session = await sessionRes.json().catch(() => null);
  if (!sessionRes.ok || !session?.accessJwt || !session?.did) {
    return NextResponse.json(
      { error: session?.message ?? "Bluesky'a bağlanılamadı — handle veya app password hatalı olabilir." },
      { status: 400 }
    );
  }

  // Best-effort — a missing avatar/displayName shouldn't fail the whole
  // connection, the account is already proven real by createSession above.
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  try {
    const profileRes = await fetch(
      `${HOST}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(session.did)}`,
      { headers: { Authorization: `Bearer ${session.accessJwt}` } }
    );
    const profile = await profileRes.json().catch(() => null);
    if (profileRes.ok && profile) {
      displayName = profile.displayName ?? null;
      avatarUrl = profile.avatar ?? null;
    }
  } catch (err) {
    console.error("Bluesky profil bilgisi alınamadı:", err instanceof Error ? err.message : err);
  }

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("social_accounts").upsert(
    {
      brand_id: brand.id,
      platform: "bluesky",
      external_account_id: session.did,
      username: session.handle,
      display_name: displayName || session.handle,
      avatar_url: avatarUrl,
      access_token_encrypted: encryptToken(rawPassword, brand.id),
      refresh_token_encrypted: null,
      token_expires_at: null,
      status: "active",
      last_health_check_at: new Date().toISOString(),
      metadata: { handle: session.handle },
    },
    { onConflict: "brand_id,platform,external_account_id" }
  );
  if (saveError) {
    console.error("social_accounts upsert (bluesky) failed:", saveError.message);
    return NextResponse.json({ error: "Doğrulandı ama veritabanına kaydedilemedi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

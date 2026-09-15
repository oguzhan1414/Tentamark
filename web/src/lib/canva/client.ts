import { createRemoteJWKSet, jwtVerify } from "jose";
import { encryptToken, decryptToken } from "@/lib/crypto/tokenCipher";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const API = "https://api.canva.com/rest/v1";
const AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize";

// design:content:write also covers create-design; asset scopes aren't
// requested because v1 only opens a blank canvas — no pre-populating from
// an existing Tentamark media library asset yet (see MediaLibraryModal).
export const CANVA_SCOPES = ["design:content:read", "design:content:write", "design:meta:read"].join(" ");

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  message?: string;
};

function basicAuthHeader(): string {
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("CANVA_CLIENT_ID/CANVA_CLIENT_SECRET is not configured.");
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

export function buildAuthorizeUrl(opts: { redirectUri: string; state: string; codeChallenge: string }): string {
  const clientId = process.env.CANVA_CLIENT_ID;
  if (!clientId) throw new Error("CANVA_CLIENT_ID is not configured.");
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", CANVA_SCOPES);
  url.searchParams.set("state", opts.state);
  url.searchParams.set("code_challenge", opts.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

async function requestToken(body: URLSearchParams) {
  const res = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { Authorization: basicAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!res.ok || !json.access_token || !json.refresh_token) {
    throw new Error(json.message || "Canva token isteği başarısız oldu.");
  }
  return json as Required<Pick<TokenResponse, "access_token" | "refresh_token">> & Pick<TokenResponse, "expires_in">;
}

export function exchangeCodeForToken(opts: { code: string; codeVerifier: string; redirectUri: string }) {
  return requestToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code: opts.code,
      code_verifier: opts.codeVerifier,
      redirect_uri: opts.redirectUri,
    })
  );
}

function refreshAccessToken(refreshToken: string) {
  return requestToken(new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }));
}

export async function fetchCanvaIdentity(accessToken: string): Promise<{ userId: string; teamId: string | null }> {
  const res = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const json = await res.json().catch(() => null);
  const userId = json?.team_user?.user_id;
  if (!res.ok || !userId) throw new Error("Canva kullanıcı bilgisi alınamadı.");
  return { userId, teamId: json.team_user.team_id ?? null };
}

/*
  Canva access tokens live 4 hours and refresh tokens are single-use
  (rotate on every refresh) — every caller that needs a live token goes
  through here so the rotated pair is persisted immediately, never just
  held in memory and silently dropped after one use.
*/
export async function getValidAccessToken(
  supabase: SupabaseServerClient,
  brandId: string
): Promise<string | null> {
  const { data: conn } = await supabase
    .from("canva_connections")
    .select("id, access_token_encrypted, refresh_token_encrypted, token_expires_at, status")
    .eq("brand_id", brandId)
    .maybeSingle();
  if (!conn || conn.status !== "active") return null;

  const expiresInMs = new Date(conn.token_expires_at).getTime() - Date.now();
  if (expiresInMs > 5 * 60 * 1000) {
    return decryptToken(conn.access_token_encrypted, brandId);
  }

  const refreshToken = decryptToken(conn.refresh_token_encrypted, brandId);
  const refreshed = await refreshAccessToken(refreshToken);
  const newExpiresAt = new Date(Date.now() + (refreshed.expires_in ?? 14400) * 1000).toISOString();

  await supabase
    .from("canva_connections")
    .update({
      access_token_encrypted: encryptToken(refreshed.access_token, brandId),
      refresh_token_encrypted: encryptToken(refreshed.refresh_token, brandId),
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conn.id);

  return refreshed.access_token;
}

export async function createBlankDesign(accessToken: string, title: string): Promise<{ id: string; editUrl: string }> {
  const res = await fetch(`${API}/designs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    // 1080x1080 — a safe square that reads fine on every platform this app
    // publishes to, since this button has no per-platform context of its
    // own (it lives in the shared media library, not a single-platform
    // compose form).
    body: JSON.stringify({
      type: "type_and_asset",
      design_type: { type: "custom", width: 1080, height: 1080 },
      title,
    }),
  });
  const json = await res.json().catch(() => null);
  const id = json?.design?.id;
  const editUrl = json?.design?.urls?.edit_url;
  if (!res.ok || !id || !editUrl) throw new Error(json?.message || "Canva tasarımı oluşturulamadı.");
  return { id, editUrl };
}

export async function createExportJob(accessToken: string, designId: string): Promise<string> {
  const res = await fetch(`${API}/exports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ design_id: designId, format: { type: "png" } }),
  });
  const json = await res.json().catch(() => null);
  const jobId = json?.job?.id;
  if (!res.ok || !jobId) throw new Error(json?.message || "Canva export başlatılamadı.");
  return jobId;
}

export async function pollExportJob(accessToken: string, jobId: string): Promise<string> {
  // A single-page export renders almost immediately in practice, but the
  // API is async-by-contract — 20 tries * 1.5s gives a 30s ceiling before
  // giving up rather than polling forever.
  for (let attempt = 0; attempt < 20; attempt++) {
    const res = await fetch(`${API}/exports/${jobId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const json = await res.json().catch(() => null);
    const job = json?.job;
    if (job?.status === "success" && job.urls?.[0]) return job.urls[0] as string;
    if (job?.status === "failed") throw new Error(job.error?.message || "Canva export başarısız oldu.");
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("Canva export zaman aşımına uğradı.");
}

// Fetched fresh from Canva on first use (jose caches the key set itself) —
// the correlation_jwt arrives on a public, unauthenticated return route, so
// its signature is what stops someone crafting a fake return hit that makes
// an arbitrary design_id show up as another brand's post image.
const CANVA_JWKS = createRemoteJWKSet(new URL(`${API}/connect/keys`));

export async function verifyReturnJwt(token: string): Promise<{ designId: string }> {
  const { payload } = await jwtVerify(token, CANVA_JWKS, { algorithms: ["EdDSA"] });
  const designId = payload.design_id;
  if (typeof designId !== "string" || !designId) throw new Error("Canva return JWT'sinde design_id yok.");
  return { designId };
}

import { randomBytes, createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { McpErrors } from "../contracts/errors";
import { isMcpScope, type McpScope } from "../contracts/scopes";
import { verifyPkce } from "./pkce";
import { getOAuthClient } from "./oauthClients";
import type { McpActorContext } from "../actorContext";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes — RFC 6749 recommends "a maximum of 10 minutes"
const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export const ACCESS_TOKEN_PREFIX = "tmat_";
const REFRESH_TOKEN_PREFIX = "tmrt_";

function sha256hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/*
  Step 1 of the flow: the consent screen (app/oauth/authorize/page.tsx) calls
  this after the signed-in user clicks "Allow". Validates everything the
  authorize GET request itself already should have validated too — this
  function doesn't trust that the page did it correctly, it re-checks.
*/
export async function createAuthorizationCode(params: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scopes: McpScope[];
  brandIds: string[];
  userId: string;
}): Promise<string> {
  const client = await getOAuthClient(params.clientId);
  if (!client) throw McpErrors.validationError("Unknown client_id.");
  if (!client.redirect_uris.includes(params.redirectUri)) {
    // Exact match only — no prefix/wildcard matching. A loose match here is
    // the classic OAuth open-redirect-to-token-leak vector.
    throw McpErrors.validationError("redirect_uri does not match any URI registered for this client.");
  }
  const invalidScopes = params.scopes.filter((s) => !isMcpScope(s));
  if (invalidScopes.length > 0) throw McpErrors.validationError(`Unknown scope(s): ${invalidScopes.join(", ")}`);
  if (params.brandIds.length === 0) throw McpErrors.validationError("At least one brand must be granted.");

  // Never trust brand ids posted by the consent form. Until per-role scope
  // ceilings are implemented, OAuth grants are owner-only, matching PAT
  // issuance. This prevents a member from using the service-role-backed MCP
  // tools to bypass the UI/RLS permissions they normally have.
  const uniqueBrandIds = [...new Set(params.brandIds)];
  const admin = createAdminClient();
  const { data: brands, error: brandsReadError } = await admin
    .from("brands")
    .select("id, organization_id")
    .in("id", uniqueBrandIds);
  if (brandsReadError) throw McpErrors.temporarilyUnavailable(brandsReadError.message);
  if (!brands || brands.length !== uniqueBrandIds.length) {
    throw McpErrors.forbidden("One or more selected brands are unavailable.");
  }
  const organizationIds = [...new Set(brands.map((brand) => brand.organization_id))];
  if (organizationIds.length !== 1) {
    throw McpErrors.validationError("All granted brands must belong to the same organization.");
  }
  const organizationId = organizationIds[0];
  const { data: ownerMembership, error: membershipError } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("organization_id", organizationId)
    .eq("user_id", params.userId)
    .eq("role", "owner")
    .maybeSingle();
  if (membershipError) throw McpErrors.temporarilyUnavailable(membershipError.message);
  if (!ownerMembership) {
    throw McpErrors.forbidden("Only the organization owner can authorize MCP connections during beta.");
  }

  const rawCode = randomBytes(32).toString("base64url");
  const { error } = await admin.from("mcp_authorization_codes").insert({
    code_hash: sha256hex(rawCode),
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    code_challenge: params.codeChallenge,
    scopes: params.scopes,
    brand_ids: uniqueBrandIds,
    user_id: params.userId,
    organization_id: organizationId,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  return rawCode;
}

export type OAuthTokenResult = { accessToken: string; refreshToken: string; expiresIn: number; scope: string };

/*
  Step 2: the token endpoint's authorization_code grant. Consuming the code
  and creating the connection happen as one logical unit — a code that fails
  the PKCE check or was already used must leave no new connection behind,
  and a code that succeeds must not be exchangeable a second time even if
  this same request somehow runs twice concurrently (the .is("consumed_at",
  null) guard on the update makes the second racer's update affect 0 rows).
*/
export async function exchangeAuthorizationCode(params: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<OAuthTokenResult> {
  const admin = createAdminClient();
  const codeHash = sha256hex(params.code);

  const { data: authCode, error: readError } = await admin
    .from("mcp_authorization_codes")
    .select("*")
    .eq("code_hash", codeHash)
    .maybeSingle();
  if (readError) throw McpErrors.temporarilyUnavailable(readError.message);
  if (!authCode) throw McpErrors.unauthenticated("Invalid or already-used authorization code.");
  if (authCode.consumed_at) throw McpErrors.unauthenticated("This authorization code was already used.");
  if (new Date(authCode.expires_at).getTime() <= Date.now()) {
    throw McpErrors.unauthenticated("This authorization code has expired.");
  }
  if (authCode.client_id !== params.clientId) throw McpErrors.unauthenticated("client_id does not match this code.");
  if (authCode.redirect_uri !== params.redirectUri) {
    throw McpErrors.unauthenticated("redirect_uri does not match the one used to request this code.");
  }
  if (!verifyPkce(params.codeVerifier, authCode.code_challenge)) {
    throw McpErrors.unauthenticated("code_verifier does not match code_challenge.");
  }

  const { data: claimed, error: claimError } = await admin
    .from("mcp_authorization_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("code_hash", codeHash)
    .is("consumed_at", null)
    .select("code_hash")
    .maybeSingle();
  if (claimError) throw McpErrors.temporarilyUnavailable(claimError.message);
  if (!claimed) throw McpErrors.unauthenticated("This authorization code was already used.");

  const client = await getOAuthClient(params.clientId);
  const { data: connection, error: connectionError } = await admin
    .from("mcp_connections")
    .insert({
      organization_id: authCode.organization_id,
      created_by: authCode.user_id,
      connection_type: "oauth",
      client_name: client?.client_name ?? params.clientId,
      oauth_client_id: params.clientId,
      scopes: authCode.scopes,
    })
    .select("id")
    .single();
  if (connectionError || !connection) {
    throw McpErrors.temporarilyUnavailable(connectionError?.message ?? "Could not create connection.");
  }

  const { error: brandsError } = await admin
    .from("mcp_connection_brands")
    .insert((authCode.brand_ids as string[]).map((brandId) => ({ connection_id: connection.id, brand_id: brandId })));
  if (brandsError) {
    await admin.from("mcp_connections").delete().eq("id", connection.id);
    throw McpErrors.temporarilyUnavailable(brandsError.message);
  }

  return issueTokenPair(connection.id, authCode.scopes as string[]);
}

async function issueTokenPair(connectionId: string, scopes: string[]): Promise<OAuthTokenResult> {
  const admin = createAdminClient();
  const rawAccessToken = `${ACCESS_TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
  const rawRefreshToken = `${REFRESH_TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;

  const { error } = await admin.from("mcp_oauth_tokens").insert({
    connection_id: connectionId,
    access_token_hash: sha256hex(rawAccessToken),
    access_token_expires_at: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString(),
    refresh_token_hash: sha256hex(rawRefreshToken),
    refresh_token_expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
  });
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  return {
    accessToken: rawAccessToken,
    refreshToken: rawRefreshToken,
    expiresIn: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    scope: scopes.join(" "),
  };
}

/*
  Step 3: refresh_token grant. Rotates both tokens on every use (OAuth 2.1
  best practice) rather than reissuing just a new access token off the same
  refresh token — a stolen-and-reused-once refresh token is detectable
  because the legitimate client's next refresh attempt will fail (its
  refresh token was already invalidated by the thief's use), rather than
  both parties silently sharing one long-lived refresh token forever.
*/
export async function refreshOAuthTokens(params: { refreshToken: string; clientId: string }): Promise<OAuthTokenResult> {
  const admin = createAdminClient();
  const refreshHash = sha256hex(params.refreshToken);

  const { data: tokenRow, error: readError } = await admin
    .from("mcp_oauth_tokens")
    .select("id, connection_id, refresh_token_expires_at")
    .eq("refresh_token_hash", refreshHash)
    .maybeSingle();
  if (readError) throw McpErrors.temporarilyUnavailable(readError.message);
  if (!tokenRow) throw McpErrors.unauthenticated("Invalid refresh token.");
  if (!tokenRow.refresh_token_expires_at || new Date(tokenRow.refresh_token_expires_at).getTime() <= Date.now()) {
    throw McpErrors.unauthenticated("Refresh token has expired — the user must re-authorize.");
  }

  const { data: connection, error: connectionError } = await admin
    .from("mcp_connections")
    .select("id, status, scopes, oauth_client_id")
    .eq("id", tokenRow.connection_id)
    .maybeSingle();
  if (connectionError || !connection) throw McpErrors.unauthenticated();
  if (connection.status !== "active") throw McpErrors.unauthenticated("This connection has been revoked.");
  if (!connection.oauth_client_id || connection.oauth_client_id !== params.clientId) {
    throw McpErrors.unauthenticated("client_id does not match this refresh token.");
  }

  const rawAccessToken = `${ACCESS_TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
  const rawRefreshToken = `${REFRESH_TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;

  const { data: rotated, error: rotateError } = await admin
    .from("mcp_oauth_tokens")
    .update({
      access_token_hash: sha256hex(rawAccessToken),
      access_token_expires_at: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString(),
      refresh_token_hash: sha256hex(rawRefreshToken),
      refresh_token_expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString(),
    })
    .eq("id", tokenRow.id)
    .eq("refresh_token_hash", refreshHash)
    .select("id")
    .maybeSingle(); // guard against a concurrent refresh already having rotated this row

  if (rotateError) throw McpErrors.temporarilyUnavailable(rotateError.message);
  if (!rotated) throw McpErrors.unauthenticated("Refresh token was already rotated.");

  return {
    accessToken: rawAccessToken,
    refreshToken: rawRefreshToken,
    expiresIn: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    scope: (connection.scopes ?? []).join(" "),
  };
}

/*
  RFC 7009 revocation. Revokes the whole connection rather than just one
  token — an MCP client that hands back its access_token for revocation
  almost always means "disconnect me", and leaving the refresh token (or a
  sibling access token from a since-rotated pair) alive after that would be
  surprising, not a useful partial-revocation feature.
*/
export async function revokeOAuthToken(rawToken: string): Promise<void> {
  const admin = createAdminClient();
  const hash = sha256hex(rawToken);

  const { data } = await admin
    .from("mcp_oauth_tokens")
    .select("connection_id")
    .or(`access_token_hash.eq.${hash},refresh_token_hash.eq.${hash}`)
    .maybeSingle();

  // RFC 7009: "the authorization server responds with HTTP 200 ... even if
  // the token was invalid" — an invalid/already-revoked token is not an
  // error to the caller.
  if (!data) return;

  await admin
    .from("mcp_connections")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", data.connection_id);
}

/*
  Per-request auth for the /mcp endpoint (Aşama 2) when the presented bearer
  token is an OAuth access token — the OAuth-side twin of pat.ts's
  resolveActorFromPat. "Instant" revocation (the doc's own completion
  criterion) is why this is a DB lookup on every call rather than trusting a
  self-contained JWT's unexpired signature: a JWT can't be un-issued, only
  outlived, and this needs to stop working the moment revokeOAuthToken()
  (or the connection-management UI's revoke button) runs, not when a JWT's
  own exp claim eventually catches up.
*/
export async function resolveActorFromOAuthToken(rawToken: string): Promise<McpActorContext> {
  const admin = createAdminClient();
  const hash = sha256hex(rawToken);

  const { data: tokenRow, error: tokenError } = await admin
    .from("mcp_oauth_tokens")
    .select("connection_id, access_token_expires_at")
    .eq("access_token_hash", hash)
    .maybeSingle();
  if (tokenError || !tokenRow) throw McpErrors.unauthenticated();
  if (new Date(tokenRow.access_token_expires_at).getTime() <= Date.now()) {
    throw McpErrors.unauthenticated("Access token has expired — use the refresh token to get a new one.");
  }

  const { data: connection, error: connectionError } = await admin
    .from("mcp_connections")
    .select("id, organization_id, created_by, scopes, status, client_name")
    .eq("id", tokenRow.connection_id)
    .maybeSingle();
  if (connectionError || !connection) throw McpErrors.unauthenticated();
  if (connection.status !== "active") throw McpErrors.unauthenticated("This connection has been revoked.");

  const { data: brandRows, error: brandError } = await admin
    .from("mcp_connection_brands")
    .select("brand_id")
    .eq("connection_id", connection.id);
  if (brandError) throw McpErrors.temporarilyUnavailable(brandError.message);

  admin
    .from("mcp_connections")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", connection.id)
    .then(({ error }) => {
      if (error) console.error("resolveActorFromOAuthToken: last_used_at bump failed:", error.message);
    });

  return {
    actorType: "mcp_oauth",
    userId: connection.created_by ?? "",
    organizationId: connection.organization_id,
    brandIds: (brandRows ?? []).map((r) => r.brand_id as string),
    scopes: (connection.scopes ?? []).filter(isMcpScope),
    connectionId: connection.id,
    clientName: connection.client_name,
  };
}

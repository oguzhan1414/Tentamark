import { randomBytes, createHash, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { McpErrors } from "../contracts/errors";
import { isMcpScope, type McpScope } from "../contracts/scopes";
import type { McpActorContext } from "../actorContext";

/*
  Personal Access Token issuance/verification — Aşama 1's PAT half (the
  faster-to-ship path docs/mcp-entegrasyon-plani.md recommends before a full
  OAuth 2.1 authorization server). A PAT and a future OAuth grant both
  produce the same McpActorContext shape; a tool handler never needs to know
  which one it's talking to.

  Token shape: `tmpat_<64 hex chars>`. The first 8 hex chars after the
  prefix are also stored separately as `token_prefix` so verification can
  look the row up by an indexed equality match before ever touching
  token_hash — comparing a caller-supplied hash against every stored hash in
  the table would be a needless full scan, and would also make a timing
  side-channel across rows (not just within one row) worth worrying about.
*/

const TOKEN_PREFIX = "tmpat_";

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

function safeHashesEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export type IssuePatParams = {
  organizationId: string;
  createdBy: string;
  label: string;
  brandIds: string[]; // required, non-empty — never an implicit "all brands"
  scopes: McpScope[];
  expiresInDays: number;
};

export async function issuePersonalAccessToken(
  params: IssuePatParams
): Promise<{ connectionId: string; rawToken: string; tokenPrefix: string; expiresAt: string }> {
  if (params.brandIds.length === 0) {
    throw McpErrors.validationError("A personal access token must be granted at least one brand.");
  }
  const invalidScopes = params.scopes.filter((s) => !isMcpScope(s));
  if (invalidScopes.length > 0) {
    throw McpErrors.validationError(`Unknown scope(s): ${invalidScopes.join(", ")}`);
  }
  if (params.expiresInDays <= 0 || params.expiresInDays > 365) {
    throw McpErrors.validationError("expiresInDays must be between 1 and 365 — PATs are never issued without an expiry.");
  }

  const admin = createAdminClient();
  const uniqueBrandIds = [...new Set(params.brandIds)];
  const { data: grantedBrands, error: brandReadError } = await admin
    .from("brands")
    .select("id")
    .eq("organization_id", params.organizationId)
    .in("id", uniqueBrandIds);
  if (brandReadError) throw McpErrors.temporarilyUnavailable(brandReadError.message);
  if (!grantedBrands || grantedBrands.length !== uniqueBrandIds.length) {
    throw McpErrors.forbidden("One or more selected brands do not belong to this organization.");
  }

  const { data: connection, error: connectionError } = await admin
    .from("mcp_connections")
    .insert({
      organization_id: params.organizationId,
      created_by: params.createdBy,
      connection_type: "pat",
      client_name: params.label,
      scopes: params.scopes,
    })
    .select("id")
    .single();
  if (connectionError || !connection) {
    throw McpErrors.temporarilyUnavailable(connectionError?.message ?? "Could not create connection.");
  }

  const { error: brandsError } = await admin
    .from("mcp_connection_brands")
    .insert(uniqueBrandIds.map((brandId) => ({ connection_id: connection.id, brand_id: brandId })));
  if (brandsError) {
    await admin.from("mcp_connections").delete().eq("id", connection.id);
    throw McpErrors.temporarilyUnavailable(brandsError.message);
  }

  const secret = randomBytes(32).toString("hex");
  const rawToken = `${TOKEN_PREFIX}${secret}`;
  const tokenPrefix = `${TOKEN_PREFIX}${secret.slice(0, 8)}`;
  const expiresAt = new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { error: patError } = await admin.from("mcp_personal_access_tokens").insert({
    connection_id: connection.id,
    token_prefix: tokenPrefix,
    token_hash: hashToken(rawToken),
    expires_at: expiresAt,
  });
  if (patError) {
    await admin.from("mcp_connections").delete().eq("id", connection.id);
    throw McpErrors.temporarilyUnavailable(patError.message);
  }

  return { connectionId: connection.id, rawToken, tokenPrefix, expiresAt };
}

export async function resolveActorFromPat(rawToken: string): Promise<McpActorContext> {
  if (!rawToken.startsWith(TOKEN_PREFIX)) throw McpErrors.unauthenticated();
  const secret = rawToken.slice(TOKEN_PREFIX.length);
  if (secret.length < 16) throw McpErrors.unauthenticated();
  const tokenPrefix = `${TOKEN_PREFIX}${secret.slice(0, 8)}`;

  const admin = createAdminClient();
  const { data: pat, error: patError } = await admin
    .from("mcp_personal_access_tokens")
    .select("connection_id, token_hash, expires_at")
    .eq("token_prefix", tokenPrefix)
    .maybeSingle();
  if (patError || !pat) throw McpErrors.unauthenticated();

  if (!safeHashesEqual(hashToken(rawToken), pat.token_hash)) throw McpErrors.unauthenticated();
  if (new Date(pat.expires_at).getTime() <= Date.now()) {
    throw McpErrors.unauthenticated("This personal access token has expired.");
  }

  const { data: connection, error: connectionError } = await admin
    .from("mcp_connections")
    .select("id, organization_id, created_by, scopes, status, client_name")
    .eq("id", pat.connection_id)
    .maybeSingle();
  if (connectionError || !connection) throw McpErrors.unauthenticated();
  if (connection.status !== "active") throw McpErrors.unauthenticated("This connection has been revoked.");

  const { data: brandRows, error: brandError } = await admin
    .from("mcp_connection_brands")
    .select("brand_id")
    .eq("connection_id", connection.id);
  if (brandError) throw McpErrors.temporarilyUnavailable(brandError.message);

  // Best-effort — a failed last_used_at bump should never block the actual
  // call it's timestamping.
  admin
    .from("mcp_connections")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", connection.id)
    .then(({ error }) => {
      if (error) console.error("resolveActorFromPat: last_used_at bump failed:", error.message);
    });

  return {
    actorType: "mcp_pat",
    userId: connection.created_by ?? "",
    organizationId: connection.organization_id,
    brandIds: (brandRows ?? []).map((r) => r.brand_id as string),
    scopes: (connection.scopes ?? []).filter(isMcpScope),
    connectionId: connection.id,
    clientName: connection.client_name,
  };
}

export type ConnectionSummary = {
  id: string;
  clientName: string;
  connectionType: "pat" | "oauth";
  scopes: McpScope[];
  brandIds: string[];
  status: "active" | "revoked";
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  tokenPrefix: string | null;
  expiresAt: string | null;
};

export async function listConnectionsForOrg(organizationId: string): Promise<ConnectionSummary[]> {
  const admin = createAdminClient();
  const { data: connections, error } = await admin
    .from("mcp_connections")
    .select(
      "id, client_name, connection_type, scopes, status, created_at, last_used_at, revoked_at, mcp_connection_brands(brand_id), mcp_personal_access_tokens(token_prefix, expires_at)"
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  return (connections ?? []).map((c) => {
    const pat = Array.isArray(c.mcp_personal_access_tokens) ? c.mcp_personal_access_tokens[0] : c.mcp_personal_access_tokens;
    return {
      id: c.id,
      clientName: c.client_name,
      connectionType: c.connection_type,
      scopes: (c.scopes ?? []).filter(isMcpScope),
      brandIds: (c.mcp_connection_brands ?? []).map((b: { brand_id: string }) => b.brand_id),
      status: c.status,
      createdAt: c.created_at,
      lastUsedAt: c.last_used_at,
      revokedAt: c.revoked_at,
      tokenPrefix: pat?.token_prefix ?? null,
      expiresAt: pat?.expires_at ?? null,
    };
  });
}

export async function revokeConnection(params: { connectionId: string; organizationId: string; revokedBy: string }): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("mcp_connections")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_by: params.revokedBy })
    .eq("id", params.connectionId)
    .eq("organization_id", params.organizationId)
    .eq("status", "active")
    .select("id")
    .maybeSingle();
  if (error) throw McpErrors.temporarilyUnavailable(error.message);
  if (!data) throw McpErrors.notFound("mcp_connection", params.connectionId);
}

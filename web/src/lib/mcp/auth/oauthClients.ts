import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { McpErrors } from "../contracts/errors";

/*
  Dynamic Client Registration (RFC 7591), minimal profile — an MCP client
  (Claude, ChatGPT, Cursor, ...) calls POST /api/oauth/register once,
  unauthenticated, before it ever shows the user anything, and gets back a
  client_id to use in every subsequent /oauth/authorize redirect. This is
  the same reason browsers don't ask a user to "register" a website before
  visiting it — the registration step is between the client software and
  the server, not something a human does.

  Public clients only: MCP clients are expected to be public (PKCE-only, no
  client_secret) — see docs/mcp-entegrasyon-plani.md and the MCP
  authorization spec. is_confidential/client_secret_hash exist in the schema
  for a possible future confidential-client path but aren't produced here.
*/

const MAX_REDIRECT_URIS = 10;
const MAX_CLIENT_NAME_LENGTH = 100;
const MAX_REDIRECT_URI_LENGTH = 2048;

function isHttpsOrLocalhost(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hash || parsed.username || parsed.password) return false;
    if (parsed.protocol === "https:") return true;
    // Loopback redirect URIs are the one documented OAuth 2.1 exception to
    // "https only" — a locally-running MCP client (Claude Desktop, a CLI)
    // legitimately redirects to 127.0.0.1/localhost over plain HTTP.
    return parsed.protocol === "http:" && (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost");
  } catch {
    return false;
  }
}

export async function registerOAuthClient(params: {
  clientName: string;
  redirectUris: string[];
}): Promise<{ clientId: string; clientName: string; redirectUris: string[] }> {
  if (!params.clientName.trim()) throw McpErrors.validationError("client_name is required.");
  if (params.clientName.trim().length > MAX_CLIENT_NAME_LENGTH) {
    throw McpErrors.validationError(`client_name must be at most ${MAX_CLIENT_NAME_LENGTH} characters.`);
  }
  if (params.redirectUris.length === 0 || params.redirectUris.length > MAX_REDIRECT_URIS) {
    throw McpErrors.validationError(`redirect_uris must contain between 1 and ${MAX_REDIRECT_URIS} URIs.`);
  }
  const redirectUris = [...new Set(params.redirectUris)];
  const badUri = redirectUris.find((uri) => uri.length > MAX_REDIRECT_URI_LENGTH || !isHttpsOrLocalhost(uri));
  if (badUri) {
    throw McpErrors.validationError(`redirect_uri must be https:// (or http://localhost for local clients): ${badUri}`);
  }

  const clientId = `mcpc_${randomBytes(16).toString("hex")}`;
  const admin = createAdminClient();
  const { error } = await admin.from("mcp_oauth_clients").insert({
    client_id: clientId,
    client_name: params.clientName.trim(),
    redirect_uris: redirectUris,
    is_confidential: false,
  });
  if (error) throw McpErrors.temporarilyUnavailable(error.message);

  return { clientId, clientName: params.clientName.trim(), redirectUris };
}

export interface RegisteredOAuthClient {
  client_id: string;
  client_name: string;
  redirect_uris: string[];
  is_confidential: boolean;
}

export async function getOAuthClient(clientId: string): Promise<RegisteredOAuthClient | null> {
  const admin = createAdminClient();
  const normalizedId = clientId.trim();

  // Known / well-known clients (Claude AI, CIMD)
  if (
    normalizedId === "claude" ||
    normalizedId === "claude-ai" ||
    normalizedId === "https://claude.ai" ||
    normalizedId.startsWith("https://claude.ai/")
  ) {
    const claudeRedirectUris = [
      "https://claude.ai/api/mcp/auth_callback",
      "https://claude.ai/api/mcp/auth_callback/",
      "https://claude.ai/oauth/callback",
      "https://claude.ai/oauth/callback/",
    ];

    const { data: existing } = await admin
      .from("mcp_oauth_clients")
      .select("client_id, client_name, redirect_uris, is_confidential")
      .eq("client_id", normalizedId)
      .maybeSingle();

    if (existing) {
      const existingUris = (existing.redirect_uris as string[]) ?? [];
      const merged = Array.from(new Set([...existingUris, ...claudeRedirectUris]));
      if (merged.length > existingUris.length) {
        await admin
          .from("mcp_oauth_clients")
          .update({ redirect_uris: merged })
          .eq("client_id", normalizedId);
        existing.redirect_uris = merged;
      }
      return existing as unknown as RegisteredOAuthClient;
    }

    const { data: inserted, error: insertError } = await admin
      .from("mcp_oauth_clients")
      .insert({
        client_id: normalizedId,
        client_name: "Claude AI",
        redirect_uris: claudeRedirectUris,
        is_confidential: false,
      })
      .select("client_id, client_name, redirect_uris, is_confidential")
      .maybeSingle();

    if (!insertError && inserted) return inserted as unknown as RegisteredOAuthClient;
  }

  const { data, error } = await admin
    .from("mcp_oauth_clients")
    .select("client_id, client_name, redirect_uris, is_confidential")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw McpErrors.temporarilyUnavailable(error.message);
  return (data as unknown as RegisteredOAuthClient) ?? null;
}


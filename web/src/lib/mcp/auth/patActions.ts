"use server";

import { createClient } from "@/lib/supabase/server";
import {
  issuePersonalAccessToken,
  listConnectionsForOrg,
  revokeConnection,
  type ConnectionSummary,
} from "./pat";
import { MCP_SCOPES, type McpScope } from "../contracts/scopes";

/*
  Thin Server Action adapters over lib/mcp/auth/pat.ts, for the Settings
  "Geliştirici Erişimi" tab. organizationId and the caller's role are always
  resolved from the real session here — never accepted as a parameter from
  the client — same reasoning settings/page.tsx's own team-management
  actions already use for organizationId/myRole.
*/

async function requireOwnerContext(): Promise<{ organizationId: string; userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (!membership) throw new Error("Only the organization owner can manage developer connections.");
  return { organizationId: membership.organization_id, userId: user.id };
}

export async function createPersonalAccessToken(params: {
  label: string;
  brandIds: string[];
  scopes: McpScope[];
  expiresInDays: number;
}): Promise<{ rawToken: string; tokenPrefix: string; expiresAt: string } | { error: string }> {
  try {
    const { organizationId, userId } = await requireOwnerContext();

    // Defense-in-depth beyond issuePersonalAccessToken's own scope check:
    // reject anything not in the frozen scope catalogue before it ever
    // reaches the DB insert.
    const invalid = params.scopes.filter((s) => !(MCP_SCOPES as readonly string[]).includes(s));
    if (invalid.length > 0) return { error: `Unknown scope(s): ${invalid.join(", ")}` };

    const result = await issuePersonalAccessToken({
      organizationId,
      createdBy: userId,
      label: params.label.trim() || "Untitled connection",
      brandIds: params.brandIds,
      scopes: params.scopes,
      expiresInDays: params.expiresInDays,
    });
    return { rawToken: result.rawToken, tokenPrefix: result.tokenPrefix, expiresAt: result.expiresAt };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create token." };
  }
}

export async function getOrgBrands(): Promise<{ id: string; name: string }[] | { error: string }> {
  try {
    const { organizationId } = await requireOwnerContext();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .select("id, name")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    return data ?? [];
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not load brands." };
  }
}

export async function getOrgConnections(): Promise<ConnectionSummary[] | { error: string }> {
  try {
    const { organizationId } = await requireOwnerContext();
    return await listConnectionsForOrg(organizationId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not load connections." };
  }
}

export async function revokeOrgConnection(connectionId: string): Promise<{ ok: true } | { error: string }> {
  try {
    const { organizationId, userId } = await requireOwnerContext();
    await revokeConnection({ connectionId, organizationId, revokedBy: userId });
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not revoke connection." };
  }
}

import type { McpScope } from "./contracts/scopes";
import { McpErrors } from "./contracts/errors";

/*
  The single shape every MCP tool handler receives instead of a raw brandId
  string — docs/mcp-entegrasyon-plani.md's "İkinci kritik eksik" section is
  explicit that domain services must never trust a caller-supplied brandId on
  its own; they check it against actor.brandIds instead.

  This file only defines the type and the pure, DB-free authorization checks
  built on top of it. Actually producing one (from an OAuth access token or a
  PAT) is Aşama 1's job — see the (not yet written) lib/mcp/auth/resolveActor.ts
  — because that requires the mcp_connections / mcp_personal_access_tokens
  tables this stage doesn't create yet. Keeping the checks here decoupled
  from how the actor was resolved means Aşama 1 can land PAT support first
  and OAuth later without this file, or any tool handler, changing at all.
*/
export type McpActorType = "user" | "mcp_oauth" | "mcp_pat";

export type McpActorContext = {
  actorType: McpActorType;
  // The Tentamark human this credential ultimately traces back to — a PAT or
  // OAuth grant is always issued *by* a profile, never anonymously. Used both
  // for RLS delegation (see resolveActor's short-lived-JWT approach) and as
  // the audit trail's actor_id when actorType !== "user".
  userId: string;
  organizationId: string;
  // Every brand this credential may act on. A single-brand connection (the
  // common case) has exactly one entry — assertBrandAccess below defaults to
  // it when a tool call omits brandId.
  brandIds: string[];
  scopes: McpScope[];
  // The mcp_connections/mcp_personal_access_tokens row id this credential
  // came from — recorded on every audit log row (see lib/mcp/audit.ts) so a
  // revoked connection's history stays attributable after revocation.
  connectionId: string;
  clientName?: string;
};

export function assertScopes(actor: McpActorContext, required: McpScope[]): void {
  const missing = required.filter((scope) => !actor.scopes.includes(scope));
  if (missing.length > 0) {
    throw McpErrors.forbidden(`This connection is missing required scope(s): ${missing.join(", ")}.`, {
      missing,
      granted: actor.scopes,
    });
  }
}

// Resolves which brand a tool call should act on, and proves the actor is
// actually allowed to touch it — every tool handler must call this before
// reading or writing anything, never branch on a raw `input.brandId` itself.
export function assertBrandAccess(actor: McpActorContext, requestedBrandId?: string): string {
  if (actor.brandIds.length === 0) {
    throw McpErrors.forbidden("This connection has no brands granted.");
  }

  if (!requestedBrandId) {
    if (actor.brandIds.length === 1) return actor.brandIds[0];
    throw McpErrors.validationError(
      "This connection has access to multiple brands — brandId is required.",
      { brandIds: actor.brandIds }
    );
  }

  if (!actor.brandIds.includes(requestedBrandId)) {
    throw McpErrors.forbidden(`Brand ${requestedBrandId} is not granted to this connection.`, {
      requestedBrandId,
      grantedBrandIds: actor.brandIds,
    });
  }

  return requestedBrandId;
}

import { createAdminClient } from "@/lib/supabase/admin";
import type { McpActorContext } from "./actorContext";

/*
  The one and only place in the codebase allowed to write to audit_logs. Per
  patches/0047's comment: no DB constraint can actually stop a service-role
  caller from bypassing this and writing (or updating/deleting) the table
  directly, so the guarantee here is a convention, not a wall — every MCP
  tool handler and every UI mutation this stage extracts into a shared
  domain service (see Aşama 0 item 3) must call recordAuditEvent() and never
  supabase.from("audit_logs") directly.

  Audit currently follows the domain mutation rather than sharing its DB
  transaction. A failed audit insert is therefore logged but must not turn a
  committed mutation into a reported failure: doing so would invite an MCP
  retry and could repeat the side effect. Sensitive mutations should move to
  transaction-backed RPCs before audit persistence is treated as mandatory.
*/

export type AuditActionInput = {
  actor: McpActorContext | { actorType: "user" | "system"; userId: string | null; organizationId: string };
  action: string; // e.g. "CONTENT_APPROVED", "SCHEDULE_UPDATED" — see audit_logs.action's existing convention.
  entityType: string;
  entityId: string;
  outcome: "success" | "denied" | "failed";
  requestId?: string;
  toolName?: string;
  clientName?: string;
  // Minimal, non-secret snapshots only — never a full row, never a token.
  // See patches/0047's column comments for what must never land here.
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function isMcpActor(actor: AuditActionInput["actor"]): actor is McpActorContext {
  return actor.actorType === "mcp_oauth" || actor.actorType === "mcp_pat";
}

export async function recordAuditEvent(input: AuditActionInput): Promise<void> {
  const admin = createAdminClient();
  const { actor } = input;

  const { error } = await admin.from("audit_logs").insert({
    organization_id: actor.organizationId,
    user_id: actor.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    actor_type: actor.actorType,
    mcp_connection_id: isMcpActor(actor) ? actor.connectionId : null,
    request_id: input.requestId ?? null,
    tool_name: input.toolName ?? (isMcpActor(actor) ? actor.currentToolName : undefined) ?? null,
    outcome: input.outcome,
    before_state: input.beforeState ?? null,
    after_state: input.afterState ?? null,
    client_name: input.clientName ?? (isMcpActor(actor) ? actor.clientName ?? null : null),
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("recordAuditEvent failed:", error.message, { action: input.action, entityId: input.entityId });
  }
}

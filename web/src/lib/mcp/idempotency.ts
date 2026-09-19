import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { McpErrors } from "./contracts/errors";

/*
  Every write tool in contracts/tools/writeTools.ts requires an
  idempotencyKey. This module is what makes that requirement real: a caller
  retrying the exact same call (same connection + tool + key + input) gets
  the original result back instead of a second draft/reschedule/approval.

  Deliberately insert-first rather than select-then-insert: two genuinely
  concurrent calls with the same key both attempt the INSERT, the unique
  constraint on (connection_id, tool_name, idempotency_key) lets exactly one
  through, and the loser falls back to reading whatever the winner wrote —
  no separate advisory lock needed for this stage.
*/

export function computeRequestHash(input: unknown): string {
  // JSON.stringify on an object with a stable key order matters here — two
  // logically-identical payloads with keys in a different order must hash
  // the same, or a perfectly good retry looks like key reuse with different
  // input. Callers pass already-validated (schema-parsed) input, so keys
  // come from the same schema every time; sorting defends against a client
  // that happens to serialize its JSON in a different key order between tries.
  const sorted = JSON.stringify(input, Object.keys(input as object).sort());
  return createHash("sha256").update(sorted).digest("hex");
}

export type IdempotencyOutcome<Result> =
  | { status: "new" }
  | { status: "retry" } // a prior attempt with this exact key+input failed; safe to run again
  | { status: "replay"; result: Result } // a prior attempt with this exact key+input already completed
  | { status: "in_progress" }; // another call with this key+input is currently executing

type IdempotencyKeyArgs = { connectionId: string; toolName: string; idempotencyKey: string; input: unknown };

export async function checkIdempotency<Result = unknown>({
  connectionId,
  toolName,
  idempotencyKey,
  input,
}: IdempotencyKeyArgs): Promise<IdempotencyOutcome<Result>> {
  const admin = createAdminClient();
  const requestHash = computeRequestHash(input);

  const { error: insertError } = await admin.from("mcp_idempotency_keys").insert({
    connection_id: connectionId,
    tool_name: toolName,
    idempotency_key: idempotencyKey,
    request_hash: requestHash,
    status: "in_progress",
  });

  if (!insertError) return { status: "new" };

  // 23505 = unique_violation — someone (possibly this same caller, retrying)
  // already claimed this (connection, tool, key) triple.
  if (insertError.code !== "23505") {
    throw McpErrors.temporarilyUnavailable(`Idempotency check failed: ${insertError.message}`);
  }

  const { data: existing, error: selectError } = await admin
    .from("mcp_idempotency_keys")
    .select("request_hash, status, result")
    .eq("connection_id", connectionId)
    .eq("tool_name", toolName)
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (selectError || !existing) {
    throw McpErrors.temporarilyUnavailable("Idempotency check failed to read the existing record.");
  }

  if (existing.request_hash !== requestHash) {
    throw McpErrors.conflict(
      "This idempotencyKey was already used for a different request. Generate a new key for a genuinely new call.",
      { toolName, idempotencyKey }
    );
  }

  if (existing.status === "completed") return { status: "replay", result: existing.result as Result };
  if (existing.status === "failed") {
    // Atomically reclaim a failed key. Without the status predicate two
    // simultaneous retries would both receive "retry" and repeat the side
    // effect in parallel.
    const { data: reclaimed, error: reclaimError } = await admin
      .from("mcp_idempotency_keys")
      .update({ status: "in_progress", error: null, completed_at: null })
      .eq("connection_id", connectionId)
      .eq("tool_name", toolName)
      .eq("idempotency_key", idempotencyKey)
      .eq("status", "failed")
      .select("id")
      .maybeSingle();
    if (reclaimError) throw McpErrors.temporarilyUnavailable(`Idempotency retry claim failed: ${reclaimError.message}`);
    return reclaimed ? { status: "retry" } : { status: "in_progress" };
  }
  return { status: "in_progress" };
}

export async function completeIdempotency(args: Omit<IdempotencyKeyArgs, "input">, result: unknown): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("mcp_idempotency_keys")
    .update({ status: "completed", result, completed_at: new Date().toISOString() })
    .eq("connection_id", args.connectionId)
    .eq("tool_name", args.toolName)
    .eq("idempotency_key", args.idempotencyKey);
}

export async function failIdempotency(args: Omit<IdempotencyKeyArgs, "input">, error: unknown): Promise<void> {
  const admin = createAdminClient();
  const errorPayload = error instanceof Error ? { message: error.message } : { message: String(error) };
  await admin
    .from("mcp_idempotency_keys")
    .update({ status: "failed", error: errorPayload, completed_at: new Date().toISOString() })
    .eq("connection_id", args.connectionId)
    .eq("tool_name", args.toolName)
    .eq("idempotency_key", args.idempotencyKey);
}

/*
  Optimistic concurrency for mutation tools that edit an existing row
  (reschedule_draft, submit_for_approval) rather than create a new one.
  Requires patches/0047's set_updated_at trigger to actually be applied to
  the table being checked — without it, `currentUpdatedAt` never changes and
  this check becomes a no-op that always passes.
*/
export function assertNotStale(params: { expected: string; current: string; entityType: string; entityId: string }): void {
  const expectedMs = new Date(params.expected).getTime();
  const currentMs = new Date(params.current).getTime();
  if (expectedMs !== currentMs) {
    throw McpErrors.conflict(`${params.entityType} ${params.entityId} was modified since it was last read.`, {
      expectedUpdatedAt: params.expected,
      currentUpdatedAt: params.current,
    });
  }
}

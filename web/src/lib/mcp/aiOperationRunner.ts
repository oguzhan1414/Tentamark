import { createAdminClient } from "@/lib/supabase/admin";
import { McpErrors } from "./contracts/errors";
import { checkIdempotency, completeIdempotency, failIdempotency } from "./idempotency";
import type { McpActorContext } from "./actorContext";

/*
  Shared runner for every MCP tool that calls into web/src/lib/ai/*. Per
  docs/mcp-entegrasyon-plani.md's Aşama 0 item 5, this owns: brand-scoped
  cost budget, per-connection concurrency limiting, a wall-clock timeout, and
  guaranteed ai_runs visibility for the call — an MCP tool handler is not
  supposed to call generateDrafts()/recycleContentHook()/etc. directly, it
  calls executeAiOperation() with that function as `run`.

  Two honest limitations, not silently glossed over:

  1. Some existing functions (generateDrafts, generateWeeklyPack,
     suggestPostIdea, askAssistant, suggestPostImprovement — see the audit in
     docs/mcp-entegrasyon-plani.md) already insert their own ai_runs row.
     Others (analyzePostHookAndVirality, getBrandVoiceConsistency,
     recycleContentHook, generateSmartHashtags, remixContent,
     fixBrandSafetyIssues, generateCaptionLab, generateImage) do not. Pass
     `selfLogs: true` for the first group so this runner doesn't double-log;
     for the second group this runner writes a best-effort row itself, with
     model/token fields left unknown unless `run` reports them via its
     return value's `usage` field. Getting real per-call cost data out of the
     second group means refactoring each to return usage instead of hiding
     it inside its own ai_runs insert — worth doing, not done in this pass.

  2. Concurrency limiting is an in-process Map, not a distributed counter.
     It only protects a single server instance from one connection opening
     many parallel AI calls; it does nothing across multiple instances/cold
     starts. Fine for now, not a real limit once this runs on more than one
     instance — swap for a DB-backed or Redis-backed counter before that
     matters.

  3. The timeout below only stops *waiting* on the underlying call — none of
     the wrapped functions accept an AbortSignal, so the Groq/OpenAI request
     itself keeps running server-side after a timeout fires. This bounds
     latency for the caller, it does not bound spend for a single call.
*/

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_CONCURRENT_PER_CONNECTION = 3;
const DEFAULT_MONTHLY_BUDGET_USD = Number(process.env.MCP_MONTHLY_COST_BUDGET_USD ?? 50);

const inFlightByConnection = new Map<string, number>();

async function assertWithinMonthlyBudget(brandId: string): Promise<void> {
  const admin = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data, error } = await admin
    .from("ai_runs")
    .select("cost_estimate_usd")
    .eq("brand_id", brandId)
    .gte("created_at", monthStart.toISOString());

  if (error) {
    // A budget check failing open (instead of blocking every call) is a
    // deliberate choice — a monitoring gap shouldn't take down every MCP
    // tool call. It's logged so the gap itself is visible.
    console.error("assertWithinMonthlyBudget: could not read ai_runs, failing open:", error.message);
    return;
  }

  const spent = (data ?? []).reduce((sum, row) => sum + (Number(row.cost_estimate_usd) || 0), 0);
  if (spent >= DEFAULT_MONTHLY_BUDGET_USD) {
    throw McpErrors.quotaExceeded(
      `This brand has used its AI budget for this month ($${spent.toFixed(2)} of $${DEFAULT_MONTHLY_BUDGET_USD}).`
    );
  }
}

function acquireConcurrencySlot(connectionId: string, max: number): () => void {
  const current = inFlightByConnection.get(connectionId) ?? 0;
  if (current >= max) {
    throw McpErrors.rateLimited(`This connection already has ${max} AI operations in flight — wait for one to finish.`);
  }
  inFlightByConnection.set(connectionId, current + 1);
  return () => {
    const next = (inFlightByConnection.get(connectionId) ?? 1) - 1;
    if (next <= 0) inFlightByConnection.delete(connectionId);
    else inFlightByConnection.set(connectionId, next);
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(McpErrors.temporarilyUnavailable(`AI operation exceeded ${ms}ms.`)), ms)),
  ]);
}

export type AiOperationUsage = { model: string; inputTokens: number; outputTokens: number; costEstimateUsd?: number };
export type AiOperationRunResult<T> = { value: T; usage?: AiOperationUsage };

export async function executeAiOperation<T>(params: {
  actor: McpActorContext;
  brandId: string;
  operation: string; // e.g. "analyze_hook" — logged as ai_runs.stage = `mcp:${operation}`
  idempotencyKey: string;
  input: unknown; // the tool's full validated input, hashed for idempotency replay detection
  selfLogs: boolean; // true for generateDrafts/generateWeeklyPack/suggestPostIdea/askAssistant/suggestPostImprovement
  timeoutMs?: number;
  maxConcurrentPerConnection?: number;
  run: () => Promise<AiOperationRunResult<T> | T>;
}): Promise<T> {
  const {
    actor,
    brandId,
    operation,
    idempotencyKey,
    input,
    selfLogs,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxConcurrentPerConnection = DEFAULT_MAX_CONCURRENT_PER_CONNECTION,
    run,
  } = params;

  const idempotencyArgs = { connectionId: actor.connectionId, toolName: operation, idempotencyKey };
  const outcome = await checkIdempotency<T>({ ...idempotencyArgs, input });
  if (outcome.status === "replay") return outcome.result;
  if (outcome.status === "in_progress") {
    throw McpErrors.conflict("This exact request is already being processed.");
  }

  await assertWithinMonthlyBudget(brandId);
  const releaseSlot = acquireConcurrencySlot(actor.connectionId, maxConcurrentPerConnection);

  const startedAt = Date.now();
  try {
    const rawResult = await withTimeout(run(), timeoutMs);
    const hasUsageShape = typeof rawResult === "object" && rawResult !== null && "value" in rawResult;
    const value = hasUsageShape ? (rawResult as AiOperationRunResult<T>).value : (rawResult as T);
    const usage = hasUsageShape ? (rawResult as AiOperationRunResult<T>).usage : undefined;

    if (!selfLogs) {
      const admin = createAdminClient();
      await admin.from("ai_runs").insert({
        brand_id: brandId,
        stage: `mcp:${operation}`,
        prompt_version: "mcp-runner-v1",
        model: usage?.model ?? "unknown",
        input_tokens: usage?.inputTokens ?? 0,
        output_tokens: usage?.outputTokens ?? 0,
        cost_estimate_usd: usage?.costEstimateUsd ?? 0,
        latency_ms: Date.now() - startedAt,
        status: "SUCCESS",
        error: null,
      });
    }

    await completeIdempotency(idempotencyArgs, value);
    return value;
  } catch (err) {
    if (!selfLogs) {
      const admin = createAdminClient();
      await admin.from("ai_runs").insert({
        brand_id: brandId,
        stage: `mcp:${operation}`,
        prompt_version: "mcp-runner-v1",
        model: "unknown",
        input_tokens: 0,
        output_tokens: 0,
        cost_estimate_usd: 0,
        latency_ms: Date.now() - startedAt,
        status: "ERROR",
        error: err instanceof Error ? err.message : String(err),
      });
    }
    await failIdempotency(idempotencyArgs, err);
    throw err;
  } finally {
    releaseSlot();
  }
}

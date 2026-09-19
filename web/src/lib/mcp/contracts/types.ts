import type { McpScope } from "./scopes";

// Loose on purpose — this only needs to be precise enough to hand to an MCP
// client as a tool's `inputSchema`/`outputSchema`, not a full JSON Schema
// implementation. Each tool file writes real, specific schemas against this
// shape; nothing here validates them beyond "it's a plain object".
export type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: readonly (string | number)[];
  description?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean;
  [key: string]: unknown;
};

// "read"    — no side effects, safe to retry/cache, never needs an idempotency key.
// "write"   — creates or edits a draft-stage resource (content still short of review).
// "approve" — moves content across a review boundary (submit/decide), never touches
//             a live social account.
// "publish" — the one class that can end with a real post landing on a real
//             platform; per docs/mcp-entegrasyon-plani.md this must never happen
//             directly from a tool call, only via request_publish_approval's
//             human-clickable link (see Aşama 5).
export type ToolRiskClass = "read" | "write" | "approve" | "publish";

export type ToolContract<Name extends string = string> = {
  name: Name;
  description: string;
  requiredScopes: McpScope[];
  riskClass: ToolRiskClass;
  // Whether repeated calls with the same idempotencyKey (see
  // lib/mcp/idempotency.ts) must return the original result instead of
  // repeating the side effect. Always true for "write"/"approve"/"publish";
  // trivially true for "read" tools since they have no side effect to repeat.
  idempotent: boolean;
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
};

// Every mutating tool's input schema extends this — a bare `idempotencyKey`
// isn't enough on its own for tools that edit an existing row (reschedule,
// submit_for_approval): those also carry `expectedUpdatedAt` for optimistic
// concurrency (see lib/mcp/idempotency.ts's assertNotStale).
export const IDEMPOTENCY_KEY_FIELD: JsonSchema = {
  type: "string",
  minLength: 8,
  maxLength: 128,
  description:
    "Caller-generated key, stable across retries of the exact same intent. Replaying the same key returns the original result instead of repeating the side effect.",
};

export const EXPECTED_UPDATED_AT_FIELD: JsonSchema = {
  type: "string",
  format: "date-time",
  description:
    "The `updatedAt` value last read for this record. If the record changed since, the call fails with CONFLICT instead of silently overwriting a concurrent edit.",
};

export const BRAND_ID_FIELD: JsonSchema = {
  type: "string",
  format: "uuid",
  description:
    "Which brand to act on. Optional when the connection is scoped to exactly one brand — required and validated against the connection's granted brands otherwise.",
};

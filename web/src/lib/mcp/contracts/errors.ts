/*
  Standard MCP tool error codes — frozen per docs/mcp-entegrasyon-plani.md,
  Aşama 0. Every tool handler throws McpToolError instead of a bare Error so
  the MCP transport layer (built in Aşama 2) can map a stable code to the
  JSON-RPC error response, rather than leaking a raw exception message.
*/
export const MCP_ERROR_CODES = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "QUOTA_EXCEEDED",
  "APPROVAL_REQUIRED",
  "TEMPORARILY_UNAVAILABLE",
] as const;

export type McpErrorCode = (typeof MCP_ERROR_CODES)[number];

export class McpToolError extends Error {
  readonly code: McpErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: McpErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "McpToolError";
    this.code = code;
    this.details = details;
  }
}

// Thin, purpose-named constructors — keeps call sites (actorContext.ts,
// individual tool handlers) from re-typing the same code/message pairing.
export const McpErrors = {
  unauthenticated: (message = "No valid MCP credential presented.") =>
    new McpToolError("UNAUTHENTICATED", message),
  forbidden: (message: string, details?: Record<string, unknown>) =>
    new McpToolError("FORBIDDEN", message, details),
  notFound: (entity: string, id: string) =>
    new McpToolError("NOT_FOUND", `${entity} not found: ${id}`, { entity, id }),
  conflict: (message: string, details?: Record<string, unknown>) =>
    new McpToolError("CONFLICT", message, details),
  validationError: (message: string, details?: Record<string, unknown>) =>
    new McpToolError("VALIDATION_ERROR", message, details),
  rateLimited: (message = "Too many requests, slow down.") =>
    new McpToolError("RATE_LIMITED", message),
  quotaExceeded: (message: string) => new McpToolError("QUOTA_EXCEEDED", message),
  approvalRequired: (message = "This action requires a human to approve it inside Tentamark first.") =>
    new McpToolError("APPROVAL_REQUIRED", message),
  temporarilyUnavailable: (message = "The service is temporarily unavailable, try again shortly.") =>
    new McpToolError("TEMPORARILY_UNAVAILABLE", message),
};

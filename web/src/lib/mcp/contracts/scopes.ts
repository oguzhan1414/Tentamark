/*
  MCP scope catalogue — frozen per docs/mcp-entegrasyon-plani.md, Aşama 0.
  Deliberately granular (not a coarse read/draft/approve/publish split): a
  connection that can read analytics shouldn't automatically be able to read
  media, and a connection that can request approval shouldn't automatically
  be able to decide one. Every tool contract in ./tools/* declares exactly
  which of these it requires — actorContext.ts checks the actor's granted
  scopes against a tool's requiredScopes before the tool body ever runs.
*/
export const MCP_SCOPES = [
  "brand:read",
  "calendar:read",
  "analytics:read",
  "media:read",
  "draft:create",
  "draft:update",
  "approval:request",
  "approval:decide",
  "schedule:update",
  "publish:request",
] as const;

export type McpScope = (typeof MCP_SCOPES)[number];

export function isMcpScope(value: string): value is McpScope {
  return (MCP_SCOPES as readonly string[]).includes(value);
}

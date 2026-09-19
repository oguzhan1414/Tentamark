import { NextRequest, NextResponse } from "next/server";
import { resolveActor } from "@/lib/mcp/auth/resolveActor";
import { callTool, WIRED_TOOL_NAMES } from "@/lib/mcp/dispatch";
import { getToolContract, ALL_TOOLS } from "@/lib/mcp/contracts/tools";
import { McpToolError } from "@/lib/mcp/contracts/errors";
import { MCP_ISSUER_URL } from "@/lib/mcp/config";

/*
  The MCP endpoint — Streamable HTTP transport, primarily protocol revision
  2026-07-28 (docs/mcp-entegrasyon-plani.md, Aşama 2), which has no
  `initialize` handshake and no protocol-level session: a modern client's
  every POST already carries its own protocol version and auth. `initialize`
  / `notifications/initialized` are also handled (not just tolerated) so a
  client that either speaks a genuinely older protocol version, or simply
  performs the handshake defensively before probing for modern per-request
  behavior, doesn't get turned away — see SUPPORTED_PROTOCOL_VERSIONS below.

  Implemented: initialize, notifications/initialized, tools/list, tools/call.
  Everything else (resources/*, prompts/*, subscriptions/listen) responds
  404 + "Method not found" per spec — this server declares no resources or
  prompts capability.
*/

// This hand-written endpoint implements the initialize-based protocol era.
// Advertise 2026 only after server/discover and its per-request envelope are
// implemented (or after this route moves to the official SDK handler).
const SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26"] as const;
const DEFAULT_PROTOCOL_VERSION = "2025-06-18";

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
};

function jsonRpcError(id: string | number | undefined | null, code: number, message: string, status: number) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

function decodeHeaderValue(value: string | null): string | null {
  if (value === null) return null;
  const match = /^=\?base64\?(.+)\?=$/.exec(value);
  if (!match) return value;
  try {
    return Buffer.from(match[1], "base64").toString("utf-8");
  } catch {
    return null;
  }
}

// DNS-rebinding protection per spec: reject a request whose Origin header IS
// present but isn't a well-formed https origin. An absent Origin (every
// non-browser MCP client — Claude Desktop, a CLI, a server-to-server
// integration) is allowed through, same as this server accepts direct API
// calls with no Origin today. This isn't a strict per-client allowlist —
// the ecosystem of legitimate MCP client origins changes too often to
// hardcode — and the primary DNS-rebinding scenario the spec is guarding
// against (tricking a browser into reaching a server bound to 127.0.0.1)
// doesn't apply to a public HTTPS host the way it does to a local server.
function isOriginAcceptable(origin: string | null): boolean {
  if (!origin) return true;
  try {
    return new URL(origin).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!isOriginAcceptable(origin)) {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "Origin not allowed." } }, { status: 403 });
  }

  const protocolVersionHeader = req.headers.get("mcp-protocol-version");
  if (protocolVersionHeader && !SUPPORTED_PROTOCOL_VERSIONS.includes(protocolVersionHeader as typeof SUPPORTED_PROTOCOL_VERSIONS[number])) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32022,
          message: `Unsupported protocol version: ${protocolVersionHeader ?? "(missing)"}.`,
          data: { supported: SUPPORTED_PROTOCOL_VERSIONS },
        },
      },
      { status: 400 }
    );
  }

  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error: body must be valid JSON.", 400);
  }

  if (body?.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return jsonRpcError(body?.id, -32600, "Invalid Request: not a well-formed JSON-RPC 2.0 request.", 400);
  }

  const requestedInitializeVersion = body.method === "initialize" && typeof body.params?.protocolVersion === "string"
    ? body.params.protocolVersion
    : null;
  if (!protocolVersionHeader && body.method !== "initialize") {
    return jsonRpcError(body.id, -32022, "MCP-Protocol-Version header is required after initialization.", 400);
  }

  const bodyProtocolVersion = (body.params?._meta as Record<string, unknown> | undefined)?.[
    "io.modelcontextprotocol/protocolVersion"
  ];
  if (bodyProtocolVersion !== undefined && bodyProtocolVersion !== protocolVersionHeader) {
    return jsonRpcError(body.id, -32020, "Header mismatch: MCP-Protocol-Version does not match params._meta.", 400);
  }

  const mcpMethodHeader = decodeHeaderValue(req.headers.get("mcp-method"));
  if (mcpMethodHeader !== null && mcpMethodHeader !== body.method) {
    return jsonRpcError(body.id, -32020, `Header mismatch: Mcp-Method header value '${mcpMethodHeader}' does not match body method '${body.method}'.`, 400);
  }

  const isNotification = body.id === undefined;

  if (body.method === "tools/call") {
    const toolName = body.params?.name;
    const mcpNameHeader = decodeHeaderValue(req.headers.get("mcp-name"));
    if (mcpNameHeader !== null && mcpNameHeader !== toolName) {
      return jsonRpcError(body.id, -32020, `Header mismatch: Mcp-Name header value '${mcpNameHeader}' does not match body params.name '${String(toolName)}'.`, 400);
    }
  }

  if (!["initialize", "notifications/initialized", "tools/list", "tools/call"].includes(body.method)) {
    return jsonRpcError(body.id, -32601, `Method not found: ${body.method}`, 404);
  }

  let actor;
  try {
    actor = await resolveActor(req.headers.get("authorization"));
  } catch (err) {
    if (isNotification) return new NextResponse(null, { status: 202 });
    const message = err instanceof McpToolError ? err.message : "Authentication required.";
    return NextResponse.json(
      { jsonrpc: "2.0", id: body.id ?? null, error: { code: -32001, message } },
      {
        status: 401,
        headers: { "WWW-Authenticate": `Bearer resource_metadata="${MCP_ISSUER_URL}/.well-known/oauth-protected-resource"` },
      }
    );
  }

  if (isNotification) return new NextResponse(null, { status: 202 });

  if (body.method === "initialize") {
    const negotiatedVersion = requestedInitializeVersion && SUPPORTED_PROTOCOL_VERSIONS.includes(requestedInitializeVersion as typeof SUPPORTED_PROTOCOL_VERSIONS[number])
      ? requestedInitializeVersion
      : DEFAULT_PROTOCOL_VERSION;
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        protocolVersion: negotiatedVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "Tentamark", version: "1.0.0" },
      },
    });
  }

  if (body.method === "tools/list") {
    const availableTools = ALL_TOOLS.filter(
      (tool) => WIRED_TOOL_NAMES.includes(tool.name) && tool.requiredScopes.every((s) => actor.scopes.includes(s))
    ).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      ...(tool.outputSchema ? { outputSchema: tool.outputSchema } : {}),
    }));

    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: { tools: availableTools },
    });
  }

  // tools/call
  const toolName = String(body.params?.name ?? "");
  const contract = getToolContract(toolName);
  if (!contract || !WIRED_TOOL_NAMES.includes(toolName)) {
    return jsonRpcError(body.id, -32602, `Unknown tool: ${toolName}`, 200);
  }

  try {
    const result = await callTool(actor, toolName, body.params?.arguments);
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      },
    });
  } catch (err) {
    const message = err instanceof McpToolError ? err.message : "Unexpected error.";
    // Tool execution error, not a protocol error — the calling model can
    // see this message and retry with different arguments (or ask the user
    // to fix a scope/brand grant), per the tools/call error-handling model.
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: { content: [{ type: "text", text: message }], isError: true },
    });
  }
}

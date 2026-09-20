import { NextRequest, NextResponse } from "next/server";
import { registerOAuthClient } from "@/lib/mcp/auth/oauthClients";
import { McpToolError } from "@/lib/mcp/contracts/errors";
import { consumeMcpRateLimit } from "@/lib/mcp/rateLimit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Dynamic Client Registration (RFC 7591). Deliberately unauthenticated —
// this is how an MCP client introduces itself to Tentamark before any user
// has been involved at all, same as any public OAuth authorization server.
export async function POST(req: NextRequest) {
  try {
    const rateLimit = await consumeMcpRateLimit(req, { bucket: "oauth-register", limit: 10, windowSeconds: 60 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", error_description: "Too many OAuth client registration requests." },
        { status: 429, headers: { ...CORS_HEADERS, "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }
  } catch (error) {
    console.error("OAuth registration rate limit failed:", error);
    return NextResponse.json({ error: "temporarily_unavailable" }, { status: 503, headers: CORS_HEADERS });
  }


  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_client_metadata", error_description: "Body must be valid JSON." }, { status: 400, headers: CORS_HEADERS });
  }

  const { client_name, redirect_uris } = (body ?? {}) as { client_name?: unknown; redirect_uris?: unknown };
  if (typeof client_name !== "string" || !Array.isArray(redirect_uris) || !redirect_uris.every((u) => typeof u === "string")) {
    return NextResponse.json(
      { error: "invalid_client_metadata", error_description: "client_name (string) and redirect_uris (string[]) are required." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const client = await registerOAuthClient({ clientName: client_name, redirectUris: redirect_uris });
    return NextResponse.json(
      {
        client_id: client.clientId,
        client_name: client.clientName,
        redirect_uris: client.redirectUris,
        token_endpoint_auth_method: "none",
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    if (err instanceof McpToolError) {
      return NextResponse.json({ error: "invalid_client_metadata", error_description: err.message }, { status: 400, headers: CORS_HEADERS });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: CORS_HEADERS });
  }
}

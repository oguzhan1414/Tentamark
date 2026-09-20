import { NextResponse } from "next/server";
import { MCP_ISSUER_URL } from "@/lib/mcp/config";
import { MCP_SCOPES } from "@/lib/mcp/contracts/scopes";

// RFC 8414 Authorization Server Metadata — this is the document an MCP
// client fetches first (per the MCP authorization spec's discovery flow) to
// learn where /oauth/authorize, the token endpoint, and registration live,
// without any of those URLs being hardcoded into the client.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      issuer: MCP_ISSUER_URL,
      authorization_endpoint: `${MCP_ISSUER_URL}/oauth/authorize`,
      token_endpoint: `${MCP_ISSUER_URL}/api/oauth/token`,
      registration_endpoint: `${MCP_ISSUER_URL}/api/oauth/register`,
      revocation_endpoint: `${MCP_ISSUER_URL}/api/oauth/revoke`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"], // public clients only — see oauthClients.ts
      scopes_supported: [...MCP_SCOPES],
      logo_uri: `${MCP_ISSUER_URL}/brand/tentamark-mark-512.png`,
      client_uri: MCP_ISSUER_URL,
    },
    { headers: CORS_HEADERS }
  );
}


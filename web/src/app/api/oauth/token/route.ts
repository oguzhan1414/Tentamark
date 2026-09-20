import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthorizationCode, refreshOAuthTokens } from "@/lib/mcp/auth/oauthFlow";
import { McpToolError } from "@/lib/mcp/contracts/errors";

// The OAuth 2.1 token endpoint. Per RFC 6749 §4.1.3 the request body is
// application/x-www-form-urlencoded — that's what every real OAuth client
// (including MCP clients) actually sends — but JSON is also accepted here
// since it costs nothing extra and makes this endpoint easier to exercise
// by hand while there's no MCP client wired up yet to test against.
async function readParams(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v ?? "")]));
  }
  const form = await req.formData();
  return Object.fromEntries(Array.from(form.entries()).map(([k, v]) => [k, String(v)]));
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function oauthError(error: string, description: string, status = 400) {
  return NextResponse.json({ error, error_description: description }, { status, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const params = await readParams(req);
  const grantType = params.grant_type;

  try {
    if (grantType === "authorization_code") {
      const { code, client_id: clientId, redirect_uri: redirectUri, code_verifier: codeVerifier } = params;
      if (!code || !clientId || !redirectUri || !codeVerifier) {
        return oauthError("invalid_request", "code, client_id, redirect_uri, and code_verifier are all required.");
      }
      const tokens = await exchangeAuthorizationCode({ code, clientId, redirectUri, codeVerifier });
      return NextResponse.json(
        {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          token_type: "Bearer",
          expires_in: tokens.expiresIn,
          scope: tokens.scope,
        },
        { headers: CORS_HEADERS }
      );
    }

    if (grantType === "refresh_token") {
      const { refresh_token: refreshToken, client_id: clientId } = params;
      if (!refreshToken || !clientId) return oauthError("invalid_request", "refresh_token and client_id are required.");
      const tokens = await refreshOAuthTokens({ refreshToken, clientId });
      return NextResponse.json(
        {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          token_type: "Bearer",
          expires_in: tokens.expiresIn,
          scope: tokens.scope,
        },
        { headers: CORS_HEADERS }
      );
    }

    return oauthError("unsupported_grant_type", `grant_type must be authorization_code or refresh_token, got: ${grantType ?? "(none)"}`);
  } catch (err) {
    if (err instanceof McpToolError) {
      const status = err.code === "UNAUTHENTICATED" ? 400 : err.code === "TEMPORARILY_UNAVAILABLE" ? 503 : 400;
      // OAuth's token endpoint uses "invalid_grant" for a bad/expired/reused
      // code or refresh token — not the MCP-tool-facing error codes this
      // McpToolError normally carries.
      const oauthCode = err.code === "TEMPORARILY_UNAVAILABLE" ? "server_error" : "invalid_grant";
      return oauthError(oauthCode, err.message, status);
    }
    return oauthError("server_error", "Unexpected error.", 500);
  }
}


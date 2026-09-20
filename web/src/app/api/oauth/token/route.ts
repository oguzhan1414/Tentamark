import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthorizationCode, refreshOAuthTokens } from "@/lib/mcp/auth/oauthFlow";
import { McpToolError } from "@/lib/mcp/contracts/errors";

// The OAuth 2.1 token endpoint. Per RFC 6749 §4.1.3 the request body is
// application/x-www-form-urlencoded — that's what every real OAuth client
// (including MCP clients) actually sends — but JSON is also accepted here
// since it costs nothing extra and makes this endpoint easier to exercise
// by hand while there's no MCP client wired up yet to test against.
async function readParams(req: NextRequest): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // 1. Basic Auth check (RFC 6749 §2.3.1)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
      const colonIdx = decoded.indexOf(":");
      if (colonIdx !== -1) {
        result.client_id = decodeURIComponent(decoded.slice(0, colonIdx));
        result.client_secret = decodeURIComponent(decoded.slice(colonIdx + 1));
      } else {
        result.client_id = decodeURIComponent(decoded);
      }
    } catch {}
  }

  // 2. Query string fallback
  try {
    for (const [k, v] of req.nextUrl.searchParams.entries()) {
      if (!result[k]) result[k] = v;
    }
  } catch {}

  // 3. Body
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body)) {
        if (v !== undefined && v !== null) result[k] = String(v);
      }
      return result;
    } catch {}
  }

  // Standard urlencoded parsing via text() + URLSearchParams
  try {
    const rawText = await req.text();
    if (rawText) {
      const parsed = new URLSearchParams(rawText);
      for (const [k, v] of parsed.entries()) {
        result[k] = v;
      }
      return result;
    }
  } catch {}

  // Fallback to formData
  try {
    const form = await req.formData();
    for (const [k, v] of form.entries()) {
      result[k] = String(v);
    }
  } catch {}

  return result;
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
      if (!code || !codeVerifier) {
        return oauthError("invalid_request", "code and code_verifier are required.");
      }
      const tokens = await exchangeAuthorizationCode({
        code,
        clientId: clientId || undefined,
        redirectUri: redirectUri || undefined,
        codeVerifier,
      });
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
    console.error("OAuth token exchange error:", err);
    if (err instanceof McpToolError) {
      const status = err.code === "UNAUTHENTICATED" ? 400 : err.code === "TEMPORARILY_UNAVAILABLE" ? 503 : 400;
      const oauthCode = err.code === "TEMPORARILY_UNAVAILABLE" ? "server_error" : "invalid_grant";
      return oauthError(oauthCode, err.message, status);
    }
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return oauthError("server_error", message, 500);
  }
}


import { NextRequest, NextResponse } from "next/server";
import { revokeOAuthToken } from "@/lib/mcp/auth/oauthFlow";

// RFC 7009. Per the spec, always 200 — even for an already-invalid token —
// see revokeOAuthToken's own comment for why "token not found" isn't an
// error from the caller's point of view.
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  const params = contentType.includes("application/json")
    ? ((await req.json().catch(() => ({}))) as Record<string, unknown>)
    : Object.fromEntries(Array.from((await req.formData()).entries()));

  const token = typeof params.token === "string" ? params.token : "";
  if (!token) {
    return NextResponse.json({ error: "invalid_request", error_description: "token is required." }, { status: 400 });
  }

  await revokeOAuthToken(token);
  return new NextResponse(null, { status: 200 });
}

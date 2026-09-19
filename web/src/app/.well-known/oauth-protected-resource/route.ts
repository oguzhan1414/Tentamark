import { NextResponse } from "next/server";
import { MCP_ISSUER_URL, MCP_RESOURCE_URL } from "@/lib/mcp/config";

// RFC 9728 Protected Resource Metadata — tells an MCP client which
// authorization server(s) it must get a token from before calling the
// actual /api/mcp endpoint (built in Aşama 2). Publishing this now, ahead
// of that endpoint existing, is intentional: a client's discovery flow
// starts by fetching this document from the resource URL it already knows,
// so the metadata needs to be live before the endpoint itself has to be.
export async function GET() {
  return NextResponse.json({
    resource: MCP_RESOURCE_URL,
    authorization_servers: [MCP_ISSUER_URL],
  });
}

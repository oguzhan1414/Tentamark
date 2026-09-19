import { createAdminClient } from "@/lib/supabase/admin";
import { assertBrandAccess, assertScopes, type McpActorContext } from "../actorContext";
import { McpErrors } from "../contracts/errors";
import { recordAuditEvent } from "../audit";
import { MCP_ISSUER_URL } from "../config";

/*
  request_publish_approval — mints a row in the EXISTING content_share_links
  table (patches/0028) rather than inventing new share-link infrastructure.
  That table already backs the real "Paylaş" flow reviewers use today
  (web/src/app/onay/[token]/page.tsx + the respond_to_share_link() RPC),
  so reusing it means this tool's link behaves exactly like a link a human
  teammate would have generated from the Approvals screen — same page, same
  approve/feedback actions, same revocation model (status: active|revoked,
  no separate expiry column on this legacy table, so "expiresAt" isn't part
  of this tool's real output — an MCP client should not be told a lifetime
  this mechanism doesn't actually enforce).

  This is deliberately the ONLY way an MCP-originated request can end with
  content.status becoming APPROVED — the tool itself never touches that
  column. A human clicking "Onayla" on the resulting page is what runs
  respond_to_share_link('approve'), which is where the real state change
   (and the require_approval_schedule trigger's own safety check) happens.
   MCP-created links expire after 30 minutes and become unusable after the
   first successful approval.
*/
export async function requestPublishApproval(
  actor: McpActorContext,
  params: { brandId?: string; contentId: string }
): Promise<{ approvalUrl: string }> {
  assertScopes(actor, ["publish:request"]);
  const brandId = assertBrandAccess(actor, params.brandId);

  const admin = createAdminClient();
  const { data: content, error: readError } = await admin
    .from("content")
    .select("id, brand_id, status")
    .eq("id", params.contentId)
    .maybeSingle();
  if (readError) throw McpErrors.temporarilyUnavailable(readError.message);
  if (!content) throw McpErrors.notFound("content", params.contentId);
  if (content.brand_id !== brandId) throw McpErrors.forbidden("This content does not belong to the granted brand.");
  if (content.status !== "NEEDS_REVIEW") {
    throw McpErrors.conflict(
      `Content is ${content.status}, not NEEDS_REVIEW — submit it for review first (submit_for_approval) before requesting publish approval.`,
      { status: content.status }
    );
  }

  const { data: link, error: linkError } = await admin
    .from("content_share_links")
    .insert({
      content_id: params.contentId,
      created_by: actor.userId || null,
      purpose: "mcp_publish",
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
    .select("token")
    .single();
  if (linkError || !link) throw McpErrors.temporarilyUnavailable(linkError?.message ?? "Could not create approval link.");

  await recordAuditEvent({
    actor,
    action: "PUBLISH_APPROVAL_REQUESTED",
    entityType: "content",
    entityId: params.contentId,
    outcome: "success",
  });

  return { approvalUrl: `${MCP_ISSUER_URL}/onay/${link.token}` };
}

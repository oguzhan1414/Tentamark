import {
  BRAND_ID_FIELD,
  EXPECTED_UPDATED_AT_FIELD,
  IDEMPOTENCY_KEY_FIELD,
  type ToolContract,
} from "../types";

const PLATFORM_IDS = ["instagram", "facebook", "linkedin", "threads", "tiktok", "pinterest", "telegram", "youtube", "bluesky"] as const;

/*
  Stage-2/3/4 (write) tool contracts — docs/mcp-entegrasyon-plani.md, "İlk
  yazma yüzeyi". Every one of these is `idempotent: true`, meaning the Aşama 2
  handler MUST run it through lib/mcp/idempotency.ts's checkIdempotency()
  before doing anything real — an MCP client is expected to retry a timed-out
  call, and a retry must return the original result, not a second draft /
  second reschedule / second approval.

  None of these ever sets content_platforms.status to PUBLISHING/PUBLISHED,
  and none of them ever touches SCHEDULER_WEBHOOK_SECRET — see
  request_publish_approval's description for why "publish" here means
  "hand the human a link", not "post it".
*/

export const WRITE_TOOLS = [
  {
    name: "create_content_brief",
    description:
      "Turn a rough topic into a structured brief (angle, key points, suggested hook) without creating any content row yet. Maps to suggestPostIdea/generateDrafts used in 'brief only' mode — the caller decides afterward whether to turn it into a real draft via create_post_draft.",
    requiredScopes: ["draft:create"],
    riskClass: "write",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        topic: { type: "string", minLength: 3, maxLength: 500 },
        platform: { type: "string", enum: PLATFORM_IDS, description: "One supported platform id." },
        idempotencyKey: IDEMPOTENCY_KEY_FIELD,
      },
      required: ["topic", "idempotencyKey"],
      additionalProperties: false,
    },
  },
  {
    name: "create_post_draft",
    description:
      "Create a real content row in DRAFT status with AI-generated per-platform captions. Maps to generateDrafts + the content/content_platforms insert currently inlined in ComposeForm's submit(). Never sets status beyond DRAFT — this tool cannot schedule, submit for review, or publish anything.",
    requiredScopes: ["draft:create"],
    riskClass: "write",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        idea: { type: "string", minLength: 3, maxLength: 2000 },
        platforms: { type: "array", items: { type: "string", enum: PLATFORM_IDS }, minItems: 1 },
        format: { type: "string", enum: ["post", "story", "reel"], description: "Defaults to post." },
        idempotencyKey: IDEMPOTENCY_KEY_FIELD,
      },
      required: ["idea", "platforms", "idempotencyKey"],
      additionalProperties: false,
    },
  },
  {
    name: "generate_weekly_plan",
    description: "Generate a full week of DRAFT content in one call. Maps to generateWeeklyPack + the same per-item insert create_post_draft uses, repeated.",
    requiredScopes: ["draft:create"],
    riskClass: "write",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        platforms: { type: "array", items: { type: "string", enum: PLATFORM_IDS }, minItems: 1 },
        weekStart: { type: "string", format: "date" },
        idempotencyKey: IDEMPOTENCY_KEY_FIELD,
      },
      required: ["platforms", "idempotencyKey"],
      additionalProperties: false,
    },
  },
  {
    name: "reschedule_draft",
    description:
      "Change a single content_platforms row's scheduled_at. Only legal while the parent content is still DRAFT or NEEDS_REVIEW — matches the guard already enforced by posts/page.tsx's savePlatform(). Requires expectedUpdatedAt: a stale value means someone (or something) edited it since this tool's caller last read it.",
    requiredScopes: ["schedule:update"],
    riskClass: "write",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        contentPlatformId: { type: "string", format: "uuid" },
        newScheduledAt: { type: "string", format: "date-time" },
        expectedUpdatedAt: EXPECTED_UPDATED_AT_FIELD,
        idempotencyKey: IDEMPOTENCY_KEY_FIELD,
      },
      required: ["contentPlatformId", "newScheduledAt", "expectedUpdatedAt", "idempotencyKey"],
      additionalProperties: false,
    },
  },
  {
    name: "submit_for_approval",
    description: "Move content from DRAFT to NEEDS_REVIEW. Maps to posts/page.tsx's sendForReview(). Requires expectedUpdatedAt for the same optimistic-concurrency reason as reschedule_draft.",
    requiredScopes: ["approval:request"],
    riskClass: "approve",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        contentId: { type: "string", format: "uuid" },
        expectedUpdatedAt: EXPECTED_UPDATED_AT_FIELD,
        idempotencyKey: IDEMPOTENCY_KEY_FIELD,
      },
      required: ["contentId", "expectedUpdatedAt", "idempotencyKey"],
      additionalProperties: false,
    },
  },
  {
    name: "request_publish_approval",
    description:
      "The ONLY publish-adjacent tool, and it never sets content.status to APPROVED or touches a live social account itself — it requires the content already be NEEDS_REVIEW, then reuses Tentamark's existing content_share_links mechanism (the same one behind the Approvals screen's 'Paylaş' button) to mint a reviewer link and returns its URL. A human opening that link and clicking Approve is what actually flips content.status to APPROVED (via the existing respond_to_share_link RPC); from there the existing cron (dispatch_due_content -> process_publish_queue -> /api/scheduler/publish) does the real publish exactly as it does for a human-scheduled post. This link does not expire and is not single-use — it stays active (reusable) until someone revokes it from the Approvals screen, same as any other share link. An MCP client must never be told this tool 'published' anything — only that a review link was created.",
    requiredScopes: ["publish:request"],
    riskClass: "publish",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        contentId: { type: "string", format: "uuid" },
        idempotencyKey: IDEMPOTENCY_KEY_FIELD,
      },
      required: ["contentId", "idempotencyKey"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        approvalUrl: { type: "string", format: "uri" },
      },
    },
  },
] as const satisfies readonly ToolContract[];

export type WriteToolName = (typeof WRITE_TOOLS)[number]["name"];

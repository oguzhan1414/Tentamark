import type { McpActorContext } from "./actorContext";
import { assertBrandAccess, assertScopes } from "./actorContext";
import { getToolContract } from "./contracts/tools";
import { McpErrors } from "./contracts/errors";
import { validateToolInput } from "./validation";
import { checkIdempotency, completeIdempotency, failIdempotency } from "./idempotency";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBrandContext } from "@/lib/brand/getBrandContext";
import { getLatestStrategy } from "@/lib/ai/generateStrategy";
import { getAnalyticsOverview } from "@/lib/ai/getAnalyticsOverview";
import { getWeeklyCalendar, getPendingApprovals, getPostDetails, searchMedia, findCalendarGaps } from "./domain/contentReads";
import { rescheduleContentPlatform, submitContentForApproval } from "./domain/contentMutations";
import { createContentBrief, createPostDraft, generateWeeklyPlanDrafts } from "./domain/contentCreation";
import { requestPublishApproval } from "./domain/publishApproval";
import type { ContentFormat, LaunchPlatform } from "@/lib/ai/generateDrafts";

type ToolArgs = Record<string, unknown>;
type ToolHandler = (actor: McpActorContext, args: ToolArgs) => Promise<unknown>;

/*
  Every tool that's actually callable today — all 13 tools from
  contracts/tools/* are wired. tools/list only ever advertises
  WIRED_TOOL_NAMES (see route.ts), so this map staying in sync with the
  contracts list is what keeps a client from being shown a tool it would
  immediately get "unknown tool" from.
*/
const HANDLERS: Record<string, ToolHandler> = {
  async get_brand_profile(actor, args) {
    assertScopes(actor, ["brand:read"]);
    const brandId = assertBrandAccess(actor, args.brandId as string | undefined);
    const admin = createAdminClient();
    const [context, strategy] = await Promise.all([
      getBrandContext(brandId, { client: admin }),
      getLatestStrategy(brandId, admin),
    ]);
    return { brand: context, strategy };
  },

  async get_weekly_calendar(actor, args) {
    // Wrapped in an object rather than returned as a bare array — some MCP
    // clients validate tools/call's structuredContent as a JSON object and
    // reject a top-level array outright (seen live against a non-Claude
    // client during testing).
    const entries = await getWeeklyCalendar(actor, { brandId: args.brandId as string | undefined, weekStart: args.weekStart as string });
    return { entries };
  },

  async get_pending_approvals(actor, args) {
    return getPendingApprovals(actor, {
      brandId: args.brandId as string | undefined,
      cursor: args.cursor as string | undefined,
      limit: args.limit as number | undefined,
    });
  },

  async get_post_details(actor, args) {
    return getPostDetails(actor, { brandId: args.brandId as string | undefined, contentId: args.contentId as string });
  },

  async search_media(actor, args) {
    return searchMedia(actor, {
      brandId: args.brandId as string | undefined,
      query: args.query as string | undefined,
      cursor: args.cursor as string | undefined,
      limit: args.limit as number | undefined,
    });
  },

  async get_performance_summary(actor, args) {
    assertScopes(actor, ["analytics:read"]);
    const brandId = assertBrandAccess(actor, args.brandId as string | undefined);
    const overview = await getAnalyticsOverview(brandId);
    return {
      ...overview,
      _dataQualityNote:
        "channels, topPosts, and bestPostingHours are illustrative placeholder data, not yet computed from real per-brand analytics — see docs/mcp-entegrasyon-plani.md.",
    };
  },

  async find_calendar_gaps(actor, args) {
    const gaps = await findCalendarGaps(actor, {
      brandId: args.brandId as string | undefined,
      fromDate: args.fromDate as string,
      toDate: args.toDate as string,
    });
    return { gapDates: gaps };
  },

  async reschedule_draft(actor, args) {
    return rescheduleContentPlatform(actor, {
      brandId: args.brandId as string | undefined,
      contentPlatformId: args.contentPlatformId as string,
      newScheduledAt: args.newScheduledAt as string,
      expectedUpdatedAt: args.expectedUpdatedAt as string,
    });
  },

  async submit_for_approval(actor, args) {
    return submitContentForApproval(actor, {
      brandId: args.brandId as string | undefined,
      contentId: args.contentId as string,
      expectedUpdatedAt: args.expectedUpdatedAt as string,
    });
  },

  async create_content_brief(actor, args) {
    return createContentBrief(actor, {
      brandId: args.brandId as string | undefined,
      topic: args.topic as string,
      platform: args.platform as string | undefined,
      idempotencyKey: args.idempotencyKey as string,
    });
  },

  async create_post_draft(actor, args) {
    return createPostDraft(actor, {
      brandId: args.brandId as string | undefined,
      idea: args.idea as string,
      platforms: args.platforms as LaunchPlatform[],
      format: args.format as ContentFormat | undefined,
      idempotencyKey: args.idempotencyKey as string,
    });
  },

  async generate_weekly_plan(actor, args) {
    return generateWeeklyPlanDrafts(actor, {
      brandId: args.brandId as string | undefined,
      platforms: args.platforms as LaunchPlatform[],
      weekStart: args.weekStart as string | undefined,
      idempotencyKey: args.idempotencyKey as string,
    });
  },

  async request_publish_approval(actor, args) {
    return requestPublishApproval(actor, {
      brandId: args.brandId as string | undefined,
      contentId: args.contentId as string,
    });
  },
};

// Keep the analytics tool private until every field is backed by real
// per-brand data; advertising fixture output to an agent would be misleading.
export const WIRED_TOOL_NAMES = Object.keys(HANDLERS).filter((name) => name !== "get_performance_summary");

export async function callTool(actor: McpActorContext, name: string, rawArgs: unknown): Promise<unknown> {
  const contract = getToolContract(name);
  if (!contract || !HANDLERS[name]) throw McpErrors.notFound("tool", name);

  const args = (rawArgs ?? {}) as ToolArgs;
  validateToolInput(contract.inputSchema, args);
  assertScopes(actor, contract.requiredScopes);
  actor = { ...actor, currentToolName: name };

  if (contract.riskClass === "read") return HANDLERS[name](actor, args);

  // Every mutating tool's contract requires idempotencyKey (see
  // contracts/tools/writeTools.ts) — checked once, centrally, here, so no
  // individual domain function has to wire lib/mcp/idempotency.ts itself.
  // A handler that also calls executeAiOperation internally (create_post_draft,
  // generate_weekly_plan) passes THAT call a distinctly-suffixed operation
  // name (e.g. "create_post_draft:generate") specifically so its own,
  // separate idempotency claim doesn't collide with this outer one.
  const idempotencyKey = String(args.idempotencyKey ?? "");
  const idempotencyArgs = { connectionId: actor.connectionId, toolName: name, idempotencyKey };
  const outcome = await checkIdempotency({ ...idempotencyArgs, input: args });
  if (outcome.status === "replay") return outcome.result;
  if (outcome.status === "in_progress") throw McpErrors.conflict("This exact request is already being processed.");

  try {
    const result = await HANDLERS[name](actor, args);
    await completeIdempotency(idempotencyArgs, result);
    return result;
  } catch (err) {
    await failIdempotency(idempotencyArgs, err);
    throw err;
  }
}

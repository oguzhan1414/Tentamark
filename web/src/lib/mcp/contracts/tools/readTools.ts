import { BRAND_ID_FIELD, type JsonSchema, type ToolContract } from "../types";

/*
  Stage-1 (read-only) tool contracts — docs/mcp-entegrasyon-plani.md, "Önerilen
  ilk salt-okunur yüzey". These map almost directly onto existing "use server"
  functions in web/src/lib/ai/ and web/src/lib/brand/ (see the codebase audit
  in the same doc) — the tool handlers built in Aşama 2 are expected to be
  thin adapters over those, not new business logic.

  None of these accept a raw `limit`/offset pagination — cursor-based only,
  per the doc's "Liste araçları cursor tabanlı pagination ve düşük bir
  varsayılan limit kullanmalı" requirement.
*/

const CURSOR_FIELDS: Record<string, JsonSchema> = {
  cursor: { type: "string", description: "Opaque pagination cursor from a previous call's `nextCursor`." },
  limit: { type: "integer", minimum: 1, maximum: 50, description: "Defaults to 20 when omitted." },
};

export const READ_TOOLS = [
  {
    name: "get_brand_profile",
    description:
      "Brand identity, DNA, tone, target audience, and latest content strategy for one brand. Maps to getBrandContext + getBrandIntelligenceSummary + getLatestStrategy.",
    requiredScopes: ["brand:read"],
    riskClass: "read",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: { brandId: BRAND_ID_FIELD },
      additionalProperties: false,
    },
  },
  {
    name: "get_weekly_calendar",
    description:
      "Scheduled and published content for a given week, across every connected platform. Maps to the calendar page's content-fetching query, not fetchContentRows directly (that helper takes a browser Supabase client today — Aşama 0 item 3 replaces it with a server-callable equivalent).",
    requiredScopes: ["calendar:read"],
    riskClass: "read",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        weekStart: { type: "string", format: "date", description: "ISO 8601 date (YYYY-MM-DD), interpreted in the brand's own timezone (see brand.timezone)." },
      },
      required: ["weekStart"],
      additionalProperties: false,
    },
  },
  {
    name: "get_pending_approvals",
    description:
      "Content currently sitting in NEEDS_REVIEW, oldest first. Scoped under calendar:read rather than a separate approval-read scope — reading the review queue is not itself a decision.",
    requiredScopes: ["calendar:read"],
    riskClass: "read",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: { brandId: BRAND_ID_FIELD, ...CURSOR_FIELDS },
      additionalProperties: false,
    },
  },
  {
    name: "get_post_details",
    description:
      "Full detail for one piece of content: per-platform captions, hashtags, media, schedule, status history, and comments.",
    requiredScopes: ["calendar:read"],
    riskClass: "read",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        contentId: { type: "string", format: "uuid" },
      },
      required: ["contentId"],
      additionalProperties: false,
    },
  },
  {
    name: "search_media",
    description: "Search the brand's media library by filename/tag. Maps to MediaLibraryModal's existing query.",
    requiredScopes: ["media:read"],
    riskClass: "read",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        query: { type: "string", maxLength: 200 },
        ...CURSOR_FIELDS,
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_performance_summary",
    description:
      "Aggregate engagement/reach metrics for a date range. Maps to getAnalyticsOverview — IMPORTANT: that function's `channels`, `topPosts`, and `bestPostingHours` fields are still fixture data, not real per-brand analytics (see docs/mcp-entegrasyon-plani.md §1). Do not expose this tool until that's either wired to real data or the tool's own output explicitly marks those fields as illustrative.",
    requiredScopes: ["analytics:read"],
    riskClass: "read",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        range: { type: "string", enum: ["7d", "30d", "90d"], description: "Defaults to 30d." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "find_calendar_gaps",
    description: "Days in a date range with no scheduled or published content — for an agent proposing where to fill the calendar.",
    requiredScopes: ["calendar:read"],
    riskClass: "read",
    idempotent: true,
    inputSchema: {
      type: "object",
      properties: {
        brandId: BRAND_ID_FIELD,
        fromDate: { type: "string", format: "date" },
        toDate: { type: "string", format: "date" },
      },
      required: ["fromDate", "toDate"],
      additionalProperties: false,
    },
  },
] as const satisfies readonly ToolContract[];

export type ReadToolName = (typeof READ_TOOLS)[number]["name"];

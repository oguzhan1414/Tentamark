// Matches the hardcoded-base-URL convention already used by
// web/src/app/sitemap.ts and robots.ts — this project has no
// NEXT_PUBLIC_SITE_URL env var, so OAuth discovery metadata follows the
// same pattern rather than inventing a new one.
export const MCP_ISSUER_URL = "https://tentamark.com";
export const MCP_RESOURCE_URL = `${MCP_ISSUER_URL}/api/mcp`;

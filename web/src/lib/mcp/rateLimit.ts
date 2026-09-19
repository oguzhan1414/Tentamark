import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/rateLimit";

export async function consumeMcpRateLimit(
  req: Request,
  options: { bucket: string; limit: number; windowSeconds: number }
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const identifierHash = createHash("sha256").update(getClientIp(req)).digest("hex");
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("consume_mcp_rate_limit", {
    p_bucket: options.bucket,
    p_identifier_hash: identifierHash,
    p_limit: options.limit,
    p_window_seconds: options.windowSeconds,
  });
  if (error) throw new Error(`Rate limit check failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  const resetAt = row?.reset_at ? new Date(row.reset_at).getTime() : Date.now() + options.windowSeconds * 1000;
  return { allowed: Boolean(row?.allowed), retryAfterSeconds: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)) };
}


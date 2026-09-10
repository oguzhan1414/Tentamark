import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/*
  Service-role client, bypasses RLS entirely. Only for server code with no
  user session to key off — e.g. Meta's deauthorize/data-deletion callbacks,
  which are server-to-server calls with no browser cookies attached, so the
  cookie-based client in server.ts has nothing to authenticate with.
  Never import this into anything that runs with a real user's request
  unless the operation is genuinely meant to bypass their own permissions.
*/
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

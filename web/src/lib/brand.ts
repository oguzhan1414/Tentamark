import { createClient } from "@/lib/supabase/server";

export type CurrentBrand = { id: string; name: string; timezone: string };

/*
  MVP has exactly one brand per organization (handle_new_user creates it at
  signup), so "the current brand" is just the first brand of the caller's
  first org membership. Once an org can hold multiple brands, this needs an
  actual brand switcher — not a bigger query, a UI decision.

  Server-only: reads via the cookie-based server client, so it always reflects
  the request's real session rather than trusting a client-supplied brand id.
*/
export async function getCurrentBrand(): Promise<CurrentBrand | null> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, timezone")
    .eq("organization_id", membership.organization_id)
    .limit(1)
    .maybeSingle();

  return brand ?? null;
}

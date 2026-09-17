import { createClient } from "@/lib/supabase/server";

export type CurrentBrand = { id: string; name: string; timezone: string };

export type Workspace = {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  isActive: boolean;
};

/*
  An org can now hold multiple brands ("workspaces" in the UI). Which one is
  "current" is a per-user choice, persisted in profiles.active_brand_id
  (supabase/patches/0034) rather than always "the first brand of the first
  org" like before. A stale/inaccessible active_brand_id (brand deleted, or
  the user lost access to that org) just falls back to the old default
  resolution and re-saves it — never a hard failure.

  Server-only: reads via the cookie-based server client, so it always reflects
  the request's real session rather than trusting a client-supplied brand id.
*/
export async function getCurrentBrand(): Promise<CurrentBrand | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_brand_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.active_brand_id) {
    const { data: activeBrand } = await supabase
      .from("brands")
      .select("id, name, timezone")
      .eq("id", profile.active_brand_id)
      .maybeSingle();
    if (activeBrand) return activeBrand;
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, timezone")
    .eq("organization_id", membership.organization_id)
    .limit(1)
    .maybeSingle();

  if (brand) {
    // Best-effort cache of the default so it's stable next time — not the
    // source of truth, so a failure here doesn't need to be surfaced.
    await supabase.from("profiles").update({ active_brand_id: brand.id }).eq("id", user.id);
  }

  return brand ?? null;
}

/*
  Every brand the caller can access, across every organization they belong
  to — the data behind the workspace switcher (/calisma-alanlari).
*/
export async function getUserWorkspaces(): Promise<Workspace[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("active_brand_id").eq("id", user.id).maybeSingle(),
    supabase.from("organization_members").select("organization_id").eq("user_id", user.id),
  ]);

  const orgIds = Array.from(new Set((memberships ?? []).map((m) => m.organization_id)));
  if (orgIds.length === 0) return [];

  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, organization_id, organizations(name)")
    .in("organization_id", orgIds)
    .order("created_at", { ascending: true });

  const activeBrandId = profile?.active_brand_id ?? null;

  return (brands ?? []).map((b) => {
    const org = Array.isArray(b.organizations) ? b.organizations[0] : b.organizations;
    return {
      id: b.id,
      name: b.name,
      organizationId: b.organization_id,
      organizationName: org?.name ?? "",
      isActive: b.id === activeBrandId,
    };
  });
}

"use server";

import { createClient } from "@/lib/supabase/server";

/*
  Switching workspace only ever changes profiles.active_brand_id — every
  brand-scoped query in the app (layout.tsx, every dashboard page) re-derives
  itself from that on the next request, so there's no second place to update.
*/
export async function switchActiveWorkspace(brandId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  // RLS on brands scopes select to orgs the caller belongs to — a brandId
  // outside that scope simply won't be found, which is exactly the access
  // check needed here.
  const { data: brand } = await supabase.from("brands").select("id").eq("id", brandId).maybeSingle();
  if (!brand) return { error: "Bu çalışma alanına erişiminiz yok." };

  const { error } = await supabase.from("profiles").update({ active_brand_id: brandId }).eq("id", user.id);
  if (error) return { error: "Çalışma alanı değiştirilemedi." };

  return {};
}

/*
  Creating a workspace = a new brand under the org the caller owns. Gated to
  owners (not admins/members) since this is what a pricing tier will meter —
  same reasoning as invites and role changes, which are owner-only too.
*/
export async function createWorkspace(name: string): Promise<{ brandId?: string; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Çalışma alanı adı boş olamaz." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data: ownerMembership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (!ownerMembership) {
    return { error: "Yeni çalışma alanı oluşturmak için organizasyon sahibi olmanız gerekir." };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("max_brands")
    .eq("id", ownerMembership.organization_id)
    .maybeSingle();

  const { count: currentBrandCount } = await supabase
    .from("brands")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", ownerMembership.organization_id);

  const maxBrands = org?.max_brands ?? 1;
  if ((currentBrandCount ?? 0) >= maxBrands) {
    return {
      error: `Planınız en fazla ${maxBrands} çalışma alanına izin veriyor. Daha fazlası için planınızı yükseltmeniz gerekir.`,
    };
  }

  const { data: newBrand, error } = await supabase
    .from("brands")
    .insert({ organization_id: ownerMembership.organization_id, name: trimmed })
    .select("id")
    .single();

  if (error || !newBrand) return { error: "Çalışma alanı oluşturulamadı." };

  // handle_new_user() does this for the very first brand at signup — a
  // brand created here otherwise ends up with no brand_dna row at all, and
  // Brand Profile's save is an UPDATE (not upsert), so it would silently
  // affect zero rows until one exists.
  await supabase.from("brand_dna").insert({ brand_id: newBrand.id });

  await supabase.from("profiles").update({ active_brand_id: newBrand.id }).eq("id", user.id);

  return { brandId: newBrand.id };
}

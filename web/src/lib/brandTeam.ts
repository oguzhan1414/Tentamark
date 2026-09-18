import type { createClient } from "@/lib/supabase/client";

type Client = ReturnType<typeof createClient>;

export type BrandTeamMember = {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member";
  name: string;
  email: string;
};

export async function getBrandTeam(supabase: Client, brandId: string): Promise<BrandTeamMember[]> {
  const { data: brand, error: brandError } = await supabase.from("brands")
    .select("organization_id").eq("id", brandId).single();
  if (brandError || !brand) throw brandError ?? new Error("Marka bulunamadı.");

  const [{ data: grants, error: grantsError }, { data: owners, error: ownersError }] = await Promise.all([
    supabase.from("brand_memberships")
      .select("id, user_id, role, profiles(full_name, email)")
      .eq("brand_id", brandId).order("created_at", { ascending: true }),
    supabase.from("organization_members")
      .select("id, user_id, role, profiles(full_name, email)")
      .eq("organization_id", brand.organization_id).eq("role", "owner"),
  ]);
  if (grantsError || ownersError) throw grantsError ?? ownersError ?? new Error("Ekip yüklenemedi.");

  const uniqueMembers = [...new Map([...(grants ?? []), ...(owners ?? [])].map((member) => [member.user_id, member])).values()];
  return uniqueMembers.map((member) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
    return {
      id: member.id,
      userId: member.user_id,
      role: member.role as BrandTeamMember["role"],
      name: profile?.full_name || profile?.email?.split("@")[0] || "Üye",
      email: profile?.email ?? "",
    };
  });
}

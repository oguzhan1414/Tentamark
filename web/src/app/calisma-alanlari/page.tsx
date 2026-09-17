import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/lib/brand";
import TentamarkLogo from "@/components/TentamarkLogo";
import UserProfileDropdown from "@/components/dashboard/UserProfileDropdown";
import WorkspacePicker from "@/components/dashboard/WorkspacePicker";

/*
  Deliberately outside the (app) route group — this is the pre-workspace
  landing screen, so it must NOT be wrapped by (app)/layout.tsx's dashboard
  shell (sidebar, brand-scoped topbar). That layout also hard-requires a
  resolved brand before it renders anything, which is backwards here: this
  page IS how a brand gets chosen. Same reasoning (auth)/giris and
  (auth)/kayit already sit outside (app) with their own full-page markup.
*/
export default async function WorkspacesLandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const [workspaces, { data: profile }, { data: ownerMembership }] = await Promise.all([
    getUserWorkspaces(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle(),
  ]);

  let maxBrands = 1;
  let ownedWorkspaceCount = 0;
  const isOwner = Boolean(ownerMembership);

  if (ownerMembership) {
    const { data: org } = await supabase
      .from("organizations")
      .select("max_brands")
      .eq("id", ownerMembership.organization_id)
      .maybeSingle();
    maxBrands = org?.max_brands ?? 1;
    ownedWorkspaceCount = workspaces.filter((w) => w.organizationId === ownerMembership.organization_id).length;
  }

  const userName = profile?.full_name || user.email?.split("@")[0] || "Kullanıcı";

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-slate-900 antialiased">
      <header className="flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <TentamarkLogo size={26} withWordmark />
        <UserProfileDropdown userName={userName} userEmail={user.email ?? undefined} />
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <WorkspacePicker
          workspaces={workspaces}
          isOwner={isOwner}
          maxBrands={maxBrands}
          ownedWorkspaceCount={ownedWorkspaceCount}
        />
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { BrandProvider } from "@/components/dashboard/BrandProvider";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import type { PlatformName } from "@/components/PlatformIcon";

/*
  Shared shell for the logged-in app (dashboard/* and settings). Resets the
  root layout's dark marketing body to the light app surface — the marketing
  site and the product are two different visual registers on purpose (see
  11-design-system.md).

  Also the auth boundary: every route under this layout requires a real
  session and a resolved brand. Sign-in/register screens are owned elsewhere
  (see (auth)/giris) — this only guards what's already behind them.
*/
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris");
  }

  const brand = await getCurrentBrand();

  if (!brand) {
    // Signed in but no org/brand yet — shouldn't happen once handle_new_user
    // runs on every signup, but fail safely rather than crash the panel on
    // a stale session or a user created outside the normal signup flow.
    redirect("/giris");
  }

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("platform")
    .eq("brand_id", brand.id);

  const connectedPlatforms = Array.from(
    new Set((accounts ?? []).map((a) => a.platform as PlatformName))
  );

  return (
    <BrandProvider brand={brand}>
      <div className="flex min-h-dvh bg-[#F8FAFC] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <DashboardSidebar connectedPlatforms={connectedPlatforms} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar brandName={brand.name} />
          <DashboardMobileNav />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </BrandProvider>
  );
}

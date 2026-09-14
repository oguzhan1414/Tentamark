import { redirect } from "next/navigation";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { BrandProvider } from "@/components/dashboard/BrandProvider";
import { ComposeModalProvider } from "@/components/dashboard/ComposeModalProvider";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const userName = profile?.full_name || user.email?.split("@")[0] || "Kullanıcı";

  const userEmail = user.email || "";

  if (!brand) {
    // Signed in but no org/brand yet — shouldn't happen once handle_new_user
    // runs on every signup, but fail safely rather than crash the panel on
    // a stale session or a user created outside the normal signup flow.
    redirect("/giris");
  }

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("platform, status")
    .eq("brand_id", brand.id);

  const connectedPlatforms = Array.from(
    new Set((accounts ?? []).map((a) => a.platform as PlatformName))
  );

  const hasBrokenConnection = (accounts ?? []).some((a) => a.status !== "active");

  const { count: failedContentCount } = await supabase
    .from("content_platforms")
    .select("id, content!inner(brand_id)", { count: "exact", head: true })
    .eq("content.brand_id", brand.id)
    .in("status", ["FAILED", "NEEDS_USER_ACTION"]);

  const systemHealthy = !hasBrokenConnection && !failedContentCount;

  const { count: pendingApprovals } = await supabase
    .from("content")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brand.id)
    .eq("status", "NEEDS_REVIEW");

  const { count: unreadInboxCount } = await supabase
    .from("social_messages")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brand.id)
    .eq("direction", "inbound")
    .eq("status", "open");

  return (
    <BrandProvider brand={brand}>
      <ComposeModalProvider>
        <div className="flex min-h-dvh bg-[#F8FAFC] text-slate-900 antialiased selection:bg-[#FA5252] selection:text-white">
          <DashboardSidebar
            connectedPlatforms={connectedPlatforms}
            pendingApprovals={pendingApprovals ?? 0}
            unreadInboxCount={unreadInboxCount ?? 0}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardTopbar
              userName={userName}
              userEmail={userEmail}
              brandName={brand.name}
              systemHealthy={systemHealthy}
            />
            <DashboardMobileNav />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </ComposeModalProvider>
    </BrandProvider>
  );
}

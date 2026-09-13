import AnalyticsNav from "@/components/dashboard/analytics/AnalyticsNav";

/*
  AnalyticsNav renders flush against the main DashboardSidebar (same white,
  same border-r, no gap) so the two read as one continuous rail with
  Analitik branching off it, rather than a second floating panel sitting in
  the page's gray background — that's what made it feel "ayrı" before.
*/
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      <AnalyticsNav />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1720px]">{children}</div>
      </div>
    </div>
  );
}

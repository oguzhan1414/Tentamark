"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import WeeklyPackForm, { type CampaignRange } from "@/components/dashboard/WeeklyPackForm";

function WeeklyPackPageContent() {
  const searchParams = useSearchParams();

  // Kept for deep-linking/bookmarking a campaign's planner directly by URL —
  // the primary path (from a campaign card) now opens CampaignPlannerModal
  // instead, without ever navigating here.
  const campaignId = searchParams.get("campaign") ?? undefined;
  const campaignRange = useMemo<CampaignRange | null>(() => {
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    if (!startParam || !endParam) return null;
    const start = new Date(startParam);
    const end = new Date(endParam);
    start.setHours(10, 0, 0, 0);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
    const daySpan = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    return { start, daySpan: Math.max(1, daySpan) };
  }, [searchParams]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <WeeklyPackForm campaignId={campaignId} campaignRange={campaignRange} />
    </div>
  );
}

export default function WeeklyPackPage() {
  // WeeklyPackPageContent reads ?campaign=/?start=/?end= via useSearchParams,
  // which Next.js requires a Suspense boundary for in production builds.
  return (
    <Suspense fallback={null}>
      <WeeklyPackPageContent />
    </Suspense>
  );
}

"use client";

import { useEffect } from "react";
import WeeklyPackForm, { type CampaignRange } from "@/components/dashboard/WeeklyPackForm";

/*
  Opens the multi-day campaign planner in place on the Campaigns page instead
  of navigating to /dashboard/compose/weekly — the campaign never actually
  goes anywhere, it stays right where you were looking at it. Submitting
  shows WeeklyPackForm's own review-then-confirmed screen right here in the
  modal — it never silently jumps to the Calendar on its own; going there is
  a link the user clicks themselves once they've seen the result.
*/
export default function CampaignPlannerModal({
  campaignId,
  campaignName,
  campaignObjective,
  startDate,
  endDate,
  onClose,
}: {
  campaignId: string;
  campaignName: string;
  campaignObjective: string | null;
  startDate: string;
  endDate: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Both ends need the same time-of-day set, otherwise `end` sits at
  // midnight while `start` sits at 10:00 and the inclusive day count comes
  // out short (a same-week range could silently compute one day short).
  const start = new Date(startDate);
  start.setHours(10, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(10, 0, 0, 0);
  const daySpan = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const campaignRange: CampaignRange = { start, daySpan };

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <div className="relative z-10 my-4 w-full max-w-6xl rounded-[28px] bg-[#F8FAFC] p-4 shadow-2xl sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          ✕
        </button>
        <WeeklyPackForm
          campaignId={campaignId}
          campaignName={campaignName}
          campaignObjective={campaignObjective}
          campaignRange={campaignRange}
        />
      </div>
    </div>
  );
}

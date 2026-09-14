"use client";

import { useEffect } from "react";
import ComposeForm from "@/components/dashboard/ComposeForm";
import type { MediaLibraryItem } from "@/lib/media/useMediaLibrary";

/*
  The one real content studio, as an overlay — reachable from anywhere via
  useComposeModal() (see ComposeModalProvider.tsx). Used to be one of two
  ways to reach ComposeForm (the other being the standalone /dashboard/compose
  page); now it's the only one, sized as a near-fullscreen modal so the full
  two-column studio (form + live preview) has room to breathe.
*/
export default function ComposeModal({
  onClose,
  initialCampaignId,
  initialDate,
  initialHour,
  initialMedia,
  onSubmitted,
}: {
  onClose: () => void;
  initialCampaignId?: string;
  initialDate?: string;
  initialHour?: number;
  initialMedia?: MediaLibraryItem;
  onSubmitted?: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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
        <ComposeForm
          onNavigate={onClose}
          onSubmitted={onSubmitted}
          initialCampaignId={initialCampaignId}
          initialDate={initialDate}
          initialHour={initialHour}
          initialMedia={initialMedia}
        />
      </div>
    </div>
  );
}

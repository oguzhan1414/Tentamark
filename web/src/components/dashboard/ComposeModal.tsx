"use client";

import { useCallback, useEffect, useState } from "react";
import ComposeForm from "@/components/dashboard/ComposeForm";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";
import type { MediaLibraryItem } from "@/lib/media/useMediaLibrary";

/*
  The one real content studio, as an overlay — reachable from anywhere via
  useComposeModal() (see ComposeModalProvider.tsx). Sized as a small, fixed-
  width popup (not a near-fullscreen panel) on purpose — ComposeForm itself
  is a single compact column now, so a wide modal would just leave dead
  backdrop on both sides instead of framing it.

  The form box is capped at 540px, not full-width — on any wider screen
  there's real clickable backdrop around it, and that backdrop used to close
  the whole modal on a single click with zero confirmation. A stray click
  there (or Escape) instantly threw away a typed idea, generated drafts, or
  an attached photo. isDirty is lifted from ComposeForm so this can ask
  before discarding anything real.
*/
export default function ComposeModal({
  onClose,
  initialCampaignId,
  initialDate,
  initialHour,
  initialIdea,
  initialMedia,
  onSubmitted,
}: {
  onClose: () => void;
  initialCampaignId?: string;
  initialDate?: string;
  initialHour?: number;
  initialIdea?: string;
  initialMedia?: MediaLibraryItem[];
  onSubmitted?: () => void;
}) {
  const [isDirty, setIsDirty] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  // A window-level listener, not onKeyDown on the modal div — Escape has to
  // work even when focus never landed on anything inside the modal (nothing
  // here auto-focuses), and keydown only bubbles up from whatever element
  // currently has focus, not down into unfocused descendants.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Kapat"
        onClick={requestClose}
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Yeni gönderi oluştur"
        className="relative z-10 flex max-h-[min(760px,calc(100dvh-24px))] w-full max-w-[540px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
      >
        <button
          type="button"
          onClick={requestClose}
          aria-label="Kapat"
          className="absolute right-4 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          ✕
        </button>
        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <ComposeForm
            onNavigate={onClose}
            onSubmitted={onSubmitted}
            onDirtyChange={setIsDirty}
            initialCampaignId={initialCampaignId}
            initialDate={initialDate}
            initialHour={initialHour}
            initialIdea={initialIdea}
            initialMedia={initialMedia}
          />
        </div>
      </div>

      <ConfirmDiscardDialog
        isOpen={confirmingClose}
        onCancel={() => setConfirmingClose(false)}
        onConfirm={onClose}
      />
    </div>
  );
}

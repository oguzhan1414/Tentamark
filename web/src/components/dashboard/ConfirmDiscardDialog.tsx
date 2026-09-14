"use client";

import { useEffect } from "react";
import {
  HiOutlineExclamationCircle,
  HiOutlineXMark,
  HiOutlineArrowUturnLeft,
} from "react-icons/hi2";

type Props = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
};

/*
  Linear & Raycast inspired, refined discard warning modal.
  Replaces generic browser confirm() or garish traffic-color alert boxes with
  a sleek, brand-aligned dialog that prevents accidental data loss across:
  - ComposeModal (Post Creator & Studio)
  - ApprovalDetailModal (Comments & tags in review)
  - BatchReviewModal (Bulk approval comments)
  - CampaignFormModal (Campaign fields)
  - CampaignPlannerModal (AI generated weekly pack)
  - SmartScheduleModal (AI smart schedule drafts)
*/
export default function ConfirmDiscardDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = "Kaydedilmemiş değişiklikleriniz var",
  message = "Şu an çıkarsanız yaptığınız değişiklikler kaybolur. Yine de çıkmak istiyor musunuz?",
  cancelLabel = "Düzenlemeye Devam Et",
  confirmLabel = "Kaydetmeden Çık",
}: Props) {
  // Listen for Escape key to safely cancel
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-dialog-title"
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xl shadow-slate-950/15 animate-in zoom-in-95 duration-150"
      >
        {/* Top bar: Icon & Badge & Close Button */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-[#FA5252]">
              <HiOutlineExclamationCircle className="h-5 w-5 stroke-[1.75]" />
            </div>
            <span className="rounded-full bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 tracking-wider uppercase">
              Kaydedilmedi
            </span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Kapat ve düzenlemeye devam et"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5 pt-1">
          <h3 id="discard-dialog-title" className="font-display text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Informational reassurance notice */}
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
          <span className="text-[11px] text-slate-500">
            Kapatırsanız girilen veriler veya üretilen taslaklar silinir.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer text-center"
          >
            {confirmLabel}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 px-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer text-center"
          >
            <HiOutlineArrowUturnLeft className="h-3.5 w-3.5 stroke-[2]" />
            <span>{cancelLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

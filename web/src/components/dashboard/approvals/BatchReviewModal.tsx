"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import PlatformIcon from "@/components/PlatformIcon";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";
import type { ApprovalItem } from "./types";

type Props = {
  items: ApprovalItem[];
  initialIndex?: number;
  onClose: () => void;
  onApprove: (id: string) => void;
  onAddComment: (itemId: string, text: string) => void;
};

export default function BatchReviewModal({
  items,
  initialIndex = 0,
  onClose,
  onApprove,
  onAddComment,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [quickComment, setQuickComment] = useState("");
  const [completed, setCompleted] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  // If no items
  const total = items.length;
  const currentItem = items[currentIndex] ?? null;

  // A typed-but-unsent quick comment used to vanish silently on Escape or
  // the X button — same "stray dismiss eats real input" bug as ComposeModal.
  const requestClose = useCallback(() => {
    if (quickComment.trim()) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  }, [quickComment, onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, total, requestClose]);

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setQuickComment("");
    }
  }

  function handleNext() {
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setQuickComment("");
    } else {
      setCompleted(true);
    }
  }

  function handleApproveCurrent() {
    if (!currentItem) return;
    onApprove(currentItem.id);
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setQuickComment("");
    } else {
      setCompleted(true);
    }
  }

  function handleCommentSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!currentItem || !quickComment.trim()) return;
    onAddComment(currentItem.id, quickComment.trim());
    setQuickComment("");
  }

  if (total === 0 || completed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 mb-4">
            🎉
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tüm İncelemeler Tamamlandı!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Kuyruktaki tüm gönderileri başarıyla gözden geçirdiniz.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            Panoya Dön
          </button>
        </div>
      </div>
    );
  }

  // Progress percentage
  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / total) * 100));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/65 backdrop-blur-sm p-4 sm:p-6 select-none">
      {/* Top Header: Progress and Close (matching screenshot 4) */}
      <header className="flex w-full max-w-4xl items-center justify-between">
        <div className="w-10" /> {/* Spacer */}

        {/* Center Progress: 1/12 with progress track */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-white/90">
            {currentIndex + 1}/{total}
          </span>
          <div className="h-1.5 w-32 sm:w-48 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Close button: dark rounded with white X */}
        <button
          type="button"
          onClick={requestClose}
          aria-label="Kapat"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer backdrop-blur-xs"
        >
          ✕
        </button>
      </header>

      {/* Floating Left Arrow */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Önceki"
          className="fixed left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer backdrop-blur-xs"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Floating Right Arrow */}
      {currentIndex + 1 < total && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Sonraki"
          className="fixed right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer backdrop-blur-xs"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Center Focused Review Card (matching screenshot 4) */}
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
              {currentItem.accountName.charAt(0).toLowerCase()}
            </div>
            <span className="text-xs font-bold text-slate-800">{currentItem.handle}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{currentItem.fullDateLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="text-slate-400 hover:text-slate-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
              <PlatformIcon name={currentItem.platform} variant="bare" className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {currentItem.imageUrl && (
          <div className="relative aspect-4/3 w-full bg-slate-100">
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.title}
              fill
              sizes="512px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Inline Quick Comment Input Box (matching screenshot 4) */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-blue-500 transition">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
              O
            </div>
            <input
              type="text"
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              placeholder="Bir şey söylemek..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {quickComment.trim() && (
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-blue-700"
              >
                Ekle
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Floating Action Bar: Atlamak & Gönderiyi Onayla (matching screenshot 4) */}
      <footer className="flex items-center gap-3 pb-2">
        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl bg-white px-10 py-3 text-sm font-semibold text-slate-800 shadow-md hover:bg-slate-50 transition cursor-pointer"
        >
          Atlamak
        </button>
        <button
          type="button"
          onClick={handleApproveCurrent}
          className="flex items-center gap-2 rounded-xl bg-[#1877f2] px-10 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-600 transition cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Gönderiyi onayla</span>
        </button>
      </footer>

      <ConfirmDiscardDialog
        isOpen={confirmingClose}
        onCancel={() => setConfirmingClose(false)}
        onConfirm={onClose}
        title="Gönderilmemiş bir yorumunuz var"
        message="Şu an çıkarsanız yazdığınız yorum kaybolur. Yine de çıkmak istiyor musunuz?"
      />
    </div>
  );
}

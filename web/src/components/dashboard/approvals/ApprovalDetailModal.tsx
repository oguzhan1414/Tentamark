"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PlatformIcon from "@/components/PlatformIcon";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { suggestPostImprovement, type PostSuggestion } from "@/lib/ai/suggestPostImprovement";
import { STATUS_LABEL } from "@/lib/contentStatus";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";
import type { ApprovalItem, TeamMemberOption } from "./types";

type Props = {
  item: ApprovalItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleApprove: (id: string) => void;
  onAddComment: (itemId: string, text: string) => void;
  teamMembers: TeamMemberOption[];
  onAssign: (itemId: string, userId: string | null) => void;
  // Only Gönderiler's merged view passes this — Onaylarım's own items never
  // needed inline tag editing, so the header's Tags pill stays purely
  // decorative when this is omitted (unchanged behavior).
  onEditTags?: (itemId: string, tags: string[]) => void;
  // Sends a review item back to Taslak instead of leaving "onayla" as the
  // only real decision this modal could make — see reject() in posts/page.tsx.
  onReject?: (id: string) => void;
  // Permanently removes the content row (cascades to content_platforms/
  // content_media/comments per schema). Closes the modal itself once done —
  // there's nothing left to look at.
  onDelete?: (id: string) => void;
};

export default function ApprovalDetailModal({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  onToggleApprove,
  onAddComment,
  teamMembers,
  onAssign,
  onEditTags,
  onReject,
  onDelete,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"comments" | "suggestions">("comments");
  const [commentInput, setCommentInput] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [confirmingClose, setConfirmingClose] = useState(false);

  // A typed-but-unsent comment or tag used to vanish silently on Escape or
  // the X button — same "stray dismiss eats real input" bug as ComposeModal.
  const isDirty = Boolean(commentInput.trim() || tagInput.trim());

  const requestClose = useCallback(() => {
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestClose, onPrev, onNext]);

  const isApproved = item.status === "APPROVED";
  // Gönderiler's merged view can open this modal for content in ANY state
  // (draft, scheduled, published, failed) — the approve/reject decision
  // only makes sense while it's genuinely awaiting review. Onaylarım's own
  // items never set realStatus, so they fall back to "review" and keep the
  // exact behavior this modal always had.
  const realStatus = item.realStatus ?? "review";
  const isActionable = realStatus === "review";
  const heroPermalinkUrl = item.platforms?.find((p) => p.platform === item.platform)?.permalinkUrl;

  function handleCommentSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    onAddComment(item.id, trimmed);
    setCommentInput("");
  }

  function handleReject() {
    if (!onReject) return;
    onReject(item.id);
    onClose();
  }

  function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Bu içeriği kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    onDelete(item.id);
    onClose();
  }

  async function handleShare() {
    if (item.isDemo || sharing) return;
    setSharing(true);
    try {
      const { data: existing } = await supabase
        .from("content_share_links")
        .select("token")
        .eq("content_id", item.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      let token = existing?.token as string | undefined;
      if (!token) {
        const { data: created, error } = await supabase
          .from("content_share_links")
          .insert({ content_id: item.id })
          .select("token")
          .single();
        if (error || !created) throw new Error(error?.message ?? "Bağlantı oluşturulamadı.");
        token = created.token;
      }

      await navigator.clipboard.writeText(`${window.location.origin}/onay/${token}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error("Paylaşım bağlantısı oluşturulamadı:", err);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-md">
      {/* Top Navigation Bar (matching screenshot 2 & 3) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/20 bg-white/95 px-4 sm:px-6 shadow-xs">
        {/* Left: Channel icon, plus, campaign & tags */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main Channel Badge */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs">
            <PlatformIcon name={item.platform} variant="bare" className="h-4 w-4 text-white" />
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          {/* Campaign — informational only (not a button, since clicking it
              doesn't do anything; campaign assignment happens in Compose). */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-semibold text-slate-700">
            <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>{item.campaignName || "Kampanya yok"}</span>
          </span>

          {/* Tags — opens the feedback panel, where they're actually
              editable (onEditTags below), instead of being its own dead
              pill duplicating that. */}
          {onEditTags && (
            <button
              type="button"
              onClick={() => setShowRightPanel(true)}
              title="Etiketleri düzenle"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition hidden sm:inline-flex"
            >
              <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Etiketler</span>
              {item.tags.length > 0 && (
                <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                  {item.tags.length}
                </span>
              )}
            </button>
          )}

          {/* Onaya ata — real, wired up. */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1">
            <svg className="h-3 w-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <select
              value={item.assignedTo?.id ?? ""}
              onChange={(e) => onAssign(item.id, e.target.value || null)}
              title="Onaya ata"
              className="bg-transparent text-xs font-bold text-rose-700 cursor-pointer focus:outline-none"
            >
              <option value="">Atanmadı</option>
              {teamMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: User avatar, Paylaşmak, icons & close */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-xs">
            O
          </div>

          {/* Paylaşmak Button */}
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing || item.isDemo}
            title="Hesabı olmayan biriyle paylaşabileceğin, onay verebileceği bir bağlantı oluşturur"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            <span>{shareCopied ? "Bağlantı Kopyalandı!" : sharing ? "Oluşturuluyor..." : "Onay Linki Paylaş"}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Feedback panel toggle — the one icon-only button left, since
              its own drawer's header repeats the label right after opening. */}
          <button
            type="button"
            onClick={() => setShowRightPanel((prev) => !prev)}
            title="Geri bildirim panelini aç/kapat"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              showRightPanel ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {onDelete && !item.isDemo && (
            <button
              type="button"
              onClick={handleDelete}
              title="İçeriği kalıcı olarak sil"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10" />
              </svg>
              <span>Sil</span>
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={requestClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative flex flex-1 overflow-hidden bg-[#edf1f5]/90">
        {/* Floating Left Arrow */}
        {index > 0 && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Önceki gönderi"
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg hover:bg-white transition cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Floating Right Arrow */}
        {index + 1 < total && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Sonraki gönderi"
            className={`absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg hover:bg-white transition cursor-pointer ${
              showRightPanel ? "right-[395px]" : "right-4"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Left / Center Preview Area */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-6 sm:px-8">
          {/* Top Device View Toggle */}
          <div className="mb-5 flex items-center rounded-xl bg-white p-1 shadow-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setDeviceView("desktop")}
              title="Masaüstü Görünümü"
              className={`flex h-8 w-10 items-center justify-center rounded-lg transition ${
                deviceView === "desktop" ? "bg-slate-100 text-slate-900 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setDeviceView("mobile")}
              title="Mobil Görünümü"
              className={`flex h-8 w-10 items-center justify-center rounded-lg transition ${
                deviceView === "mobile" ? "bg-slate-100 text-slate-900 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Main Preview with Left Status Line */}
          <div className="flex w-full max-w-2xl items-start justify-center gap-6">
            {/* Left Status Indicator Column (matches screenshot 2 & 3) */}
            <div className="hidden sm:flex flex-col items-end pt-8 shrink-0 w-44 text-right">
              {!isActionable ? (
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight ${STATUS_LABEL[realStatus].className}`}
                  >
                    {STATUS_LABEL[realStatus].label}
                  </span>
                  {realStatus === "published" && heroPermalinkUrl && (
                    <a
                      href={heroPermalinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Gönderiyi Görüntüle ↗
                    </a>
                  )}
                </div>
              ) : isApproved ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Onaylandı</span>
                  <button
                    type="button"
                    onClick={() => onToggleApprove(item.id)}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-600 transition cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Onayı geri al</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-medium text-slate-500">Henüz onaylanmadı</span>
                  <div className="flex items-center gap-1.5">
                    {onReject && (
                      <button
                        type="button"
                        onClick={handleReject}
                        className="flex items-center gap-1 rounded-full border-2 border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:border-red-500 hover:text-red-600 shadow-xs transition cursor-pointer"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Reddet</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleApprove(item.id)}
                      className="flex items-center gap-1 rounded-full border-2 border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:border-emerald-500 hover:text-emerald-600 shadow-xs transition cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Onayla</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline Connector Line and Device/Warning badges */}
              <div className="mr-3.5 mt-2 flex flex-col items-center gap-3">
                <div className="h-10 w-0.5 border-r border-dashed border-slate-300" />
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="h-6 w-0.5 border-r border-dashed border-slate-300" />
                <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs">
                  <PlatformIcon name={item.platform} variant="bare" className="h-3.5 w-3.5 text-slate-600" />
                  {isActionable && !isApproved && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white">
                      !
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Simulated Social Post Card */}
            <div
              className={`w-full transition-all duration-300 ${
                deviceView === "mobile"
                  ? "max-w-[340px] rounded-[32px] border-[6px] border-slate-800 bg-white p-1 shadow-2xl"
                  : "max-w-[480px] rounded-2xl border border-slate-200 bg-white shadow-xl"
              }`}
            >
              <div className="overflow-hidden rounded-xl bg-white">
                {/* Post Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {/* Brand Avatar */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                      {item.accountName.charAt(0).toLowerCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{item.handle}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        {isActionable && !isApproved && <span className="text-xs text-red-500">⚠️</span>}
                        <span className="text-[11px] text-slate-500">{item.fullDateLabel}</span>
                        <span className="text-[9px] text-slate-400">˅</span>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-slate-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                    </svg>
                  </button>
                </div>

                {/* Post Media */}
                {item.imageUrl && (
                  <div className="relative aspect-square w-full bg-slate-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="480px"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                {/* Post Caption */}
                <div className="p-3.5 space-y-2">
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-800">
                    {item.caption}
                  </p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map((t) => (
                        <span key={t} className="text-xs text-rose-600 hover:underline">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hook / Visual concept / per-platform captions — the info
              Gönderiler's old inspector drawer showed that this modal's
              single-caption device mockup doesn't have room for. Only
              rendered when actually populated (Onaylarım's own items never
              set these). */}
          {(item.hook || item.visualPrompt || (item.platforms && item.platforms.length > 1)) && (
            <div className="mt-5 w-full max-w-2xl space-y-3">
              {item.hook && (
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                    🪝 2 Saniyelik Kanca (Hook)
                  </span>
                  <p className="mt-1 text-xs font-semibold text-slate-900 leading-snug">&ldquo;{item.hook}&rdquo;</p>
                </div>
              )}

              {item.visualPrompt && (
                <div className="rounded-2xl border border-blue-200/70 bg-blue-50/50 p-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                    🎨 Görsel / Video Çekim Konsepti
                  </span>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">{item.visualPrompt}</p>
                </div>
              )}

              {item.platforms && item.platforms.length > 1 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Platform Metinleri ({item.platforms.length})
                  </span>
                  {item.platforms.map((p, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                      <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                        <PlatformIcon name={p.platform} className="h-5 w-5 rounded-md" />
                        <span className="text-xs font-bold text-slate-800">{p.platform}</span>
                        {p.scheduledAt && (
                          <span className="ml-auto font-mono text-[10px] text-slate-500">
                            {new Date(p.scheduledAt).toLocaleString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-line text-xs text-slate-800 leading-relaxed">{p.caption}</p>
                      {p.hashtags && p.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/40">
                          {p.hashtags.map((h, hIdx) => (
                            <span key={hIdx} className="font-mono text-[10px] text-rose-600 font-medium">
                              #{h.replace(/^#/, "")}
                            </span>
                          ))}
                        </div>
                      )}
                      {p.permalinkUrl && (
                        <a
                          href={p.permalinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          Gönderiyi Görüntüle ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Feedback Panel (Geri Bildirim) */}
        {showRightPanel && (
          <aside className="w-full sm:w-[380px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-full shadow-lg z-10">
            {/* Drawer Header */}
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
              <h3 className="font-semibold text-sm text-slate-800">Geri bildirim</h3>
              <button
                type="button"
                onClick={() => setShowRightPanel(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {onEditTags && (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-5 py-3">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => onEditTags(item.id, item.tags.filter((x) => x !== t))}
                      className="text-amber-600 hover:text-amber-900"
                      aria-label={`${t} etiketini kaldır`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== ",") return;
                    e.preventDefault();
                    const t = tagInput.trim();
                    if (t && !item.tags.includes(t)) onEditTags(item.id, [...item.tags, t]);
                    setTagInput("");
                  }}
                  placeholder="+ etiket"
                  className="w-20 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-700 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
            )}

            {/* Tabs: Yorumlar vs Öneriler */}
            <div className="flex border-b border-slate-100 px-5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === "comments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>Yorumlar</span>
                {item.comments.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {item.comments.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("suggestions")}
                className={`ml-5 pb-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === "suggestions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Öneriler
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === "comments" ? (
                <>
                  {/* Quick comment input box */}
                  <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/70 p-1.5 pr-2 focus-within:border-blue-500 focus-within:bg-white shadow-2xs transition">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                      O
                    </div>
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Bir şey söylemek..."
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="rounded-full bg-blue-600 p-1 text-white hover:bg-blue-700 disabled:opacity-30 transition shrink-0"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </form>

                  {/* Comments list or Empty State */}
                  {item.comments.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-600">Henüz yorum yok.</p>
                      <p>İlk yorumu bırakarak sohbete başlayın.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {item.comments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                            {c.avatarText || "O"}
                          </div>
                          <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-bold text-slate-900">{c.authorName}</span>
                              <span className="text-[10px] text-slate-400">• {c.timeAgo}</span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                              {c.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <SuggestionsTab key={item.id} caption={item.caption} platform={item.platform} />
              )}
            </div>
          </aside>
        )}
      </div>

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

/*
  Fetches once per mount — the parent keys this by item.id, so switching
  posts (prev/next) remounts it fresh instead of needing a manual reset
  inside an effect (same pattern as ContentComments/ComposeForm's idea
  suggestion elsewhere in the app).
*/
function SuggestionsTab({ caption, platform }: { caption: string; platform: string }) {
  const brand = useBrand();
  const [suggestion, setSuggestion] = useState<PostSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const result = await suggestPostImprovement(brand.id, caption, platform);
        if (!ignore) setSuggestion(result);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Öneri alınamadı.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [brand.id, caption, platform]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-slate-400">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
        <span>AI markanıza uygun bir öneri hazırlıyor...</span>
      </div>
    );
  }

  if (error) {
    return <p className="py-6 text-xs text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-3 py-2">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-slate-700 space-y-1.5">
        <span className="font-bold text-amber-900">💡 AI İpucu</span>
        <p>{suggestion?.tip || "Bu gönderi için şu an bir öneri üretilemedi."}</p>
      </div>
      {suggestion && suggestion.hashtags.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-2">
          <span className="font-bold text-slate-800">Önerilen Hashtagler:</span>
          <div className="flex flex-wrap gap-1">
            {suggestion.hashtags.map((h) => (
              <span
                key={h}
                className="rounded bg-white px-2 py-0.5 text-slate-600 border border-slate-200 text-[11px]"
              >
                {h.startsWith("#") ? h : `#${h}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

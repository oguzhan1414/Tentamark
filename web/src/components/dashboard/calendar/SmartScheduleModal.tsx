"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fillCalendarDateWithAi, type CalendarSmartDraft } from "@/lib/ai/fillCalendarDateWithAi";
import { PLATFORM_LABEL, type LaunchPlatform } from "@/lib/ai/platforms";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";

type Props = {
  brandId: string;
  targetDateStr: string;
  existingTitles?: string[];
  // Set when opened from the İçerik Dengesi Radarı's "eksik günü doldur"
  // button — forces the draft into the pillar the radar flagged as missing
  // instead of leaving the category up to whatever the model picks on its
  // own, which is what the button's label always promised but never did.
  presetCategory?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function SmartScheduleModal({
  brandId,
  targetDateStr,
  existingTitles = [],
  presetCategory,
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<CalendarSmartDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<LaunchPlatform>("instagram");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  // Guards against a stale response clobbering a newer one — without this,
  // React's dev-mode double-invoked effect (or a quick double-click on
  // "Tekrar Dene"/"Farklı Fikir Üret") fires generate() twice, and whichever
  // call's promise settles last wins for whatever state it touches. That's
  // how an old call's draft and a newer call's error ended up on screen at
  // the same time — each call cleared both, but neither run knew about the
  // other, so the one that finished last silently overwrote just its own
  // half of the picture.
  const latestRequestId = useRef(0);
  const [confirmingClose, setConfirmingClose] = useState(false);

  // A freshly AI-generated, not-yet-added-to-calendar draft used to vanish
  // silently on a backdrop click — same "stray dismiss eats real work" bug
  // as ComposeModal, worse here since regenerating costs a real AI call.
  // Doesn't guard the explicit "Vazgeç" button — clicking a button labeled
  // "give up" already is the confirmation.
  const isDirty = Boolean(draft) && !savedSuccess;

  const requestClose = useCallback(() => {
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, requestClose]);

  const formattedDate = useMemo(() => {
    try {
      const d = new Date(targetDateStr);
      return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
    } catch {
      return targetDateStr;
    }
  }, [targetDateStr]);

  async function generate(dateStr: string) {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    setDraft(null);
    setSavedSuccess(false);

    try {
      const result = await fillCalendarDateWithAi(brandId, dateStr, existingTitles, presetCategory);
      if (latestRequestId.current !== requestId) return; // superseded by a newer call
      setDraft(result);
      const firstPlatform = Object.keys(result.captions)[0] as LaunchPlatform;
      if (firstPlatform) setActivePlatform(firstPlatform);
    } catch (err) {
      if (latestRequestId.current !== requestId) return;
      setError(err instanceof Error ? err.message : "Gönderi taslağı oluşturulamadı.");
    } finally {
      if (latestRequestId.current === requestId) setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && targetDateStr) {
      void generate(targetDateStr);
    }
  }, [isOpen, targetDateStr]);

  async function handleSaveToCalendar() {
    if (!draft) return;
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Insert content record
      const { data: contentRow, error: contentError } = await supabase
        .from("content")
        .insert({
          brand_id: brandId,
          title: draft.title,
          core_idea: draft.title,
          category: draft.category || null,
          status: "NEEDS_REVIEW",
          ai_generated: true,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();

      if (contentError || !contentRow) throw new Error(contentError?.message ?? "İçerik kaydedilemedi.");

      // 2. Insert platform captions
      const platforms = Object.keys(draft.captions) as LaunchPlatform[];
      if (platforms.length > 0) {
        const { error: cpError } = await supabase.from("content_platforms").insert(
          platforms.map((platform) => {
            const caption = draft.captions[platform] ?? "";
            const matches = caption.match(/#[\p{L}0-9_]+/gu) ?? [];
            const hashtags = Array.from(new Set(matches));

            return {
              content_id: contentRow.id,
              platform,
              caption,
              hashtags,
              status: "PENDING",
              scheduled_at: draft.scheduledIso,
            };
          })
        );

        if (cpError) throw new Error(cpError.message);
      }

      setSavedSuccess(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Takvime kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="absolute inset-0" onClick={requestClose} />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-[#FA5252] text-white shadow-xs">
              ✨
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                AI Akıllı Takvim Doldurucu
              </h3>
              <p className="text-[11px] text-slate-500">{formattedDate}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={requestClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-slate-800">
                  {formattedDate} için en etkili içerik tasarlanıyor…
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {presetCategory
                    ? `İçerik dengesi radarının önerdiği "${presetCategory}" kategorisine göre hazırlanıyor.`
                    : "Marka DNA'nız, hedef kitleniz ve haftalık içerik dengeniz analiz ediliyor."}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <p className="font-semibold">Hata oluştu</p>
              <p className="mt-0.5">{error}</p>
              <button
                type="button"
                onClick={() => generate(targetDateStr)}
                className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {draft && (
            <div className="space-y-4">
              {/* Draft Info Header */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    {draft.category}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-900 bg-white/80 px-2 py-0.5 rounded-md border border-rose-100">
                    Önerilen Saat: {draft.suggestedTime}
                  </span>
                </div>

                <h4 className="mt-2.5 font-display text-base font-bold text-slate-900">
                  {draft.title}
                </h4>

                <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="text-rose-600">💡</span>
                  <p className="italic">{draft.rationale}</p>
                </div>
              </div>

              {/* Platform Tabs */}
              <div>
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  {(Object.keys(draft.captions) as LaunchPlatform[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActivePlatform(p)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        activePlatform === p
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {PLATFORM_LABEL[p]}
                    </button>
                  ))}
                </div>

                {/* Caption View */}
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <p className="whitespace-pre-line text-xs text-slate-800 leading-relaxed font-body">
                    {draft.captions[activePlatform] || "Bu platform için metin bulunmuyor."}
                  </p>
                </div>
              </div>

              {savedSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <span>✓</span>
                  <span>Gönderi başarıyla takvime eklendi ve onay listesine alındı!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {draft && !savedSuccess && (
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-3.5 bg-slate-50/50">
            <button
              type="button"
              onClick={() => generate(targetDateStr)}
              disabled={loading || saving}
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>🔄</span>
              <span>Farklı Fikir Üret</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSaveToCalendar}
                disabled={saving || loading}
                className="rounded-xl bg-[#FA5252] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {saving ? (
                  <span>Ekleniyor…</span>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Takvime Ekle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDiscardDialog
        isOpen={confirmingClose}
        onCancel={() => setConfirmingClose(false)}
        onConfirm={onClose}
        title="Oluşturulan taslak henüz eklenmedi"
        message="Şu an çıkarsanız bu taslak kaybolur. Yine de çıkmak istiyor musunuz?"
      />
    </div>
  );
}

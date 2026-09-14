"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import PlatformIcon from "@/components/PlatformIcon";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";
import { PLATFORM_LABEL, type LaunchPlatform } from "@/lib/ai/platforms";

export type CampaignStatus = "active" | "completed" | "archived";

const STATUS_CONFIG: Record<CampaignStatus, { label: string }> = {
  active: { label: "Aktif" },
  completed: { label: "Tamamlandı" },
  archived: { label: "Arşivlendi" },
};

export type CampaignFormValues = {
  name: string;
  objective: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  platforms: LaunchPlatform[];
};

/*
  Shared by "Yeni Kampanya Başlat" and each card's "Düzenle" action — same
  fields either way, only the submit handler and starting values differ, so
  this is the one place the form actually lives.
*/
export default function CampaignFormModal({
  mode,
  initial,
  connectedPlatforms,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: CampaignFormValues;
  connectedPlatforms: LaunchPlatform[];
  onClose: () => void;
  onSubmit: (values: CampaignFormValues) => Promise<string | null>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [objective, setObjective] = useState(initial?.objective ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState<CampaignStatus>(initial?.status ?? "active");
  const [platforms, setPlatforms] = useState<LaunchPlatform[]>(initial?.platforms ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingClose, setConfirmingClose] = useState(false);

  // Compared against the real starting values (not just "is anything
  // filled in") so editing an existing campaign without changing anything
  // doesn't nag on close — only a real, unsaved edit does.
  const isDirty = initial
    ? name !== initial.name ||
      objective !== initial.objective ||
      startDate !== initial.startDate ||
      endDate !== initial.endDate ||
      status !== initial.status ||
      platforms.length !== initial.platforms.length ||
      platforms.some((p) => !initial.platforms.includes(p))
    : Boolean(name.trim() || objective.trim() || startDate || endDate || platforms.length > 0);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  function togglePlatform(platform: LaunchPlatform) {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const err = await onSubmit({
      name: name.trim(),
      objective: objective.trim(),
      startDate,
      endDate,
      status,
      platforms,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        onClick={requestClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      <div className="relative w-full max-w-lg rounded-[24px] border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-display text-lg font-bold text-slate-900">
            {mode === "create" ? "Yeni Kampanya Oluştur" : "Kampanyayı Düzenle"}
          </h3>
          <button
            type="button"
            onClick={requestClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kampanya Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: 2026 Yaz Koleksiyonu Lansmanı"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pazarlama Hedefi (Objective)
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Örn: Web sitesi trafiğini %25 artırmak ve e-bülten kaydı toplamak..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="relative space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Zaman Aralığı</label>
            <button
              type="button"
              onClick={() => setShowDatePicker((s) => !s)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:border-slate-300"
            >
              <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
              </svg>
              <span className={startDate || endDate ? "font-mono text-slate-800" : "text-slate-400"}>
                {startDate ? new Date(startDate).toLocaleDateString("tr-TR") : "Başlangıç tarihi"}
                {" — "}
                {endDate ? new Date(endDate).toLocaleDateString("tr-TR") : "Bitiş tarihi"}
              </span>
            </button>

            {showDatePicker && (
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(s, e) => {
                  setStartDate(s);
                  setEndDate(e);
                }}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Durum</label>
            <div className="flex gap-2">
              {(Object.keys(STATUS_CONFIG) as CampaignStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    status === s
                      ? "border-rose-500 bg-rose-50/70 text-rose-900 ring-1 ring-rose-500"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kanallar (Opsiyonel)
            </label>
            {connectedPlatforms.length === 0 ? (
              <p className="text-xs text-slate-400">
                Henüz bağlı bir hesap yok —{" "}
                <Link href="/settings?tab=baglantilar" className="font-semibold text-rose-600 hover:underline">
                  önce bir hesap bağla
                </Link>
                .
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {connectedPlatforms.map((p) => {
                  const checked = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        checked
                          ? "border-rose-500 bg-rose-50/70 text-rose-900 ring-1 ring-rose-500"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <PlatformIcon name={p} className="h-4 w-4" />
                      <span>{PLATFORM_LABEL[p]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={requestClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : mode === "create" ? "Kampanyayı Başlat" : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmDiscardDialog
        isOpen={confirmingClose}
        onCancel={() => setConfirmingClose(false)}
        onConfirm={onClose}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";

type Status = "active" | "completed" | "archived";

type Campaign = {
  id: string;
  name: string;
  objective: string | null;
  start_date: string | null;
  end_date: string | null;
  status: Status;
  totalContent: number;
  publishedContent: number;
};

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-emerald-50 text-emerald-700 border-emerald-200/50" },
  completed: { label: "Tamamlandı", className: "bg-slate-100 text-slate-700 border-slate-200" },
  archived: { label: "Arşivlendi", className: "bg-slate-50 text-slate-400 border-slate-100" },
};

export default function CampaignsPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const [{ data, error }, { data: contentRows, error: contentError }] = await Promise.all([
        supabase
          .from("campaigns")
          .select("id, name, objective, start_date, end_date, status")
          .eq("brand_id", brand.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("content")
          .select("campaign_id, status")
          .eq("brand_id", brand.id)
          .not("campaign_id", "is", null),
      ]);

      if (ignore) return;
      if (error) {
        console.error("Kampanyalar yüklenemedi:", error.message);
        setCampaigns([]);
        return;
      }
      if (contentError) {
        console.error("Kampanya içerik sayıları alınamadı:", contentError.message);
      }

      const counts = new Map<string, { total: number; published: number }>();
      for (const row of contentRows ?? []) {
        if (!row.campaign_id) continue;
        const entry = counts.get(row.campaign_id) ?? { total: 0, published: 0 };
        entry.total += 1;
        if (row.status === "PUBLISHED" || row.status === "PARTIALLY_PUBLISHED") entry.published += 1;
        counts.set(row.campaign_id, entry);
      }

      setCampaigns(
        (data ?? []).map((c) => ({
          ...c,
          totalContent: counts.get(c.id)?.total ?? 0,
          publishedContent: counts.get(c.id)?.published ?? 0,
        })) as Campaign[]
      );
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, refreshKey]);

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCreateError(null);

    const { error } = await supabase.from("campaigns").insert({
      brand_id: brand.id,
      name: name.trim(),
      objective: objective.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: "active",
    });

    setCreating(false);
    if (error) {
      setCreateError(error.message);
      return;
    }
    setName("");
    setObjective("");
    setStartDate("");
    setEndDate("");
    setShowCreateModal(false);
    setRefreshKey((k) => k + 1);
  }

  async function setStatus(id: string, status: Status) {
    const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
    if (error) {
      console.error("Durum güncellenemedi:", error.message);
      return;
    }
    setRefreshKey((k) => k + 1);
  }

  async function remove(id: string) {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) {
      console.error("Silinemedi:", error.message);
      return;
    }
    setRefreshKey((k) => k + 1);
  }

  const activeCount = useMemo(() => campaigns?.filter((c) => c.status === "active").length ?? 0, [campaigns]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Kampanyalar & Büyüme Masası
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            {brand.name} için tematik pazarlama hedeflerini, içerik paketlerini ve zaman çizelgelerini yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Yeni Kampanya Başlat</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Aktif Kampanyalar
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {activeCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Yayında</span>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Toplam Kampanya
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {campaigns?.length ?? 0}
            </span>
            <span className="text-xs text-slate-400">Kayıtlı</span>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hedef Ritim & Başarı
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-300 sm:text-3xl">
              —
            </span>
            <span className="text-xs text-slate-500">Analiz özelliği ile birlikte gelecek</span>
          </div>
        </div>
      </div>

      {/* 3. Campaigns Grid */}
      {campaigns === null ? (
        <div className="flex h-64 items-center justify-center rounded-[22px] border border-slate-100 bg-white text-sm text-slate-400">
          Kampanyalar yükleniyor...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-white py-16 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <h3 className="font-display text-base font-bold text-slate-800">Henüz kampanya oluşturulmadı</h3>
          <p className="max-w-md text-xs text-slate-500">
            Ürün lansmanları, mevsimsel indirimler veya marka farkındalığı gibi hedeflerinizi gruplamak için ilk kampanyayı başlatın.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            + İlk Kampanyayı Başlat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const cfg = STATUS_CONFIG[c.status];
            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Kampanya
                      </span>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold ${cfg.className}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">{c.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {c.objective || "Belirli bir hedef tanımı girilmedi."}
                    </p>
                  </div>

                  {(c.start_date || c.end_date) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                      </svg>
                      <span>
                        {c.start_date ? new Date(c.start_date).toLocaleDateString("tr-TR") : "—"} →{" "}
                        {c.end_date ? new Date(c.end_date).toLocaleDateString("tr-TR") : "—"}
                      </span>
                    </div>
                  )}

                  {/* Visual Progress Bar — real content counts, not a placeholder */}
                  <div className="pt-2">
                    {c.totalContent > 0 ? (
                      <>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>İçerik Tamamlanma</span>
                          <span className="font-bold text-slate-800">
                            {c.publishedContent} / {c.totalContent} Gönderi
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
                            style={{ width: `${Math.round((c.publishedContent / c.totalContent) * 100)}%` }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-400">Bu kampanyaya bağlı içerik henüz yok.</p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 gap-2">
                  <Link
                    href={`/dashboard/compose?campaign=${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>+ İçerik Üret</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <select
                      value={c.status}
                      onChange={(e) => setStatus(c.id, e.target.value as Status)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="active">Aktif</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="archived">Arşivlendi</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Sil"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setShowCreateModal(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-lg rounded-[24px] border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">Yeni Kampanya Oluştur</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createCampaign} className="mt-5 space-y-4">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
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
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{createError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  {creating ? "Oluşturuluyor..." : "Kampanyayı Başlat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

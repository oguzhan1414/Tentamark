"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { getAnalyticsOverview, type AnalyticsOverview } from "@/lib/ai/getAnalyticsOverview";
import { STATUS_LABEL, type UIStatus } from "@/lib/contentStatus";
import AnalyticsPageHeader from "@/components/dashboard/analytics/AnalyticsPageHeader";
import { type PlatformName } from "@/components/PlatformIcon";
import {
  HiOutlineDocumentText,
  HiOutlineTableCells,
  HiOutlinePrinter,
} from "react-icons/hi2";

type CampaignOption = { id: string; name: string };
type PlatformRow = { platform: PlatformName; status: string; scheduled_at: string | null };
type ContentRow = { id: string; title: string; status: string; created_at: string; content_platforms: PlatformRow[] };

function overallStatus(row: ContentRow): UIStatus {
  const platforms = row.content_platforms ?? [];
  if (platforms.some((p) => p.status === "NEEDS_USER_ACTION" || p.status === "FAILED")) return "failed";
  if (row.status === "PUBLISHED" || row.status === "PARTIALLY_PUBLISHED") return "published";
  if (row.status === "APPROVED" || row.status === "SCHEDULED") return "scheduled";
  if (row.status === "DRAFT" || row.status === "IDEA" || row.status === "GENERATING") return "draft";
  return "review";
}

function csvEscape(cell: string | number): string {
  const s = String(cell);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

function downloadCsv(filename: string, csv: string) {
  // BOM so Excel opens Turkish characters correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportsAnalyticsPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [scope, setScope] = useState<"overview" | "campaign">("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  const [campaignOptions, setCampaignOptions] = useState<CampaignOption[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignContents, setCampaignContents] = useState<ContentRow[] | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(false);

  useEffect(() => {
    let ignore = false;
    // Loading is intentionally reset when the active brand changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    (async () => {
      const [data, { data: campaignRows }] = await Promise.all([
        getAnalyticsOverview(brand.id),
        supabase.from("campaigns").select("id, name").eq("brand_id", brand.id).order("created_at", { ascending: false }),
      ]);
      if (ignore) return;
      setOverview(data);
      setCampaignOptions((campaignRows ?? []) as CampaignOption[]);
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [brand.id, supabase]);

  useEffect(() => {
    if (scope !== "campaign" || !selectedCampaignId) return;
    let ignore = false;
    // Loading is intentionally reset when the selected campaign changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingCampaign(true);
    (async () => {
      const [{ data: campaignRow }, { data: contentRows }] = await Promise.all([
        supabase.from("campaigns").select("name").eq("id", selectedCampaignId).maybeSingle(),
        supabase
          .from("content")
          .select("id, title, status, created_at, content_platforms(platform, status, scheduled_at)")
          .eq("campaign_id", selectedCampaignId)
          .order("created_at", { ascending: false }),
      ]);
      if (ignore) return;
      setCampaignName(campaignRow?.name ?? "");
      setCampaignContents((contentRows ?? []) as unknown as ContentRow[]);
      setLoadingCampaign(false);
    })();
    return () => {
      ignore = true;
    };
  }, [scope, selectedCampaignId, supabase]);

  const campaignStats = useMemo(() => {
    const rows = campaignContents ?? [];
    return {
      total: rows.length,
      published: rows.filter((r) => overallStatus(r) === "published").length,
      scheduled: rows.filter((r) => overallStatus(r) === "scheduled").length,
      review: rows.filter((r) => overallStatus(r) === "review").length,
    };
  }, [campaignContents]);

  function handleExportCsv() {
    const generatedAt = new Date().toLocaleString("tr-TR");
    if (scope === "overview" && overview) {
      const rows: (string | number)[][] = [
        [`${brand.name} — Genel Bakış Raporu`],
        [`Oluşturulma: ${generatedAt}`],
        [],
        ["Durum", "Adet"],
        ...(Object.entries(overview.statusBreakdown) as [string, number][]).map(([k, v]) => [
          STATUS_LABEL[k as UIStatus]?.label ?? k,
          v,
        ]),
        [],
        ["Hafta", "Yayınlanan Gönderi"],
        ...overview.weeklyVelocity.map((w) => [w.weekLabel, w.count]),
        [],
        ["Platform", "İçerik Sayısı"],
        ...overview.platformCounts.map((p) => [p.platform, p.count]),
        [],
        ["Strateji Sütunu", "Planlanan %", "Gerçekleşen %"],
        ...overview.pillarAdherence.map((p) => [p.name, p.planned, p.actual]),
      ];
      downloadCsv(`${brand.name}_genel_bakis_raporu.csv`, toCsv(rows));
    } else if (scope === "campaign" && campaignContents) {
      const rows: (string | number)[][] = [
        [`${brand.name} — ${campaignName} Kampanya Raporu`],
        [`Oluşturulma: ${generatedAt}`],
        [],
        ["Başlık", "Durum", "Platformlar", "Oluşturulma Tarihi"],
        ...campaignContents.map((c) => [
          c.title,
          STATUS_LABEL[overallStatus(c)].label,
          (c.content_platforms ?? []).map((p) => p.platform).join(" / "),
          new Date(c.created_at).toLocaleDateString("tr-TR"),
        ]),
      ];
      downloadCsv(`${brand.name}_${campaignName || "kampanya"}_raporu.csv`, toCsv(rows));
    }
  }

  function handlePrint() {
    window.print();
  }

  const generatedLabel = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        icon={HiOutlineDocumentText}
        title="Raporlama & Sunum Merkezi"
        subtitle="Gerçek üretim verilerinizi PDF (yazdır) veya CSV olarak dışa aktarın — müşteriye ya da ekibinize paylaşmaya hazır."
      />

      {/* Interactive report builder — hidden when printing */}
      <div className="print:hidden space-y-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <HiOutlineDocumentText className="h-4 w-4 stroke-[2]" />
            </span>
            <h3 className="font-display text-sm font-bold text-slate-900">Rapor Kapsamı Seç</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setScope("overview")}
              className={`rounded-xl border p-4 text-left transition ${
                scope === "overview" ? "border-rose-500 bg-rose-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-bold text-slate-900">Genel Bakış Raporu</p>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Durum dağılımı, yayın hızı, platform dağılımı ve strateji uyumunun tamamı.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setScope("campaign")}
              disabled={campaignOptions.length === 0}
              className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                scope === "campaign" ? "border-rose-500 bg-rose-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-bold text-slate-900">Kampanya Raporu</p>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                {campaignOptions.length === 0
                  ? "Rapor alabileceğiniz bir kampanya yok."
                  : "Seçtiğiniz kampanyanın içerik listesi ve durum dağılımı."}
              </p>
            </button>
          </div>

          {scope === "campaign" && campaignOptions.length > 0 && (
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
            >
              <option value="">Kampanya seçin...</option>
              {campaignOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || (scope === "campaign" && !selectedCampaignId)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
            >
              <HiOutlinePrinter className="h-4 w-4" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={loading || (scope === "campaign" && !selectedCampaignId)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <HiOutlineTableCells className="h-4 w-4" />
              <span>CSV İndir</span>
            </button>
          </div>
        </div>

        {/* On-screen preview of what will print */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
          </div>
        ) : scope === "overview" && overview ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Önizleme</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.entries(overview.statusBreakdown) as [UIStatus, number][]).map(([key, count]) => (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {STATUS_LABEL[key].label}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        ) : scope === "campaign" && selectedCampaignId ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Önizleme — {campaignName}</p>
            {loadingCampaign ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent inline-block" />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Toplam İçerik</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900">{campaignStats.total}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Yayınlandı</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900">{campaignStats.published}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Zamanlandı</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900">{campaignStats.scheduled}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Onay Bekliyor</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900">{campaignStats.review}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Print-only report layout — invisible on screen, shown only by window.print() */}
      <div className="hidden print:block text-slate-900">
        <div className="mb-6 flex items-center justify-between border-b border-slate-300 pb-4">
          <div>
            <h1 className="font-display text-xl font-bold">{brand.name}</h1>
            <p className="text-xs text-slate-500">
              {scope === "overview" ? "Genel Bakış Raporu" : `Kampanya Raporu — ${campaignName}`}
            </p>
          </div>
          <p className="text-xs text-slate-500">{generatedLabel}</p>
        </div>

        {scope === "overview" && overview && (
          <div className="space-y-6 text-xs">
            <section>
              <h2 className="mb-2 font-display text-sm font-bold">İçerik Havuzu Durumu</h2>
              <table className="w-full border-collapse">
                <tbody>
                  {(Object.entries(overview.statusBreakdown) as [UIStatus, number][]).map(([key, count]) => (
                    <tr key={key} className="border-b border-slate-200">
                      <td className="py-1.5">{STATUS_LABEL[key].label}</td>
                      <td className="py-1.5 text-right font-mono">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="mb-2 font-display text-sm font-bold">Son 8 Hafta Yayın Hacmi</h2>
              <table className="w-full border-collapse">
                <tbody>
                  {overview.weeklyVelocity.map((w) => (
                    <tr key={w.weekLabel} className="border-b border-slate-200">
                      <td className="py-1.5">{w.weekLabel}</td>
                      <td className="py-1.5 text-right font-mono">{w.count} gönderi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {overview.pillarAdherence.length > 0 && (
              <section>
                <h2 className="mb-2 font-display text-sm font-bold">Strateji Sütunu Uyumu</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-left">
                      <th className="py-1.5">Sütun</th>
                      <th className="py-1.5 text-right">Planlanan</th>
                      <th className="py-1.5 text-right">Gerçekleşen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.pillarAdherence.map((p) => (
                      <tr key={p.name} className="border-b border-slate-200">
                        <td className="py-1.5">{p.name}</td>
                        <td className="py-1.5 text-right font-mono">%{p.planned}</td>
                        <td className="py-1.5 text-right font-mono">%{p.actual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </div>
        )}

        {scope === "campaign" && campaignContents && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] uppercase text-slate-500">Toplam</p>
                <p className="font-mono text-base font-bold">{campaignStats.total}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Yayınlandı</p>
                <p className="font-mono text-base font-bold">{campaignStats.published}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Zamanlandı</p>
                <p className="font-mono text-base font-bold">{campaignStats.scheduled}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Onay Bekliyor</p>
                <p className="font-mono text-base font-bold">{campaignStats.review}</p>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-left">
                  <th className="py-1.5">Başlık</th>
                  <th className="py-1.5">Durum</th>
                  <th className="py-1.5">Platform</th>
                  <th className="py-1.5 text-right">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {campaignContents.map((c) => (
                  <tr key={c.id} className="border-b border-slate-200">
                    <td className="py-1.5">{c.title}</td>
                    <td className="py-1.5">{STATUS_LABEL[overallStatus(c)].label}</td>
                    <td className="py-1.5">{(c.content_platforms ?? []).map((p) => p.platform).join(", ")}</td>
                    <td className="py-1.5 text-right font-mono">
                      {new Date(c.created_at).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

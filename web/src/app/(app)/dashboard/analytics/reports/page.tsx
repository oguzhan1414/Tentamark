"use client";

import { useState } from "react";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/BrandProvider";
import AnalyticsNav from "@/components/dashboard/analytics/AnalyticsNav";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import {
  HiOutlineDocumentChartBar,
  HiOutlineDocumentText,
  HiOutlineMegaphone,
  HiOutlineSparkles,
  HiOutlineChartBar,
} from "react-icons/hi2";

export default function ReportsAnalyticsPage() {
  const brand = useBrand();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"executive" | "campaign" | "competitor">("executive");
  const [reportFormat, setReportFormat] = useState<"pdf" | "ppt">("pdf");
  const [datePeriod, setDatePeriod] = useState<string>("30d");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformName[]>([
    "instagram",
    "linkedin",
    "tiktok",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const togglePlatform = (p: PlatformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setIsGenerateModalOpen(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto">
      {/* 1. Header with Analytics Sub-Navigation */}
      <AnalyticsNav
        title="Raporlama & Sunum Merkezi"
        subtitle="Verilerinizi analiz etmeye, ekibinizle paylaşmaya veya müşterilerinize sunmaya hazır profesyonel raporlara dönüştürün."
      >
        <button
          type="button"
          onClick={() => {
            setReportType("executive");
            setIsGenerateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
        >
          <HiOutlineDocumentChartBar className="h-4 w-4 stroke-[2]" />
          <span>Hemen Rapor Oluştur</span>
        </button>
      </AnalyticsNav>

      {/* 2. Highlight Banner (Metricool Banner Style) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              Ajans & Yönetici Desteği
            </span>
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
              Müşterilerinize veya Yönetiminize Özel Markalı Raporlar Sunun
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tüm sosyal ağlardan gelen metrikleri {brand.name} logosu ve kurumsal renklerinizle
              tek tıkla PDF veya PPT sunum formatına aktarın.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setReportType("executive");
              setIsGenerateModalOpen(true);
            }}
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Özel Şablonu Başlat
          </button>
        </div>
      </div>

      {/* 3. Four Core Reporting Cards (Directly matching Metricool Screenshot 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Raporlar (PDF / PPT) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <HiOutlineDocumentText className="h-5 w-5 stroke-[1.75]" />
              </div>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                En Popüler
              </span>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-slate-900">
                Sosyal Medya Raporları
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Belirli bir dönem için seçtiğiniz sosyal ağlardan gelen verilerle önceden tasarlanmış
                raporlar oluşturun. Logonuzla özelleştirin, PDF veya PPT olarak dışa aktarın.
              </p>
            </div>
          </div>

          {/* Mini Visual Preview */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                PDF
              </span>
              <span className="h-6 w-6 rounded bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">
                PPT
              </span>
              <span className="text-[11px] text-slate-600 font-sans">Hazır Şablon</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">12 Sayfa</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setReportType("executive");
              setIsGenerateModalOpen(true);
            }}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer text-center"
          >
            Rapor Oluştur
          </button>
        </div>

        {/* Card 2: Kampanya Kontrol Panelleri */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <HiOutlineMegaphone className="h-5 w-5 stroke-[1.75]" />
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Kampanya
              </span>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-slate-900">
                Kampanya Kontrol Panelleri
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Kampanya veya konu başlıklarına göre içerikleri gruplandırın. Her bir pazarlama operasyonunun
                gerçek kitle etkisini birleşik performansla analiz edin.
              </p>
            </div>
          </div>

          {/* Mini Visual Preview */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-slate-600 font-sans">#Lansman2026</span>
            <span className="text-[10px] text-rose-700 font-bold">90.2K Erişim</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setReportType("campaign");
              setIsGenerateModalOpen(true);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer text-center"
          >
            Kampanya Raporu Al
          </button>
        </div>

        {/* Card 3: Tentamark Studio / Özel Görünümler */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <HiOutlineSparkles className="h-5 w-5 stroke-[1.75]" />
              </div>
              <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                Özel Pano
              </span>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-slate-900">
                Tentamark Stüdyo Panoları
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Teknik bilgiye ihtiyaç duymadan özel gösterge grafikleri oluşturun. Birden fazla metriği
                yan yana koyup karşılaştırmalı görsel raporlar hazırlayın.
              </p>
            </div>
          </div>

          {/* Mini Visual Preview */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-slate-600 font-sans">AI Prompt & Grafikler</span>
            <span className="text-[10px] text-rose-700 font-bold">Özelleştirilebilir</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setReportType("competitor");
              setIsGenerateModalOpen(true);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer text-center"
          >
            Stüdyo Görünümü
          </button>
        </div>

        {/* Card 4: Looker Studio & CSV Dışa Aktarım */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <HiOutlineChartBar className="h-5 w-5 stroke-[1.75]" />
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                BI & Entegrasyon
              </span>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-slate-900">
                Looker Studio & Excel / CSV
              </h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Verilerinizi Google Looker Studio&apos;ya bağlayın veya Excel/CSV formatında indirip
                kendi kurumsal iş zekası raporlarınıza dahil edin.
              </p>
            </div>
          </div>

          {/* Mini Visual Preview */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-slate-600 font-sans">Google Looker Bağlantısı</span>
            <span className="text-[10px] text-emerald-600 font-bold">API Aktif</span>
          </div>

          <button
            type="button"
            onClick={() => alert("Looker Studio ve CSV veri dışa aktarım anahtarınız panoya kopyalandı.")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer text-center"
          >
            Looker Studio&apos;ya Bağlan
          </button>
        </div>
      </div>

      {/* 4. Past Generated Reports Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Son Oluşturulan Raporlar
            </h3>
            <p className="text-xs text-slate-500">
              Daha önce oluşturulmuş indirilebilir PDF ve PPT raporlarınız
            </p>
          </div>
          <span className="text-xs text-slate-500">3 Rapor Arşivde</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs font-body">
          <div className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold text-xs">
                PDF
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  {brand.name} - Ağustos 2026 Aylık Yönetici Özeti
                </p>
                <p className="text-[10px] text-slate-400">1 Eylül 2026 · 4 Kanal · 14 Sayfa</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("PDF Raporu İndirildi: " + brand.name + "_Ağustos_2026.pdf")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                İndir (PDF)
              </button>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">
                PPT
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  {brand.name} - Q3 Rakip Kıyaslama Sunumu
                </p>
                <p className="text-[10px] text-slate-400">8 Eylül 2026 · 4 Rakip · 8 Slayt</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("Sunum İndirildi: " + brand.name + "_Q3_Rakip_Sunumu.pptx")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                İndir (PPT)
              </button>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                CSV
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  {brand.name} - Son 90 Gün Gönderi Metrikleri Dökümü
                </p>
                <p className="text-[10px] text-slate-400">12 Eylül 2026 · 84 Gönderi Verisi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("CSV Verisi İndirildi: " + brand.name + "_Gonderi_Metrikleri.csv")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                İndir (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Report Generator Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                  <HiOutlineDocumentChartBar className="h-4 w-4 stroke-[2]" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Özel Rapor Oluştur
                  </h3>
                  <p className="text-xs text-slate-500">
                    {brand.name} için anında sunuma hazır rapor derleyin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Period Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rapor Dönemi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "7d", label: "Son 7 Gün" },
                    { id: "30d", label: "Son 30 Gün" },
                    { id: "month", label: "Bu Ay" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDatePeriod(d.id)}
                      className={`rounded-xl border p-2 text-xs font-semibold transition cursor-pointer ${
                        datePeriod === d.id
                          ? "border-rose-500 bg-rose-50/70 text-rose-900 font-bold ring-1 ring-rose-500"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dahil Edilecek Kanallar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["instagram", "linkedin", "tiktok", "facebook"] as PlatformName[]).map((plt) => {
                    const selected = selectedPlatforms.includes(plt);
                    return (
                      <button
                        key={plt}
                        type="button"
                        onClick={() => togglePlatform(plt)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold capitalize transition cursor-pointer ${
                          selected
                            ? "border-rose-500 bg-rose-50/70 text-rose-900 font-bold ring-1 ring-rose-500"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <PlatformIcon name={plt} className="h-3.5 w-3.5" />
                        <span>{plt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Selector: PDF vs PPT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dışa Aktarma Formatı
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReportFormat("pdf")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                      reportFormat === "pdf"
                        ? "border-rose-500 bg-rose-50/70 text-rose-900 ring-1 ring-rose-500"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="h-6 w-6 rounded bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                      PDF
                    </span>
                    <span>Yönetici PDF Raporu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportFormat("ppt")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition cursor-pointer ${
                      reportFormat === "ppt"
                        ? "border-rose-500 bg-rose-50/70 text-rose-900 ring-1 ring-rose-500"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="h-6 w-6 rounded bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">
                      PPT
                    </span>
                    <span>Sunum Slaytları (PPT)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={isGenerating || downloadSuccess}
                onClick={handleGenerateReport}
                className="rounded-xl bg-[#FA5252] px-4 py-2 text-xs font-bold text-white hover:bg-[#E03131] shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 transition"
              >
                {isGenerating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Rapor Derleniyor...</span>
                  </>
                ) : downloadSuccess ? (
                  <span>✓ Rapor İndirildi!</span>
                ) : (
                  <span>Raporu Oluştur ve İndir</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

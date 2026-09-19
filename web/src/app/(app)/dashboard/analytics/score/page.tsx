"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { getAnalyticsOverview } from "@/lib/ai/getAnalyticsOverview";
import { computeSocialScore, type SocialScoreResult } from "@/lib/analytics/socialScore";
import AnalyticsPageHeader from "@/components/dashboard/analytics/AnalyticsPageHeader";
import {
  HiOutlineSparkles,
  HiOutlineBolt,
  HiOutlineScale,
  HiOutlineDocumentChartBar,
  HiOutlineChartBar,
} from "react-icons/hi2";

const STATUS_LABEL: Record<string, string> = {
  guclu: "Güçlü",
  orta: "Orta",
  zayif: "Zayıf",
  "veri-yok": "Veri Yok",
};

const STATUS_COLOR: Record<string, string> = {
  guclu: "bg-emerald-500",
  orta: "bg-amber-500",
  zayif: "bg-rose-500",
  "veri-yok": "bg-slate-300",
};

function levelLabel(total: number): string {
  if (total >= 850) return "Elit";
  if (total >= 650) return "Güçlü";
  if (total >= 400) return "Gelişiyor";
  return "Başlangıç";
}

const EXPLORE_CARDS = [
  {
    title: "Rakip Analizi",
    desc: "AI'nın pazar bilgisine dayalı rakip konumlandırma ve fırsat analizi.",
    icon: HiOutlineScale,
    href: "/dashboard/analytics/competitors",
  },
  {
    title: "Raporlama",
    desc: "Bu skoru ve gerçek üretim verilerinizi PDF/CSV olarak dışa aktarın.",
    icon: HiOutlineDocumentChartBar,
    href: "/dashboard/analytics/reports",
  },
  {
    title: "Genel Bakış",
    desc: "Kanal dağılımı, yayın hızı ve içerik havuzu durumunun tamamı.",
    icon: HiOutlineChartBar,
    href: "/dashboard/analytics",
  },
];

export default function SocialScorePage() {
  const brand = useBrand();
  const [result, setResult] = useState<SocialScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    // Loading is intentionally reset when the active brand changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getAnalyticsOverview(brand.id)
      .then((data) => {
        if (ignore) return;
        setResult(computeSocialScore(data));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [brand.id]);

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        icon={HiOutlineSparkles}
        title="Sosyal Performans Skoru & AI Teşhisi"
        subtitle={`${brand.name} markasının gerçek üretim verilerinden hesaplanan sağlık puanı — yayın başarısı, strateji uyumu, üretim tutarlılığı ve hesap sağlığından oluşur.`}
      />

      {loading || !result ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
            <span>Skor hesaplanıyor...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Score Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                    <HiOutlineSparkles className="h-4 w-4 stroke-[2]" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tentamark Yayın Sağlığı Skoru
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-slate-900">
                    {result.total}
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-slate-400">/ 1.000</span>
                  <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 font-mono text-xs font-bold text-rose-700">
                    {levelLabel(result.total)}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.diagnosis}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 min-w-[280px] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Seviye</span>
                  <span className="font-bold text-rose-700">{levelLabel(result.total)}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-[#FA5252] to-emerald-500 transition-all"
                      style={{ width: `${result.total / 10}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0</span>
                    <span>650 (Güçlü)</span>
                    <span>850 (Elit)</span>
                    <span>1000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 real factor cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-8 border-t border-slate-100 mt-8">
              {result.factors.map((f) => (
                <div
                  key={f.key}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 truncate">{f.label}</span>
                    <span className="font-mono text-xs font-bold text-slate-900">{f.score}/250</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLOR[f.status]}`}
                      style={{ width: `${(f.score / 250) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-slate-400 font-mono">%25 Ağırlık</span>
                    <span className="font-semibold text-slate-700">{STATUS_LABEL[f.status]}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug pt-1">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Real prioritized action list, weakest factor first */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                  <HiOutlineBolt className="h-4 w-4 stroke-[2]" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">Skoru Yükseltecek Adımlar</h3>
                  <p className="text-xs text-slate-500">En düşük puanlı alandan başlayarak sıralandı</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {[...result.factors]
                  .sort((a, b) => a.score - b.score)
                  .map((f) => (
                    <div key={f.key} className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{f.label}</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            f.status === "guclu"
                              ? "text-emerald-700 bg-emerald-50"
                              : f.status === "orta"
                              ? "text-amber-700 bg-amber-50"
                              : "text-rose-700 bg-rose-50"
                          }`}
                        >
                          {f.score}/250
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{f.detail}</p>
                      <Link href={f.action.href} className="inline-block text-[11px] font-bold text-rose-600 hover:text-rose-800">
                        {f.action.label} →
                      </Link>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: Explore other real sections */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">Devamını Keşfet</h3>
                <p className="text-xs text-slate-500">Bu skorun beslendiği diğer analiz alanları</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {EXPLORE_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.title}
                      href={card.href}
                      className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2 hover:border-slate-300 hover:shadow-2xs transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                          <Icon className="h-4.5 w-4.5 stroke-[1.75]" />
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900">{card.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-snug">{card.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-rose-600 font-semibold">
                        <span>Görüntüle</span>
                        <span>→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

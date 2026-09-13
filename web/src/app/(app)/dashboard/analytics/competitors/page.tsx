"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import AnalyticsPageHeader from "@/components/dashboard/analytics/AnalyticsPageHeader";
import PlatformIcon from "@/components/PlatformIcon";
import type { CompetitorInsight, MarketComparison } from "@/lib/brand/autofillFromWebsite";
import { HiOutlineScale, HiOutlineGlobeAlt, HiOutlineLightBulb, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

function normalizeCompetitors(value: unknown): CompetitorInsight[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const c = (item && typeof item === "object" ? item : {}) as Partial<CompetitorInsight>;
    return {
      name: c.name ?? "",
      website: c.website ?? "",
      socials: {
        instagram: "",
        tiktok: "",
        youtube: "",
        linkedin: "",
        x: "",
        ...(c.socials ?? {}),
      },
      positioning: c.positioning ?? "",
      strength: c.strength ?? "",
      weakness: c.weakness ?? "",
      differentiation: c.differentiation ?? "",
      scores: c.scores ?? {},
    };
  });
}

function normalizeMarketComparison(value: unknown): MarketComparison {
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const dimensions = Array.isArray(obj.dimensions) ? obj.dimensions.map(String) : [];
  const rawScores =
    obj.brandScores && typeof obj.brandScores === "object" ? (obj.brandScores as Record<string, unknown>) : {};
  const brandScores: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawScores)) {
    const n = Number(v);
    if (Number.isFinite(n)) brandScores[k] = n;
  }
  return {
    dimensions,
    brandScores,
    competitiveGap: String(obj.competitiveGap ?? ""),
    opportunity: String(obj.opportunity ?? ""),
  };
}

function buildWebsiteUrl(value: string): string | null {
  const clean = value.trim();
  if (!clean) return null;
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

const SOCIAL_URL_BUILDERS: Record<string, (handle: string) => string> = {
  instagram: (h) => `https://instagram.com/${h}`,
  tiktok: (h) => `https://tiktok.com/@${h}`,
  youtube: (h) => `https://youtube.com/@${h}`,
  linkedin: (h) => `https://linkedin.com/company/${h}`,
  x: (h) => `https://x.com/${h}`,
};

function buildSocialUrl(key: string, value: string): string | null {
  const clean = value.trim().replace(/^@/, "");
  if (!clean) return null;
  return /^https?:\/\//i.test(clean) ? clean : SOCIAL_URL_BUILDERS[key](clean);
}

export default function CompetitorsAnalyticsPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorInsight[]>([]);
  const [marketComparison, setMarketComparison] = useState<MarketComparison>({
    dimensions: [],
    brandScores: {},
    competitiveGap: "",
    opportunity: "",
  });

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      const [{ data: brandRow }, { data: dna }] = await Promise.all([
        supabase.from("brands").select("name").eq("id", brand.id).maybeSingle(),
        supabase
          .from("brand_dna")
          .select("competitor_analysis, market_comparison")
          .eq("brand_id", brand.id)
          .maybeSingle(),
      ]);
      if (ignore) return;
      setBrandName(brandRow?.name ?? brand.name);
      setCompetitors(normalizeCompetitors(dna?.competitor_analysis));
      setMarketComparison(normalizeMarketComparison(dna?.market_comparison));
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, brand.name]);

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        icon={HiOutlineScale}
        title="Rakip Analizi & Karşılaştırma"
        subtitle={`${brand.name} markasının Marka Profili'nde tanımladığınız rakiplerin AI'nın pazar bilgisine dayalı konumlandırma analizi.`}
      >
        <Link
          href="/dashboard/brand"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
        >
          <span>Rakip Ekle / Düzenle</span>
        </Link>
      </AnalyticsPageHeader>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
            <span>Rakip verileri yükleniyor...</span>
          </div>
        </div>
      ) : competitors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <HiOutlineScale className="h-6 w-6 stroke-[1.5]" />
          </span>
          <h3 className="font-display text-base font-bold text-slate-900">Henüz rakip analizi yok</h3>
          <p className="max-w-md text-xs text-slate-500">
            Marka Profili &rarr; Rakipler &amp; Pazar sekmesinden rakip ekleyin veya web sitesi analiziyle otomatik
            doldurun — AI&apos;nın pazar konumlandırma analizi burada görünecek.
          </p>
          <Link
            href="/dashboard/brand"
            className="mt-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Marka Profili&apos;ne Git
          </Link>
        </div>
      ) : (
        <>
          {/* Hızlı Karşılaştırma Tablosu */}
          {marketComparison.dimensions.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Hızlı Karşılaştırma Tablosu</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    AI&apos;nın pazar bilgisine dayalı tahmini karşılaştırma — ölçülmüş veri değildir.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-medium text-slate-600">
                  {competitors.length} rakip inceleniyor
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Boyut</th>
                      <th className="py-3 px-3 text-center">{brandName || "Markanız"}</th>
                      {competitors.map((c, idx) => (
                        <th key={idx} className="py-3 px-3 text-center">
                          {c.name || "—"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body">
                    {marketComparison.dimensions.map((dim) => (
                      <tr key={dim}>
                        <td className="py-3 px-3 font-medium text-slate-700">{dim}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 font-mono text-[11px] font-bold text-rose-700">
                            {marketComparison.brandScores[dim] ?? "—"}
                          </span>
                        </td>
                        {competitors.map((c, idx) => (
                          <td key={idx} className="py-3 px-3 text-center font-mono text-slate-500">
                            {c.scores[dim] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rakip Kartları */}
          <div className="grid gap-4 sm:grid-cols-2">
            {competitors.map((c, idx) => {
              const websiteUrl = buildWebsiteUrl(c.website);
              return (
                <div key={idx} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-slate-900">{c.name || "İsimsiz Rakip"}</span>
                    <div className="flex items-center gap-1.5">
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={c.website}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-white transition hover:scale-105"
                        >
                          <HiOutlineGlobeAlt className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {(["instagram", "tiktok", "youtube", "linkedin", "x"] as const).map((key) => {
                        const url = buildSocialUrl(key, c.socials[key]);
                        if (!url) return null;
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={c.socials[key]}
                            className="transition hover:scale-105"
                          >
                            <PlatformIcon name={key} className="h-6 w-6" />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {c.positioning && (
                      <p className="rounded-lg bg-slate-50 px-2.5 py-1.5 leading-relaxed text-slate-600">
                        {c.positioning}
                      </p>
                    )}
                    {c.strength && (
                      <p className="rounded-lg bg-emerald-50 px-2.5 py-1.5 leading-relaxed text-emerald-700">
                        <span className="font-bold">Güçlü yönü: </span>
                        {c.strength}
                      </p>
                    )}
                    {c.weakness && (
                      <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 leading-relaxed text-amber-700">
                        <span className="font-bold">Zayıf noktası: </span>
                        {c.weakness}
                      </p>
                    )}
                    {c.differentiation && (
                      <p className="rounded-lg bg-rose-50 px-2.5 py-1.5 font-medium leading-relaxed text-rose-800">
                        <span className="font-bold">Fırsat: </span>
                        {c.differentiation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Rekabet Analizi */}
          {(marketComparison.competitiveGap || marketComparison.opportunity) && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                  <HiOutlineLightBulb className="h-4 w-4 stroke-[2]" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">AI Rekabet Analizi</h3>
                  <p className="text-[11px] text-slate-500">Pazar bilgisine dayalı tahmini analiz — canlı takip edilen veri değildir</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {marketComparison.competitiveGap && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Rekabet Boşluğu</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{marketComparison.competitiveGap}</p>
                  </div>
                )}
                {marketComparison.opportunity && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Fırsat</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-rose-900">{marketComparison.opportunity}</p>
                    <Link
                      href="/dashboard/calendar"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-800"
                    >
                      Takvimde İçerik Planla <HiOutlineArrowTopRightOnSquare className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

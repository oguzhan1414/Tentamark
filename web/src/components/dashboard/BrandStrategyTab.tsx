"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLatestStrategy,
  generateBrandStrategy,
  listStrategyVersions,
  revertToStrategyVersion,
  type BrandStrategyRecord,
  type StrategyVersionSummary,
} from "@/lib/ai/generateStrategy";

const PILLAR_COLORS = [
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-orange-400",
  "from-amber-500 to-orange-400",
];

const DAY_LABELS: Record<string, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
};

type Section = "pozisyon" | "sutunlar" | "ritim" | "ses";

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: "pozisyon", label: "Konumlandırma", icon: "🎯" },
  { key: "sutunlar", label: "İçerik Sütunları", icon: "📊" },
  { key: "ritim", label: "Haftalık Ritim", icon: "📅" },
  { key: "ses", label: "Marka Sesi", icon: "🗣️" },
];

export default function BrandStrategyTab({
  brandId,
  brandName,
}: {
  brandId: string;
  brandName?: string;
}) {
  const [strategy, setStrategy] = useState<BrandStrategyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<StrategyVersionSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reverting, setReverting] = useState<number | null>(null);
  const [section, setSection] = useState<Section>("pozisyon");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getLatestStrategy(brandId);
        if (!ignore) setStrategy(data);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Strateji yüklenemedi.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [brandId]);

  useEffect(() => {
    if (!strategy) return;
    let ignore = false;
    listStrategyVersions(brandId)
      .then((v) => {
        if (!ignore) setVersions(v);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [brandId, strategy]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const created = await generateBrandStrategy(brandId);
      setStrategy(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Strateji üretilirken bir hata oluştu.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevert(version: number) {
    setReverting(version);
    setError(null);
    try {
      const reverted = await revertToStrategyVersion(brandId, version);
      setStrategy(reverted);
      setShowHistory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Önceki versiyona dönülemedi.");
    } finally {
      setReverting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <span>Strateji verileri yükleniyor…</span>
        </div>
      </div>
    );
  }

  // Empty state: no strategy generated yet
  if (!strategy) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-600">
          🧭
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Markanıza Özel İçerik Stratejisi
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
          Marka DNA&apos;nızı ve hedef kitlenizi analiz ederek sektörünüze en uygun içerik sütunlarını (% dağılımlarını), haftalık yayın ritmini ve marka sesi kurallarını tek tıkla oluşturun.
        </p>

        {error && (
          <div className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>AI Stratejisi Çıkarılıyor…</span>
              </>
            ) : (
              <span>✨ AI ile İçerik Stratejisi Oluştur</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  const { positioning, content_pillars, weekly_cadence, tone_guardrails } = strategy.payload;

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {brandName ? `${brandName} İçerik Stratejisi` : "Sosyal Medya İçerik Stratejisi"}
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              v{strategy.version}.0 · Aktif
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Son güncelleme: {new Date(strategy.generated_at).toLocaleDateString("tr-TR")} · Marka DNA verilerinizle senkronize
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700"
          >
            <span>🕘 Versiyon Geçmişi ({versions.length})</span>
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" />
                <span>Yeniden Üretiliyor…</span>
              </>
            ) : (
              <span>↻ Stratejiyi Yenile</span>
            )}
          </button>
        </div>
      </div>

      {/* Version history / revert — a real "geri dön": copies an older
          version's payload forward as a new version instead of a fake
          approval queue, so nothing is silently lost. */}
      {showHistory && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Versiyon Geçmişi</p>
          <div className="mt-3 space-y-2">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900">v{v.version}.0</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(v.generated_at).toLocaleString("tr-TR")}
                  </span>
                  {v.changeNotes.isManualRevert && (
                    <span className="ml-2 text-[11px] text-slate-400">
                      (v{v.changeNotes.revertedToVersion}.0&apos;a geri dönüldü)
                    </span>
                  )}
                </div>
                {v.version === strategy.version ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Aktif
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRevert(v.version)}
                    disabled={reverting !== null}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700 disabled:opacity-40"
                  >
                    {reverting === v.version ? "Dönülüyor…" : "Bu Versiyona Dön"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why this version — real diff of what actually changed since the
          last one (brand DNA inputs + pillar percentages), not invented
          "signals". */}
      {(strategy.changeNotes.changedInputs.length > 0 || strategy.changeNotes.pillarDiffs.length > 0) && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h3 className="font-display text-sm font-bold text-slate-900">v{strategy.version}.0 Neden Değişti?</h3>
          </div>

          {strategy.changeNotes.changedInputs.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {strategy.changeNotes.changedInputs.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}

          {strategy.changeNotes.pillarDiffs.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[11px] font-medium text-slate-400">İçerik Sütunu Değişiklikleri</p>
              <div className="mt-2 space-y-1.5">
                {strategy.changeNotes.pillarDiffs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-slate-700">
                    <span>{d.name}</span>
                    <span className="text-slate-500">
                      {d.oldPercentage === null ? "Yeni" : `%${d.oldPercentage}`}
                      {" → "}
                      {d.newPercentage === null ? "Kaldırıldı" : `%${d.newPercentage}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Action Banner to Generate Weekly Pack */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-rose-50/30 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h3 className="font-display text-base font-bold text-slate-900">
              Bu Strateji ile 5 Günlük İçerik Paketi Hazırla
            </h3>
          </div>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
            Belirlediğiniz içerik sütunları (% ağırlıkları) ve haftalık ritme göre önümüzdeki 5 iş günü için hazır gönderi taslakları, kanca cümleleri ve görsel konseptleri üretin.
          </p>
        </div>
        <Link
          href="/dashboard/compose/weekly"
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:scale-[1.02]"
        >
          <span>✨ Haftalık Paketi AI ile Üret →</span>
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">{error}</div>
      )}

      {/* Segmented sub-nav — replaces 4 stacked full-width sections with one
          visible at a time, so this tab no longer forces an endless scroll. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              section === s.key
                ? "bg-slate-900 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Konumlandırma */}
      {section === "pozisyon" && positioning && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Temel Konumlandırma & Değer Vaadi
          </span>

          <p className="mt-3 font-display text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
            &ldquo;{positioning.core_message}&rdquo;
          </p>

          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Hedef Kitle Özeti</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {positioning.target_audience_summary}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Değer Önerisi (Neden Biz?)</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {positioning.value_proposition}
              </p>
            </div>
          </div>

          {Array.isArray(positioning.differentiators) && positioning.differentiators.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[11px] font-medium text-slate-400">Fark Yaratan Yönler</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {positioning.differentiators.map((diff, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    <span className="text-emerald-600">✓</span>
                    <span>{diff}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* İçerik Sütunları & Ağırlık Dağılımı */}
      {section === "sutunlar" && Array.isArray(content_pillars) && content_pillars.length > 0 && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              İçerik Sütunları & Ağırlık Dağılımı
            </span>
            <span className="text-xs text-slate-500">Toplam: %100</span>
          </div>

          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {content_pillars.map((pillar, i) => (
              <div
                key={i}
                style={{ width: `${pillar.percentage}%` }}
                title={`${pillar.name} (%${pillar.percentage})`}
                className={`bg-gradient-to-r ${PILLAR_COLORS[i % PILLAR_COLORS.length]}`}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {content_pillars.map((pillar, i) => (
              <div key={i} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{pillar.name}</h3>
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                      %{pillar.percentage}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{pillar.description}</p>
                </div>

                {Array.isArray(pillar.examples) && pillar.examples.length > 0 && (
                  <div className="mt-3 border-t border-slate-200/70 pt-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Örnek Formatlar
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {pillar.examples.map((ex, exIdx) => (
                        <span
                          key={exIdx}
                          className="rounded-md border border-slate-100 bg-white px-2 py-0.5 text-[11px] text-slate-500"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Haftalık Yayın Ritmi */}
      {section === "ritim" && weekly_cadence && Object.keys(weekly_cadence).length > 0 && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Önerilen Haftalık Yayın Ritmi
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Haftalık paket üretirken AI bu günlere özel içerik formatlarını otomatik eşleştirir.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {Object.entries(weekly_cadence).map(([dayKey, focus]) => (
              <div key={dayKey} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-xs font-semibold text-rose-700">{DAY_LABELS[dayKey] ?? dayKey}</span>
                <p className="mt-1.5 text-xs leading-snug text-slate-700">{focus}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Marka Sesi: Do's & Don'ts */}
      {section === "ses" && tone_guardrails && (
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span>
              <h3 className="text-sm font-bold text-emerald-700">Marka Sesi: Yapılacaklar (Do&apos;s)</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
              {(tone_guardrails.dos ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
            <div className="flex items-center gap-2">
              <span className="text-red-600">✕</span>
              <h3 className="text-sm font-bold text-red-700">Marka Sesi: Kaçınılacaklar (Don&apos;ts)</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
              {(tone_guardrails.donts ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-red-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Bottom CTA to Generate Weekly Pack */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-xs sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">Haftalık paylaşımlarınızı planlamaya başlayın</h4>
          <p className="mt-0.5 text-xs text-slate-500">
            Bu kurallara ve sütunlara göre 5 günlük hazır içerik paketi oluşturun.
          </p>
        </div>
        <Link
          href="/dashboard/compose/weekly"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Haftalık Paketi Başlat →
        </Link>
      </div>
    </div>
  );
}

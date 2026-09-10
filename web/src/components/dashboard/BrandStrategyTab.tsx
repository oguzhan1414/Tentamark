"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLatestStrategy,
  generateBrandStrategy,
  type BrandStrategyRecord,
} from "@/lib/ai/generateStrategy";

const PILLAR_COLORS = [
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-purple-500 to-pink-400",
  "from-amber-500 to-orange-400",
];

const DAY_LABELS: Record<string, string> = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
};

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

  if (loading) {
    return (
      <div className="mt-8 flex h-48 items-center justify-center font-body text-sm text-faint">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Strateji verileri yükleniyor…</span>
        </div>
      </div>
    );
  }

  // Empty state: no strategy generated yet
  if (!strategy) {
    return (
      <div className="mt-6 max-w-3xl rounded-2xl border border-line bg-surface p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-2xl text-accent-text">
          🧭
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-ink sm:text-2xl">
          Markanıza Özel İçerik Stratejisi
        </h2>
        <p className="mx-auto mt-2 max-w-lg font-body text-sm leading-relaxed text-muted">
          Marka DNA&apos;nızı ve hedef kitlenizi analiz ederek sektörünüze en uygun içerik sütunlarını (% dağılımlarını), haftalık yayın ritmini ve marka sesi kurallarını tek tıkla oluşturun.
        </p>

        {error && (
          <div className="mx-auto mt-4 max-w-md rounded-xl border border-coral-bright/20 bg-coral-bright/10 p-3 text-xs font-body text-coral-bright">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-bg shadow-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-bg border-t-transparent animate-spin" />
                <span>AI Stratejisi Çıkarılıyor…</span>
              </>
            ) : (
              <>
                <span>✨ AI ile İçerik Stratejisi Oluştur</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const { positioning, content_pillars, weekly_cadence, tone_guardrails } = strategy.payload;

  return (
    <div className="mt-6 max-w-4xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-bold text-ink">
              {brandName ? `${brandName} İçerik Stratejisi` : "Sosyal Medya İçerik Stratejisi"}
            </h2>
            <span className="rounded-full bg-mint/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-mint">
              v{strategy.version}.0 · Aktif
            </span>
          </div>
          <p className="mt-1 font-body text-xs text-muted">
            Son güncelleme: {new Date(strategy.generated_at).toLocaleDateString("tr-TR")} · Marka DNA verilerinizle senkronize
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 font-body text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {generating ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-ink border-t-transparent animate-spin" />
              <span>Yeniden Üretiliyor…</span>
            </>
          ) : (
            <>
              <span>↻ Stratejiyi Yenile</span>
            </>
          )}
        </button>
      </div>

      {/* Action Banner to Generate Weekly Pack */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent-subtle/50 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h3 className="font-display text-base font-bold text-ink">
              Bu Strateji ile 5 Günlük İçerik Paketi Hazırla
            </h3>
          </div>
          <p className="mt-1 font-body text-xs text-muted max-w-xl leading-relaxed">
            Belirlediğiniz içerik sütunları (% ağırlıkları) ve haftalık ritme göre önümüzdeki 5 iş günü için hazır gönderi taslakları, kanca cümleleri ve görsel konseptleri üretin.
          </p>
        </div>
        <Link
          href="/dashboard/compose/weekly"
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-body text-xs font-semibold text-bg shadow-sm transition-all hover:bg-accent hover:scale-[1.02]"
        >
          <span>✨ Haftalık Paketi AI ile Üret →</span>
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-coral-bright/20 bg-coral-bright/10 p-3 text-xs font-body text-coral-bright">
          {error}
        </div>
      )}

      {/* 1. Core Positioning Card */}
      {positioning && (
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
              01 · Temel Konumlandırma & Değer Vaadi
            </span>
          </div>

          <p className="mt-3 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
            &ldquo;{positioning.core_message}&rdquo;
          </p>

          <div className="mt-4 grid gap-4 border-t border-line/60 pt-4 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-medium text-faint">Hedef Kitle Özeti</p>
              <p className="mt-1 font-body text-sm leading-relaxed text-muted">
                {positioning.target_audience_summary}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] font-medium text-faint">Değer Önerisi (Neden Biz?)</p>
              <p className="mt-1 font-body text-sm leading-relaxed text-muted">
                {positioning.value_proposition}
              </p>
            </div>
          </div>

          {Array.isArray(positioning.differentiators) && positioning.differentiators.length > 0 && (
            <div className="mt-4 border-t border-line/60 pt-3">
              <p className="font-mono text-[11px] font-medium text-faint">Fark Yaratan Yönler</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {positioning.differentiators.map((diff, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1 font-body text-xs text-ink"
                  >
                    <span className="text-mint">✓</span>
                    <span>{diff}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 2. Content Pillars (Dağılım) */}
      {Array.isArray(content_pillars) && content_pillars.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
              02 · İçerik Sütunları & Ağırlık Dağılımı
            </span>
            <span className="font-mono text-xs text-muted">Toplam: %100</span>
          </div>

          {/* Unified horizontal distribution bar */}
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-bg">
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
              <div
                key={i}
                className="flex flex-col justify-between rounded-xl border border-line bg-bg p-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-body text-sm font-bold text-ink">{pillar.name}</h3>
                    <span className="rounded-md bg-surface-soft px-2 py-0.5 font-mono text-xs font-semibold text-accent">
                      %{pillar.percentage}
                    </span>
                  </div>
                  <p className="mt-2 font-body text-xs leading-relaxed text-muted">
                    {pillar.description}
                  </p>
                </div>

                {Array.isArray(pillar.examples) && pillar.examples.length > 0 && (
                  <div className="mt-3 border-t border-line/50 pt-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-faint">
                      Örnek Formatlar
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {pillar.examples.map((ex, exIdx) => (
                        <span
                          key={exIdx}
                          className="rounded-md bg-surface px-2 py-0.5 font-body text-[11px] text-faint"
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

      {/* 3. Weekly Posting Cadence */}
      {weekly_cadence && Object.keys(weekly_cadence).length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
            03 · Önerilen Haftalık Yayın Ritmi
          </span>
          <p className="mt-1 font-body text-xs text-muted">
            Haftalık paket üretirken AI bu günlere özel içerik formatlarını otomatik eşleştirir.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {Object.entries(weekly_cadence).map(([dayKey, focus]) => (
              <div
                key={dayKey}
                className="flex flex-col rounded-xl border border-line bg-bg p-3"
              >
                <span className="font-mono text-xs font-semibold text-accent">
                  {DAY_LABELS[dayKey] ?? dayKey}
                </span>
                <p className="mt-1.5 font-body text-xs leading-snug text-ink">
                  {focus}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Tone Guardrails (Do's & Don'ts) */}
      {tone_guardrails && (
        <section className="grid gap-4 sm:grid-cols-2">
          {/* Do's */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <h3 className="font-body text-sm font-bold text-emerald-300">
                Marka Sesi: Yapılacaklar (Do&apos;s)
              </h3>
            </div>
            <ul className="mt-3 space-y-2 font-body text-xs leading-relaxed text-muted">
              {(tone_guardrails.dos ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="rounded-2xl border border-coral-bright/20 bg-coral-bright/[0.04] p-5">
            <div className="flex items-center gap-2">
              <span className="text-coral-bright">✕</span>
              <h3 className="font-body text-sm font-bold text-coral-bright">
                Marka Sesi: Kaçınılacaklar (Don&apos;ts)
              </h3>
            </div>
            <ul className="mt-3 space-y-2 font-body text-xs leading-relaxed text-muted">
              {(tone_guardrails.donts ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-coral-bright mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Bottom CTA to Generate Weekly Pack */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h4 className="font-display text-sm font-bold text-ink">Haftalık paylaşımlarınızı planlamaya başlayın</h4>
          <p className="mt-0.5 font-body text-xs text-muted">
            Bu kurallara ve sütunlara göre 5 günlük hazır içerik paketi oluşturun.
          </p>
        </div>
        <Link
          href="/dashboard/compose/weekly"
          className="rounded-full bg-ink px-5 py-2.5 font-body text-xs font-semibold text-bg transition-colors hover:bg-accent"
        >
          Haftalık Paketi Başlat →
        </Link>
      </div>
    </div>
  );
}

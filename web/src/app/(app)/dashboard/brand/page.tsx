"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { autofillFromWebsite } from "@/lib/brand/autofillFromWebsite";
import { generateBrandStrategy } from "@/lib/ai/generateStrategy";
import BrandStrategyTab from "@/components/dashboard/BrandStrategyTab";

type Tab = "genel" | "dna" | "hedef" | "strateji";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "genel", label: "Genel Bilgiler", icon: "🏢" },
  { key: "dna", label: "Marka DNA & Ton", icon: "🧬" },
  { key: "hedef", label: "Hedef Kitle & Rakipler", icon: "🎯" },
  { key: "strateji", label: "AI İçerik Stratejisi", icon: "🧭" },
];

type FormState = {
  name: string;
  website: string;
  industry: string;
  tone_of_voice: string;
  brand_traits: string;
  forbidden_words: string;
  color_palette: string;
  target_audience: string;
  competitors: string;
  raw_notes: string;
};

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs";

function toCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromArray(value: unknown): string {
  return Array.isArray(value) ? value.map(String).join(", ") : "";
}

export default function BrandProfilePage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<Tab>("genel");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [strategyWarning, setStrategyWarning] = useState<string | null>(null);
  const [strategyVersion, setStrategyVersion] = useState(0);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState<string | null>(null);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [autofillStep, setAutofillStep] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const [{ data: brandRow }, { data: dna }] = await Promise.all([
        supabase.from("brands").select("name, website").eq("id", brand.id).maybeSingle(),
        supabase
          .from("brand_dna")
          .select(
            "industry, tone_of_voice, brand_traits, forbidden_words, color_palette, target_audience, competitors, raw_notes"
          )
          .eq("brand_id", brand.id)
          .maybeSingle(),
      ]);

      if (ignore) return;

      setForm({
        name: brandRow?.name ?? brand.name,
        website: brandRow?.website ?? "",
        industry: dna?.industry ?? "",
        tone_of_voice: dna?.tone_of_voice ?? "",
        brand_traits: fromArray(dna?.brand_traits),
        forbidden_words: fromArray(dna?.forbidden_words),
        color_palette: fromArray(dna?.color_palette),
        target_audience: fromArray(dna?.target_audience),
        competitors: fromArray(dna?.competitors),
        raw_notes: dna?.raw_notes ?? "",
      });
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, brand.name]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  // Parse color swatches for visual preview
  const colorsList = useMemo(() => {
    if (!form?.color_palette) return [];
    return toCommaList(form.color_palette).filter((c) => c.startsWith("#") && c.length >= 4);
  }, [form?.color_palette]);

  async function autofill() {
    if (!form || !form.website.trim()) return;
    setAutofilling(true);
    setAutofillError(null);
    setAutofillSuccess(null);
    setAutofillStep("Web sitesi taranıyor & analiz ediliyor…");

    try {
      const result = await autofillFromWebsite(brand.id, form.website.trim());

      const notesParts = [
        result.valueProposition ? `Değer Vaadi: ${result.valueProposition}` : "",
        result.rawNotes ? `Önemli Notlar: ${result.rawNotes}` : "",
      ].filter(Boolean);

      const updatedForm: FormState = {
        name: result.brandName || form.name,
        website: result.website,
        industry: result.industry || form.industry,
        tone_of_voice: result.toneOfVoice || form.tone_of_voice,
        brand_traits: result.brandTraits.length ? result.brandTraits.join(", ") : form.brand_traits,
        forbidden_words: form.forbidden_words,
        color_palette: form.color_palette,
        target_audience: result.targetAudience.length
          ? result.targetAudience.join(", ")
          : form.target_audience,
        competitors: result.competitors.length
          ? result.competitors.join(", ")
          : form.competitors,
        raw_notes: notesParts.length ? notesParts.join("\n\n") : form.raw_notes,
      };

      setForm(updatedForm);

      setAutofillStep("Marka profili ve DNA kaydediliyor…");
      const { error: brandError } = await supabase
        .from("brands")
        .update({ name: updatedForm.name, website: updatedForm.website || null })
        .eq("id", brand.id);

      if (brandError) throw new Error(`Marka bilgileri kaydedilemedi: ${brandError.message}`);

      const { error: dnaError } = await supabase
        .from("brand_dna")
        .update({
          industry: updatedForm.industry || null,
          tone_of_voice: updatedForm.tone_of_voice || null,
          brand_traits: toCommaList(updatedForm.brand_traits),
          forbidden_words: toCommaList(updatedForm.forbidden_words),
          color_palette: toCommaList(updatedForm.color_palette),
          target_audience: toCommaList(updatedForm.target_audience),
          competitors: toCommaList(updatedForm.competitors),
          raw_notes: updatedForm.raw_notes || null,
        })
        .eq("brand_id", brand.id);

      if (dnaError) throw new Error(`Marka DNA'sı kaydedilemedi: ${dnaError.message}`);

      setAutofillStep("AI İçerik Stratejisi otomatik üretiliyor…");
      try {
        await generateBrandStrategy(brand.id);
        setStrategyVersion((v) => v + 1);
        setAutofillSuccess(
          `"${updatedForm.name}" için web sitesi analiz edildi, Marka DNA'sı ve İçerik Stratejisi başarıyla güncellendi!`
        );
      } catch (strategyErr) {
        setAutofillSuccess(
          `"${updatedForm.name}" için Marka DNA'sı kaydedildi, ama İçerik Stratejisi üretilemedi (${strategyErr instanceof Error ? strategyErr.message : "bilinmeyen hata"}).`
        );
      }
      setSaved(true);
    } catch (err) {
      setAutofillError(err instanceof Error ? err.message : "Analiz edilemedi.");
    } finally {
      setAutofilling(false);
      setAutofillStep(null);
    }
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    setSavingStep("Marka profili kaydediliyor…");

    const { error: brandError } = await supabase
      .from("brands")
      .update({ name: form.name, website: form.website || null })
      .eq("id", brand.id);

    if (brandError) {
      setSaveError(brandError.message);
      setSaving(false);
      setSavingStep(null);
      return;
    }

    const { error: dnaError } = await supabase
      .from("brand_dna")
      .update({
        industry: form.industry || null,
        tone_of_voice: form.tone_of_voice || null,
        brand_traits: toCommaList(form.brand_traits),
        forbidden_words: toCommaList(form.forbidden_words),
        color_palette: toCommaList(form.color_palette),
        target_audience: toCommaList(form.target_audience),
        competitors: toCommaList(form.competitors),
        raw_notes: form.raw_notes || null,
      })
      .eq("brand_id", brand.id);

    if (dnaError) {
      setSaveError(dnaError.message);
      setSaving(false);
      setSavingStep(null);
      return;
    }

    setStrategyWarning(null);
    try {
      setSavingStep("AI İçerik Stratejisi yeni markanıza göre güncelleniyor…");
      await generateBrandStrategy(brand.id);
      setStrategyVersion((v) => v + 1);
    } catch (err) {
      setStrategyWarning(
        `Marka profili kaydedildi, ama İçerik Stratejisi güncellenemedi (${err instanceof Error ? err.message : "bilinmeyen hata"}).`
      );
    }

    setSaving(false);
    setSavingStep(null);
    setSaved(true);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Marka Profili & DNA
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Buradaki veriler, AI pazarlama motorunun içerik üretirken referans aldığı temel marka kimliğidir.
        </p>
      </div>

      {/* 2. Subnav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {!form ? (
        <div className="flex h-64 items-center justify-center rounded-[22px] border border-slate-100 bg-white text-sm text-slate-400">
          Marka bilgileri yükleniyor...
        </div>
      ) : tab === "strateji" ? (
        <BrandStrategyTab
          key={`${brand.id}-${strategyVersion}`}
          brandId={brand.id}
          brandName={form.name}
        />
      ) : (
        /* Form Card */
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          {tab === "genel" && (
            <div className="space-y-5">
              <Field label="Marka Adı">
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Örn: Mavi, Trendyol"
                />
              </Field>

              {/* Web Sitesi & AI Autofill Banner */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌐</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Web Sitesinden Otomatik Marka Çıkarımı
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Web sitenizin adresini girerek marka adını, ses tonunu, hedef kitleyi ve içerik stratejisini tek tıkla otomatik oluşturun.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <input
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://siteniz.com"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={autofill}
                    disabled={!form.website.trim() || autofilling}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
                  >
                    {autofilling ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{autofillStep || "Analiz Ediliyor..."}</span>
                      </>
                    ) : (
                      <span>✨ Tara ve Otomatik Doldur</span>
                    )}
                  </button>
                </div>

                {autofillSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <span>✓</span> {autofillSuccess}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTab("strateji")}
                        className="rounded-lg bg-emerald-700 text-white px-3 py-1 text-[11px] font-bold hover:bg-emerald-800"
                      >
                        İçerik Stratejisini İncele →
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("dna")}
                        className="rounded-lg border border-emerald-300 bg-white text-emerald-800 px-2.5 py-1 text-[11px] font-semibold"
                      >
                        Marka DNA&apos;sını Gör
                      </button>
                    </div>
                  </div>
                )}

                {autofillError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {autofillError}
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "dna" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Sektör">
                  <input
                    value={form.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    placeholder="Örn: Moda, E-Ticaret, SaaS, Turizm"
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="Ses Tonu (Tone of Voice)">
                  <input
                    value={form.tone_of_voice}
                    onChange={(e) => set("tone_of_voice", e.target.value)}
                    placeholder="Örn: Samimi, ilham verici, yalın"
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>

              <Field label="Marka Nitelikleri (DNA Özellikleri)" hint="Virgülle ayırın">
                <input
                  value={form.brand_traits}
                  onChange={(e) => set("brand_traits", e.target.value)}
                  placeholder="yenilikçi, sürdürülebilir, güvenilir, enerjik"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Yasaklı / Kaçınılacak Kelimeler" hint="Virgülle ayırın">
                <input
                  value={form.forbidden_words}
                  onChange={(e) => set("forbidden_words", e.target.value)}
                  placeholder="ucuz, fırsatı kaçırma, garanti"
                  className={INPUT_CLASS}
                />
              </Field>

              <div className="space-y-2">
                <Field label="Marka Renk Paleti (Hex Kodları)" hint="Virgülle ayırın">
                  <input
                    value={form.color_palette}
                    onChange={(e) => set("color_palette", e.target.value)}
                    placeholder="#6366F1, #10B981, #F43F5E, #0F172A"
                    className={INPUT_CLASS}
                  />
                </Field>

                {/* Color Swatches Preview */}
                {colorsList.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Palet Önizleme:</span>
                    <div className="flex items-center gap-1.5">
                      {colorsList.map((hex, idx) => (
                        <div
                          key={idx}
                          style={{ backgroundColor: hex }}
                          title={hex}
                          className="h-6 w-6 rounded-full border border-slate-200 shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Field
                label="Temel Değer Önerisi & Özel Marka Notları"
                hint="AI içerik üretirken bu detayları temel alır"
              >
                <textarea
                  value={form.raw_notes}
                  onChange={(e) => set("raw_notes", e.target.value)}
                  rows={4}
                  placeholder="Markanın kuruluş vizyonu, müşterilerine vadettiği temel fayda ve dikkat edilmesi gereken özel noktalar..."
                  className={`${INPUT_CLASS} resize-none`}
                />
              </Field>
            </div>
          )}

          {tab === "hedef" && (
            <div className="space-y-5">
              <Field label="Hedef Kitle Segmentleri" hint="Virgülle ayırın">
                <textarea
                  rows={3}
                  value={form.target_audience}
                  onChange={(e) => set("target_audience", e.target.value)}
                  placeholder="Örn: 22-35 yaş arası şehirli profesyoneller, kaliteli ve minimalist tasarıma değer verenler..."
                  className={`${INPUT_CLASS} resize-none`}
                />
              </Field>

              <Field label="Ana Rakipler & Alternatifler" hint="Virgülle ayırın">
                <input
                  value={form.competitors}
                  onChange={(e) => set("competitors", e.target.value)}
                  placeholder="Zara, Massimo Dutti, Beymen Club"
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{savingStep || "Kaydediliyor..."}</span>
                </>
              ) : (
                <span>Değişiklikleri Kaydet & Stratejiyi Güncelle</span>
              )}
            </button>

            {saved && !strategyWarning && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <span>✓</span> Marka profili ve strateji başarıyla güncellendi!
              </span>
            )}

            {strategyWarning && (
              <span className="text-xs font-medium text-amber-600">{strategyWarning}</span>
            )}

            {saveError && (
              <span className="text-xs text-red-600 font-medium">{saveError}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
        {hint && <span className="ml-1.5 font-normal text-slate-400">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

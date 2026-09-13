"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import {
  autofillFromWebsite,
  type CompetitorInsight,
  type CompetitorSocials,
  type MarketComparison,
  type AudiencePersona,
} from "@/lib/brand/autofillFromWebsite";
import { TRAIT_KEYS, describeTone, type TraitKey, type TraitScores, type TonePosition } from "@/lib/brand/traits";
import { generateBrandStrategy } from "@/lib/ai/generateStrategy";
import { getAudienceInsight, type AudienceInsight } from "@/lib/ai/getAudienceInsight";
import { getBrandIntelligenceSummary, type BrandIntelligenceSummary } from "@/lib/ai/getBrandIntelligenceSummary";
import { getLearningLog, type LearningLogDay } from "@/lib/ai/getLearningLog";
import PlatformIcon from "@/components/PlatformIcon";
import BrandStrategyTab from "@/components/dashboard/BrandStrategyTab";
import BrandKpiStrip from "@/components/dashboard/brand/BrandKpiStrip";
import BrandLiveSidebar from "@/components/dashboard/brand/BrandLiveSidebar";
import {
  HiOutlineBuildingOffice2,
  HiOutlineFingerPrint,
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineSparkles,
  HiOutlineGlobeAlt,
  HiOutlineCpuChip,
} from "react-icons/hi2";

type Tab = "genel" | "dna" | "hedef" | "rakipler" | "strateji";

const TABS = [
  { key: "genel" as Tab, label: "Genel Bilgiler", icon: HiOutlineBuildingOffice2 },
  { key: "dna" as Tab, label: "Marka DNA & Ton", icon: HiOutlineFingerPrint },
  { key: "hedef" as Tab, label: "Hedef Kitle", icon: HiOutlineUserGroup },
  { key: "rakipler" as Tab, label: "Rakipler & Pazar", icon: HiOutlineScale },
  { key: "strateji" as Tab, label: "AI İçerik Stratejisi", icon: HiOutlineSparkles },
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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 shadow-2xs transition";

function toCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromArray(value: unknown): string {
  return Array.isArray(value) ? value.map(String).join(", ") : "";
}

function toLineList(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromLineArray(value: unknown): string {
  return Array.isArray(value) ? value.map(String).join("\n") : "";
}

function emptyPersona(): AudiencePersona {
  return { label: "", age: "", location: "", language: "", career: "", goal: "", painPoint: "" };
}

function parsePersonaFromDb(value: unknown): AudiencePersona {
  const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    label: String(obj.label ?? ""),
    age: String(obj.age ?? ""),
    location: String(obj.location ?? ""),
    language: String(obj.language ?? ""),
    career: String(obj.career ?? ""),
    goal: String(obj.goal ?? ""),
    painPoint: String(obj.painPoint ?? obj.pain_point ?? ""),
  };
}

function emptySocials(): CompetitorSocials {
  return { instagram: "", tiktok: "", youtube: "", linkedin: "", x: "" };
}

function emptyCompetitor(): CompetitorInsight {
  return {
    name: "",
    website: "",
    socials: emptySocials(),
    positioning: "",
    strength: "",
    weakness: "",
    differentiation: "",
    scores: {},
  };
}

function normalizeCompetitorsFromDb(value: unknown): CompetitorInsight[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const c = (item && typeof item === "object" ? item : {}) as Partial<CompetitorInsight>;
    return {
      name: c.name ?? "",
      website: c.website ?? "",
      socials: { ...emptySocials(), ...(c.socials ?? {}) },
      positioning: c.positioning ?? "",
      strength: c.strength ?? "",
      weakness: c.weakness ?? "",
      differentiation: c.differentiation ?? "",
      scores: c.scores ?? {},
    };
  });
}

function buildWebsiteUrl(value: string): string | null {
  const clean = value.trim();
  if (!clean) return null;
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

const SOCIAL_URL_BUILDERS: Record<keyof CompetitorSocials, (handle: string) => string> = {
  instagram: (h) => `https://instagram.com/${h}`,
  tiktok: (h) => `https://tiktok.com/@${h}`,
  youtube: (h) => `https://youtube.com/@${h}`,
  linkedin: (h) => `https://linkedin.com/company/${h}`,
  x: (h) => `https://x.com/${h}`,
};

function buildSocialUrl(key: keyof CompetitorSocials, value: string): string | null {
  const clean = value.trim().replace(/^@/, "");
  if (!clean) return null;
  return /^https?:\/\//i.test(clean) ? clean : SOCIAL_URL_BUILDERS[key](clean);
}

function emptyMarketComparison(): MarketComparison {
  return { dimensions: [], brandScores: {}, competitiveGap: "", opportunity: "" };
}

function parseMarketComparisonFromDb(value: unknown): MarketComparison {
  const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const dims = Array.isArray(obj.dimensions) ? obj.dimensions.map(String) : [];
  const scores = obj.brandScores && typeof obj.brandScores === "object" ? (obj.brandScores as Record<string, unknown>) : {};
  const brandScores: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores)) {
    const n = Number(v);
    if (!Number.isNaN(n)) brandScores[k] = n;
  }
  return {
    dimensions: dims,
    brandScores,
    competitiveGap: String(obj.competitiveGap ?? obj.competitive_gap ?? ""),
    opportunity: String(obj.opportunity ?? ""),
  };
}

const TRAIT_LABELS: Record<TraitKey, string> = {
  samimi: "Samimi",
  profesyonel: "Profesyonel",
  teknolojik: "Teknolojik",
  enerjik: "Enerjik",
  destekleyici: "Destekleyici",
  luks: "Lüks",
};

export default function BrandPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<Tab>("genel");
  const [form, setForm] = useState<FormState | null>(null);
  const [tonePosition, setTonePosition] = useState<TonePosition>({ x: 50, y: 50 });
  const [traitScores, setTraitScores] = useState<TraitScores>({
    samimi: 50,
    profesyonel: 50,
    teknolojik: 50,
    enerjik: 50,
    destekleyici: 50,
    luks: 50,
  });
  const [persona, setPersona] = useState<AudiencePersona>(emptyPersona);
  const [painPoints, setPainPoints] = useState("");
  const [motivations, setMotivations] = useState("");
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorInsight[]>([]);
  const [editingSocialsFor, setEditingSocialsFor] = useState<number | null>(null);
  const [marketComparison, setMarketComparison] = useState<MarketComparison>(emptyMarketComparison);
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillStep, setAutofillStep] = useState<string | null>(null);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [autofillSuccess, setAutofillSuccess] = useState<string | null>(null);
  const [strategyVersion, setStrategyVersion] = useState(0);
  const [strategyWarning, setStrategyWarning] = useState<string | null>(null);
  const [audienceInsight, setAudienceInsight] = useState<AudienceInsight | null>(null);
  const [audienceInsightLoading, setAudienceInsightLoading] = useState(false);
  const [intelligenceSummary, setIntelligenceSummary] = useState<BrandIntelligenceSummary | null>(null);
  const [learningLog, setLearningLog] = useState<LearningLogDay[]>([]);

  // Load Brand Intelligence Summary & Learning Log
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const summary = await getBrandIntelligenceSummary(brand.id);
        if (!ignore) setIntelligenceSummary(summary);
      } catch (err) {
        console.error("Brand Intelligence özeti yüklenemedi:", err);
      }
      try {
        const log = await getLearningLog(brand.id);
        if (!ignore) setLearningLog(log);
      } catch (err) {
        console.error("Öğrenme günlüğü yüklenemedi:", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [brand.id, strategyVersion]);

  // Load Audience Insight on Tab 3
  useEffect(() => {
    if (tab !== "hedef" || audienceInsight) return;
    let ignore = false;
    (async () => {
      setAudienceInsightLoading(true);
      try {
        const data = await getAudienceInsight(brand.id);
        if (!ignore) setAudienceInsight(data);
      } catch (err) {
        console.error("Audience insight error:", err);
      } finally {
        if (!ignore) setAudienceInsightLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [brand.id, tab, audienceInsight]);

  // Load base brand data
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data: brandRow } = await supabase
        .from("brands")
        .select("name, website")
        .eq("id", brand.id)
        .maybeSingle();

      const { data: dnaRow } = await supabase
        .from("brand_dna")
        .select(
          "industry, tone_of_voice, brand_traits, forbidden_words, color_palette, target_audience, competitors, competitor_analysis, trait_scores, tone_position, audience_persona, audience_pain_points, audience_motivations, market_comparison, raw_notes"
        )
        .eq("brand_id", brand.id)
        .maybeSingle();

      if (ignore) return;

      setForm({
        name: brandRow?.name ?? "",
        website: brandRow?.website ?? "",
        industry: dnaRow?.industry ?? "",
        tone_of_voice: dnaRow?.tone_of_voice ?? "",
        brand_traits: fromArray(dnaRow?.brand_traits),
        forbidden_words: fromArray(dnaRow?.forbidden_words),
        color_palette: fromArray(dnaRow?.color_palette),
        target_audience: fromArray(dnaRow?.target_audience),
        competitors: fromArray(dnaRow?.competitors),
        raw_notes: dnaRow?.raw_notes ?? "",
      });

      if (dnaRow?.tone_position && typeof dnaRow.tone_position === "object") {
        const tp = dnaRow.tone_position as { x?: number; y?: number };
        setTonePosition({ x: Number(tp.x ?? 50), y: Number(tp.y ?? 50) });
      }

      if (dnaRow?.trait_scores && typeof dnaRow.trait_scores === "object") {
        const scores = dnaRow.trait_scores as Record<string, unknown>;
        setTraitScores({
          samimi: Number(scores.samimi ?? 50),
          profesyonel: Number(scores.profesyonel ?? 50),
          teknolojik: Number(scores.teknolojik ?? 50),
          enerjik: Number(scores.enerjik ?? 50),
          destekleyici: Number(scores.destekleyici ?? 50),
          luks: Number(scores.luks ?? 50),
        });
      }

      if (dnaRow?.audience_persona) {
        setPersona(parsePersonaFromDb(dnaRow.audience_persona));
      }
      setPainPoints(fromLineArray(dnaRow?.audience_pain_points));
      setMotivations(fromLineArray(dnaRow?.audience_motivations));
      setCompetitorAnalysis(normalizeCompetitorsFromDb(dnaRow?.competitor_analysis));
      setMarketComparison(parseMarketComparisonFromDb(dnaRow?.market_comparison));
    })();

    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  function set(field: keyof FormState, value: string) {
    if (!form) return;
    setForm({ ...form, [field]: value });
    setSaved(false);
  }

  function setTrait(key: TraitKey, value: number) {
    setTraitScores((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  // Dragging the dot has no AI call behind it, so the plain-language
  // tone_of_voice string (every AI prompt reads this column, see
  // getBrandContext.ts) is derived deterministically here instead of the
  // quadrant position silently going stale relative to the saved text.
  function setTone(pos: TonePosition) {
    setTonePosition(pos);
    setForm((prev) => (prev ? { ...prev, tone_of_voice: describeTone(pos) } : prev));
    setSaved(false);
  }

  function setPersonaField<K extends keyof AudiencePersona>(field: K, value: AudiencePersona[K]) {
    setPersona((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function updateCompetitor(index: number, patch: Partial<CompetitorInsight>) {
    setCompetitorAnalysis((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setSaved(false);
  }

  function updateCompetitorSocial(index: number, network: keyof CompetitorSocials, value: string) {
    setCompetitorAnalysis((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        socials: { ...next[index].socials, [network]: value },
      };
      return next;
    });
    setSaved(false);
  }

  function addCompetitor() {
    setCompetitorAnalysis((prev) => [...prev, emptyCompetitor()]);
    setSaved(false);
  }

  function removeCompetitor(index: number) {
    setCompetitorAnalysis((prev) => prev.filter((_, i) => i !== index));
    if (editingSocialsFor === index) setEditingSocialsFor(null);
    setSaved(false);
  }

  async function autofill() {
    if (!form?.website.trim()) return;
    setAutofilling(true);
    setAutofillError(null);
    setAutofillSuccess(null);
    setAutofillStep("Web sitesi taranıyor & analiz ediliyor…");

    try {
      const result = await autofillFromWebsite(brand.id, form.website);

      const updatedForm: FormState = {
        ...form,
        name: result.brandName || form.name,
        industry: result.industry || form.industry,
        tone_of_voice: result.toneOfVoice || form.tone_of_voice,
        brand_traits: result.brandTraits.length > 0 ? result.brandTraits.join(", ") : form.brand_traits,
        forbidden_words: form.forbidden_words,
        color_palette: result.colorPalette.length > 0 ? result.colorPalette.join(", ") : form.color_palette,
        target_audience: result.targetAudience.length > 0 ? result.targetAudience.join(", ") : form.target_audience,
        competitors: result.competitors.length > 0 ? result.competitors.join(", ") : form.competitors,
        raw_notes: result.rawNotes || form.raw_notes,
      };

      setForm(updatedForm);
      if (result.tonePosition) setTonePosition(result.tonePosition);
      if (result.traitScores) setTraitScores(result.traitScores);
      if (result.audiencePersona) setPersona(result.audiencePersona);
      if (result.audiencePainPoints && result.audiencePainPoints.length > 0) setPainPoints(result.audiencePainPoints.join("\n"));
      if (result.audienceMotivations && result.audienceMotivations.length > 0) setMotivations(result.audienceMotivations.join("\n"));
      if (result.competitorAnalysis && result.competitorAnalysis.length > 0) {
        setCompetitorAnalysis(result.competitorAnalysis);
      }
      if (result.marketComparison) setMarketComparison(result.marketComparison);

      // Persist immediately — leaving this as local-only state meant
      // navigating away (or a refresh) silently discarded everything the
      // scan just found, with a success message claiming otherwise.
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
          competitor_analysis: result.competitorAnalysis,
          trait_scores: result.traitScores,
          tone_position: result.tonePosition,
          audience_persona: result.audiencePersona,
          audience_pain_points: result.audiencePainPoints,
          audience_motivations: result.audienceMotivations,
          market_comparison: result.marketComparison,
          raw_notes: updatedForm.raw_notes || null,
        })
        .eq("brand_id", brand.id);
      if (dnaError) throw new Error(`Marka DNA'sı kaydedilemedi: ${dnaError.message}`);

      setAutofillStep("AI İçerik Stratejisi otomatik güncelleniyor…");
      try {
        await generateBrandStrategy(brand.id);
        setStrategyVersion((v) => v + 1);
        setAutofillSuccess(
          `"${updatedForm.name}" için web sitesi analiz edildi, Marka DNA'sı, rakip analizi ve İçerik Stratejisi kaydedildi!`
        );
      } catch (strategyErr) {
        setAutofillSuccess(
          `"${updatedForm.name}" için Marka DNA'sı kaydedildi, ama İçerik Stratejisi güncellenemedi (${strategyErr instanceof Error ? strategyErr.message : "bilinmeyen hata"}).`
        );
      }
      setSaved(true);
    } catch (err) {
      setAutofillError(err instanceof Error ? err.message : "Analiz başarısız oldu.");
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
        competitor_analysis: competitorAnalysis,
        trait_scores: traitScores,
        tone_position: tonePosition,
        audience_persona: persona,
        audience_pain_points: toLineList(painPoints),
        audience_motivations: toLineList(motivations),
        market_comparison: marketComparison,
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

  const colorsList = useMemo(() => (form ? toCommaList(form.color_palette) : []), [form]);
  const brandTraitsList = useMemo(() => (form ? toCommaList(form.brand_traits) : []), [form]);

  return (
    <div className="w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Top Breadcrumb & Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          {/* Breadcrumb matching Approvals & Calendar */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-tr from-rose-500 to-[#FA5252] text-[8px] font-bold text-white">
              .j
            </span>
            <span className="font-semibold text-slate-900">{form?.name || brand.name || "Örnek çalışma alanı"}</span>
            <span className="text-[10px] text-slate-400">˅</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">Marka Zekası</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900">Marka Profili</span>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Marka Profili & DNA
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Tentamark markanızı, hedef kitlenizi, rakiplerinizi ve içerik stratejinizi sürekli öğrenip optimize eder.
          </p>
        </div>

        {/* Status Pill & Web Sitesinden Doldur CTA */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Motoru Aktif
          </span>

          <button
            type="button"
            onClick={() => setTab("genel")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition"
          >
            <HiOutlineSparkles className="h-4 w-4 stroke-[2] text-rose-600" />
            <span>Web Sitesinden Analiz Et</span>
          </button>
        </div>
      </div>

      {/* 2. Sleek Light KPI Strip */}
      {intelligenceSummary && (
        <BrandKpiStrip summary={intelligenceSummary} />
      )}

      {/* 3. Master-Detail 2-Column Responsive Layout (Fills Widescreen, No Wasted Space) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tab Strip + Tab Forms (approx 68% width) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Horizontal Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
            {TABS.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              const badge =
                t.key === "rakipler" && competitorAnalysis.length > 0
                  ? String(competitorAnalysis.length)
                  : t.key === "strateji" && intelligenceSummary?.strategyVersion
                  ? `v${intelligenceSummary.strategyVersion}`
                  : null;

              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 stroke-[1.75] ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{t.label}</span>
                  {badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          {!form ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
              Marka bilgileri yükleniyor...
            </div>
          ) : tab === "strateji" ? (
            <BrandStrategyTab key={`${brand.id}-${strategyVersion}`} brandId={brand.id} brandName={form.name} />
          ) : (
            <div className="space-y-5">
              {/* TAB 1: Genel Bilgiler */}
              {tab === "genel" && (
                <>
                  {/* Marka Adı ve Sektör (2-Column Grid Row) */}
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <h3 className="font-display text-sm font-bold text-slate-900">Marka Temel Bilgileri</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Marka Adı">
                        <input
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          className={INPUT_CLASS}
                          placeholder="Örn: Jusco, Tentamark"
                        />
                      </Field>

                      <Field label="Sektör / Kategori">
                        <input
                          value={form.industry}
                          onChange={(e) => set("industry", e.target.value)}
                          placeholder="Örn: İçecek, E-Ticaret, SaaS, Turizm"
                          className={INPUT_CLASS}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Web Sitesi & AI Autofill */}
                  <div className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                        <HiOutlineGlobeAlt className="h-4 w-4 stroke-[2]" />
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Web Sitesinden Otomatik Marka Çıkarımı
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Web sitenizi tarayarak marka ses tonunu, hedef kitleyi ve içerik stratejisini tek tıkla analiz edin.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <input
                        value={form.website}
                        onChange={(e) => set("website", e.target.value)}
                        placeholder="https://siteniz.com"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={autofill}
                        disabled={!form.website.trim() || autofilling}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 shrink-0 cursor-pointer"
                      >
                        {autofilling ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>{autofillStep || "Analiz Ediliyor..."}</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineSparkles className="h-4 w-4 stroke-[2]" />
                            <span>Tara ve Otomatik Doldur</span>
                          </>
                        )}
                      </button>
                    </div>

                    {autofillSuccess && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800 space-y-2">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>✓</span> {autofillSuccess}
                        </p>
                        <div className="flex flex-wrap gap-2">
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
                          <button
                            type="button"
                            onClick={() => setTab("hedef")}
                            className="rounded-lg border border-emerald-300 bg-white text-emerald-800 px-2.5 py-1 text-[11px] font-semibold"
                          >
                            Hedef Kitleyi Gör
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

                  {/* Renk Paleti & Yasaklı Kelimeler */}
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <h3 className="font-display text-sm font-bold text-slate-900">Görsel & Dil Kılavuzu</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Renk Paleti */}
                      <div className="space-y-2">
                        <Field label="Marka Renk Paleti (Hex)" hint="Virgülle ayırın">
                          <input
                            value={form.color_palette}
                            onChange={(e) => set("color_palette", e.target.value)}
                            placeholder="#FA5252, #10B981, #0EA5E9"
                            className={INPUT_CLASS}
                          />
                        </Field>

                        {colorsList.length > 0 && (
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold">Önizleme:</span>
                            <div className="flex items-center gap-1.5">
                              {colorsList.map((hex, idx) => (
                                <div
                                  key={idx}
                                  style={{ backgroundColor: hex }}
                                  title={hex}
                                  className="h-5 w-5 rounded-full border border-slate-200 shadow-2xs"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Yasaklı Kelimeler */}
                      <Field label="Yasaklı / Kaçınılacak Kelimeler" hint="Virgülle ayırın">
                        <input
                          value={form.forbidden_words}
                          onChange={(e) => set("forbidden_words", e.target.value)}
                          placeholder="ucuz, fırsatı kaçırma, garanti"
                          className={INPUT_CLASS}
                        />
                      </Field>
                    </div>

                    {/* Notlar */}
                    <Field label="Özel Marka Notları & Değer Önerisi" hint="AI içerik üretirken referans alır">
                      <textarea
                        value={form.raw_notes}
                        onChange={(e) => set("raw_notes", e.target.value)}
                        rows={4}
                        placeholder="Markanızın vaadi, hikayesi, müşterilerine yaşattığı temel duygu ve özel kampanya kuralları..."
                        className={`${INPUT_CLASS} resize-y`}
                      />
                    </Field>
                  </div>
                </>
              )}

              {/* TAB 2: Marka DNA & Ton */}
              {tab === "dna" && (
                <>
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        Ses Tonu Matrisi
                        <span className="ml-1.5 font-normal text-xs text-slate-400">(noktayı sürükleyerek konumlandırın)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        İçeriklerinizin ne kadar resmi veya samimi, enerjik veya sakin olacağını belirler.
                      </p>
                    </div>
                    <ToneQuadrant position={tonePosition} onChange={setTone} />
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <h3 className="font-display text-sm font-bold text-slate-900">Karakter Skorları</h3>
                    <p className="text-xs text-slate-500">
                      AI içerik taslağı hazırlarken bu skor dengesini gözetir.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      {TRAIT_KEYS.map((key) => (
                        <TraitSlider
                          key={key}
                          label={TRAIT_LABELS[key]}
                          value={traitScores[key]}
                          onChange={(v) => setTrait(key, v)}
                        />
                      ))}
                    </div>

                    <div className="pt-2">
                      <Field label="Marka Nitelikleri (DNA Etiketleri)" hint="Virgülle ayırın">
                        <input
                          value={form.brand_traits}
                          onChange={(e) => set("brand_traits", e.target.value)}
                          placeholder="yenilikçi, sürdürülebilir, dinamik, neşeli"
                          className={INPUT_CLASS}
                        />
                      </Field>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 3: Hedef Kitle */}
              {tab === "hedef" && (
                <>
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <Field label="Genel Hedef Kitle Segmentleri" hint="Virgülle ayırın">
                      <textarea
                        rows={3}
                        value={form.target_audience}
                        onChange={(e) => set("target_audience", e.target.value)}
                        placeholder="Örn: 22-35 yaş arası şehirli profesyoneller, sağlıklı yaşama ve ferahlığa önem veren genç kitle..."
                        className={`${INPUT_CLASS} resize-y`}
                      />
                    </Field>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-sm font-bold text-slate-900">Ana Müşteri Personası</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Web analiziyle otomatik oluşturulur; elle de özelleştirebilirsiniz.
                        </p>
                      </div>
                    </div>

                    <input
                      value={persona.label}
                      onChange={(e) => setPersonaField("label", e.target.value)}
                      placeholder="Persona Adı (Örn: Şehirli Profesyonel)"
                      className={`${INPUT_CLASS} font-semibold`}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <PersonaField label="Yaş Aralığı" value={persona.age} onChange={(v) => setPersonaField("age", v)} placeholder="22-35" />
                      <PersonaField label="Konum" value={persona.location} onChange={(v) => setPersonaField("location", v)} placeholder="Büyükşehirler" />
                      <PersonaField label="Dil" value={persona.language} onChange={(v) => setPersonaField("language", v)} placeholder="Türkçe" />
                      <PersonaField label="Meslek" value={persona.career} onChange={(v) => setPersonaField("career", v)} placeholder="Kurumsal / Girişimci" />
                      <PersonaField label="Temel Hedef" value={persona.goal} onChange={(v) => setPersonaField("goal", v)} placeholder="Sağlıklı ve enerjik yaşam" />
                      <PersonaField label="Acı Noktası" value={persona.painPoint} onChange={(v) => setPersonaField("painPoint", v)} placeholder="Yoğun tempo, yorgunluk" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Pain Points (Acı Noktaları)
                        </span>
                        <textarea
                          rows={4}
                          value={painPoints}
                          onChange={(e) => {
                            setPainPoints(e.target.value);
                            setSaved(false);
                          }}
                          placeholder={"Her satıra bir madde\nÖrn: Şekerli gazlı içeceklerden kaçınma"}
                          className={`${INPUT_CLASS} resize-y`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Motivations (Tetikleyiciler)
                        </span>
                        <textarea
                          rows={4}
                          value={motivations}
                          onChange={(e) => {
                            setMotivations(e.target.value);
                            setSaved(false);
                          }}
                          placeholder={"Her satıra bir madde\nÖrn: Doğal ve katkısız lezzet arayışı"}
                          className={`${INPUT_CLASS} resize-y`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Audience Insight */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 shadow-xs">
                    {audienceInsightLoading ? (
                      <p className="text-xs text-slate-400">İçgörü hesaplanıyor…</p>
                    ) : audienceInsight ? (
                      <>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                          <HiOutlineCpuChip className="h-4 w-4 stroke-[2] text-rose-600" />
                          <span>AI Audience Insight</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-700">{audienceInsight.text}</p>
                        <p className="mt-2 text-[10px] text-slate-400 font-mono">
                          Kaynak: son 30 günde {audienceInsight.sampleSize} içerik · Plan %{audienceInsight.plannedPercentage} · Gerçekleşen %{audienceInsight.actualPercentage}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Henüz yeterli veri yok. AI stratejisi doğrultusunda birkaç içerik yayınlandığında gerçek kitle etkileşim analizi burada görünecektir.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* TAB 4: Rakipler & Pazar */}
              {tab === "rakipler" && (
                <>
                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <Field label="Ana Rakipler Listesi" hint="Virgülle ayırın">
                      <input
                        value={form.competitors}
                        onChange={(e) => set("competitors", e.target.value)}
                        placeholder="Örn: San Pellegrino, Uludağ Premium, Beypazarı"
                        className={INPUT_CLASS}
                      />
                    </Field>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-sm font-bold text-slate-900">Takip Edilen Rakip Profilleri</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Rakiplerinizin sosyal hesaplarını ve pazar konumunu inceleyin.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addCompetitor}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-300 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                      >
                        + Rakip Ekle
                      </button>
                    </div>

                    {competitorAnalysis.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
                        Henüz rakip eklenmedi. Yukarıdaki &quot;+ Rakip Ekle&quot; butonuyla ekleyebilir veya web sitesinden otomatik analiz çalıştırabilirsiniz.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {competitorAnalysis.map((c, idx) => (
                          <div
                            key={idx}
                            className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-xs transition"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <input
                                value={c.name}
                                onChange={(e) => updateCompetitor(idx, { name: e.target.value })}
                                placeholder="Rakip Adı"
                                className="border-0 bg-transparent text-sm font-bold text-slate-900 focus:outline-none flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => removeCompetitor(idx)}
                                title="Rakibi sil"
                                className="text-slate-300 hover:text-red-500 p-1 text-xs"
                              >
                                ✕
                              </button>
                            </div>

                            {/* Social / Web Icons */}
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const websiteUrl = buildWebsiteUrl(c.website);
                                return websiteUrl ? (
                                  <a
                                    href={websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={c.website}
                                    className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-700 text-white transition hover:scale-105"
                                  >
                                    <GlobeIcon className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-300">
                                    <GlobeIcon className="h-3 w-3" />
                                  </span>
                                );
                              })()}

                              {(["instagram", "tiktok", "youtube", "linkedin", "x"] as const).map((key) => {
                                const url = buildSocialUrl(key, c.socials[key]);
                                return url ? (
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
                                ) : (
                                  <span key={key} className="opacity-20 grayscale">
                                    <PlatformIcon name={key} className="h-6 w-6" />
                                  </span>
                                );
                              })}

                              <button
                                type="button"
                                onClick={() => setEditingSocialsFor(editingSocialsFor === idx ? null : idx)}
                                className="ml-auto text-[10px] font-semibold text-rose-600 hover:underline"
                              >
                                {editingSocialsFor === idx ? "Kapat" : "✎ Düzenle"}
                              </button>
                            </div>

                            {/* Editing Socials Input Box */}
                            {editingSocialsFor === idx && (
                              <div className="space-y-1.5 rounded-xl border border-dashed border-rose-200 bg-rose-50/30 p-2.5">
                                <input
                                  value={c.website}
                                  onChange={(e) => updateCompetitor(idx, { website: e.target.value })}
                                  placeholder="Website (https://...)"
                                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-1.5">
                                  {(["instagram", "tiktok", "youtube", "linkedin", "x"] as const).map((key) => (
                                    <input
                                      key={key}
                                      value={c.socials[key]}
                                      onChange={(e) => updateCompetitorSocial(idx, key, e.target.value)}
                                      placeholder={key === "x" ? "X" : key.slice(0, 4)}
                                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:outline-none"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Competitor Analysis Snippets */}
                            <div className="space-y-1 text-xs pt-1">
                              <textarea
                                rows={2}
                                value={c.positioning}
                                onChange={(e) => updateCompetitor(idx, { positioning: e.target.value })}
                                placeholder="Konumlanma (Örn: Lüks & İthal segment)"
                                className="w-full resize-none rounded-lg bg-slate-50 p-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                              />
                              <textarea
                                rows={1}
                                value={c.strength}
                                onChange={(e) => updateCompetitor(idx, { strength: e.target.value })}
                                placeholder="Güçlü yönü"
                                className="w-full resize-none rounded-lg bg-emerald-50/60 p-2 text-[11px] text-emerald-800 placeholder-emerald-400 focus:outline-none"
                              />
                              <textarea
                                rows={1}
                                value={c.weakness}
                                onChange={(e) => updateCompetitor(idx, { weakness: e.target.value })}
                                placeholder="Zayıf yönü"
                                className="w-full resize-none rounded-lg bg-amber-50/60 p-2 text-[11px] text-amber-800 placeholder-amber-400 focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Market Comparison Table */}
                  {marketComparison.dimensions.length > 0 && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Pazar Karşılaştırması & Rekabet Matrisi
                      </h4>
                      <p className="text-[11px] text-slate-400 mb-3">
                        AI pazar bilgisine dayalı tahmini skorlama göstergesidir.
                      </p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                            <th className="py-2 text-left">Boyut</th>
                            <th className="py-2 text-center text-[#FA5252] font-bold">{form.name || "Markanız"}</th>
                            {competitorAnalysis.map((c, idx) => (
                              <th key={idx} className="py-2 text-center text-slate-600">{c.name || "—"}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {marketComparison.dimensions.map((dim) => (
                            <tr key={dim} className="border-b border-slate-50">
                              <td className="py-2 text-slate-700 font-medium">{dim}</td>
                              <td className="py-2 text-center text-[#FA5252] font-bold">{marketComparison.brandScores[dim] ?? "—"}</td>
                              {competitorAnalysis.map((c, idx) => (
                                <td key={idx} className="py-2 text-center text-slate-500">{c.scores[dim] ?? "—"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Competitive Gap / Opportunity — same AI pass that fills
                      the comparison table above also writes these two, but
                      the UI stopped rendering them even though the data was
                      still being computed and saved. */}
                  {(marketComparison.competitiveGap || marketComparison.opportunity) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {marketComparison.competitiveGap && (
                        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 shadow-xs">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Rekabet Boşluğu
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                            {marketComparison.competitiveGap}
                          </p>
                        </div>
                      )}
                      {marketComparison.opportunity && (
                        <div className="rounded-2xl border border-rose-100/80 bg-rose-50/40 p-5 shadow-xs">
                          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                            Fırsat
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-900">
                            {marketComparison.opportunity}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Secondary Inline Save Button at the bottom of forms */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <p className="text-xs text-slate-500">
                  Değişikliklerin kaydedilmesi AI içerik önerilerini ve haftalık takvimi anında günceller.
                </p>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Brand Identity & AI Intelligence (approx 32% width) */}
        <div className="lg:col-span-4">
          <BrandLiveSidebar
            brandName={form?.name || ""}
            industry={form?.industry || ""}
            tonePosition={tonePosition}
            colorList={colorsList}
            brandTraits={brandTraitsList}
            intelligenceSummary={intelligenceSummary}
            learningLog={learningLog}
            saving={saving}
            savingStep={savingStep}
            saved={saved}
            saveError={saveError}
            strategyWarning={strategyWarning}
            onSave={save}
            describeTone={describeTone}
          />
        </div>
      </div>
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function PersonaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
      />
    </label>
  );
}

function TraitSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer accent-[#FA5252]"
      />
      <span className="w-8 text-right font-mono text-[11px] font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function ToneQuadrant({
  position,
  onChange,
}: {
  position: TonePosition;
  onChange: (pos: TonePosition) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  function updateFromPointer(e: React.PointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const xPct = Math.round((x / rect.width) * 100);
    const yPct = Math.round((y / rect.height) * 100);
    onChange({ x: xPct, y: yPct });
  }

  const leftPct = Math.max(5, Math.min(95, position.x));
  const topPct = Math.max(5, Math.min(95, position.y));

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) updateFromPointer(e);
        }}
        className="relative h-44 w-full touch-none select-none rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-2xs"
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-slate-200" />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-slate-200" />

        <span className="pointer-events-none absolute left-3 top-2 text-[9px] font-semibold uppercase tracking-wider text-slate-300">
          Kendinden Emin
        </span>
        <span className="pointer-events-none absolute right-3 top-2 text-[9px] font-semibold uppercase tracking-wider text-slate-300">
          Samimi
        </span>
        <span className="pointer-events-none absolute bottom-2 left-3 text-[9px] font-semibold uppercase tracking-wider text-slate-300">
          Resmi
        </span>
        <span className="pointer-events-none absolute bottom-2 right-3 text-[9px] font-semibold uppercase tracking-wider text-slate-300">
          Destekleyici
        </span>

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
          Profesyonel
        </span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
          Rahat
        </span>
        <span className="pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2 text-[10px] font-bold text-slate-500">
          Enerjik
        </span>
        <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
          Sakin
        </span>

        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white bg-[#FA5252] shadow-md active:cursor-grabbing"
          style={{ left: `${leftPct}%`, top: `${topPct}%` }}
        />
      </div>
    </div>
  );
}

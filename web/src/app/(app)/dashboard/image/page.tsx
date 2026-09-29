"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  CARD_TEMPLATES,
  getCardTemplate,
  TEMPLATE_CATEGORIES,
  type FieldConfig,
  type TemplateCategory,
} from "@/lib/cards/templateFieldConfig";
import type { CardFormat } from "@/lib/cards/typeRegistry";
import { getSupportedFormats } from "@/lib/cards/cardFormats";
import { CardLivePreview } from "@/components/dashboard/cards/CardLivePreview";
import type { ResolvedSuggestion } from "@/lib/cards/contentPurpose";

type CardResult = { mediaId: string; fileUrl: string };

async function compressImageFile(file: File, maxDim = 1920, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function ImageFieldInput({
  field,
  value,
  onChange,
  isEn,
}: {
  field: FieldConfig;
  value: string;
  onChange: (val: string) => void;
  isEn: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = isEn ? field.label.en : field.label.tr;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert(
        isEn
          ? "Please select a valid image file (PNG, JPG, WebP)."
          : "Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP)."
      );
      return;
    }
    setProcessing(true);
    try {
      const dataUrl = await compressImageFile(file, 1920, 0.88);
      onChange(dataUrl);
    } catch (err) {
      console.error("Image read error:", err);
      alert(isEn ? "Failed to read image file." : "Görsel dosyası okunamadı.");
    } finally {
      setProcessing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  const hasImage = Boolean(value && value.trim().length > 0);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}{" "}
          {field.optional && (
            <span className="text-[11px] font-normal text-slate-400">
              ({isEn ? "optional" : "opsiyonel"})
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 underline cursor-pointer"
        >
          {showUrlInput
            ? isEn
              ? "Switch to file upload"
              : "Dosya yüklemeye dön"
            : isEn
            ? "or paste URL"
            : "veya URL gir"}
        </button>
      </div>

      {showUrlInput ? (
        <div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-slate-900 focus:bg-white focus:outline-none"
          />
        </div>
      ) : hasImage ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded thumbnail"
            className="h-14 w-14 rounded-xl object-cover border border-slate-200 bg-white shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">
              {value.startsWith("data:")
                ? isEn
                  ? "Custom uploaded image"
                  : "Yüklenen özel görsel"
                : value}
            </p>
            <p className="text-[11px] text-slate-400">
              {isEn ? "Ready for preview & render" : "Önizleme ve üretim için hazır"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
            >
              {isEn ? "Replace" : "Değiştir"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={processing}
              className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer shadow-2xs"
            >
              {isEn ? "Remove" : "Kaldır"}
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !processing && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
            isDragging
              ? "border-slate-900 bg-slate-100/80"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-2xs border border-slate-200 text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-xs font-bold text-slate-800">
            {processing
              ? isEn
                ? "Processing image..."
                : "Görsel işleniyor..."
              : isEn
              ? "Drop photo here or click to browse"
              : "Fotoğrafı buraya sürükleyin veya dosya seçin"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP (maks. 8MB)</p>
        </div>
      )}
    </div>
  );
}

function buildFieldValue(field: FieldConfig, raw: string): unknown {
  switch (field.kind) {
    case "lines":
      return raw.split("\n").map((s) => s.trim()).filter(Boolean);
    case "numbers":
      return raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
    case "rating":
      return raw ? Number(raw) : undefined;
    default:
      return raw.trim() || undefined;
  }
}

export default function ImagePage() {
  const { t, isEn } = useLanguage();
  const v = t.dashboard.image;

  const [topic, setTopic] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestResult, setSuggestResult] = useState<{ purposeLabel: { tr: string; en: string }; suggestions: ResolvedSuggestion[] } | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<"all" | TemplateCategory>("all");
  const [templateKey, setTemplateKey] = useState(CARD_TEMPLATES[0].key);
  const [format, setFormat] = useState<CardFormat>("square");
  const [variantKey, setVariantKey] = useState<string>("centered");
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CardResult[] | null>(null);
  const [generationWarnings, setGenerationWarnings] = useState<string[]>([]);

  // Live preview states
  const [previewHtmls, setPreviewHtmls] = useState<string[]>([]);
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number }>({ width: 1080, height: 1080 });
  const [previewLoading, setPreviewLoading] = useState(false);

  const template = getCardTemplate(templateKey) ?? CARD_TEMPLATES[0];

  const filteredTemplates = CARD_TEMPLATES.filter((tpl) =>
    selectedCategory === "all" ? true : tpl.category === selectedCategory
  );

  function selectTemplate(key: string) {
    setTemplateKey(key);
    const nextTpl = getCardTemplate(key);
    setVariantKey(nextTpl?.variants?.[0]?.key || "centered");
    setValues({});
    setError(null);
    const nextFormats = getSupportedFormats(key);
    if (!nextFormats.includes(format)) setFormat("square");
  }

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function applySuggestion(suggestion: ResolvedSuggestion) {
    selectTemplate(suggestion.templateKey);
    setVariantKey(suggestion.variantKey);
  }

  async function handleSuggest() {
    const trimmed = topic.trim();
    if (!trimmed || suggesting) return;
    setSuggesting(true);
    setSuggestError(null);
    try {
      const res = await fetch("/api/cards/suggest-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? v.aiSuggestError);
      setSuggestResult({ purposeLabel: data.purposeLabel, suggestions: data.suggestions });
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : v.aiSuggestError);
    } finally {
      setSuggesting(false);
    }
  }

  // Live preview effect with fast 180ms debounce
  useEffect(() => {
    let isCancelled = false;
    const timeoutId = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const payloadValues: Record<string, unknown> = {};
        for (const field of template.fields) {
          const val = buildFieldValue(field, values[field.key] ?? "");
          if (val !== undefined && !(Array.isArray(val) && val.length === 0)) {
            payloadValues[field.key] = val;
          }
        }

        const res = await fetch("/api/cards/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: template.key,
            format,
            variantKey,
            values: payloadValues,
          }),
        });

        if (!res.ok) throw new Error("Önizleme alınamadı");
        const data = await res.json();
        if (!isCancelled && Array.isArray(data.htmls)) {
          setPreviewHtmls(data.htmls);
          if (data.dimensions) setPreviewDimensions(data.dimensions);
        }
      } catch (err) {
        console.warn("Live preview fetch error:", err);
      } finally {
        if (!isCancelled) setPreviewLoading(false);
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [template.key, template.fields, format, variantKey, values]);

  const canSubmit = template.fields
    .filter((f) => !f.optional)
    .every((f) => (values[f.key] ?? "").trim().length > 0);

  async function handleGenerate() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { format, variantKey };
      for (const field of template.fields) {
        const value = buildFieldValue(field, values[field.key] ?? "");
        if (value !== undefined && !(Array.isArray(value) && value.length === 0)) {
          body[field.key] = value;
        }
      }
      const res = await fetch(`/api/cards/${template.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? v.errorGeneric);
      setResults(data.results as CardResult[]);
      setGenerationWarnings(Array.isArray(data.warnings) ? data.warnings : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : v.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResults(null);
    setError(null);
    setGenerationWarnings([]);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{v.title}</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">{v.subtitle}</p>
      </div>

      {results ? (
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-base font-bold text-slate-900">{v.statusCompleted}</p>
              <p className="text-xs text-slate-500 mt-0.5">{v.savedToMediaHint}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {v.createAnotherButton}
            </button>
          </div>

          {generationWarnings.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 space-y-1">
              {generationWarnings.map((w, i) => (
                <p key={i}>⚠️ {w}</p>
              ))}
            </div>
          )}

          <div className={results.length > 1 ? "mt-6 flex gap-4 overflow-x-auto pb-2" : "mt-6"}>
            {results.map((r, i) => (
              <div key={r.mediaId} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- rendered PNG served from Supabase Storage */}
                <img
                  src={r.fileUrl}
                  alt={`Üretilen Kart ${i + 1}`}
                  className={`rounded-2xl bg-slate-900 shadow-md transition group-hover:shadow-lg ${
                    results.length > 1
                      ? "h-72 w-auto shrink-0"
                      : `mx-auto ${
                          format === "story"
                            ? "max-h-[70vh]"
                            : format === "landscape"
                            ? "max-w-2xl w-full"
                            : "max-w-md w-full"
                        }`
                  }`}
                />
                <div className="mt-3 flex items-center justify-center gap-2">
                  <a
                    href={r.fileUrl}
                    download={`tentamark-card-${i + 1}.png`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                  >
                    {v.downloadButton}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Sol Kolon: Form Alanları (7 Sütun) */}
          <div className="space-y-6 lg:col-span-7 rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {/* AI Şablon Önerisi (opsiyonel) */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.aiSuggestLabel}</span>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSuggest();
                  }}
                  placeholder={v.aiSuggestPlaceholder}
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800"
                />
                <button
                  type="button"
                  disabled={!topic.trim() || suggesting}
                  onClick={handleSuggest}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {suggesting ? v.aiSuggestButtonLoading : v.aiSuggestButton}
                </button>
              </div>
              {suggestError && <p className="mt-2 text-xs font-semibold text-red-600">{suggestError}</p>}
              {suggestResult && (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-semibold text-slate-500">
                    {isEn ? suggestResult.purposeLabel.en : suggestResult.purposeLabel.tr}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestResult.suggestions.map((s) => {
                      const tierLabel =
                        s.tier === "safe" ? v.aiSuggestTierSafe : s.tier === "bold" ? v.aiSuggestTierBold : v.aiSuggestTierExperimental;
                      const isActive = templateKey === s.templateKey && variantKey === s.variantKey;
                      return (
                        <button
                          key={`${s.templateKey}-${s.variantKey}`}
                          type="button"
                          onClick={() => applySuggestion(s)}
                          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                            isActive
                              ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0 shadow-xs"
                            style={{ backgroundColor: s.colorPreview }}
                          />
                          <span className="flex flex-col items-start leading-tight">
                            <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">{tierLabel}</span>
                            <span>{isEn ? s.templateLabel.en : s.templateLabel.tr}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Şablon Seçici & Kategori Filtresi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.templateLabel}</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {filteredTemplates.length} / {CARD_TEMPLATES.length} {isEn ? "Templates" : "Şablon"}
                </span>
              </div>

              {/* Kategori Sekmeleri */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/70 border border-slate-200/50 mb-3">
                {TEMPLATE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                      }`}
                    >
                      {isEn ? cat.label.en : cat.label.tr}
                    </button>
                  );
                })}
              </div>

              {/* Şablon Butonları */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredTemplates.map((tpl) => (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => selectTemplate(tpl.key)}
                    className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      templateKey === tpl.key
                        ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    {isEn ? tpl.label.en : tpl.label.tr}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasarım Stili / Tema Seçici (Eğer Şablonun Stilleri Varsa) */}
            {template.variants && template.variants.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isEn ? "Visual Style / Theme" : "Tasarım Stili / Tema"}
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {template.variants.map((va) => (
                    <button
                      key={va.key}
                      type="button"
                      onClick={() => setVariantKey(va.key)}
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                        variantKey === va.key
                          ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                          : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0 shadow-xs"
                        style={{ backgroundColor: va.colorPreview }}
                      />
                      {isEn ? va.label.en : va.label.tr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Format Seçici */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.formatLabel}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {getSupportedFormats(template.key).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                      format === f
                        ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    {f === "square"
                      ? v.formatSquare
                      : f === "story"
                      ? v.formatStory
                      : isEn
                      ? "16:9 YouTube / Landscape"
                      : "16:9 YouTube / Yatay"}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* İçerik Doldurma & Hızlı Araçlar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (template.exampleValues) {
                      setValues({ ...template.exampleValues });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/60 px-3 py-1.5 text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
                  title={isEn ? "Fill with viral ready copy" : "Viral örnek metinle doldur"}
                >
                  <span className="text-sm">⚡</span>
                  <span>{isEn ? "Magic Fill Example" : "Örnek Doldur"}</span>
                </button>
                {Object.keys(values).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setValues({})}
                    className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                  >
                    {isEn ? "Clear" : "Temizle"}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <span className="text-slate-400 font-semibold">{isEn ? "Shortcuts:" : "Kısayollar:"}</span>
                <span className="rounded-md bg-yellow-100/90 px-1.5 py-0.5 text-yellow-900 font-bold border border-yellow-300/60 shadow-2xs" title={isEn ? "Fills word with bright highlighter" : "Kelimeyi parlak fosforlu kalemle boyar"}>
                  *fosforlu*
                </span>
                <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-rose-700 font-bold border border-rose-300/60 shadow-2xs" title={isEn ? "Draws hand-drawn circle around word" : "Kelimeyi kırmızı el çizimi daireye alır"}>
                  ~daire~
                </span>
                <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-sky-700 font-bold border border-sky-300/60 shadow-2xs" title={isEn ? "Draws wavy hand-drawn underline" : "Kelimenin altına dalgalı el çizgisi çeker"}>
                  _altı çizili_
                </span>
              </div>
            </div>

            {/* Dinamik Alanlar */}
            <div className="space-y-4">
              {template.fields.map((field) => {
                const value = values[field.key] ?? "";
                const label = isEn ? field.label.en : field.label.tr;
                const placeholder = field.placeholder ? (isEn ? field.placeholder.en : field.placeholder.tr) : undefined;

                if (field.kind === "rating") {
                  const current = Number(value) || 0;
                  return (
                    <div key={field.key}>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                      <div className="mt-2 flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setField(field.key, String(n === current ? 0 : n))}
                            className={`text-2xl leading-none cursor-pointer transition transform hover:scale-110 ${
                              n <= current ? "text-amber-400" : "text-slate-200"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (field.kind === "image") {
                  return (
                    <ImageFieldInput
                      key={field.key}
                      field={field}
                      value={value}
                      onChange={(val) => setField(field.key, val)}
                      isEn={isEn}
                    />
                  );
                }

                if (field.kind === "textarea" || field.kind === "lines") {
                  return (
                    <div key={field.key}>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                        {field.maxLength && field.kind === "textarea" && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {value.length}/{field.maxLength}
                          </span>
                        )}
                      </div>
                      <textarea
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value)}
                        placeholder={placeholder}
                        rows={field.kind === "lines" ? 4 : 3}
                        maxLength={field.maxLength}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.key}>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                    <input
                      type={field.kind === "url" ? "url" : "text"}
                      value={value}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={placeholder}
                      maxLength={field.maxLength}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleGenerate}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              {submitting ? v.submitting : v.submitButton}
            </button>
          </div>

          {/* Sağ Kolon: Canlı Önizleme (5 Sütun - Sticky) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8">
              <CardLivePreview
                htmls={previewHtmls}
                dimensions={previewDimensions}
                format={format}
                loading={previewLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

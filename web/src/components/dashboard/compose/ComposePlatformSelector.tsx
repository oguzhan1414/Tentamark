"use client";

import { useState } from "react";
import Link from "next/link";
import PlatformIcon, { platformLabel } from "@/components/PlatformIcon";
import type { LaunchPlatform, ContentFormat } from "@/lib/ai/generateDrafts";

interface ComposePlatformSelectorProps {
  connectedPlatforms: LaunchPlatform[] | null;
  selectedPlatforms: LaunchPlatform[];
  onTogglePlatform: (platform: LaunchPlatform) => void;
  format: ContentFormat;
  onChangeFormat: (format: ContentFormat) => void;
  campaignId: string;
  campaigns: { id: string; name: string }[];
  onChangeCampaign: (id: string) => void;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  selectedTone: string;
  onChangeTone: (tone: string) => void;
  toneOptions: { id: string; label: string; desc: string }[];
  mode: "manual" | "ai";
  metadataPanel: "campaign" | "labels" | "more" | null;
  setMetadataPanel: (panel: "campaign" | "labels" | "more" | null) => void;
  onOpenTemplatePicker: () => void;
  isEn: boolean;
}

export default function ComposePlatformSelector({
  connectedPlatforms,
  selectedPlatforms,
  onTogglePlatform,
  format,
  onChangeFormat,
  campaignId,
  campaigns,
  onChangeCampaign,
  tags,
  onAddTag,
  onRemoveTag,
  selectedTone,
  onChangeTone,
  toneOptions,
  mode,
  metadataPanel,
  setMetadataPanel,
  onOpenTemplatePicker,
  isEn,
}: ComposePlatformSelectorProps) {
  const [tagInput, setTagInput] = useState("");

  function handleAddTag() {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
      setTagInput("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {connectedPlatforms === null ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              <span className="text-xs text-slate-400">
                {isEn ? "Loading accounts..." : "Hesaplar yükleniyor..."}
              </span>
            </div>
          ) : connectedPlatforms.length === 0 ? (
            <p className="text-xs text-slate-500">
              {isEn ? "No connected accounts yet. " : "Henüz bağlı bir hesabın yok. "}
              <Link
                href="/settings?tab=baglantilar"
                className="font-semibold text-blue-600 hover:underline"
              >
                {isEn ? "Connect one →" : "Bir hesap bağla →"}
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {connectedPlatforms.map((platform) => {
                const checked = selectedPlatforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => onTogglePlatform(platform)}
                    title={platformLabel(platform)}
                    aria-label={`${platformLabel(platform)} ${
                      checked
                        ? isEn
                          ? "selected"
                          : "seçili"
                        : isEn
                        ? "not selected"
                        : "seçili değil"
                    }`}
                    aria-pressed={checked}
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 ${
                      checked
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <PlatformIcon
                      name={platform}
                      variant="tile"
                      className={`h-7 w-7 rounded-lg transition ${
                        checked ? "" : "opacity-35 grayscale"
                      }`}
                    />
                    {checked && (
                      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                        <svg
                          className="h-2 w-2 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={4}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenTemplatePicker}
            disabled={selectedPlatforms.length === 0}
            className="rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 disabled:opacity-40"
          >
            {isEn ? "Template" : "Şablon"}
          </button>
          <button
            type="button"
            onClick={() =>
              setMetadataPanel(metadataPanel === "campaign" ? null : "campaign")
            }
            aria-expanded={metadataPanel === "campaign"}
            className={`rounded-lg border border-dashed px-2.5 py-1.5 text-[11px] font-semibold ${
              campaignId
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-300 text-slate-600 hover:border-blue-300"
            }`}
          >
            {campaignId
              ? campaigns.find((c) => c.id === campaignId)?.name ??
                (isEn ? "Campaign" : "Kampanya")
              : isEn
              ? "Campaign"
              : "Kampanya"}
          </button>
          <button
            type="button"
            onClick={() =>
              setMetadataPanel(metadataPanel === "labels" ? null : "labels")
            }
            aria-expanded={metadataPanel === "labels"}
            className={`rounded-lg border border-dashed px-2.5 py-1.5 text-[11px] font-semibold ${
              tags.length
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-slate-300 text-slate-600 hover:border-blue-300"
            }`}
          >
            {isEn ? "Labels" : "Etiketler"}
            {tags.length ? ` · ${tags.length}` : ""}
          </button>
          <button
            type="button"
            onClick={() =>
              setMetadataPanel(metadataPanel === "more" ? null : "more")
            }
            aria-expanded={metadataPanel === "more"}
            className="rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-blue-300"
          >
            {isEn ? "More" : "Diğer"}
          </button>
        </div>
      </div>

      {/* Content Format Selector */}
      <div className="flex gap-1.5">
        {(
          [
            { key: "post", label: isEn ? "📄 Post" : "📄 Gönderi" },
            { key: "story", label: isEn ? "⚡ Story" : "⚡ Hikaye" },
            { key: "reel", label: isEn ? "🎬 Reel" : "🎬 Makara" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onChangeFormat(f.key)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
              format === f.key
                ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Metadata Panel Dropdown */}
      {metadataPanel && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
          {metadataPanel === "more" && mode === "ai" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isEn ? "Brand Voice & Tone" : "Marka Sesi & Tonu"}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {toneOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeTone(t.id)}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      selectedTone === t.id
                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{t.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {t.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(metadataPanel === "campaign" || metadataPanel === "more") && (
            <div className="space-y-1.5">
              <label
                htmlFor="campaign_select"
                className="text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                {isEn ? "Campaign (Optional)" : "Kampanya (Opsiyonel)"}
              </label>
              <select
                id="campaign_select"
                value={campaignId}
                onChange={(e) => onChangeCampaign(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
              >
                <option value="">
                  {isEn
                    ? "General Content (No Campaign)"
                    : "Genel İçerik (Kampanya Bağlantısız)"}
                </option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(metadataPanel === "labels" || metadataPanel === "more") && (
            <div className="space-y-1.5">
              <label
                htmlFor="tag_input"
                className="text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                {isEn ? "Tags (Optional)" : "Etiketler (Opsiyonel)"}
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(t)}
                      className="text-amber-600 hover:text-amber-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  id="tag_input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  onBlur={handleAddTag}
                  placeholder={
                    isEn ? "Type a tag, press Enter..." : "Etiket yaz, Enter'a bas..."
                  }
                  className="min-w-[140px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import type { GeneratedDrafts, LaunchPlatform } from "@/lib/ai/generateDrafts";
import type { HookAnalysisResult } from "@/lib/ai/analyzePostHookAndVirality";
import type { BrandVoiceConsistency } from "@/lib/ai/getBrandVoiceConsistency";
import ContentRemixMenu from "./ContentRemixMenu";
import SmartHashtagPanel from "./SmartHashtagPanel";
import BrandGuardianBar from "./BrandGuardianBar";

interface ComposeEditorTabsProps {
  brandId: string;
  drafts: GeneratedDrafts;
  setDrafts: React.Dispatch<React.SetStateAction<GeneratedDrafts | null>>;
  activePlatformTab: LaunchPlatform;
  setActivePlatformTab: (platform: LaunchPlatform) => void;
  setPreviewPlatform: (platform: LaunchPlatform) => void;
  selectedPlatforms: LaunchPlatform[];
  hook: string;
  setHook: (hook: string) => void;
  charLimit: Record<PlatformName, number>;
  onOpenSaveTemplate: () => void;
  handleRewriteWithAI: () => void;
  rewriting: boolean;
  handleGenerateHashtags: () => void;
  generatingHashtags: boolean;
  hashtagSuggestions: Record<string, string[]>;
  toggleCaptionHashtag: (tag: string) => void;
  extractHashtags: (text: string) => string[];
  aiInsightsOpen: boolean;
  setAiInsightsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  hookAnalysis: HookAnalysisResult | null;
  voiceConsistency: BrandVoiceConsistency | null;
  voiceCheckedEmpty: boolean;
  analyzingHook: boolean;
  handleAnalyzeHook: () => void;
  hookError: string | null;
  applyHook: (hook: string) => void;
  applyOptimizedCaption: (caption: string) => void;
  analyzingVoice: boolean;
  handleCheckVoiceConsistency: () => void;
  onOpenCaptionLab: () => void;
  isEn: boolean;
}

export default function ComposeEditorTabs({
  brandId,
  drafts,
  setDrafts,
  activePlatformTab,
  setActivePlatformTab,
  setPreviewPlatform,
  selectedPlatforms,
  hook,
  setHook,
  charLimit,
  onOpenSaveTemplate,
  handleRewriteWithAI,
  rewriting,
  handleGenerateHashtags,
  generatingHashtags,
  hashtagSuggestions,
  toggleCaptionHashtag,
  extractHashtags,
  aiInsightsOpen,
  setAiInsightsOpen,
  hookAnalysis,
  voiceConsistency,
  voiceCheckedEmpty,
  analyzingHook,
  handleAnalyzeHook,
  hookError,
  applyHook,
  applyOptimizedCaption,
  analyzingVoice,
  handleCheckVoiceConsistency,
  onOpenCaptionLab,
  isEn,
}: ComposeEditorTabsProps) {
  const currentCaption = drafts[activePlatformTab] ?? "";

  return (
    <div className="pt-4 border-t border-slate-100 space-y-5">
      {/* 2-Second Hook Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="hook_input"
          className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <span>🪝</span>
            <span>{isEn ? "2-Second Hook (Pattern Interrupt)" : "2 Saniyelik Açılış Kancası (Hook)"}</span>
          </span>
          <span className="text-[10px] font-medium text-slate-400 normal-case">
            {isEn ? "The first line that stops the scroll" : "Akışı durduran ilk dikkat çekici cümle"}
          </span>
        </label>
        <input
          id="hook_input"
          type="text"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          placeholder={
            isEn
              ? "e.g. Most marketers get this completely backwards..."
              : "Örn: Çoğu işletmenin sosyal medyada yaptığı en büyük hata..."
          }
          className="w-full rounded-xl border border-amber-200/80 bg-amber-50/40 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-amber-400 focus:bg-white focus:outline-none transition shadow-2xs"
        />
      </div>

      {/* Platform Tabs & Caption Box */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isEn ? "Platform Captions" : "Platform Gönderi Metinleri"}
          </label>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={onOpenSaveTemplate}
              disabled={!currentCaption.trim()}
              className="text-[11px] font-semibold text-slate-500 hover:text-violet-700 transition disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer"
            >
              {isEn ? "💾 Save as Template" : "💾 Şablon Olarak Kaydet"}
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              {currentCaption.length} / {charLimit[activePlatformTab] ?? 2000}{" "}
              {isEn ? "chars" : "karakter"}
            </span>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
          {selectedPlatforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setActivePlatformTab(p);
                setPreviewPlatform(p);
              }}
              className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activePlatformTab === p
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <PlatformIcon name={p} className="h-3.5 w-3.5" />
              <span>{platformLabel(p)}</span>
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={currentCaption}
            onChange={(e) =>
              setDrafts((prev) =>
                prev ? { ...prev, [activePlatformTab]: e.target.value } : prev
              )
            }
            rows={7}
            placeholder={
              isEn
                ? "Write your social post caption here or test variants in Caption Lab..."
                : "Gönderi metninizi buraya yazın veya Caption Lab ile varyantlar üretin..."
            }
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition shadow-2xs"
          />
        </div>

        {/* Live AI Brand Guardian Bar */}
        <BrandGuardianBar
          brandId={brandId}
          caption={currentCaption}
          platform={activePlatformTab}
          onUpdateCaption={(newCaption) => {
            setDrafts((prev) =>
              prev ? { ...prev, [activePlatformTab]: newCaption } : prev
            );
          }}
          isEn={isEn}
        />

        {/* Action Toolbar */}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {/* Star Hero Button: Caption Lab */}
          <button
            type="button"
            onClick={onOpenCaptionLab}
            disabled={!currentCaption.trim()}
            className="relative group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 p-[1px] shadow-sm hover:shadow-md hover:shadow-violet-500/20 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="flex items-center gap-1.5 rounded-[11px] bg-white px-3.5 py-1.5 text-[11px] font-extrabold text-violet-700 group-hover:bg-violet-50/50 transition">
              <span className="text-sm">🧪</span>
              <span>{isEn ? "Caption Lab (3 A/B Variants)" : "Caption Lab (3 A/B Varyantı)"}</span>
              <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-black text-violet-800">
                PRO
              </span>
            </span>
          </button>

          {/* Content Remix DJ Menu */}
          <ContentRemixMenu
            brandId={brandId}
            currentCaption={currentCaption}
            activePlatform={activePlatformTab}
            onApplyRemix={(newCaption) => {
              setDrafts((prev) =>
                prev ? { ...prev, [activePlatformTab]: newCaption } : prev
              );
            }}
            isEn={isEn}
          />

          {/* Compact Inline Smart Hashtag Engine */}
          <SmartHashtagPanel
            brandId={brandId}
            caption={currentCaption}
            platform={activePlatformTab}
            onUpdateCaption={(newCaption) => {
              setDrafts((prev) =>
                prev ? { ...prev, [activePlatformTab]: newCaption } : prev
              );
            }}
            isEn={isEn}
          />
        </div>
      </div>

      {/* Unified Caption Lab™ & AI Intelligence Hub */}
      <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/30 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Hub Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
              <span className="text-base">🧪</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black tracking-tight text-slate-900">
                  Caption Lab<span className="text-violet-600">™</span> & Kanca Merkezi
                </h4>
                {hookAnalysis && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-800 border border-emerald-200">
                    ⚡ {hookAnalysis.score}/100
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? "Algorithmic hook power, 3-variant simulation, and brand voice alignment."
                  : "Sosyal medya viralite skoru, 3-varyant simülasyonu ve marka sesi uyumu."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick launch modal */}
            <button
              type="button"
              onClick={onOpenCaptionLab}
              disabled={!currentCaption.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1.5 text-xs font-black text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 transition cursor-pointer disabled:opacity-40"
            >
              <span>{isEn ? "Launch Lab 🚀" : "3 Varyantı Aç 🚀"}</span>
            </button>

            {/* Toggle inline details */}
            <button
              type="button"
              onClick={() => setAiInsightsOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
              title={aiInsightsOpen ? "Daralt" : "Genişlet"}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  aiInsightsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded Inline Hub Section */}
        {aiInsightsOpen && (
          <div className="space-y-4 pt-2 border-t border-violet-100/80 animate-in fade-in duration-200">
            {/* Hook & Virality Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🪝</span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {isEn ? "AI Hook & Virality Score" : "Hızlı Kanca & Viralite Skoru"}
                  </span>
                </div>

                {!hookAnalysis && (
                  <button
                    type="button"
                    onClick={handleAnalyzeHook}
                    disabled={analyzingHook || !currentCaption.trim()}
                    className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    {analyzingHook
                      ? isEn
                        ? "Evaluating..."
                        : "Puanlanıyor..."
                      : isEn
                      ? "✨ Score Hook Strength"
                      : "✨ Kanca Gücünü Puanla"}
                  </button>
                )}
              </div>

              {analyzingHook && (
                <div className="flex items-center gap-2 text-xs text-violet-700 font-semibold py-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                  <span>
                    {isEn
                      ? "Analyzing scroll-stopping strength against social algorithms..."
                      : "Açılış kancası sosyal medya algoritmalarına göre taranıyor..."}
                  </span>
                </div>
              )}

              {hookError && !analyzingHook && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
                  {hookError}
                </p>
              )}

              {hookAnalysis && (
                <div className="space-y-3 pt-1">
                  {/* Score badge and critique */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-800 shadow-2xs">
                        {isEn ? "Score:" : "Puan:"}{" "}
                        <span
                          className={
                            hookAnalysis.score >= 80 ? "text-emerald-600" : "text-amber-600"
                          }
                        >
                          {hookAnalysis.score}/100
                        </span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {hookAnalysis.score >= 80
                          ? isEn
                            ? "High viral potential"
                            : "Yüksek akış durdurma gücü"
                          : isEn
                          ? "Can be improved with a stronger question or curiosity gap"
                          : "Bir soru veya merak kancasıyla geliştirilebilir"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAnalyzeHook}
                      disabled={analyzingHook}
                      className="text-xs font-bold text-violet-700 hover:underline cursor-pointer"
                    >
                      {isEn ? "Re-evaluate" : "Tekrar Puanla"}
                    </button>
                  </div>

                  {/* Critique Callout */}
                  <div className="rounded-xl border-l-4 border-l-violet-500 bg-violet-50/50 p-3 text-xs text-slate-700">
                    <p className="italic leading-relaxed">&ldquo;{hookAnalysis.critique}&rdquo;</p>
                  </div>

                  {/* Alternative Hooks */}
                  {hookAnalysis.alternativeHooks.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {isEn
                          ? "Alternative Opening Hooks (Apply with 1 Click):"
                          : "Alternatif Açılış Kancaları (Tek Tıkla Uygula):"}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {[...hookAnalysis.alternativeHooks]
                          .sort((a, b) => b.stopScore - a.stopScore)
                          .map((altHook, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => applyHook(altHook.text)}
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 text-left text-xs font-medium text-slate-800 hover:border-violet-300 hover:bg-violet-50/40 transition group cursor-pointer shadow-2xs"
                            >
                              <span className="truncate font-semibold text-slate-800">
                                💡 &ldquo;{altHook.text}&rdquo;
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`rounded-lg px-2 py-0.5 font-mono text-[11px] font-black ${
                                    altHook.stopScore >= 80
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                                >
                                  %{altHook.stopScore}
                                </span>
                                <span className="text-xs font-black text-violet-700 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
                                  {isEn ? "Use →" : "Kullan →"}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Full optimized caption apply */}
                  <button
                    type="button"
                    onClick={() => applyOptimizedCaption(hookAnalysis.optimizedCaption)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-violet-700 hover:text-violet-900 hover:underline cursor-pointer pt-1"
                  >
                    <span>✓</span>
                    <span>
                      {isEn
                        ? "Replace Entire Caption with Optimized Version"
                        : "Tüm Metni Optimize Edilmiş Haliyle Değiştir"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Brand Voice Consistency Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {isEn ? "Brand Voice Consistency" : "Marka Sesi Tutarlılığı"}
                  </span>
                </div>

                {!voiceConsistency && (
                  <button
                    type="button"
                    onClick={handleCheckVoiceConsistency}
                    disabled={analyzingVoice || !currentCaption.trim()}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    {analyzingVoice
                      ? isEn
                        ? "Measuring..."
                        : "Ölçülüyor..."
                      : isEn
                      ? "✨ Check Brand Voice"
                      : "✨ Marka Sesini Ölç"}
                  </button>
                )}
              </div>

              {analyzingVoice && (
                <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold py-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  <span>
                    {isEn
                      ? "Comparing against your published post history..."
                      : "Markanızın geçmiş yayınları ve tonu taranıyor..."}
                  </span>
                </div>
              )}

              {voiceCheckedEmpty && !analyzingVoice && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isEn
                    ? "Not enough published history yet (at least 5 real posts required) — this feature will automatically activate as your brand publishes content."
                    : "Henüz yeterli yayınlanmış geçmiş yok (en az 5 gerçek gönderi gerekiyor) — bu özellik markanız gerçek içerik yayınladıkça kendiliğinden aktif olacak."}
                </p>
              )}

              {voiceConsistency && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <span className="flex items-center gap-2 font-mono text-xs font-black text-slate-900">
                    <span>{isEn ? "Alignment:" : "Marka Uyumu:"}</span>
                    <span
                      className={
                        voiceConsistency.score >= 70 ? "text-emerald-600" : "text-amber-600"
                      }
                    >
                      %{voiceConsistency.score}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isEn
                      ? `compared with ${voiceConsistency.sampleSize} published posts`
                      : `${voiceConsistency.sampleSize} yayınlanmış gönderiyle karşılaştırıldı`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

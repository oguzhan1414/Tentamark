"use client";

import type { LaunchPlatform } from "@/lib/ai/generateDrafts";

interface ComposeIdeaSectionProps {
  mode: "manual" | "ai";
  setMode: (mode: "manual" | "ai") => void;
  aiPanelOpen: boolean;
  setAiPanelOpen: (open: boolean) => void;
  prepareManualDrafts: () => void;
  selectedPlatforms: LaunchPlatform[];
  idea: string;
  setIdea: (idea: string) => void;
  founderName: string | null;
  brandName: string;
  voiceMode: "brand" | "founder";
  setVoiceMode: (mode: "brand" | "founder") => void;
  toneOptions: { id: string; label: string; desc: string }[];
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  suggestionDismissed: boolean;
  setSuggestionDismissed: (dismissed: boolean) => void;
  suggestionOpen: boolean;
  setSuggestionOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  suggestingIdea: boolean;
  suggestedIdea: string | null;
  retryIdeaSuggestion: () => void;
  useSuggestedIdea: () => void;
  ideaExamplesOpen: boolean;
  setIdeaExamplesOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  ideaChips: string[];
  woocommerceConnected: boolean;
  onOpenProductPicker: () => void;
  onGenerate: () => void;
  generating: boolean;
  genError: string | null;
  onOpenMultiplier?: () => void;
  isEn: boolean;
}

export default function ComposeIdeaSection({
  mode,
  setMode,
  aiPanelOpen,
  setAiPanelOpen,
  prepareManualDrafts,
  selectedPlatforms,
  idea,
  setIdea,
  founderName,
  brandName,
  voiceMode,
  setVoiceMode,
  toneOptions,
  selectedTone,
  setSelectedTone,
  suggestionDismissed,
  setSuggestionDismissed,
  suggestionOpen,
  setSuggestionOpen,
  suggestingIdea,
  suggestedIdea,
  retryIdeaSuggestion,
  useSuggestedIdea,
  ideaExamplesOpen,
  setIdeaExamplesOpen,
  ideaChips,
  woocommerceConnected,
  onOpenProductPicker,
  onGenerate,
  generating,
  genError,
  onOpenMultiplier,
  isEn,
}: ComposeIdeaSectionProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={() => {
            setMode("ai");
            setAiPanelOpen(true);
          }}
          aria-expanded={aiPanelOpen}
          className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition"
        >
          ✨ Generative AI
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("manual");
            setAiPanelOpen(false);
            prepareManualDrafts();
          }}
          disabled={selectedPlatforms.length === 0}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
        >
          {isEn ? "Write manually" : "Manuel yaz"}
        </button>
        <span className="text-[11px] text-slate-400">
          {isEn ? "Choose how to start your post" : "Gönderine nasıl başlayacağını seç"}
        </span>
      </div>

      {mode === "ai" && aiPanelOpen && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center p-4"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setAiPanelOpen(false);
            }
          }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setAiPanelOpen(false)}
            aria-label={isEn ? "Close AI panel" : "AI penceresini kapat"}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Generative AI"
            className="relative z-10 max-h-[min(680px,calc(100dvh-32px))] w-full max-w-[480px] space-y-4 overflow-y-auto rounded-2xl border border-violet-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">✨ Generative AI</h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {isEn
                    ? "Describe your idea and generate editable posts for each account."
                    : "Fikrini anlat, her hesap için düzenlenebilir metinler üret."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiPanelOpen(false)}
                aria-label={isEn ? "Close AI panel" : "AI penceresini kapat"}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {founderName && (
              <button
                type="button"
                onClick={() => setVoiceMode(voiceMode === "brand" ? "founder" : "brand")}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                {voiceMode === "founder" ? founderName : brandName} ↔
              </button>
            )}

            <div className="flex flex-wrap gap-1.5">
              {toneOptions.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone.id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    selectedTone === tone.id
                      ? "border-violet-400 bg-white text-violet-800"
                      : "border-slate-200 bg-white/70 text-slate-500"
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>

            {/* Proactive AI Idea Suggestion */}
            {!suggestionDismissed && !idea.trim() && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setSuggestionOpen((prev) => !prev)}
                  aria-expanded={suggestionOpen}
                  className="flex w-full items-center justify-between text-left text-xs font-semibold text-blue-800 cursor-pointer"
                >
                  <span>
                    {isEn ? "✦ A post idea for your brand" : "✦ Markanız için bir içerik fikri"}
                  </span>
                  <span>{suggestionOpen ? "⌃" : "⌄"}</span>
                </button>
                {suggestionOpen && (
                  <div className="space-y-2 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        {isEn ? "⚡ Our AI generated an idea" : "⚡ Yapay zekamız bir fikir üretti"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSuggestionDismissed(true)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label={isEn ? "Dismiss" : "Kapat"}
                      >
                        ✕
                      </button>
                    </div>
                    {suggestingIdea ? (
                      <p className="text-xs text-slate-600">
                        {isEn
                          ? "Thinking of an idea tailored to your brand..."
                          : "Markanıza uygun bir fikir düşünüyor..."}
                      </p>
                    ) : suggestedIdea ? (
                      <>
                        <p className="text-xs font-medium text-slate-900">{suggestedIdea}</p>
                        <div className="flex items-center gap-3 pt-0.5">
                          <button
                            type="button"
                            onClick={retryIdeaSuggestion}
                            className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            {isEn ? "Try again" : "Tekrar dene"}
                          </button>
                          <button
                            type="button"
                            onClick={useSuggestedIdea}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                          >
                            {isEn ? "✓ Accept" : "✓ Kabul et"}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Topic / Idea Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="idea_input"
                  className="text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  {isEn
                    ? "What would you like to post about?"
                    : "Ne hakkında paylaşım yapmak istiyorsunuz?"}
                </label>
                <span className="text-[11px] text-slate-400">
                  {idea.length} {isEn ? "characters" : "karakter"}
                </span>
              </div>
              <textarea
                id="idea_input"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={
                  isEn
                    ? "e.g. Announcement of our new sustainable linen shirt collection. Highlight natural cotton texture, breathable fabric for summer, and elegant minimal design..."
                    : "Örn: Yeni sürdürülebilir keten gömlek koleksiyonumuzun duyurusu. Doğal pamuk dokusu, sıcak yaz günlerinde nefes alan yapı ve şık minimal tasarım vurgulansın..."
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />

              <div className="space-y-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIdeaExamplesOpen((prev) => !prev)}
                    aria-expanded={ideaExamplesOpen}
                    className="text-[11px] font-semibold text-slate-500 hover:text-blue-700 cursor-pointer"
                  >
                    {isEn ? "Need inspiration?" : "Örnek konular"}{" "}
                    {ideaExamplesOpen ? "⌃" : "⌄"}
                  </button>
                  {woocommerceConnected && (
                    <button
                      type="button"
                      onClick={onOpenProductPicker}
                      className="rounded-lg border border-[#96588A]/30 bg-[#96588A]/5 px-2.5 py-1 text-[11px] font-medium text-[#96588A] hover:bg-[#96588A]/10 transition cursor-pointer"
                    >
                      {isEn ? "WooCommerce product" : "WooCommerce ürünü"}
                    </button>
                  )}
                </div>
                {ideaExamplesOpen && (
                  <div className="flex flex-wrap gap-1.5">
                    {ideaChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setIdea(chip)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700 transition cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onGenerate}
                disabled={!idea.trim() || selectedPlatforms.length === 0 || generating}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition cursor-pointer"
              >
                {generating
                  ? isEn
                    ? "Generating..."
                    : "Üretiliyor..."
                  : isEn
                  ? "Generate posts"
                  : "Gönderileri üret"}
              </button>
              {onOpenMultiplier && (
                <button
                  type="button"
                  onClick={() => {
                    setAiPanelOpen(false);
                    onOpenMultiplier();
                  }}
                  disabled={!idea.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition cursor-pointer whitespace-nowrap"
                  title={isEn ? "Multiply into 7 platform formats" : "7 platform formatına çoğalt"}
                >
                  <span>⚡</span>
                  <span>{isEn ? "1 → 7 Multiplier" : "1 → 7 Çarpan"}</span>
                </button>
              )}
            </div>
            {genError && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                {genError}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

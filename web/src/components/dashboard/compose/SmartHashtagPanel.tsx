"use client";

import { useState } from "react";
import { generateSmartHashtags } from "@/lib/ai/generateSmartHashtags";

interface SmartHashtagPanelProps {
  brandId: string;
  caption: string;
  platform: string;
  onUpdateCaption: (newCaption: string) => void;
  isEn: boolean;
}

export default function SmartHashtagPanel({
  brandId,
  caption,
  platform,
  onUpdateCaption,
  isEn,
}: SmartHashtagPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!caption.trim() || loading) return;
    setLoading(true);
    setError(null);
    setIsOpen(true);
    try {
      const res = await generateSmartHashtags({
        brandId,
        caption,
        platform,
        isEn,
      });
      setTags(res.suggestedTags || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
          ? "Could not generate hashtags."
          : "Hashtag üretilemedi."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    if (tags.length === 0) return;
    const tagsString = tags.join(" ");
    const trimmed = caption.trim();
    const separator = trimmed.length > 0 ? (trimmed.endsWith("\n") ? "\n" : "\n\n") : "";
    onUpdateCaption(trimmed + separator + tagsString);
    setIsOpen(false);
  }

  return (
    <>
      {/* Trigger Button in Action Toolbar */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !caption.trim()}
        title={isEn ? "Generate smart hashtags" : "Akıllı hashtag üret"}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[11px] font-bold transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? "border-violet-300 bg-violet-50 text-violet-800 ring-2 ring-violet-100"
            : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/40 hover:text-violet-700"
        }`}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        ) : (
          <span className="text-sm">#️⃣</span>
        )}
        <span>
          {loading
            ? isEn
              ? "Generating hashtags..."
              : "Hashtagler üretiliyor..."
            : isEn
            ? "Generate hashtags"
            : "Hashtag Üret"}
        </span>
      </button>

      {error && (
        <span className="text-[11px] font-semibold text-rose-600 animate-in fade-in duration-150">
          {error}
        </span>
      )}

      {/* Sleek, Compact Inline Hashtag Box (Exact match with modern UX) */}
      {isOpen && (
        <div className="basis-full w-full rounded-2xl border border-dashed border-violet-300 bg-violet-50/40 p-3.5 space-y-2.5 transition animate-in fade-in zoom-in-95 duration-150 shadow-2xs mt-1">
          {/* Top Pill & Close Button */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-violet-300 bg-white px-2.5 py-0.5 text-[10.5px] font-bold text-violet-700 shadow-2xs">
              <span>#</span>
              <span>{isEn ? "Generate hashtags" : "Önerilen Hashtag'ler"}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              title={isEn ? "Dismiss" : "Kapat"}
            >
              ✕
            </button>
          </div>

          {/* Body: Space-separated tags string */}
          {loading ? (
            <div className="flex items-center gap-2 py-2 text-xs font-medium text-slate-500">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
              <span>
                {isEn
                  ? "Analyzing post context and selecting ideal hashtags..."
                  : "Gönderi analiz ediliyor ve en uygun hashtag'ler seçiliyor..."}
              </span>
            </div>
          ) : tags.length > 0 ? (
            <div className="py-1">
              <p className="text-xs font-semibold leading-relaxed text-slate-800 select-all tracking-wide">
                {tags.join(" ")}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              {isEn ? "No hashtags generated." : "Hashtag bulunamadı."}
            </p>
          )}

          {/* Bottom Actions Bar */}
          {!loading && tags.length > 0 && (
            <div className="flex items-center justify-between border-t border-violet-100/80 pt-2">
              <span className="text-[10.5px] text-slate-400">
                {isEn
                  ? `${tags.length} tags tailored for ${platform}`
                  : `${platform} için seçilmiş ${tags.length} etiket`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-2.5 py-1 text-xs font-semibold text-violet-700 hover:text-violet-900 transition cursor-pointer"
                >
                  {isEn ? "Retry" : "Yeniden Dene"}
                </button>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer active:scale-[0.98]"
                >
                  <span>✓</span>
                  <span>{isEn ? "Add" : "Ekle"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

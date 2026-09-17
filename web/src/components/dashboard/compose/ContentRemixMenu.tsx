"use client";

import { useState, useRef, useEffect } from "react";
import {
  REMIX_OPTIONS,
  type RemixTone,
  type RemixOption,
} from "@/lib/ai/remixConstants";
import { remixContent } from "@/lib/ai/remixContent";

interface ContentRemixMenuProps {
  brandId: string;
  currentCaption: string;
  activePlatform: string;
  onApplyRemix: (newCaption: string) => void;
  isEn: boolean;
}

export default function ContentRemixMenu({
  brandId,
  currentCaption,
  activePlatform,
  onApplyRemix,
  isEn,
}: ContentRemixMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [remixingTone, setRemixingTone] = useState<RemixTone | null>(null);
  const [previousCaption, setPreviousCaption] = useState<string | null>(null);
  const [appliedTone, setAppliedTone] = useState<RemixTone | null>(null);
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  async function handleSelectTone(option: RemixOption) {
    if (!currentCaption.trim() || remixingTone) return;

    // Backup current text for instant undo
    setPreviousCaption(currentCaption);
    setRemixingTone(option.id);
    setError(null);

    try {
      const result = await remixContent({
        brandId,
        content: currentCaption,
        tone: option.id,
        platform: activePlatform,
        isEn,
      });

      onApplyRemix(result.rewritten);
      setAppliedTone(option.id);
      setIsOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEn
          ? "Failed to remix."
          : "Remixlenemedi."
      );
    } finally {
      setRemixingTone(null);
    }
  }

  function handleUndo() {
    if (previousCaption !== null) {
      onApplyRemix(previousCaption);
      setPreviousCaption(null);
      setAppliedTone(null);
    }
  }

  const isBusy = remixingTone !== null;

  return (
    <div className="relative inline-flex items-center gap-2" ref={menuRef}>
      {/* Remix DJ Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isBusy || !currentCaption.trim()}
        title={isEn ? "Remix with different tones" : "Farklı üslup ve tonlarda yeniden kurgula"}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[11px] font-bold transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? "border-violet-300 bg-violet-50 text-violet-800 ring-2 ring-violet-100"
            : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/40 hover:text-violet-700"
        }`}
      >
        {isBusy ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        ) : (
          <span className="text-sm">🔀</span>
        )}
        <span>
          {isBusy
            ? isEn
              ? "Remixing..."
              : "Remixleniyor..."
            : isEn
            ? "Content Remix DJ"
            : "Remixle (Ton Değiştir)"}
        </span>
        <span className="text-[9px] text-slate-400">▼</span>
      </button>

      {/* Undo Button (Visible if remix was applied) */}
      {previousCaption !== null && (
        <button
          type="button"
          onClick={handleUndo}
          title={isEn ? "Revert to original text" : "Remix öncesi orijinal metne geri dön"}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer shadow-2xs animate-in fade-in slide-in-from-left-1 duration-150"
        >
          <span>↩️</span>
          <span>{isEn ? "Undo Remix" : "Orijinale Dön"}</span>
        </button>
      )}

      {/* Applied Tone Badge */}
      {appliedTone && previousCaption !== null && (
        <span className="hidden items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:inline-flex animate-in fade-in duration-150">
          <span>✓</span>
          <span>
            {REMIX_OPTIONS.find((o) => o.id === appliedTone)?.label ?? appliedTone}
          </span>
        </span>
      )}

      {/* Error Message Tooltip */}
      {error && (
        <span className="text-[10px] font-bold text-rose-600 animate-in fade-in duration-150">
          {error}
        </span>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-40 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-xs">
                🔀
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isEn ? "Content Remix DJ" : "Content Remix DJ"}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isEn
                    ? "Select an angle to transform your copy"
                    : "Metninizi tek tıkla hedef üsluba dönüştürün"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Tone Option Cards */}
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
            {REMIX_OPTIONS.map((opt) => {
              const active = remixingTone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectTone(opt)}
                  disabled={isBusy}
                  className={`w-full text-left rounded-xl border p-2.5 transition flex items-start gap-2.5 cursor-pointer ${
                    active
                      ? "border-violet-400 bg-violet-50/70"
                      : "border-slate-100 bg-slate-50/40 hover:border-violet-200 hover:bg-violet-50/30"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs text-sm">
                    {active ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                    ) : (
                      opt.icon
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {isEn ? opt.labelEn : opt.label}
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                      {isEn ? opt.descriptionEn : opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          <div className="mt-2 border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>{isEn ? "Tip: You can always undo with ↩️" : "İpucu: Orijinale dönmek için ↩️'ye basabilirsiniz"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

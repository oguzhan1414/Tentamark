"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  scanCaptionForBrandIssues,
  normalizeWordList,
  type BrandGuardianIssue,
} from "@/lib/ai/brandGuardianTypes";
import { fixBrandSafetyIssues } from "@/lib/ai/guardBrandContent";

interface BrandGuardianBarProps {
  brandId: string;
  caption: string;
  platform?: string;
  onUpdateCaption: (newCaption: string) => void;
  isEn?: boolean;
}

export default function BrandGuardianBar({
  brandId,
  caption,
  platform = "instagram",
  onUpdateCaption,
  isEn = false,
}: BrandGuardianBarProps) {
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [toneOfVoice, setToneOfVoice] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Undo & Fix State
  const [isPending, startTransition] = useTransition();
  const [lastFixUndo, setLastFixUndo] = useState<{
    original: string;
    summary: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Brand DNA once on mount or when brandId changes
  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function loadBrandDna() {
      try {
        const { data } = await supabase
          .from("brand_dna")
          .select("forbidden_words, competitors, tone_of_voice")
          .eq("brand_id", brandId)
          .maybeSingle();

        if (ignore) return;

        if (data) {
          setForbiddenWords(normalizeWordList(data.forbidden_words));
          setCompetitors(normalizeWordList(data.competitors));
          setToneOfVoice(data.tone_of_voice || null);
        }
      } catch (err) {
        console.warn("[BrandGuardianBar] Failed to load brand DNA:", err);
      } finally {
        if (!ignore) setLoaded(true);
      }
    }

    loadBrandDna();
    return () => {
      ignore = true;
    };
  }, [brandId]);

  // Live scan issues as user types (0ms client-side)
  const issues = useMemo<BrandGuardianIssue[]>(() => {
    return scanCaptionForBrandIssues(caption, forbiddenWords, competitors);
  }, [caption, forbiddenWords, competitors]);

  // 1-Click AI Fix Action
  const handleFixIssues = () => {
    if (issues.length === 0 || isPending) return;
    setErrorMessage(null);

    const flaggedWords = Array.from(new Set(issues.map((i) => i.word)));
    const originalCaption = caption;

    startTransition(async () => {
      try {
        const res = await fixBrandSafetyIssues({
          brandId,
          caption,
          flaggedWords,
          toneOfVoice: toneOfVoice || undefined,
          platform,
          isEn,
        });

        setLastFixUndo({
          original: originalCaption,
          summary: res.changesSummary,
        });
        onUpdateCaption(res.fixedCaption);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Düzeltme yapılamadı.";
        setErrorMessage(msg);
      }
    });
  };

  const handleUndo = () => {
    if (!lastFixUndo) return;
    onUpdateCaption(lastFixUndo.original);
    setLastFixUndo(null);
  };

  if (!loaded) return null;

  // If caption is empty and no recent undo, show nothing or minimal indicator
  if (!caption.trim() && !lastFixUndo) {
    return null;
  }

  return (
    <div className="space-y-1.5 transition-all">
      {/* 1. Violation Warning Bar */}
      {issues.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-amber-300 bg-amber-50/90 px-3 py-2 text-xs shadow-2xs animate-fadeIn">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-sm">⚠️</span>
            <span className="font-bold text-amber-900">
              {isEn ? "Brand Guardian Warning:" : "Marka Uyarısı:"}
            </span>
            <div className="inline-flex flex-wrap items-center gap-1">
              {issues.map((issue, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    issue.type === "competitor"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-amber-100 text-amber-900 border border-amber-300 line-through decoration-amber-600"
                  }`}
                  title={
                    issue.type === "competitor"
                      ? isEn
                        ? "Competitor brand name"
                        : "Rakip marka ismi"
                      : issue.type === "default_guardrail"
                      ? isEn
                        ? "High-risk marketing cliché / misleading claim"
                        : "Klişe veya yanıltıcı vaat riski taşıyan ifade"
                      : isEn
                      ? "Forbidden in brand guidelines"
                      : "Marka rehberinde yasaklı kelime"
                  }
                >
                  &ldquo;{issue.word}&rdquo;
                  {issue.type === "competitor" && (
                    <span className="text-[9px] font-extrabold uppercase text-rose-600">
                      ({isEn ? "Competitor" : "Rakip"})
                    </span>
                  )}
                  {issue.type === "default_guardrail" && (
                    <span className="text-[9px] font-bold text-amber-700">
                      ({isEn ? "Risk" : "Riskli"})
                    </span>
                  )}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-amber-800 hidden sm:inline">
              {issues.some((i) => i.type === "competitor")
                ? isEn
                  ? "detected in post."
                  : "metinde tespit edildi."
                : isEn
                ? "violates brand safety guidelines."
                : "tespit edildi."}
            </span>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFixIssues}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1 text-xs font-black text-white hover:bg-amber-700 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{isEn ? "Securing..." : "Çevriliyor..."}</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>
                    {isEn ? "Convert to Safe Alternative" : "Güvenli Alternatife Çevir"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. Success / Undo Banner */}
      {lastFixUndo && issues.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50/90 px-3 py-1.5 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <span className="font-semibold">
              {lastFixUndo.summary ||
                (isEn
                  ? "Replaced with brand-safe alternatives!"
                  : "Yasaklı ifadeler güvenli marka alternatifleriyle değiştirildi!")}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2 py-0.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
          >
            <span>↩️</span>
            <span>{isEn ? "Undo" : "Geri Al"}</span>
          </button>
        </div>
      )}

      {/* 3. Clean State Indicator (Subtle & Compact) */}
      {issues.length === 0 && !lastFixUndo && caption.trim().length > 5 && (
        <div className="flex items-center justify-between px-1 py-0.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            </span>
            <span className="text-emerald-700 font-bold">
              {isEn ? "Brand Guardian:" : "Marka Uyumu:"}
            </span>
            <span className="text-slate-600">
              {isEn ? "Clean ✓" : "Temiz ✓"}
            </span>
            <span
              className="text-[10px] text-slate-400 hidden sm:inline cursor-help"
              title={
                forbiddenWords.length > 0
                  ? `Özel Yasaklılar: ${forbiddenWords.join(", ")}`
                  : "Temel pazarlama emniyet filtreleri devrede"
              }
            >
              (
              {forbiddenWords.length > 0
                ? isEn
                  ? `${forbiddenWords.length} custom + standard guardrails monitored`
                  : `${forbiddenWords.length} özel + temel emniyet filtresi devrede`
                : isEn
                ? "Standard safety filters active"
                : "Temel emniyet filtresi devrede"}
              )
            </span>
          </div>

          <Link
            href="/dashboard/brand"
            className="text-[10px] font-semibold text-slate-400 hover:text-violet-600 transition"
            title={
              isEn
                ? "Configure forbidden words in Brand DNA"
                : "Marka DNA'sında yasaklı kelimeleri yönet"
            }
          >
            {isEn ? "⚙️ Manage Guidelines" : "⚙️ Marka Rehberi"}
          </Link>
        </div>
      )}

      {/* Error message if any */}
      {errorMessage && (
        <div className="text-[11px] font-medium text-rose-600 px-1">
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
}

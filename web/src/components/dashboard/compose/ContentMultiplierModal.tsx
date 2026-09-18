"use client";

import React, { useState } from "react";
import {
  HiOutlineSparkles,
  HiOutlineXMark,
  HiCheck,
  HiOutlineClipboardDocument,
  HiOutlineArrowRight,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaTiktok,
  FaFacebook,
  FaPinterestP,
  FaThreads,
} from "react-icons/fa6";
import { multiplyContent, type MultipliedContentResult } from "@/lib/ai/multiplyContent";
import type { GeneratedDrafts, LaunchPlatform } from "@/lib/ai/generateDrafts";

interface ContentMultiplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  initialText: string;
  onApplyAll: (multipliedDrafts: GeneratedDrafts, selectedPlatforms: LaunchPlatform[]) => void;
  onApplySingle: (platform: LaunchPlatform, text: string) => void;
  isEn?: boolean;
}

type MultiplierTabKey =
  | "instagram_carousel"
  | "linkedin_post"
  | "twitter_thread"
  | "tiktok_script"
  | "facebook_post"
  | "threads_post"
  | "pinterest_pin";

export default function ContentMultiplierModal({
  isOpen,
  onClose,
  brandId,
  initialText,
  onApplyAll,
  onApplySingle,
  isEn = false,
}: ContentMultiplierModalProps) {
  const [sourceText, setSourceText] = useState(initialText || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultipliedContentResult | null>(null);
  const [activeTab, setActiveTab] = useState<MultiplierTabKey>("instagram_carousel");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await multiplyContent(brandId, sourceText);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isEn ? "Generation failed." : "Çoğaltma işlemi başarısız oldu."));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyAllClick = () => {
    if (!result) return;
    const { formats } = result;

    const draftsToApply: GeneratedDrafts = {
      instagram: [formats.instagram_carousel.caption, formats.instagram_carousel.hashtags.join(" ")].filter(Boolean).join("\n\n"),
      linkedin: formats.linkedin_post.fullText,
      tiktok: formats.tiktok_script.caption,
      facebook: formats.facebook_post.fullText,
      threads: formats.threads_post.fullText,
      pinterest: formats.pinterest_pin.fullText,
    };

    const platformsToSelect: LaunchPlatform[] = [
      "instagram",
      "linkedin",
      "tiktok",
      "facebook",
      "threads",
      "pinterest",
    ];

    onApplyAll(draftsToApply, platformsToSelect);
    onClose();
  };

  const tabsConfig = [
    {
      key: "instagram_carousel" as MultiplierTabKey,
      label: "Instagram Carousel",
      icon: FaInstagram,
      color: "text-pink-600 bg-pink-50 border-pink-200",
      badge: isEn ? "5 Slides + Hook" : "5 Slayt + Kanca",
    },
    {
      key: "linkedin_post" as MultiplierTabKey,
      label: "LinkedIn B2B",
      icon: FaLinkedinIn,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      badge: isEn ? "Thought Leadership" : "Liderlik Dili",
    },
    {
      key: "twitter_thread" as MultiplierTabKey,
      label: "X (Twitter) Thread",
      icon: FaXTwitter,
      color: "text-stone-900 bg-stone-100 border-stone-200",
      badge: isEn ? "3-4 Tweets" : "3-4 Tweet Dizisi",
    },
    {
      key: "tiktok_script" as MultiplierTabKey,
      label: "TikTok / Reels",
      icon: FaTiktok,
      color: "text-stone-900 bg-stone-100 border-stone-200",
      badge: isEn ? "Video Script" : "Video Senaryosu",
    },
    {
      key: "facebook_post" as MultiplierTabKey,
      label: "Facebook",
      icon: FaFacebook,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      badge: isEn ? "Community" : "Topluluk",
    },
    {
      key: "threads_post" as MultiplierTabKey,
      label: "Threads",
      icon: FaThreads,
      color: "text-stone-800 bg-stone-100 border-stone-200",
      badge: isEn ? "Micro-post" : "Mikro-gönderi",
    },
    {
      key: "pinterest_pin" as MultiplierTabKey,
      label: "Pinterest",
      icon: FaPinterestP,
      color: "text-red-600 bg-red-50 border-red-200",
      badge: isEn ? "SEO Pin" : "SEO Açıklaması",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
              <HiOutlineSparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>{isEn ? "1 → 7 Content Multiplier" : "1 → 7 İçerik Çarpanı"}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  AI Multi-Channel
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEn
                  ? "Transform a single thought into 7 tailored platform formats with one click."
                  : "Tek bir fikri veya taslağı tek tıkla 7 farklı platformun kültürüne uyarlayın."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Source Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>📝</span>
                <span>{isEn ? "Source Content / Idea" : "Kaynak İçerik / Temel Fikir"}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {sourceText.length} {isEn ? "chars" : "karakter"}
              </span>
            </div>

            <textarea
              rows={3}
              value={sourceText}
              onChange={(e) => { setSourceText(e.target.value); setResult(null); }}
              maxLength={10000}
              placeholder={
                isEn
                  ? "Type your core idea, announcement, tip, or paste an existing draft here..."
                  : "Dönüştürmek istediğiniz ana fikri, duyuruyu, ipucunu veya taslak metninizi buraya yazın..."
              }
              className="w-full text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-400">
                💡 {isEn ? "Pro tip: AI will adapt tone, length, hooks, and hashtags for each network." : "İpucu: AI her ağ için kanca, uzunluk, emoji ve etiketleri otomatik optimize eder."}
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !sourceText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEn ? "Multiplying into 7 formats..." : "7 Formata Çoğaltılıyor..."}</span>
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-3.5 h-3.5" />
                    <span>{result ? (isEn ? "Regenerate 7 Formats" : "Yeniden Çoğalt") : (isEn ? "Multiply into 7 Formats" : "7 Formata Çoğalt")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
              {/* Platform Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {tabsConfig.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                        isActive
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold transition ${
                          isActive
                            ? "bg-slate-800 text-slate-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Preview Box */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 relative">
                {/* 1. Instagram Carousel Details */}
                {activeTab === "instagram_carousel" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <FaInstagram className="text-pink-600 w-4 h-4" />
                        <span>Instagram Carousel Önizleme</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.formats.instagram_carousel.fullText, "ig")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "ig" ? <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboardDocument className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "ig" ? "Kopyalandı" : "Metni Kopyala"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                      {result.formats.instagram_carousel.slides.map((s) => (
                        <div
                          key={s.slideNumber}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1"
                        >
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                            Slayt {s.slideNumber}
                          </div>
                          <div className="text-xs font-bold text-slate-900">{s.title}</div>
                          <div className="text-[11px] text-slate-600 leading-relaxed">{s.content}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Açıklama & Hashtagler:</div>
                      <p className="whitespace-pre-wrap">{result.formats.instagram_carousel.caption}</p>
                      <div className="text-[11px] text-orange-600 font-medium">{result.formats.instagram_carousel.hashtags.join(" ")}</div>
                    </div>
                  </div>
                )}

                {/* 2. LinkedIn Post */}
                {activeTab === "linkedin_post" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <FaLinkedinIn className="text-blue-600 w-4 h-4" />
                        <span>LinkedIn B2B Post Önizleme</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.formats.linkedin_post.fullText, "li")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "li" ? <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboardDocument className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "li" ? "Kopyalandı" : "Metni Kopyala"}</span>
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-800">
                      <div className="font-extrabold text-slate-900 text-sm border-l-2 border-blue-600 pl-2.5">
                        {result.formats.linkedin_post.hook}
                      </div>
                      <div className="whitespace-pre-wrap text-slate-700">
                        {result.formats.linkedin_post.body}
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-blue-700 font-semibold">
                        👉 {result.formats.linkedin_post.cta}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. X (Twitter) Thread */}
                {activeTab === "twitter_thread" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <FaXTwitter className="text-stone-900 w-4 h-4" />
                        <span>X (Twitter) Thread Zinciri ({result.formats.twitter_thread.tweets.length} Tweet)</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.formats.twitter_thread.fullText, "tw")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "tw" ? <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboardDocument className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "tw" ? "Kopyalandı" : "Tümünü Kopyala"}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {result.formats.twitter_thread.tweets.map((t, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs relative pl-8"
                        >
                          <span className="absolute left-2.5 top-3 w-4 h-4 rounded-full bg-stone-100 border border-stone-200 text-[10px] font-bold text-stone-600 flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="whitespace-pre-wrap">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. TikTok / Reels Script */}
                {activeTab === "tiktok_script" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <FaTiktok className="text-stone-900 w-4 h-4" />
                        <span>TikTok & Reels Video Senaryosu</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.formats.tiktok_script.fullText, "tt")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "tt" ? <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboardDocument className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "tt" ? "Kopyalandı" : "Senaryoyu Kopyala"}</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                          🎬 Görsel Kanca (İlk 0-3 Saniye / Ekranda Yazacak Metin)
                        </span>
                        <p className="text-slate-900 font-semibold">{result.formats.tiktok_script.visualHook}</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                          🎙️ Konuşma Metni (Voiceover / Tempolu Anlatım)
                        </span>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {result.formats.tiktok_script.spokenScript}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                          👉 Bitiş Eylemi & CTA (Son 5 Saniye)
                        </span>
                        <p className="text-slate-900 font-semibold">{result.formats.tiktok_script.cta}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Facebook Post */}
                {activeTab === "facebook_post" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <FaFacebook className="text-blue-700 w-4 h-4" />
                        <span>Facebook Gönderisi</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.formats.facebook_post.fullText, "fb")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "fb" ? <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboardDocument className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "fb" ? "Kopyalandı" : "Metni Kopyala"}</span>
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {result.formats.facebook_post.fullText}
                    </div>
                  </div>
                )}

                {/* 6. Threads */}
                {activeTab === "threads_post" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <FaThreads className="text-stone-800 w-4 h-4" />
                        <span>Threads / Bluesky Mikro-Gönderi</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.formats.threads_post.fullText, "thr")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "thr" ? <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboardDocument className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "thr" ? "Kopyalandı" : "Metni Kopyala"}</span>
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {result.formats.threads_post.fullText}
                    </div>
                  </div>
                )}

                {/* 7. Pinterest Pin */}
                {activeTab === "pinterest_pin" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <FaPinterestP className="text-red-600 w-4 h-4" />
                        <span>Pinterest SEO Pin Açıklaması</span>
                      </span>
                      <button
                        onClick={() => handleCopy(result.formats.pinterest_pin.fullText, "pin")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "pin" ? <HiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <HiOutlineClipboardDocument className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "pin" ? "Kopyalandı" : "Metni Kopyala"}</span>
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-800">
                      <div className="font-extrabold text-slate-900 text-sm">
                        📌 {result.formats.pinterest_pin.title}
                      </div>
                      <div className="pt-2 border-t border-slate-100 whitespace-pre-wrap text-slate-700 leading-relaxed">
                        {result.formats.pinterest_pin.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {isEn
                  ? "X is available to copy. Carousel slides and video scripts are creative briefs; add images or a video before publishing."
                  : "X zincirini kopyalayabilirsiniz. Carousel slaytları ve video senaryosu üretim taslağıdır; yayınlamadan önce görsel veya video ekleyin."}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            {isEn ? "Close" : "Kapat"}
          </button>

          {result && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  let targetPlatform: LaunchPlatform = "instagram";
                  let textToApply = "";
                  if (activeTab === "twitter_thread") {
                    handleCopy(result.formats.twitter_thread.fullText, "tw");
                    return;
                  }
                  if (activeTab === "instagram_carousel") {
                    targetPlatform = "instagram";
                    textToApply = [result.formats.instagram_carousel.caption, result.formats.instagram_carousel.hashtags.join(" ")].filter(Boolean).join("\n\n");
                  } else if (activeTab === "linkedin_post") {
                    targetPlatform = "linkedin";
                    textToApply = result.formats.linkedin_post.fullText;
                  } else if (activeTab === "tiktok_script") {
                    targetPlatform = "tiktok";
                    textToApply = result.formats.tiktok_script.caption;
                  } else if (activeTab === "facebook_post") {
                    targetPlatform = "facebook";
                    textToApply = result.formats.facebook_post.fullText;
                  } else if (activeTab === "threads_post") {
                    targetPlatform = "threads";
                    textToApply = result.formats.threads_post.fullText;
                  } else if (activeTab === "pinterest_pin") {
                    targetPlatform = "pinterest";
                    textToApply = result.formats.pinterest_pin.fullText;
                  }

                  onApplySingle(targetPlatform, textToApply);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                {activeTab === "twitter_thread"
                  ? isEn
                    ? "Copy X thread"
                    : "X zincirini kopyala"
                  : isEn
                  ? "Apply This Tab Only"
                  : "Sadece Bu Sekmeyi Aktar"}
              </button>

              <button
                type="button"
                onClick={handleApplyAllClick}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? "Apply 6 Drafts" : "6 Taslağı Aktar"}</span>
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

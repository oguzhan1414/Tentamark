"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineArrowPath,
} from "react-icons/hi2";

type ComparisonTab = "scheduler" | "ai_generator" | "tentamark";

interface ComparisonItem {
  id: ComparisonTab;
  tabLabel: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  summary: string;
  responsibilities: {
    feature: string;
    status: "yes" | "no" | "partial";
    actor: string;
  }[];
  finalVerdict: string;
  colorBorder: string;
}

const COMPARISONS: Record<ComparisonTab, ComparisonItem> = {
  scheduler: {
    id: "scheduler",
    tabLabel: "Klasik Zamanlayıcılar (Scheduler)",
    badge: "Eski Nesil",
    badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
    tagline: "İçeriği siz hazırlarsınız. Sistem sadece saatinde yayınlar.",
    summary:
      "Buffer, Hootsuite veya Later gibi geleneksel araçlar sadece takvime gönderi yerleştirmeye yarar. Strateji, metin yazımı, kanca üretimi ve analiz yükünün tamamı yine sizin üzerinizde kalır.",
    responsibilities: [
      { feature: "Marka Kimliği & DNA Tanıma", status: "no", actor: "Siz (Araç bilmez)" },
      { feature: "Aylık/Haftalık Strateji Kurma", status: "no", actor: "Siz" },
      { feature: "Kanca & Viralite Metin Üretimi", status: "no", actor: "Siz" },
      { feature: "Platformlara Özel Formatlama", status: "no", actor: "Siz" },
      { feature: "Otomatik Takvime Göre Yayınlama", status: "yes", actor: "Araç Yapar" },
      { feature: "Sonuçlardan Öğrenip Strateji Güncelleme", status: "no", actor: "Desteklenmiyor" },
    ],
    finalVerdict: "İş yükünüzün %85'i hala omzunuzdadır.",
    colorBorder: "border-slate-200",
  },
  ai_generator: {
    id: "ai_generator",
    tabLabel: "Standart AI Metin Yazıcılar",
    badge: "Eksik Halka",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    tagline: "İçeriği AI üretir. Strateji ve dağıtım size kalır.",
    summary:
      "ChatGPT veya Jasper tek başına bir pazarlama ekibi değildir. Marka bağlamınızdan kopuk, genel metinler üretir. Bu metinleri kopyalayıp görseller bulmanız, revize etmeniz ve sosyal medyada elle paylaşmanız gerekir.",
    responsibilities: [
      { feature: "Marka Kimliği & DNA Tanıma", status: "partial", actor: "Her seferinde prompt gerekir" },
      { feature: "Aylık/Haftalık Strateji Kurma", status: "no", actor: "Siz" },
      { feature: "Kanca & Viralite Metin Üretimi", status: "partial", actor: "Genel ve ruhsuz kalır" },
      { feature: "Platformlara Özel Formatlama", status: "partial", actor: "Manuel yönlendirme gerekir" },
      { feature: "Otomatik Takvime Göre Yayınlama", status: "no", actor: "Kopyala-yapıştır gerekir" },
      { feature: "Sonuçlardan Öğrenip Strateji Güncelleme", status: "no", actor: "Performansı göremez" },
    ],
    finalVerdict: "İyi bir metin asistanı; ama pazarlama yöneticiniz değil.",
    colorBorder: "border-slate-200",
  },
  tentamark: {
    id: "tentamark",
    tabLabel: "Tentamark AI Marketing Manager",
    badge: "Yeni Nesil Otonom Model",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    tagline: "Markanızı öğrenir. Strateji kurar. Üretir, yayınlar ve öğrenir.",
    summary:
      "Tentamark web sitenizi tarayarak marka ses tonunuzu ve kurallarınızı hafızasına alır. Hedef kitlenizin saatlerine göre platforma özel kancalı içerikler üretir, takvime dizer ve algoritma performansına göre her hafta stratejinizi geliştirir.",
    responsibilities: [
      { feature: "Marka Kimliği & DNA Tanıma", status: "yes", actor: "Otonom Web Tarama & Hafıza" },
      { feature: "Aylık/Haftalık Strateji Kurma", status: "yes", actor: "İçerik Direkleri & Kitle Analizi" },
      { feature: "Kanca & Viralite Metin Üretimi", status: "yes", actor: "Platform Algoritmasına Özel" },
      { feature: "Platformlara Özel Formatlama", status: "yes", actor: "Instagram, LinkedIn, TikTok vb." },
      { feature: "Otomatik Takvime Göre Yayınlama", status: "yes", actor: "Onay Masası & Zamanlayıcı" },
      { feature: "Sonuçlardan Öğrenip Strateji Güncelleme", status: "yes", actor: "7/24 Öğrenme & AI Teşhisi" },
    ],
    finalVerdict: "Tek bir ekranda tam teşekküllü sosyal medya büyüme departmanı.",
    colorBorder: "border-[#FA5252]/40 ring-1 ring-[#FA5252]/20",
  },
};

const LOOP_STEPS = [
  { step: "01", title: "Marka DNA", desc: "Web tarama & ses tonu" },
  { step: "02", title: "Strateji", desc: "Kitle & direk dağılımı" },
  { step: "03", title: "İçerik", desc: "Kancalar & caption'lar" },
  { step: "04", title: "Yayınlama", desc: "Takvim & onay masası" },
  { step: "05", title: "Analiz", desc: "Sağlık skoru & rakipler" },
  { step: "06", title: "Öğrenme", desc: "Her hafta daha akıllı" },
];

export default function WhyUsInteractiveSection() {
  const [activeTab, setActiveTab] = useState<ComparisonTab>("tentamark");
  const current = COMPARISONS[activeTab];

  return (
    <section id="neden-biz" className="px-4 py-24 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-700">
            <span>Farkımız</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Neden <span className="text-[#FA5252]">Tentamark</span>?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Piyasadaki araçlar genellikle ya sadece yayınlar ya da sadece metin üretir. Tentamark ise tüm süreci birleştiren otonom bir büyüme yöneticisidir.
          </p>
        </div>

        {/* 3 Interactive Category Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {(Object.keys(COMPARISONS) as ComparisonTab[]).map((key) => {
            const item = COMPARISONS[key];
            const isSelected = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15 scale-[1.02]"
                    : "border border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {item.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Interactive Comparison Card */}
        <div className={`mt-8 rounded-3xl border ${current.colorBorder} bg-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-950/5 transition-all`}>
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${current.badgeColor}`}>
                  {current.badge}
                </span>
                <span className="text-xs font-bold text-slate-900">{current.tabLabel}</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                &ldquo;{current.tagline}&rdquo;
              </h3>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nihai Karar</span>
              <span className="text-xs font-bold text-slate-800">{current.finalVerdict}</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {current.summary}
          </p>

          {/* Responsibility Table / Breakdown */}
          <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden">
            {current.responsibilities.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 text-xs sm:text-sm bg-white hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      r.status === "yes"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "partial"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {r.status === "yes" ? "✓" : r.status === "partial" ? "!" : "✕"}
                  </span>
                  <span className="font-semibold text-slate-800">{r.feature}</span>
                </div>
                <span
                  className={`text-xs font-bold font-mono ${
                    r.status === "yes"
                      ? "text-emerald-700"
                      : r.status === "partial"
                      ? "text-amber-700"
                      : "text-slate-400"
                  }`}
                >
                  {r.actor}
                </span>
              </div>
            ))}
          </div>

          {/* If Tentamark is active, show the 6-step loop graphic */}
          {activeTab === "tentamark" && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineArrowPath className="h-4 w-4 text-[#FA5252] animate-spin-slow" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Sürekli Gelişen 6 Aşamalı Otonom Döngü
                  </h4>
                </div>
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                  Her hafta daha iyi içerik üretir
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {LOOP_STEPS.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center space-y-1 hover:border-rose-200 transition"
                  >
                    <span className="font-mono text-[10px] font-bold text-rose-600">{step.step}</span>
                    <h5 className="font-display text-xs font-bold text-slate-900">{step.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-tight">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Sosyal medya operasyonunuzu otonom ve akıllı bir sisteme emanet etmek ister misiniz?
            </span>
            <Link
              href="/kayit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm shrink-0"
            >
              <span>Tentamark ile Başla</span>
              <HiOutlineArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

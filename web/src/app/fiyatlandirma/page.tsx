"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PlatformIcon from "@/components/PlatformIcon";
import {
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineBuildingOffice2,
  HiOutlineUserGroup,
  HiOutlineCloudArrowUp,
  HiOutlineChevronDown,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineStar,
  HiOutlineRocketLaunch,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

function PricingContent() {
  const { t, locale } = useLanguage();
  const p = (source: keyof typeof t.pricingText) => t.pricingText[source];
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [starterWorkspaces, setStarterWorkspaces] = useState<number>(1);
  const [proWorkspaces, setProWorkspaces] = useState<number>(2);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Fiyat Hesaplamaları
  const isAnnual = billingCycle === "annual";
  const starterBase = isAnnual ? 23 : 29;
  const proBase = isAnnual ? 39 : 49;

  const starterTotal = starterBase * starterWorkspaces;
  const proTotal = proBase * proWorkspaces;

  const proSavings = (49 - 39) * proWorkspaces * 12;

  const FAQS = t.pages.pricingFaq;

  return (
      <div className="flex min-h-screen flex-col bg-[#FAF9F7] text-ink selection:bg-[#FA5252] selection:text-white">
        <SiteHeader />

        <main className="flex-1">
          <div className="mx-auto mt-24 max-w-6xl rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
            {locale === "en"
              ? "Plan details shown here are in development. Paid checkout and the advertised trial are not active yet; confirm current access and limits before relying on a listed feature."
              : "Buradaki paket ayrıntıları geliştirme aşamasındadır. Ücretli ödeme ve belirtilen deneme süresi henüz aktif değildir; bir özelliğe güvenmeden önce güncel erişim ve sınırları doğrulayın."}
          </div>
          {/* ================= HERO SECTION ================= */}
          <section className="relative overflow-hidden pt-12 pb-10 sm:pt-16 sm:pb-12">
            {/* Arka plan geometrik desen & atmosferik ambient */}
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D6CEE5_1px,transparent_1px)] [background-size:24px_24px] opacity-45"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-200/40 via-rose-100/40 to-amber-100/40 blur-[130px]"
              aria-hidden="true"
            />

            <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-[0.14em] text-slate-600 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-[#FA5252] animate-pulse" />
                {p("Şeffaf Workspace Fiyatlandırması · Koltuk Ücreti $0")}
              </div>

              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {p("Kişi başı sürpriz fatura yok.")} <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#172B46] to-[#FA5252] bg-clip-text text-transparent">
                  {p("Sadece Çalışma Alanı kadar ödeyin.")}
                </span>
              </h1>

              <p className="mt-4 font-body text-base leading-relaxed text-slate-600 sm:text-lg max-w-2xl mx-auto">
                {p("Her marka için 1 Çalışma Alanı (Workspace). Ekibinize veya müşterilerinize sınırsız davet gönderin, kişi başı ekstra $10-$20 ödemeyin.")}
              </p>

              {/* Faturalandırma Döngüsü Toggle (Aylık vs Yıllık -%20) */}
              <div className="mt-8 inline-flex items-center rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    billingCycle === "monthly"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p("Aylık Faturalandırma")}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annual")}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    billingCycle === "annual"
                      ? "bg-[#FA5252] text-white shadow-md shadow-[#FA5252]/30"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{p("Yıllık Faturalandırma")}</span>
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                    {p("%20 Tasarruf")}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* ================= 4 TIER PRICING CARDS (KART İÇİ WORKSPACE SAYACI) ================= */}
          <section className="relative px-4 pb-20 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                
                {/* ---------------- 1. FREE TIER (KEŞİF & TEST) ---------------- */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-sm opacity-60" />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-emerald-100 border border-emerald-200/90 text-emerald-700 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_3px_10px_-2px_rgba(16,185,129,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <HiOutlineSparkles className="h-6 w-6 stroke-[2.2]" />
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-mono text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        {p("🌱 Keşif & Test")}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">
                      {p("Ücretsiz")}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 min-h-[36px] leading-relaxed">
                      {p("Sıfır riskle Tentamark yapay zeka hızını ve Brand DNA motorunu deneyimleyin.")}
                    </p>

                    {/* Fiyat Alanı */}
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-extrabold text-slate-900">$0</span>
                        <span className="text-xs text-slate-500 font-medium">{p("/ ömür boyu")}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-emerald-700 font-semibold">{p("1 Çalışma Alanı dahil · Koltuk ücreti $0")}</p>
                    </div>

                    {/* Kart İçi Sabit Workspace Kutusu */}
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-slate-800">{p("Çalışma Alanı")}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{p("Tek marka veya proje")}</span>
                        </div>
                        <span className="rounded-xl border border-emerald-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-emerald-800 shadow-2xs">
                          {p("1 Alan (Sabit)")}
                        </span>
                      </div>
                      <div className="mt-2 border-t border-emerald-100/80 pt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{p("Ömür boyu $0")}</span>
                        <span className="font-bold text-emerald-700">{p("Sınırsız kullanıcı")}</span>
                      </div>
                    </div>

                    {/* Özellik Listesi */}
                    <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-700 font-medium">
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("1 Çalışma Alanı")}</strong> {p("(Tek Marka)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("Sınırsız Kullanıcı")}</strong> {p("Daveti ($0)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("15 AI Gönderisi")}</strong> {p("/ ay")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("2 Sosyal Hesap")}</strong> {p("(Instagram, X)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Brand DNA (Web Sitesi Tarama)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Görsel Takvim & Akış Önizleme")}</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-400">
                        <HiOutlineXMark className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{p("3x3 Canlı Instagram Izgara Planlayıcı")}</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-400">
                        <HiOutlineXMark className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{p("Dikey Video & Reels Stüdyosu")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Link
                      href="/kayit"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 text-center text-xs sm:text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 shadow-xs"
                    >
                      {p("Ücretsiz Başla")}
                    </Link>
                  </div>
                </div>

                {/* ---------------- 2. STARTER TIER (KART İÇİ WORKSPACE SAYACI) ---------------- */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-sky-200/90 bg-gradient-to-b from-sky-50/30 via-white to-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-sky-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-2xl bg-sky-500/20 blur-sm opacity-60" />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-sky-50 to-sky-100 border border-sky-200/90 text-sky-700 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_3px_10px_-2px_rgba(14,165,233,0.15)] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                          <HiOutlineRocketLaunch className="h-6 w-6 stroke-[2.2]" />
                        </div>
                      </div>
                      <span className="rounded-full bg-sky-50 border border-sky-200 px-3 py-1 font-mono text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                        {p("🚀 Büyüyen Markalar")}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">
                      {p("Starter")}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 min-h-[36px] leading-relaxed">
                      {p("Sosyal medyada düzenli, tutarlı ve otonom büyümek isteyen tekil işletmeler.")}
                    </p>

                    {/* Fiyat Alanı */}
                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-extrabold text-slate-900">${starterTotal}</span>
                        <span className="text-xs text-slate-500 font-medium">{p("/ay")}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {isAnnual ? `Yıllık faturalandırılır ($${starterBase * starterWorkspaces * 12}/yıl)` : "Aylık faturalandırma"}
                      </p>
                    </div>

                    {/* KART İÇİNDE GÖMÜLÜ WORKSPACE SEÇİCİ */}
                    <div className="mt-4 rounded-2xl border border-sky-200/80 bg-sky-50/50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-slate-800">{p("Çalışma Alanı")}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{p("Kaç marka hesabı?")}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-white p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setStarterWorkspaces(Math.max(1, starterWorkspaces - 1))}
                            disabled={starterWorkspaces <= 1}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                            aria-label="Azalt"
                          >
                            <HiOutlineMinus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[28px] text-center font-display text-sm font-black text-sky-700">
                            {starterWorkspaces}
                          </span>
                          <button
                            type="button"
                            onClick={() => setStarterWorkspaces(Math.min(10, starterWorkspaces + 1))}
                            disabled={starterWorkspaces >= 10}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                            aria-label="Artır"
                          >
                            <HiOutlinePlus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-sky-100/80 pt-1.5 text-[11px]">
                        <span className="text-slate-500 font-medium">{p("Alan başı: $")}{starterBase}{p("/ay")}</span>
                        <span className="font-bold text-sky-800">{p("Sınırsız koltuk $0")}</span>
                      </div>
                    </div>

                    {/* Özellik Listesi */}
                    <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-700 font-medium">
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{starterWorkspaces} {p("Çalışma Alanı")}</strong> {p("dahil")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("Sınırsız Kullanıcı & Koltuk ($0)")}</strong></span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{60 * starterWorkspaces} {p("AI Gönderisi")}</strong> {p("/ ay")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{4 * starterWorkspaces} {p("Sosyal Hesap")}</strong> {p("(4/alan)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Tam Brand DNA & Renk/Logo Belleği")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("2 Aşamalı Onay Akışı (Ekip + Yönetici)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Telefonsuz Otonom Bulut Yayın")}</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-400">
                        <HiOutlineXMark className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{p("3x3 Canlı Instagram Izgara Planlayıcı")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Link
                      href="/kayit?plan=starter"
                      className="block w-full rounded-xl bg-sky-600 py-2.5 text-center text-xs sm:text-sm font-bold text-white transition hover:bg-sky-700 shadow-md shadow-sky-500/20"
                    >
                      {p("14 Gün Ücretsiz Dene")}
                    </Link>
                  </div>
                </div>

                {/* ---------------- 3. PRO TIER (AMİRAL GEMİSİ & KART İÇİ WORKSPACE SAYACI) ---------------- */}
                <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#FA5252] bg-gradient-to-b from-[#FFF7F8] via-white to-white p-6 sm:p-7 shadow-2xl shadow-rose-500/15 transition-all duration-300 hover:scale-[1.02] xl:-mt-3 xl:mb-[-12px]">
                  {/* Glowing Backlight */}
                  <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-24 w-48 rounded-full bg-[#FA5252]/20 blur-2xl" />

                  {/* En Popüler Rozeti */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FA5252] via-[#FF6B6B] to-[#FA5252] px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-[#FA5252]/30 whitespace-nowrap">
                    {p("✦ EN ÇOK TERCİH EDİLEN")}
                  </div>

                  <div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-2xl bg-[#FA5252]/25 blur-sm opacity-80" />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FA5252] via-[#ff5c5c] to-[#e03131] border border-rose-300/80 text-white shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.4),0_4px_14px_-2px_rgba(250,82,82,0.35)] ring-4 ring-rose-100/90 hover:scale-110 hover:rotate-3 transition-all duration-300">
                          <HiOutlineStar className="h-6 w-6 stroke-[2.2]" />
                        </div>
                      </div>
                      <span className="rounded-full bg-rose-100 border border-rose-300 px-3 py-1 font-mono text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                        {p("👑 Çok Kanallı & Ajans")}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">
                      {p("Pro")}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 min-h-[36px] leading-relaxed">
                      {p("Birden fazla kanalda tam gaz büyüyen markalar ve portföy yöneten butik ajanslar.")}
                    </p>

                    {/* Fiyat Alanı */}
                    <div className="mt-5 border-t border-rose-100 pt-5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-extrabold text-slate-900">${proTotal}</span>
                        <span className="text-xs text-slate-500 font-medium">{p("/ay")}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {isAnnual ? `Yıllık faturalandırılır ($${proBase * proWorkspaces * 12}/yıl)` : "Aylık faturalandırma"}
                      </p>
                    </div>

                    {/* KART İÇİNDE GÖMÜLÜ WORKSPACE SEÇİCİ */}
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-slate-900">{p("Çalışma Alanı")}</span>
                          <span className="text-[10px] text-rose-600/80 font-medium">{p("Kaç marka veya müşteri?")}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-white p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setProWorkspaces(Math.max(1, proWorkspaces - 1))}
                            disabled={proWorkspaces <= 1}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#FA5252] hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                            aria-label="Azalt"
                          >
                            <HiOutlineMinus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[28px] text-center font-display text-sm font-black text-[#FA5252]">
                            {proWorkspaces}
                          </span>
                          <button
                            type="button"
                            onClick={() => setProWorkspaces(Math.min(30, proWorkspaces + 1))}
                            disabled={proWorkspaces >= 30}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#FA5252] hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                            aria-label="Artır"
                          >
                            <HiOutlinePlus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-rose-200/60 pt-1.5 text-[11px]">
                        <span className="text-slate-600 font-medium">{p("Alan başı: $")}{proBase}{p("/ay")}</span>
                        {isAnnual && proWorkspaces > 1 ? (
                          <span className="font-bold text-emerald-700">{p("Yılda $")}{proSavings} {p("kâr")}</span>
                        ) : (
                          <span className="font-bold text-[#FA5252]">{p("Sınırsız koltuk & müşteri")}</span>
                        )}
                      </div>
                    </div>

                    {/* Özellik Listesi */}
                    <div className="mt-6 border-t border-rose-100 pt-5 space-y-3 text-xs text-slate-800 font-semibold">
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span><strong>{proWorkspaces} {p("Çalışma Alanı")}</strong> {p("dahil")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("Sınırsız Kullanıcı & Müşteri Daveti")}</strong></span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span><strong>{150 * proWorkspaces} {p("AI Gönderisi")}</strong> {p("/ ay")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span><strong>{10 * proWorkspaces} {p("Sosyal Hesap")}</strong> {p("(10/alan)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span className="text-[#FA5252]">{p("3x3 Canlı Instagram Izgara Planlayıcı")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span>{p("Çok Kademeli Onay (İç Ekip + Müşteri)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span>{p("Özel Dikey Video, Reels & Karusel Stüdyosu")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span>{p("Performans → Strateji Öğrenme Döngüsü")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-[#FA5252] mt-0.5 stroke-[2.5]" />
                        <span>{p("Öncelikli Canlı Destek & WhatsApp")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-rose-100">
                    <Link
                      href="/kayit?plan=pro"
                      className="block w-full rounded-xl bg-[#FA5252] py-3 text-center text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-[#FA5252]/30 transition hover:bg-[#e03131] hover:scale-[1.02]"
                    >
                      {p("14 Gün Ücretsiz Başla →")}
                    </Link>
                  </div>
                </div>

                {/* ---------------- 4. ENTERPRISE TIER (AÇIK PRESTİJLİ & KURUMSAL) ---------------- */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/30 via-white to-slate-50/50 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-sm opacity-60" />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-indigo-50 to-indigo-100 border border-indigo-200/90 text-indigo-700 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_3px_10px_-2px_rgba(99,102,241,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <HiOutlineBuildingOffice2 className="h-6 w-6 stroke-[2.2]" />
                        </div>
                      </div>
                      <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 font-mono text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                        {p("🏢 Kurumsal & Holding")}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">
                      {p("Enterprise")}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 min-h-[36px] leading-relaxed">
                      {p("Büyük ekipler, holdingler ve ölçekli ajanslar için özel SLA, API ve güvenlik altyapısı.")}
                    </p>

                    {/* Fiyat Alanı */}
                    <div className="mt-5 border-t border-slate-200 pt-5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">{p("Özel Teklif")}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-indigo-700 font-semibold">{p("İhtiyacınıza göre esnek yapılandırma")}</p>
                    </div>

                    {/* Kart İçi Sabit Workspace Kutusu */}
                    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-indigo-950">{p("Çalışma Alanı")}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{p("Çoklu marka & holdingler")}</span>
                        </div>
                        <span className="rounded-xl border border-indigo-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-indigo-700 shadow-2xs">
                          {p("Sınırsız / Esnek")}
                        </span>
                      </div>
                      <div className="mt-2 border-t border-indigo-100/80 pt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{p("Özel hacim kotası")}</span>
                        <span className="font-bold text-indigo-700">{p("Kurumsal SLA")}</span>
                      </div>
                    </div>

                    {/* Özellik Listesi */}
                    <div className="mt-6 border-t border-slate-200 pt-5 space-y-3 text-xs text-slate-700 font-medium">
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("Sınırsız Çalışma Alanı")}</strong> {p("(Workspace)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("Sınırsız Kullanıcı & Rol İzin Matrisi")}</strong></span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span><strong>{p("Sınırsız AI Gönderisi")}</strong> {p("& Kampanya")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Özel Fine-Tuned AI Marka Modeli")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Tam REST API & Webhook Entegrasyonu")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Kurumsal SSO (SAML, Okta, Azure AD)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("Özel Müşteri Başarı Yöneticisi (CSM)")}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <HiOutlineCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5 stroke-[2.5]" />
                        <span>{p("%99.9 Uptime SLA & 1 Saat Destek")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <a
                      href="mailto:destek@tentamark.com?subject=Enterprise%20Plan%20Talebi"
                      className="block w-full rounded-xl bg-indigo-600 py-2.5 text-center text-xs sm:text-sm font-bold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                    >
                      {p("Satış Ekibiyle Görüşün")}
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ================= STANDART ÖZELLİKLER ŞERİDİ (5 ÖZELLİK, BÜYÜK VE TASARIMSAL İKONLAR) ================= */}
          <section className="border-y border-slate-200/90 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70 py-6 px-4 sm:px-8 w-full overflow-x-auto scrollbar-none shadow-2xs">
            <div className="flex items-center justify-between gap-6 sm:gap-8 min-w-max lg:min-w-0 lg:justify-around w-full">
              {/* 1. Telefonsuz Yayın */}
              <div className="group flex items-center gap-3.5 whitespace-nowrap cursor-default">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/35 opacity-40 blur-md transition-all duration-300 group-hover:opacity-90 group-hover:scale-115 group-hover:blur-lg" />
                  <div className="relative flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100/90 border border-emerald-200/90 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_4px_14px_-2px_rgba(16,185,129,0.18)] transition-all duration-300 ease-out group-hover:scale-108 group-hover:-translate-y-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_6px_rgba(16,185,129,0.08)] border border-white/90 backdrop-blur-xs transition-transform duration-300 group-hover:-rotate-6">
                      <HiOutlineCloudArrowUp className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-emerald-700 stroke-[2.2]" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 group-hover:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-900 transition-colors">
                    {p("Telefonsuz Yayın:")}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                    {p("Resmi API bulut yayını")}
                  </span>
                </div>
              </div>

              {/* Ayırıcı Çizgi */}
              <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-slate-300/80 to-transparent shrink-0" aria-hidden="true" />

              {/* 2. Kart Gerekmez */}
              <div className="group flex items-center gap-3.5 whitespace-nowrap cursor-default">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-rose-500/25 to-pink-500/35 opacity-40 blur-md transition-all duration-300 group-hover:opacity-90 group-hover:scale-115 group-hover:blur-lg" />
                  <div className="relative flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100/90 border border-rose-200/90 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_4px_14px_-2px_rgba(250,82,82,0.18)] transition-all duration-300 ease-out group-hover:scale-108 group-hover:-translate-y-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_6px_rgba(250,82,82,0.08)] border border-white/90 backdrop-blur-xs transition-transform duration-300 group-hover:rotate-6">
                      <HiOutlineCreditCard className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-[#FA5252] stroke-[2.2]" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60 group-hover:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FA5252] ring-2 ring-white" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-rose-900 transition-colors">
                    {p("Kart Gerekmez:")}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                    {p("14 gün ücretsiz deneme")}
                  </span>
                </div>
              </div>

              {/* Ayırıcı Çizgi */}
              <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-slate-300/80 to-transparent shrink-0" aria-hidden="true" />

              {/* 3. Esnek Workspace */}
              <div className="group flex items-center gap-3.5 whitespace-nowrap cursor-default">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-500/25 to-orange-500/35 opacity-40 blur-md transition-all duration-300 group-hover:opacity-90 group-hover:scale-115 group-hover:blur-lg" />
                  <div className="relative flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100/90 border border-amber-200/90 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_4px_14px_-2px_rgba(245,158,11,0.18)] transition-all duration-300 ease-out group-hover:scale-108 group-hover:-translate-y-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_6px_rgba(245,158,11,0.08)] border border-white/90 backdrop-blur-xs transition-transform duration-300 group-hover:-rotate-6">
                      <HiOutlineBuildingOffice2 className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-amber-700 stroke-[2.2]" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 group-hover:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600 ring-2 ring-white" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-amber-900 transition-colors">
                    {p("Esnek Workspace:")}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                    {p("Dilediğiniz an alan ekleyin")}
                  </span>
                </div>
              </div>

              {/* Ayırıcı Çizgi */}
              <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-slate-300/80 to-transparent shrink-0" aria-hidden="true" />

              {/* 4. Brand DNA™ */}
              <div className="group flex items-center gap-3.5 whitespace-nowrap cursor-default">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-sky-500/25 to-blue-500/35 opacity-40 blur-md transition-all duration-300 group-hover:opacity-90 group-hover:scale-115 group-hover:blur-lg" />
                  <div className="relative flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100/90 border border-sky-200/90 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_4px_14px_-2px_rgba(14,165,233,0.18)] transition-all duration-300 ease-out group-hover:scale-108 group-hover:-translate-y-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_6px_rgba(14,165,233,0.08)] border border-white/90 backdrop-blur-xs transition-transform duration-300 group-hover:rotate-6">
                      <HiOutlineSparkles className="h-5.5 w-5.5 sm:h-6 sm:w-6 text-sky-700 stroke-[2.2]" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60 group-hover:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-600 ring-2 ring-white" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-sky-900 transition-colors">
                    {p("Brand DNA™:")}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                    {p("Otomatik logo ve ton koruma")}
                  </span>
                </div>
              </div>

              {/* Ayırıcı Çizgi */}
              <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-slate-300/80 to-transparent shrink-0" aria-hidden="true" />

              {/* 5. 3x3 Grid */}
              <div className="group flex items-center gap-3.5 whitespace-nowrap cursor-default">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-fuchsia-500/25 to-purple-500/35 opacity-40 blur-md transition-all duration-300 group-hover:opacity-90 group-hover:scale-115 group-hover:blur-lg" />
                  <div className="relative flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-100 via-pink-50 to-purple-100/90 border border-fuchsia-200/90 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_4px_14px_-2px_rgba(217,70,239,0.18)] transition-all duration-300 ease-out group-hover:scale-108 group-hover:-translate-y-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_6px_rgba(217,70,239,0.08)] border border-white/90 backdrop-blur-xs transition-transform duration-300 group-hover:rotate-6">
                      <svg className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-fuchsia-700" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" />
                        <rect x="9.5" y="2.5" width="5" height="5" rx="1.2" />
                        <rect x="16.5" y="2.5" width="5" height="5" rx="1.2" />
                        <rect x="2.5" y="9.5" width="5" height="5" rx="1.2" />
                        <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" />
                        <rect x="16.5" y="9.5" width="5" height="5" rx="1.2" />
                        <rect x="2.5" y="16.5" width="5" height="5" rx="1.2" />
                        <rect x="9.5" y="16.5" width="5" height="5" rx="1.2" />
                        <rect x="16.5" y="16.5" width="5" height="5" rx="1.2" />
                      </svg>
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-60 group-hover:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-600 ring-2 ring-white" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-fuchsia-900 transition-colors">
                    {p("3x3 Grid:")}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                    {p("Instagram önizleme & onay")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SOCIALPILOT TARZI: SCROLL YAPTIKÇA KUSURSUZ ŞEKİLDE ÜSTTE KALAN STICKY KARŞILAŞTIRMA ================= */}
          <section id="karsilastirma" className="border-t border-slate-200 bg-[#FAF9F7] py-16 px-4 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                  {p("Şeffaf Özellik Matrisi")}
                </span>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
                  {p("Tüm Planların Detaylı Karşılaştırması")}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600">
                  {p("Hangi paketin operasyonunuza uygun olduğunu her detayla inceleyin.")}
                </p>
              </div>

              {/* STICKY PLAN HEADER BAR: Scroll yaptıkça navbar altına yumuşakça kilitlenir; metinleri asla kesmez */}
              <div className="sticky top-[68px] sm:top-[74px] z-30 mb-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/98 p-3 sm:p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md">
                <div className="grid grid-cols-12 items-center gap-2 text-xs">
                  {/* 1. Sütun (Features & Aylık/Yıllık Toggle) - %34 genişlik (col-span-4) */}
                  <div className="col-span-4 pl-1 sm:pl-2">
                    <span className="font-display text-xs sm:text-sm font-extrabold text-slate-900 block truncate">
                      {p("Tüm Planları Karşılaştır")}
                    </span>
                    <div className="mt-1.5 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-2.5 py-0.5 font-bold transition cursor-pointer ${
                          billingCycle === "monthly"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {p("Aylık")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("annual")}
                        className={`rounded-full px-2.5 py-0.5 font-bold transition cursor-pointer flex items-center gap-1 ${
                          billingCycle === "annual"
                            ? "bg-[#FA5252] text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <span>{p("Yıllık")}</span>
                        <span className="rounded bg-white/20 px-1 py-0.2 text-[9px] font-black text-white">
                          -%20
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Sütun (Free) - col-span-2 */}
                  <div className="col-span-2 text-center">
                    <span className="font-bold text-slate-800 block text-xs truncate">{p("Free")}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">$0</span>
                    <Link
                      href="/kayit"
                      className="mt-1 hidden sm:inline-block w-full rounded-lg border border-slate-300 bg-white py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                    >
                      {p("Ücretsiz Başla")}
                    </Link>
                  </div>

                  {/* 3. Sütun (Starter) - col-span-2 */}
                  <div className="col-span-2 text-center">
                    <span className="font-bold text-slate-800 block text-xs truncate">{p("Starter")}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">
                      ${starterTotal}<span className="text-[10px] font-normal text-slate-500">{p("/ay")}</span>
                    </span>
                    <span className="text-[9px] text-sky-700 font-medium hidden sm:block">({starterWorkspaces} {p("Alan)")}</span>
                    <Link
                      href="/kayit?plan=starter"
                      className="mt-1 hidden sm:inline-block w-full rounded-lg bg-sky-600 py-1 text-[10px] font-bold text-white hover:bg-sky-700 shadow-2xs transition"
                    >
                      {p("14 Gün Dene")}
                    </Link>
                  </div>

                  {/* 4. Sütun (Pro - Öne Çıkarılmış) - col-span-2 */}
                  <div className="col-span-2 text-center rounded-xl bg-gradient-to-b from-[#FFF0F2] to-[#FFE4E8] py-1.5 px-1 border-2 border-[#FA5252] shadow-xs">
                    <span className="hidden sm:inline-block rounded-full bg-[#FA5252] px-1.5 py-0.2 text-[8px] font-black uppercase text-white mb-0.5">
                      {p("EN POPÜLER")}
                    </span>
                    <span className="font-extrabold text-[#FA5252] block text-xs truncate">{p("Pro")}</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      ${proTotal}<span className="text-[10px] font-normal text-slate-500">{p("/ay")}</span>
                    </span>
                    <span className="text-[9px] text-[#FA5252] font-semibold hidden sm:block">({proWorkspaces} {p("Alan)")}</span>
                    <Link
                      href="/kayit?plan=pro"
                      className="mt-1 hidden sm:inline-block w-full rounded-lg bg-[#FA5252] py-1 text-[10px] font-extrabold text-white hover:bg-[#e03131] shadow-xs transition"
                    >
                      {p("Hemen Başla")}
                    </Link>
                  </div>

                  {/* 5. Sütun (Enterprise) - col-span-2 */}
                  <div className="col-span-2 text-center">
                    <span className="font-bold text-slate-800 block text-xs truncate">{p("Enterprise")}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">{p("Özel Teklif")}</span>
                    <span className="text-[9px] text-indigo-700 font-medium hidden sm:block">{p("(Sınırsız)")}</span>
                    <a
                      href="mailto:destek@tentamark.com?subject=Enterprise%20Plan%20Talebi"
                      className="mt-1 hidden sm:inline-block w-full rounded-lg bg-indigo-600 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 shadow-2xs transition"
                    >
                      {p("Görüşün")}
                    </a>
                  </div>
                </div>
              </div>

              {/* AYRIMLI VE KESİNTİSİZ TABLO (HER SATIR TAM GÖRÜNÜR, ASLA YUKARIYA KAYIP KESİLMEZ) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5">
                <table className="w-full table-fixed min-w-[760px] border-collapse text-left text-xs sm:text-sm">
                  <tbody className="divide-y divide-slate-100">

                    {/* ------------------------------------------------------------- */}
                    {/* BÖLÜM 1: ÇALIŞMA ALANI & EKİP YAPISI */}
                    {/* ------------------------------------------------------------- */}
                    <tr className="bg-slate-100/90 border-b border-slate-200">
                      <td colSpan={5} className="py-3.5 px-5">
                        <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                            <HiOutlineUserGroup className="h-4 w-4" />
                          </span>
                          <span>{p("1. Çalışma Alanı (Workspace) & Ekip Mimarisi")}</span>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 w-[34%] border-r border-slate-100">
                        {p("Dahil Çalışma Alanı (Marka)")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Kart içi sayaçtan belirlenen alan")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 w-[16.5%] border-r border-slate-100 font-medium">{p("1 Alan")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 w-[16.5%] border-r border-slate-100 font-semibold">{starterWorkspaces} {p("Alan")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] w-[16.5%] bg-rose-50/30 border-x-2 border-rose-200">{proWorkspaces} {p("Alan")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 w-[16.5%] font-semibold">{p("Sınırsız")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Kullanıcı & Koltuk Sayısı")}
                        <span className="block text-[11px] text-emerald-600 font-medium">{p("Kişi başı ekstra ücret $0")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 border-r border-slate-100">{p("Sınırsız")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 border-r border-slate-100">{p("Sınırsız")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Sınırsız")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">{p("Sınırsız")}</td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Müşteri Onay Portalı & Görünüm Rolleri")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Müşteriye özel sadeleştirilmiş onay ekranı")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("Dahil")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Gelişmiş Roller")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Özel İzin Matrisi")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Onay Kademeleri (Approval Workflows)")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Ekip içi ve müşteri onay basamakları")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("Tek Seviye")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("2 Seviye (Ekip + Yönetici)")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] bg-rose-50/30 border-x-2 border-rose-200">{p("Çok Kademeli (İç Ekip + Müşteri)")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Özel Onay İş Akışı")}</td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Marka Varlık Kütüphanesi & Depolama")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Logo, yazı tipi, görsel ve video arşivi")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("500 MB")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("5 GB / Alan")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] bg-rose-50/30 border-x-2 border-rose-200">{p("50 GB / Alan")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Sınırsız Bulut")}</td>
                    </tr>

                    {/* ------------------------------------------------------------- */}
                    {/* BÖLÜM 2: YAPAY ZEKA & ÇOK KANALLI İÇERİK ÜRETİMİ */}
                    {/* ------------------------------------------------------------- */}
                    <tr className="bg-slate-100/90 border-y border-slate-200">
                      <td colSpan={5} className="py-3.5 px-5">
                        <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-[#FA5252]">
                            <HiOutlineSparkles className="h-4 w-4" />
                          </span>
                          <span>{p("2. Yapay Zeka (AI) & İçerik Motoru")}</span>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Aylık AI Gönderi Hacmi")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Metin, görsel, kanca ve format uyarlamaları")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("15 / ay")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-semibold">{60 * starterWorkspaces} {p("/ ay")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] bg-rose-50/30 border-x-2 border-rose-200">{150 * proWorkspaces} {p("/ ay")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Sınırsız")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Brand DNA (URL Tarama & Bellek)")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Web sitenizden renk, logo, ton ve ürün öğrenimi")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("Temel Tarama")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("Tam Tarama")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Derin Öğrenme + Katalog")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Özel Fine-Tuning Modeli")}</td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Görsel Üretimi (Dall-E 3 & Flux)")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Platform oranlarına uygun görsel kurgulama")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("Standart")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("Dahil")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Öncelikli 4K Stüdyo")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Sınırsız HD Stüdyo")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Dikey Video & Reels Üretimi")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Otomatik video kancası, altyazı ve sahneleme")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Dahil (Reels & TikTok)")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Sınırsız Video Stüdyosu")}</td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Çok Kanallı Format Dönüştürme")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Tek fikirden her platforma optimize caption")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("2 Kanal")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("4 Kanal")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] bg-rose-50/30 border-x-2 border-rose-200">{p("Tüm Kanallar (10+)")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Tümü + Özel API")}</td>
                    </tr>

                    {/* ------------------------------------------------------------- */}
                    {/* BÖLÜM 3: PLANLAMA & GÖRSEL TAKVİM */}
                    {/* ------------------------------------------------------------- */}
                    <tr className="bg-slate-100/90 border-y border-slate-200">
                      <td colSpan={5} className="py-3.5 px-5">
                        <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <HiOutlineCalendarDays className="h-4 w-4" />
                          </span>
                          <span>{p("3. Planlama, Takvim & Instagram Izgara")}</span>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Akış ve Aylık Takvim Görünümü")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Haftalık ve aylık içerik matrisi")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 border-r border-slate-100">✓</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 border-r border-slate-100">✓</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">✓</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">✓</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("3x3 Instagram Canlı Izgara Planlayıcı")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Canlı profil ızgarası simülatörü ve sürükle-bırak")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("✓ (Canlı Simülasyon)")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">{p("✓ (Çoklu Izgara)")}</td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Otomatik En Uygun Saat Yayını")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Hedef kitle aktiflik analiziyle zamanlama")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("Dahil")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Algoritmik AI Saati")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Özel Tahminleme")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Toplu İçerik Planlama (Bulk Schedule)")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Tek tıkla tüm ayı doldurma")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("30 Gönderi")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] bg-rose-50/30 border-x-2 border-rose-200">{p("Sınırsız Gönderi")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Sınırsız Gönderi")}</td>
                    </tr>

                    {/* ------------------------------------------------------------- */}
                    {/* BÖLÜM 4: PLATFORMLAR & OTONOM BULUT YAYINLAMA */}
                    {/* ------------------------------------------------------------- */}
                    <tr className="bg-slate-100/90 border-y border-slate-200">
                      <td colSpan={5} className="py-3.5 px-5">
                        <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <HiOutlineCloudArrowUp className="h-4 w-4" />
                          </span>
                          <span>{p("4. Platformlar & Otonom Bulut Yayınlama")}</span>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Bağlanabilir Sosyal Hesap Sayısı")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Seçilen alan başına bağlı hesap kapasitesi")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("2 Hesap")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-semibold">{4 * starterWorkspaces} {p("Hesap (4/alan)")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] bg-rose-50/30 border-x-2 border-rose-200">{10 * proWorkspaces} {p("Hesap (10/alan)")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Sınırsız Profil")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Telefonsuz Otonom Bulut Yayınlama")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Bildirim beklemeden doğrudan resmi API yayını")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 border-r border-slate-100">✓</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 border-r border-slate-100">✓</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">✓</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">✓</td>
                    </tr>

                    {/* Desteklenen Platformlar Görsel İkon Satırı */}
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Desteklenen Platformlar")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Resmi entegre sosyal kanallar")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <PlatformIcon name="instagram" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="x" variant="tile" className="h-6 w-6" />
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-center border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <PlatformIcon name="instagram" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="facebook" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="tiktok" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="linkedin" variant="tile" className="h-6 w-6" />
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-center bg-rose-50/30 border-x-2 border-rose-200">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <PlatformIcon name="instagram" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="tiktok" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="facebook" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="linkedin" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="youtube" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="pinterest" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="threads" variant="tile" className="h-6 w-6" />
                          <PlatformIcon name="google-business" variant="tile" className="h-6 w-6" />
                        </div>
                        <span className="mt-1 block text-[10px] font-bold text-[#FA5252]">{p("Tüm 10+ Platform")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center">
                        <span className="font-display text-xs font-bold text-indigo-700 block">{p("Tüm Platformlar")}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{p("+ Özel Webhook & API")}</span>
                      </td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Otomatik İlk Yorum & Hashtag Yöneticisi")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Yorum alanına link veya etiket koyma")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("Dahil")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Dahil (Akıllı Öneri)")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">{p("Dahil")}</td>
                    </tr>

                    {/* ------------------------------------------------------------- */}
                    {/* BÖLÜM 5: ANALİTİK, GÜVENLİK & DESTEK */}
                    {/* ------------------------------------------------------------- */}
                    <tr className="bg-slate-100/90 border-y border-slate-200">
                      <td colSpan={5} className="py-3.5 px-5">
                        <div className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <HiOutlineChartBar className="h-4 w-4" />
                          </span>
                          <span>{p("5. Sosyal Analitik, Güvenlik & Destek")}</span>
                        </div>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Sosyal Sağlık Skoru (1.000 Puan Üzerinden)")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Hesabınızın büyüme ve etkileşim teşhisi")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("Temel Teşhis")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Gelişmiş Teşhis & Reçete")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Özel KPI Modelleri")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Öğrenme Döngüsü (Performans → Strateji)")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Tutan gönderileri analiz edip yeni takvimi uyarlama")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("Haftalık Özet")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-rose-50/30 border-x-2 border-rose-200">{p("Otomatik Plan Güncelleme")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Özel Kurumsal Raporlama")}</td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Müşteri Desteği & İletişim Kanalları")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Teknik destek yanıt süresi ve kanallar")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-600 border-r border-slate-100">{p("Topluluk")}</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 border-r border-slate-100 font-medium">{p("E-posta (24 saat)")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-[#FA5252] bg-rose-50/30 border-x-2 border-rose-200">{p("Öncelikli Canlı Destek")}</td>
                      <td className="p-4 sm:p-5 text-center text-indigo-700 font-semibold">{p("Özel CSM + 1s SLA")}</td>
                    </tr>

                    <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("SSO (SAML, Okta, Azure AD) Girişi")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Kurumsal kimlik doğrulama altyapısı")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 bg-rose-50/30 border-x-2 border-rose-200">—</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">{p("Dahil")}</td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-slate-800 border-r border-slate-100">
                        {p("Özel REST API & Webhook Erişimi")}
                        <span className="block text-[11px] text-slate-400 font-normal">{p("Kendi sistemlerinize veya Zapier/Make bağlantısı")}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-400 border-r border-slate-100">—</td>
                      <td className="p-4 sm:p-5 text-center text-slate-700 bg-rose-50/30 border-x-2 border-rose-200 font-medium">{p("Zapier / Make")}</td>
                      <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">{p("Tam REST API")}</td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ================= SIKÇA SORULAN SORULAR ================= */}
          <section className="py-16 px-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                  {p("Şeffaf Yanıtlar")}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                  {p("Fiyatlandırma Hakkında Merak Edilenler")}
                </h2>
              </div>

              <div className="mt-8 space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={faq.q}
                      className="rounded-2xl border border-slate-200/90 bg-white transition shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-display text-sm sm:text-base font-bold text-slate-900 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <HiOutlineChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                            isOpen ? "rotate-180 text-[#FA5252]" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100 px-4 sm:px-5 pb-5 pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= DÖNÜŞÜM ODAKLI SON CTA ================= */}
          <section className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/50 py-16 px-4 sm:px-6 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {p("Sosyal medyanızı otonom büyütmeye hazır mısınız?")}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {p("14 gün boyunca kredi kartı gerekmeden Pro özelliklerini test edin; farkı ilk haftada görün.")}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/kayit"
                  className="w-full sm:w-auto rounded-full bg-[#FA5252] px-8 py-3 text-sm font-bold text-white shadow-md shadow-[#FA5252]/25 transition hover:bg-[#e03131] hover:scale-[1.02]"
                >
                  {p("14 Gün Ücretsiz Başlayın →")}
                </Link>
                <a
                  href="mailto:destek@tentamark.com?subject=Tentamark%20Demo%20Talebi"
                  className="w-full sm:w-auto rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  {p("Canlı Demo Planlayın")}
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">{p("✓ Kredi kartı gerekmez")}</span>
                <span className="flex items-center gap-1">{p("✓ 60 saniyede kurulum")}</span>
                <span className="flex items-center gap-1">{p("✓ İstediğiniz an tek tıkla iptal")}</span>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
  );
}

export default function FiyatlandirmaPage() {
  return <LanguageProvider><PricingContent /></LanguageProvider>;
}

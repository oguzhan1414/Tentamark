"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageProvider } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  HiOutlineGlobeAlt,
  HiOutlineFingerPrint,
  HiOutlineUsers,
  HiOutlineScale,
  HiOutlinePencilSquare,
  HiOutlineCalendarDays,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineBolt,
  HiOutlineClock,
} from "react-icons/hi2";
import PlatformIcon from "@/components/PlatformIcon";

interface StepDetail {
  number: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  details: string[];
  mockupType: "brand" | "competitor" | "strategy" | "compose" | "calendar" | "learning";
}

const STEPS: StepDetail[] = [
  {
    number: "01",
    badge: "Otonom Öğrenme",
    title: "Markanızı ve Dijital DNA'nızı Tanır",
    tagline: "Sadece web sitesi adresinizi girin. Gerisini Tentamark çözer.",
    description:
      "Tentamark, web sitenizi derinlemesine tarayarak sattığınız ürünleri, hitap ettiğiniz kitleyi, marka vaadinizi ve kurumsal ses tonunuzu (samimi, kurumsal, esprili vb.) hafızasına kaydeder.",
    details: [
      "Web sitesinden otomatik değer önerisi ve ürün çıkarma",
      "Görsel renk paleti ve logo analiz entegrasyonu",
      "Kişiselleştirilmiş marka ses tonu (Brand Tone of Voice)",
      "Hedef kitle persona tespiti",
    ],
    mockupType: "brand",
  },
  {
    number: "02",
    badge: "Pazar İstihbaratı",
    title: "Rakipleri ve Sektör Trendlerini Analiz Eder",
    tagline: "Kimin ne paylaştığını, hangi kancaların çalıştığını radarla takip eder.",
    description:
      "Sektörünüzdeki en güçlü rakiplerin yayın sıklığını, video hacmini ve kitle etkileşim oranlarını inceler. Rakiplerin zayıf kaldığı boşlukları fırsata çevirir.",
    details: [
      "Rakip takipçi büyümesi ve gönderi temposu kıyaslaması",
      "Sektörde en çok kaydetme alan video formatları",
      "Algoritmik fırsat ve boşluk tespiti",
      "Fiyat ve değer önerisi rekabet radarı",
    ],
    mockupType: "competitor",
  },
  {
    number: "03",
    badge: "Stratejik Mimari",
    title: "İçerik Direkleri ve Haftalık Ritim Kurar",
    tagline: "Rastgele paylaşım değil, hedefe yönelik haftalık yayın dengesi.",
    description:
      "Sosyal medya başarısı dengeli içerikten geçer. Tentamark; %35 Ürün Tanıtımı, %30 Eğitici Rehber, %25 Topluluk Etkileşimi ve %10 Trend kurgusuyla haftalık yayın takviminizi dengeler.",
    details: [
      "4 ana içerik sütunu (Pillars) dağılım dengesi",
      "Kitlenin en aktif olduğu gün ve saat matrisi",
      "Lansman ve indirim dönemleri için özel kampanya modülleri",
      "Haftalık içerik paketi üretimi",
    ],
    mockupType: "strategy",
  },
  {
    number: "04",
    badge: "Stüdyo Üretimi",
    title: "Platforma Özel Kancalı İçerikler Üretir",
    tagline: "Aynı strateji, her sosyal ağın kendi dilinde farklı içerik.",
    description:
      "Instagram için 3 saniyelik görsel kancalar, LinkedIn için otoriter vaka analizleri, TikTok için konuşmalı video senaryoları üretir. Her platformun kurallarına özel metin ve hashtag çıkarır.",
    details: [
      "0-100 Algoritmik Kanca (Hook) ve viralite puanlaması",
      "Reels, Karusel, Story ve Tekil Post format desteği",
      "Görsel konsept ve stüdyo prompt önerileri",
      "Doğal marka tonunda platforma özel caption'lar",
    ],
    mockupType: "compose",
  },
  {
    number: "05",
    badge: "Yayınlama & Onay",
    title: "Takvime Dizer ve Onayınızla Otomatik Yayınlar",
    tagline: "Sürpriz yok. Her şey gözünüzün önünde onay masasında.",
    description:
      "Üretilen tüm içerikler interaktif takvimde kitle saatlerine göre dizilir. Siz tek tıkla inceler, düzenler veya onaylarsınız. Onaylanan gönderiler saniyesi saniyesine otomatik paylaşılır.",
    details: [
      "Sürükle-bırak interaktif aylık ve haftalık takvim",
      "Boş günleri tek tıkla yapay zekayla tamamlama (Smart Schedule)",
      "Ekip içi onay masası ve yorumlaşma alanı",
      "Meta Graph API ile güvenli ve zamanında yayın",
    ],
    mockupType: "calendar",
  },
  {
    number: "06",
    badge: "Sürekli Gelişim",
    title: "Sonuçları Analiz Eder, Öğrenir ve Geliştirir",
    tagline: "Tentamark her hafta markanız hakkında daha akıllı hale gelir.",
    description:
      "Yayınlanan gönderilerin kaydetme, yorum ve erişim verilerini ölçer. Hangi kancanın daha çok satış getirdiğini anlar ve bir sonraki haftanın stratejisini buna göre optimize eder.",
    details: [
      "1.000 puan üzerinden Tentamark Sosyal Sağlık Skoru",
      "Haftalık büyüme reçetesi (+2 Reels ekle, -1 Satış postu azalt)",
      "Topluluk yanıt çevikliği ve DM analitiği",
      "Yapay zekanın sürekli güncellenen strateji hafızası",
    ],
    mockupType: "learning",
  },
];

export default function HowItWorksPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = STEPS[activeStepIndex];

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-900">
        <SiteHeader />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-700">
            <HiOutlineSparkles className="h-4 w-4 stroke-[2]" />
            <span>İnteraktif Ürün Turu</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Tentamark nasıl çalışıyor?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Web sitenizi tanımaktan başlayıp algoritma öğrenimine kadar uzanan 6 aşamalı otonom büyüme döngüsü.
          </p>
        </div>

        {/* Interactive Step Navigator Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map((s, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white shadow-md scale-[1.02]"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className={`font-mono text-xs font-bold ${isSelected ? "text-rose-400" : "text-slate-400"}`}>
                  {s.number}
                </span>
                <span className="font-display text-xs font-bold mt-1 line-clamp-1">
                  {s.title.split(" ")[0]} {s.title.split(" ")[1] || ""}
                </span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                  {s.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Step Feature Showcase Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-12 shadow-xl shadow-slate-950/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Step Explanation & Value Props */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#FA5252] bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200/60">
                    ADIM {currentStep.number}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-700">
                    {currentStep.badge}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {currentStep.title}
                </h2>
                <p className="text-sm font-semibold text-[#FA5252]">
                  {currentStep.tagline}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Bullet Points */}
              <div className="space-y-2.5 pt-2">
                {currentStep.details.map((d, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-700">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] mt-0.5">
                      ✓
                    </span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-30 cursor-pointer"
                >
                  ← Önceki Adım
                </button>
                <button
                  type="button"
                  disabled={activeStepIndex === STEPS.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Sonraki Adım</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right: Live Simulated Dashboard Mockup */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 shadow-sm">
              {/* Step 01 Mockup: Brand DNA & Web Scraper */}
              {currentStep.mockupType === "brand" && (
                <div className="space-y-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <HiOutlineGlobeAlt className="h-4 w-4 text-[#FA5252]" />
                      <span className="text-xs font-bold text-slate-900">Otomatik Web Sitesi Taraması</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ Başarıyla Tarandı
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2.5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Çıkarılan Marka Tonu</span>
                      <p className="font-semibold text-slate-800">Doğal, Enerjik, Şeffaf & Samimi</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Ana Hedef Kitle</span>
                        <p className="font-semibold text-slate-800">22-38 Yaş / Sağlıklı Yaşam</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Fiyat Konumu</span>
                        <p className="font-semibold text-slate-800">Premium / Erişilebilir</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 02 Mockup: Competitor Analysis */}
              {currentStep.mockupType === "competitor" && (
                <div className="space-y-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <HiOutlineScale className="h-4 w-4 text-[#FA5252]" />
                      <span className="text-xs font-bold text-slate-900">Sektörel Rakip Radarı</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      3 Rakip İncelendi
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/50 border border-rose-100">
                      <span className="font-bold text-slate-900">Senin Markan</span>
                      <span className="font-mono font-bold text-rose-700">%4.8 Etkileşim</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                      <span className="text-slate-600">Rakip A (Pazar Lideri)</span>
                      <span className="font-mono text-slate-500">%2.1 Etkileşim</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                      <span className="text-slate-600">Rakip B</span>
                      <span className="font-mono text-slate-500">%1.7 Etkileşim</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 leading-snug">
                    💡 <strong>AI Fırsat Teşhisi:</strong> Rakipleriniz video sıklığını azalttı; haftalık +2 Reels yayınlayarak keşfet payınızı %35 artırabilirsiniz.
                  </div>
                </div>
              )}

              {/* Step 03 Mockup: Strategy Pillars */}
              {currentStep.mockupType === "strategy" && (
                <div className="space-y-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900">Haftalık İçerik Direkleri</span>
                    <span className="text-[10px] font-bold text-slate-500">7 Gönderi / Hafta</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">Ürün & Değer Tanıtımı (%35)</span>
                      <span className="font-mono font-bold text-slate-900">3 Gönderi</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#FA5252] w-[35%]" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-medium text-slate-700">Eğitici & Rehber İçerikler (%30)</span>
                      <span className="font-mono font-bold text-slate-900">2 Gönderi</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[30%]" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-medium text-slate-700">Topluluk & Etkileşim (%25)</span>
                      <span className="font-mono font-bold text-slate-900">2 Gönderi</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500 w-[25%]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 04 Mockup: Content Studio */}
              {currentStep.mockupType === "compose" && (
                <div className="space-y-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <PlatformIcon name="instagram" className="h-4 w-4" />
                      <span className="text-xs font-bold text-slate-900">İçerik Stüdyosu</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      Kanca Skoru: 92/100
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-display font-bold text-slate-900 text-sm">
                      &ldquo;Müşterilerinizi ilk 3 saniyede yakalamanın kanıtlanmış yolu 🎯&rdquo;
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      Sosyal medyada kaydırmayı durduran unsurlar görsel değil, merak uyandıran ilk cümledir...
                    </p>
                    <div className="flex gap-2 pt-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        Instagram Reels
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        19:30 Zirve Saati
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 05 Mockup: Calendar */}
              {currentStep.mockupType === "calendar" && (
                <div className="space-y-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <HiOutlineCalendarDays className="h-4 w-4 text-[#FA5252]" />
                      <span className="text-xs font-bold text-slate-900">Akıllı Yayın Takvimi</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      4 Gönderi Onaylandı
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Pazartesi</span>
                      <p className="font-bold text-slate-800">Reels (19:30)</p>
                      <span className="text-[9px] text-emerald-600">✓ Planlandı</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Çarşamba</span>
                      <p className="font-bold text-slate-800">Karusel (12:15)</p>
                      <span className="text-[9px] text-emerald-600">✓ Planlandı</span>
                    </div>
                    <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-2 text-center space-y-1">
                      <span className="text-[10px] font-bold text-rose-600">Cuma</span>
                      <p className="font-bold text-slate-800">Story Serisi</p>
                      <span className="text-[9px] text-rose-700 font-bold">✨ AI Doldurdu</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 06 Mockup: Learning & Health Score */}
              {currentStep.mockupType === "learning" && (
                <div className="space-y-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900">Sosyal Sağlık Skoru</span>
                    <span className="font-mono text-sm font-black text-slate-900">784 / 1.000</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-900 text-[11px] leading-snug">
                      📈 <strong>Haftalık Kazanım:</strong> Eğitici içerikleriniz bu hafta profil ziyaretlerini %28 artırdı.
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5 text-slate-700 text-[11px] leading-snug">
                      🎯 <strong>Sonraki Hamle:</strong> Gelecek hafta Çarşamba gününe 1 adet interaktif anket hikayesi eklendi.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA Block */}
        <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white text-center space-y-5 shadow-xl">
          <h3 className="font-display text-2xl font-bold sm:text-3xl lg:text-4xl">
            Sosyal medyanızı otonom bir büyüme makinesine dönüştürün.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Hemen kaydolun, web sitenizi girin ve markanıza özel ilk haftalık içerik paketini 60 saniyede hazır görün.
          </p>
          <div className="pt-2">
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 rounded-full bg-[#FA5252] px-7 py-3.5 font-body text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#FA5252]/30 hover:bg-[#E03131] transition"
            >
              <span>1 Dakikada Ücretsiz Başla</span>
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

        <SiteFooter />
      </div>
    </LanguageProvider>
  );
}

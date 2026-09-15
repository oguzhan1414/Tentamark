"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowRight } from "react-icons/hi2";

type AudienceSegment = "solo" | "smb" | "agency";

interface SegmentData {
  id: AudienceSegment;
  label: string;
  headline: string;
  subhead: string;
  bullets: {
    emoji: string;
    bold: string;
    text: string;
  }[];
  imageSrc: string;
  imageAlt: string;
  ctaText: string;
}

const SEGMENTS: Record<AudienceSegment, SegmentData> = {
  solo: {
    id: "solo",
    label: "Tek başına çalışan girişimciler",
    headline: "Tek başınıza çalışırken tüm sosyal medyanızı otonom yönetin.",
    subhead:
      "Pazarlamaya saatler harcamak yerine asıl işinize odaklanın. Tentamark marka ses tonunuzu öğrenir ve tüm süreci otomatikleştirir.",
    bullets: [
      {
        emoji: "⚡",
        bold: "Yapay zekâ",
        text: "ile marka ses tonunuzda saniyeler içinde içerik üretin.",
      },
      {
        emoji: "📅",
        bold: "Haftalık 9'lu",
        text: "görsel ızgaranızı tek ekranda planlayın ve zamandan tasarruf edin.",
      },
      {
        emoji: "🎯",
        bold: "Format uyarlaması",
        text: "ile Instagram, TikTok ve LinkedIn için otomatik dönüşüm sağlayın.",
      },
      {
        emoji: "📈",
        bold: "Algoritma analizleri",
        text: "ve haftalık büyüme reçeteleriyle yönünüzü belirleyin.",
      },
      {
        emoji: "🚀",
        bold: "Tek tıkla onaylayın,",
        text: "telefonunuza ihtiyaç duymadan doğrudan Cloud üzerinden yayınlansın.",
      },
    ],
    imageSrc: "/images/features/solo-entrepreneur-ui.jpg",
    imageAlt: "Tek başına çalışan girişimciler için AI İçerik Üretici ve Zamanlayıcı Paneli",
    ctaText: "14 gün boyunca ücretsiz deneyin",
  },
  smb: {
    id: "smb",
    label: "Küçük işletmeler",
    headline: "Küçük işletmeler için uygun fiyatlı, hepsi bir arada sosyal medya aracı",
    subhead:
      "İşletmenizi pazarlamak için ihtiyacınız olan her şey, birden fazla sosyal medya aracına para ödemenize gerek kalmadan.",
    bullets: [
      {
        emoji: "⚙️",
        bold: "Yapay zekâ",
        text: "ile hızlıca gönderi oluşturun.",
      },
      {
        emoji: "⏱️",
        bold: "Toplu olarak",
        text: "gönderi planlayın ve zamandan tasarruf edin.",
      },
      {
        emoji: "💬",
        bold: "Tüm konuşmalarınızı",
        text: "tek bir gelen kutusundan yönetin.",
      },
      {
        emoji: "📊",
        bold: "Performans raporlarını",
        text: "saniyeler içinde oluşturun.",
      },
      {
        emoji: "🔄",
        bold: "Tekrarlayan paylaşım",
        text: "görevlerini ortadan kaldırın.",
      },
    ],
    imageSrc: "/images/features/small-business-ui.jpg",
    imageAlt: "Küçük işletmeler için Sosyal Medya İçerik Kuyruğu ve Otomatik Yayınlama Paneli",
    ctaText: "14 gün boyunca ücretsiz deneyin",
  },
  agency: {
    id: "agency",
    label: "Ajanslar",
    headline: "Yoğun çalışan sosyal medya yöneticileri ve ajansları için mükemmel.",
    subhead:
      "Ekibinizi uyumlu tutun, düzenli olun ve her müşteriyi daha az karmaşa ve daha fazla kontrolle yönetin.",
    bullets: [
      {
        emoji: "👤",
        bold: "Birden fazla",
        text: "müşteri hesabını tek panelden yönetin.",
      },
      {
        emoji: "💼",
        bold: "Çalışma alanlarında",
        text: "müşteri varlıklarını düzenli tutun.",
      },
      {
        emoji: "⚙️",
        bold: "Sosyal medya ekibinizle",
        text: "ve müşterilerinizle işbirliği yapın.",
      },
      {
        emoji: "👍",
        bold: "Yayınlanmadan önce",
        text: "gönderileri tek tıkla onaylatın.",
      },
      {
        emoji: "📄",
        bold: "Müşterinin markasını taşıyan",
        text: "PDF raporlarını kolayca paylaşın.",
      },
    ],
    imageSrc: "/images/features/agency-workspace-ui.jpg",
    imageAlt: "Ajanslar ve ekipler için Çoklu Müşteri Çalışma Alanı ve Onay Paneli",
    ctaText: "14 gün boyunca ücretsiz deneyin",
  },
};

export default function InteractiveDemoWidget() {
  const [activeTab, setActiveTab] = useState<AudienceSegment>("smb");
  const current = SEGMENTS[activeTab];

  return (
    <section
      id="demo"
      className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28 bg-white border-t border-slate-200/80 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* ================= TOP ACCENT BAR & TITLE ================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="w-12 h-1.5 rounded-full bg-[#FA5252] mx-auto" />

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
            Büyük ya da küçük her takım için tasarlandı.
          </h2>
        </div>

        {/* ================= CENTER SEGMENT PILLS ================= */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {(Object.keys(SEGMENTS) as AudienceSegment[]).map((tabKey) => {
            const item = SEGMENTS[tabKey];
            const isSelected = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FA5252] text-white shadow-lg shadow-[#FA5252]/25 scale-[1.03]"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ================= SPLIT 2-COLUMN VIEW ================= */}
        <div className="mt-14 sm:mt-16 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ----------------- LEFT COLUMN: TEXT & BULLETS ----------------- */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 leading-tight">
              {current.headline}
            </h3>

            <p className="font-body text-sm sm:text-base leading-relaxed text-slate-600">
              {current.subhead}
            </p>

            <ul className="space-y-3.5 pt-2">
              {current.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg select-none">{bullet.emoji}</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
                    <strong className="text-slate-950 font-bold">{bullet.bold}</strong> {bullet.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/kayit"
                className="group inline-flex items-center gap-2 rounded-full bg-[#FA5252] px-8 py-3.5 font-body text-sm sm:text-base font-bold text-white shadow-lg shadow-[#FA5252]/25 hover:bg-[#E03131] transition-all hover:scale-102"
              >
                <span>{current.ctaText}</span>
                <HiOutlineArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ----------------- RIGHT COLUMN: BESPOKE 3D SAAS ARTWORK ----------------- */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] max-w-xl overflow-hidden rounded-3xl border border-slate-100 shadow-2xl transition-all duration-300 hover:scale-[1.01]">
              <Image
                key={current.id}
                src={current.imageSrc}
                alt={current.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center animate-in fade-in zoom-in-95 duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

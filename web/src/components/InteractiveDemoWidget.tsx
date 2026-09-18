"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";

type AudienceSegment = "solo" | "smb" | "agency";

const SEGMENT_IMAGES: Record<AudienceSegment, string> = {
  solo: "/images/features/solo-entrepreneur-ui.jpg",
  smb: "/images/features/small-business-ui.jpg",
  agency: "/images/features/agency-workspace-ui.jpg",
};

const TAB_KEYS: AudienceSegment[] = ["solo", "smb", "agency"];

export default function InteractiveDemoWidget() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AudienceSegment>("smb");
  const current = t.interactiveDemo.segments[activeTab];
  const imageSrc = SEGMENT_IMAGES[activeTab];

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
            {t.interactiveDemo.title}
          </h2>
        </div>

        {/* ================= CENTER SEGMENT PILLS ================= */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {TAB_KEYS.map((tabKey) => {
            const item = t.interactiveDemo.segments[tabKey];
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
                key={activeTab}
                src={imageSrc}
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

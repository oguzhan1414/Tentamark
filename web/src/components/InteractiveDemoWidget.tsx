"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";

type AudienceSegment = "solo" | "smb" | "agency";

const SEGMENT_IMAGES: Record<AudienceSegment, string> = {
  solo: "/images/features/audience-solo-v3.png",
  smb: "/images/features/audience-small-business-v3.png",
  agency: "/images/features/audience-agency-v3.png",
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
          <div className="mx-auto h-1.5 w-14 rounded-full bg-gradient-to-r from-violet via-sky to-coral" />

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
                    ? "scale-[1.03] bg-ink text-white shadow-lg shadow-violet/20"
                    : "border border-line bg-white text-slate-700 hover:border-violet/30 hover:bg-bg-violet"
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
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 font-body text-sm font-bold text-white shadow-lg shadow-ink/20 transition-all hover:-translate-y-0.5 hover:bg-violet sm:text-base"
              >
                <span>{current.ctaText}</span>
                <HiOutlineArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ----------------- RIGHT COLUMN: BESPOKE 3D SAAS ARTWORK ----------------- */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/90 bg-bg-violet shadow-[0_30px_80px_rgba(42,33,70,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_38px_95px_rgba(42,33,70,0.23)]">
              <Image
                key={activeTab}
                src={imageSrc}
                alt={current.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center animate-in fade-in zoom-in-95 duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

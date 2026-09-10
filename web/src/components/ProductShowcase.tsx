"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<"calendar" | "video" | "approval">("calendar");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ps-reveal", {
          opacity: 0,
          y: 26,
          duration: 0.65,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".ps-reveal", { opacity: 1, clearProps: "transform" });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="urun-vitrini"
      ref={sectionRef}
      className="relative z-10 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-white text-ink shadow-[0_-12px_36px_rgba(0,0,0,0.08),0_-2px_8px_rgba(0,0,0,0.03)] border-t border-black/[0.04] px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-black/[0.015] to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="ps-reveal max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold mb-2">
              Haftalık Akış & Planlama
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Haftanın tamamı <span className="text-blue-600">tek ekranda.</span>
            </h2>
            <p className="mt-3 font-body text-base leading-relaxed text-slate-600">
              Hangi içerik hangi platforma ne zaman gidiyor, hangisi sizi bekliyor.
              Karmaşık ayar yok, menü avı yok.
            </p>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="ps-reveal flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/80 p-1 self-start md:self-end shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs font-semibold transition ${
                activeTab === "calendar"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📅</span>
              <span>Haftalık Takvim</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs font-semibold transition ${
                activeTab === "video"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🎬</span>
              <span>Canlı Akış Videosu</span>
              <span className="rounded-full bg-emerald-400/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600">
                HD
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("approval")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs font-semibold transition ${
                activeTab === "approval"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📱</span>
              <span>1-Tıkla Onay</span>
            </button>
          </div>
        </div>

        <div className="ps-reveal relative mt-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-2 shadow-xl sm:p-4">
            {activeTab === "calendar" && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white border border-slate-200/80">
                <Image
                  src="/images/ui-calendar.jpg"
                  alt="Tentamark Haftalık İçerik Takvimi"
                  fill
                  priority
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  className="object-contain object-center transition-transform duration-700 ease-out hover:scale-[1.01]"
                />
              </div>
            )}

            {activeTab === "video" && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  controls
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover"
                >
                  <source src="/video/login.mp4" type="video/mp4" />
                  <source src="/video/video.mp4" type="video/mp4" />
                </video>
              </div>
            )}

            {activeTab === "approval" && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white border border-slate-200/80">
                <Image
                  src="/images/ui-approval.jpg"
                  alt="Tentamark 1-Tıkla Onay Arayüzü"
                  fill
                  priority
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  className="object-contain object-center transition-transform duration-700 ease-out hover:scale-[1.01]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

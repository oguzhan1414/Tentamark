"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

/*
  Vision preview, not a live feature — Tentamark doesn't generate video today
  (only stills, via /api/media/generate). Copy below stays in "yakında" /
  future tense on purpose. Clips live at /public/ads/01.mp4 etc; until a file
  exists, its card falls back to a gradient placeholder instead of a broken
  video box.
*/
const CLIPS = [
  { src: "/ads/01.mp4", alt: "Parfüm şişesi, boş etiket alanıyla, altın ışıkta" },
  { src: "/ads/03.mp4", alt: "Özel üretim kahve paketi ve buğulanan fincan" },
  { src: "/ads/04.mp4", alt: "Dizüstü bilgisayarda analiz paneli, aydınlık ofis" },
  { src: "/ads/05.mp4", alt: "Parfüm şişesi, ikinci açı, dramatik arka ışık" },
  { src: "/ads/06.mp4", alt: "Elde telefon, uygulama ekranı kullanımı" },
  { src: "/ads/07.mp4", alt: "Butik içinde kıyafet rafında ürün detayı" },
  { src: "/ads/08.mp4", alt: "Atölyede deri ürün üzerinde çalışan eller" },
  { src: "/ads/09.mp4", alt: "İşletme sahibi masasında kamera karşısında konuşuyor" },
  { src: "/ads/10.mp4", alt: "Barista tezgahta kahve servis ediyor" },
  { src: "/ads/11.mp4", alt: "Danışman ofiste kamera karşısında duruyor" },
  { src: "/ads/12.mp4", alt: "Fitness koçu stüdyoda esneme hareketi gösteriyor" },
];

function ClipCard({ src, alt, fallbackText }: { src: string; alt: string; fallbackText: string }) {
  const [broken, setBroken] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lift w-[190px] sm:w-[220px] md:w-[245px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="relative aspect-[9/16] w-full bg-surface-strong">
        {broken ? (
          <div
            className="flex h-full w-full items-center justify-center p-4 text-center"
            style={{ background: "var(--spectrum)", opacity: 0.85 }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/90">
              {fallbackText}
            </span>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={src}
            loop
            muted
            playsInline
            preload="none"
            aria-label={alt}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

export default function AdShowcaseSection() {
  const { t } = useLanguage();

  return (
    <section
      id="icerik-vizyonu"
      className="relative border-t border-line bg-bg text-ink pt-14 pb-20 sm:pt-16 sm:pb-24 overflow-hidden"
    >
      <div
        className="glow absolute -top-24 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full"
        style={{ background: "var(--spectrum)", opacity: 0.14 }}
        aria-hidden="true"
      />

      {/* Başlık alanı */}
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto text-center">
          <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-text">
            {t.adShowcase.badge}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.adShowcase.titleBefore}
            <span className="spectrum-text">{t.adShowcase.titleHighlight}</span>
          </h2>
          <p className="mt-3 font-body text-base leading-relaxed text-muted">
            {t.adShowcase.copy}
          </p>
        </div>
      </div>

      {/* Marquee video akışı */}
      <div className="relative mt-10 w-full overflow-hidden py-2">
        <div className="animate-marquee-ltr">
          <div className="flex shrink-0 items-center gap-4 pr-4 sm:gap-5 sm:pr-5">
            {CLIPS.map((clip, idx) => (
              <ClipCard
                key={`first-${clip.src}-${idx}`}
                src={clip.src}
                alt={clip.alt}
                fallbackText={t.adShowcase.fallbackText}
              />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-4 pr-4 sm:gap-5 sm:pr-5" aria-hidden="true">
            {CLIPS.map((clip, idx) => (
              <ClipCard
                key={`second-${clip.src}-${idx}`}
                src={clip.src}
                alt={clip.alt}
                fallbackText={t.adShowcase.fallbackText}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Erken erişim butonu */}
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mt-10 text-center">
          <a
            href="#erken-erisim"
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-body text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgb(109_79_235/0.6)] transition-colors hover:bg-accent-hover"
          >
            {t.adShowcase.ctaButton}
          </a>
        </div>
      </div>
    </section>
  );
}

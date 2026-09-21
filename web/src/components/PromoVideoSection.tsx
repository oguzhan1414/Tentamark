"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { HiPlay } from "react-icons/hi2";

export default function PromoVideoSection() {
  const { t } = useLanguage();
  const c = t.promoVideo;
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative border-t border-line bg-bg py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text shadow-xs">
          {c.eyebrow}
        </span>

        <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {c.titleBefore}
          <span className="spectrum-text">{c.titleHighlight}</span>
          {c.titleAfter}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl font-body text-base text-muted sm:text-lg">{c.description}</p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl px-6 lg:px-8">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black shadow-[0_30px_70px_-30px_rgba(23,43,70,0.35)]">
          {playing ? (
            <video
              src="/video/tentamark-promo.mp4"
              controls
              autoPlay
              className="h-full w-full"
              poster="/video/tentamark-promo-poster.jpg"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={c.playLabel}
              className="group relative block h-full w-full cursor-pointer"
            >
              <Image
                src="/video/tentamark-promo-poster.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <HiPlay className="h-8 w-8 translate-x-0.5 text-ink" />
                </span>
              </span>
              <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-2.5 py-1 font-mono text-xs font-semibold text-white">
                {c.duration}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

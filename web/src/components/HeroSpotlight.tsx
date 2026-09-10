"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import PlatformIcon, { type PlatformName } from "./PlatformIcon";

const PLATFORMS: PlatformName[] = ["instagram", "facebook", "linkedin"];

/*
  Hero built on the sproutsocial formula, measured from their live page:
  a real person carries credibility, and product UI floating over the photo
  proves the thing exists. The cards here are real markup rather than baked
  into the image, so the copy stays selectable, translatable and sharp.
*/
export default function HeroSpotlight() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".hs-headline", {
          type: "lines",
          mask: "lines",
          linesClass: "hs-line",
        });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hs-eyebrow", { opacity: 0, y: 12, duration: 0.5 })
          .from(split.lines, { opacity: 0, yPercent: 110, duration: 0.7, stagger: 0.08 }, "-=0.25")
          .from(".hs-copy", { opacity: 0, y: 16, duration: 0.6 }, "-=0.35")
          .from(".hs-form > *", { opacity: 0, y: 14, duration: 0.5, stagger: 0.08 }, "-=0.35")
          .from(".hs-trust", { opacity: 0, y: 10, duration: 0.5 }, "-=0.3")
          .from(
            ".hs-photo",
            { opacity: 0, y: 32, scale: 0.97, duration: 0.9, ease: "power3.out" },
            "-=0.9"
          )
          .from(
            ".hs-card",
            { opacity: 0, y: 18, scale: 0.92, duration: 0.5, stagger: 0.13, ease: "back.out(1.7)" },
            "-=0.45"
          );

        return () => split.revert();
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [".hs-eyebrow", ".hs-headline", ".hs-copy", ".hs-form > *", ".hs-trust", ".hs-photo", ".hs-card"],
          { opacity: 1, clearProps: "transform" }
        );
      });
    },
    { scope: rootRef }
  );

  return (
    <section id="top" ref={rootRef} className="relative bg-[#0a0a0b] text-white overflow-hidden px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        {/* ---------------- copy ---------------- */}
        <div>
          <p className="hs-eyebrow font-mono text-xs uppercase tracking-[0.28em] text-accent">
            AI Marketing Manager
          </p>

          <h1 className="hs-headline mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
            Markanızın sosyal medyasını yöneten bir ekip. <span className="text-sky-400">Tek kişi bile olsanız.</span>
          </h1>

          <p className="hs-copy mt-6 max-w-lg font-body text-base leading-relaxed text-pretty text-white/70 sm:text-lg">
            Tentamark markanızı öğrenir, haftalık içerik planını hazırlar ve her
            platforma ayrı yazar. Siz onaylarsınız, o yayınlar ve sonuçlardan
            öğrenir.
          </p>

          <form
            className="hs-form mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="hero-email" className="sr-only">
              E-posta adresiniz
            </label>
            <input
              id="hero-email"
              type="email"
              placeholder="ornek@marka.com"
              className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 font-body text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-white px-6 py-3.5 font-body text-sm font-semibold text-[#0a0a0b] transition-colors hover:bg-white/90"
            >
              Erken erişime katıl
            </button>
          </form>

          <div className="hs-trust mt-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
              Instagram, Facebook ve LinkedIn ile çalışır
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              {PLATFORMS.map((name) => (
                <PlatformIcon key={name} name={name} className="h-9 w-9" />
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- portrait + floating product UI ---------------- */}
        <div className="relative">
          <div className="hs-photo relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Image
              src="/images/hero-portrait.jpg"
              alt="Kendi markasının sosyal medyasını Tentamark ile yöneten bir işletme sahibi"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          {/* Outcome. One real-looking number, framed as a change not a vanity stat. */}
          <div className="hs-card absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#141416]/95 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur sm:left-10">
            <svg viewBox="0 0 64 30" className="h-7 w-14 text-mint" aria-hidden="true">
              <polyline
                points="0,25 11,20 22,23 33,13 44,15 54,6 64,2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="font-display text-sm font-bold text-white">Etkileşim +%18</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">son 30 gün</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

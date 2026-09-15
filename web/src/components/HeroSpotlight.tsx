"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { useLanguage } from "@/context/LanguageContext";
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
  const { t } = useLanguage();

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
    <section id="top" ref={rootRef} className="relative bg-bg text-ink overflow-hidden px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
      {/* Ambient spectrum glow — the signature motif, never a solid fill */}
      <div
        className="glow absolute -top-40 left-1/2 h-[36rem] w-[56rem] -translate-x-1/2 rounded-full"
        style={{ background: "var(--spectrum)", opacity: 0.16 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        {/* ---------------- copy ---------------- */}
        <div>
          <p className="hs-eyebrow font-mono text-xs uppercase tracking-[0.28em] text-accent-text">
            {t.hero.eyebrow}
          </p>

          <h1 className="hs-headline mt-5 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
            {t.hero.headlineBefore}
            <span className="spectrum-text">{t.hero.headlineHighlight}</span>
          </h1>

          <p className="hs-copy mt-6 max-w-lg font-body text-base leading-relaxed text-pretty text-muted sm:text-lg">
            {t.hero.copy}
          </p>

          <form
            className="hs-form mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="hero-email" className="sr-only">
              {t.hero.emailLabel}
            </label>
            <input
              id="hero-email"
              type="email"
              placeholder={t.hero.emailPlaceholder}
              className="w-full rounded-full border border-line bg-surface px-5 py-3.5 font-body text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-accent px-6 py-3.5 font-body text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgb(109_79_235/0.6)] transition-colors hover:bg-accent-hover"
            >
              {t.hero.ctaButton}
            </button>
          </form>

          <div className="hs-form mt-3">
            <a
              href="#urun-vitrini"
              className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-accent-text transition-colors hover:text-accent-hover"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">
                <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 translate-x-px fill-current" aria-hidden="true">
                  <path d="M6 4l14 8-14 8V4z" />
                </svg>
              </span>
              {t.hero.watchDemo}
            </a>
          </div>

          <div className="hs-trust mt-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              {t.hero.trustText}
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
          <div className="hs-photo spectrum-ring relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-surface-soft">
            <Image
              src="/images/hero-portrait.jpg"
              alt={t.hero.portraitAlt}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          {/* Outcome stat card */}
          <div className="hs-card absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(28,20,48,0.35)] backdrop-blur sm:left-10">
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
              <p className="font-display text-sm font-bold text-ink">{t.hero.statValue}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">{t.hero.statPeriod}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

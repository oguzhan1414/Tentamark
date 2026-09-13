"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/context/LanguageContext";

const STEPS_CONFIG = [
  {
    key: "brand-dna",
    image: "/images/step-1-brand-dna.png",
    cardBg: "bg-bg-violet",
  },
  {
    key: "content-ai",
    image: "/images/step-2-tentacast.png",
    cardBg: "bg-bg-sky",
  },
  {
    key: "approval",
    image: "/images/step-3-approval.jpeg",
    cardBg: "bg-bg-mint",
  },
  {
    key: "publish",
    image: "/images/step-4-publish.jpeg",
    cardBg: "bg-bg-coral",
  },
  {
    key: "learning",
    image: "/images/step-5-learning.jpeg",
    cardBg: "bg-bg-amber",
  },
];

const EXIT_DIRECTIONS: { x: number; y: number; rotate: number }[] = [
  { x: 1, y: -1, rotate: 1 }, // top-right
  { x: -1, y: 1, rotate: -1 }, // bottom-left
  { x: -1, y: -1, rotate: -1 }, // top-left
  { x: 1, y: 1, rotate: 1 }, // bottom-right
  { x: 1, y: -1, rotate: 1 },
];

function applyDepth(el: HTMLElement, depth: number, index: number, totalCount: number) {
  if (depth < 0) {
    const passed = Math.min(1, -depth);
    const dir = EXIT_DIRECTIONS[index % EXIT_DIRECTIONS.length];
    gsap.to(el, {
      x: passed * 760 * dir.x,
      y: passed * 320 * dir.y,
      rotate: passed * 26 * dir.rotate,
      scale: 1 - passed * 0.15,
      opacity: 1 - passed,
      zIndex: totalCount + 1,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
    return;
  }
  const d = Math.min(depth, 3);
  const sign = index % 2 === 0 ? 1 : -1;
  gsap.to(el, {
    x: d * 16,
    y: d * 18,
    rotate: sign * d * 1.8,
    scale: 1 - d * 0.05,
    opacity: 1 - d * 0.18,
    zIndex: totalCount - Math.round(d),
    duration: 0.5,
    ease: "power2.out",
    overwrite: "auto",
  });
}

export default function LoopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const { t } = useLanguage();

  const steps = STEPS_CONFIG.map((cfg, i) => ({
    ...cfg,
    ...(t.loop.steps[i] || {}),
  }));

  const currentStep = steps[active] || steps[0];

  function renderStack(rawProgress: number) {
    const scaled = rawProgress * (steps.length - 1);
    cardRefs.current.forEach((el, i) => {
      if (el) applyDepth(el, i - scaled, i, steps.length);
    });
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        renderStack(0);

        const st = ScrollTrigger.create({
          trigger: pinRef.current,
          start: "top top+=80",
          end: () => `+=${steps.length * window.innerHeight * 0.8}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
            setActive(idx);
            renderStack(self.progress);
          },
        });

        scrollTriggerRef.current = st;

        return () => {
          scrollTriggerRef.current = null;
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        renderStack(0);
        videoRef.current?.pause();
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="dongu"
      className="relative z-20 -mt-8 sm:-mt-12 overflow-hidden rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-violet text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-text">
            <span>{t.loop.badge}</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.loop.titleBefore}
            <span className="spectrum-text">{t.loop.titleHighlight}</span>
          </h2>
          <p className="mt-3 font-body text-base text-muted leading-relaxed">
            {t.loop.copy}
          </p>
        </div>
      </div>

      <div
        ref={pinRef}
        className="relative mt-10 flex min-h-[78vh] w-screen flex-col items-center justify-center"
        style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-24 object-cover sm:-bottom-32"
          aria-hidden="true"
        >
          <source src="/video/background.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-x-0 top-0 -bottom-24 bg-bg-violet/40 sm:-bottom-32" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
          <div className="relative aspect-[4/3] w-full">
            {steps.map((step, i) => (
              <div
                key={step.key}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-line shadow-xl ${step.cardBg}`}
                style={{ transformOrigin: "50% 100%" }}
              >
                <div className="relative min-h-0 flex-1 p-4 sm:p-6">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="object-contain object-center"
                    />
                  </div>
                </div>
                <div className="px-6 pb-6 pt-1 sm:px-8 sm:pb-7">
                  <p className="font-display text-xl font-bold text-ink sm:text-2xl">{step.label}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">{step.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-30 mt-4 max-w-lg text-center font-display text-lg font-semibold text-ink sm:text-xl">
          {currentStep.title}
        </p>

        <span className="relative z-30 mt-5 inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted backdrop-blur-sm">
          <span aria-hidden="true">↓</span> {t.loop.scrollHint}
        </span>
      </div>
    </section>
  );
}

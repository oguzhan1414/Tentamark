"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/context/LanguageContext";

const STEPS_CONFIG = [
  {
    key: "brand-dna",
    image: "/images/loop-brand-dna-v2.png",
    cardBg: "bg-bg-violet",
  },
  {
    key: "content-ai",
    image: "/images/loop-content-plan-v2.png",
    cardBg: "bg-bg-sky",
  },
  {
    key: "approval",
    image: "/images/loop-approval-v2.png",
    cardBg: "bg-bg-mint",
  },
  {
    key: "publish",
    image: "/images/loop-publishing-v2.png",
    cardBg: "bg-bg-coral",
  },
  {
    key: "learning",
    image: "/images/loop-learning-v2.png",
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

  function goToStep(index: number) {
    const trigger = scrollTriggerRef.current;
    if (!trigger) return;
    const progress = index / (steps.length - 1);
    window.scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * progress,
      behavior: "smooth",
    });
  }

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
          start: "top top+=75",
          end: () => `+=${steps.length * window.innerHeight * 0.75}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
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
      className="relative z-20 -mt-8 sm:-mt-12 overflow-hidden rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-violet text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line pt-16 pb-24 sm:pt-24 sm:pb-32 w-full"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6">
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
        className="relative mt-8 sm:mt-12 flex min-h-[82vh] w-full flex-col items-center justify-center overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/video/background.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-bg-violet/30" aria-hidden="true" />

        {/* Soft top & bottom gradient masks for seamless visual transition */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg-violet via-bg-violet/70 to-transparent z-10" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg-violet via-bg-violet/70 to-transparent z-10" aria-hidden="true" />

        <div className="relative z-20 mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6">
          <div className="relative aspect-[4/3] w-full">
            {steps.map((step, i) => (
              <div
                key={step.key}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-white/80 shadow-[0_30px_80px_rgba(42,33,70,0.18),0_8px_24px_rgba(42,33,70,0.08)] ${step.cardBg}`}
                style={{ transformOrigin: "50% 100%" }}
              >
                <div className="relative min-h-0 flex-1 p-3 sm:p-4">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-inner">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="object-cover object-center"
                    />
                    <span className="absolute right-3 top-3 rounded-full border border-white/75 bg-white/80 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-muted shadow-sm backdrop-blur-md">
                      {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                    </span>
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

        <p className="relative z-20 mt-4 max-w-lg text-center font-display text-lg font-semibold text-ink sm:text-xl">
          {currentStep.title}
        </p>

        <div className="relative z-20 mt-4 flex items-center gap-2" aria-label={`${active + 1} / ${steps.length}`}>
          {steps.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => goToStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === active ? "w-8 bg-accent" : index < active ? "w-2 bg-accent/45" : "w-2 bg-ink/15"}`}
              aria-label={`${index + 1}. adım: ${step.label}`}
              aria-current={index === active ? "step" : undefined}
            />
          ))}
        </div>

        <span className="relative z-20 mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-surface/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted backdrop-blur-sm shadow-xs">
          <span aria-hidden="true">↓</span> {t.loop.scrollHint}
        </span>
      </div>
    </section>
  );
}

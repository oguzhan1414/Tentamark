"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Step = {
  key: string;
  label: string;
  title: string;
  image: string;
  badge: string;
  cardBg: string;
};

const STEPS: Step[] = [
  {
    key: "brand-dna",
    label: "Brand DNA",
    title: "Markanızı tanır, dijital kimliğini çıkarır.",
    image: "/images/step-1-brand-dna.png",
    badge: "Marka DNA'sı",
    cardBg: "bg-bg-violet",
  },
  {
    key: "content-ai",
    label: "TentaCast",
    title: "Tek bir fikri tüm platformlara uyarlar.",
    image: "/images/step-2-tentacast.png",
    badge: "Çoklu Yayın",
    cardBg: "bg-bg-sky",
  },
  {
    key: "approval",
    label: "1-Tıkla Onay",
    title: "Son söz her zaman sizdedir.",
    image: "/images/step-3-approval.jpeg",
    badge: "İnsan Onaylı",
    cardBg: "bg-bg-mint",
  },
  {
    key: "publish",
    label: "Otomatik Yayın",
    title: "Doğru saatte, doğru kanalda yayında.",
    image: "/images/step-4-publish.jpeg",
    badge: "Akıllı Zamanlama",
    cardBg: "bg-bg-coral",
  },
  {
    key: "learning",
    label: "Öğrenme Döngüsü",
    title: "Rakamlar bir sonraki haftanın planını yazar.",
    image: "/images/step-5-learning.jpeg",
    badge: "Sürekli Gelişim",
    cardBg: "bg-bg-amber",
  },
];

// Each card exits in its own direction — one repeated flight path read as
// mechanical, four different corners reads as a hand actually tossing cards
// aside. Order alternates corners so no two in a row match.
const EXIT_DIRECTIONS: { x: number; y: number; rotate: number }[] = [
  { x: 1, y: -1, rotate: 1 }, // top-right
  { x: -1, y: 1, rotate: -1 }, // bottom-left
  { x: -1, y: -1, rotate: -1 }, // top-left
  { x: 1, y: 1, rotate: 1 }, // bottom-right
  { x: 1, y: -1, rotate: 1 },
];

// Depth 0 = front card. Depth > 0 = stacked behind (further back = higher
// number). Depth < 0 = already flung away. Values tween toward their target
// with power2 easing (matching what ajans360.com's own ScrollTrigger config
// actually uses — scrub:1 + power2 curves, not a raw linear snap) instead of
// gsap.set's instant jump, so it reads as eased motion, not a per-frame snap.
function applyDepth(el: HTMLElement, depth: number, index: number) {
  if (depth < 0) {
    const passed = Math.min(1, -depth);
    const dir = EXIT_DIRECTIONS[index % EXIT_DIRECTIONS.length];
    gsap.to(el, {
      x: passed * 760 * dir.x,
      y: passed * 320 * dir.y,
      rotate: passed * 26 * dir.rotate,
      scale: 1 - passed * 0.15,
      opacity: 1 - passed,
      zIndex: STEPS.length + 1,
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
    zIndex: STEPS.length - Math.round(d),
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
  const currentStep = STEPS[active];

  function renderStack(rawProgress: number) {
    const scaled = rawProgress * (STEPS.length - 1);
    cardRefs.current.forEach((el, i) => {
      if (el) applyDepth(el, i - scaled, i);
    });
  }

  // Scroll drives the step. All 5 cards sit stacked on top of each other;
  // scrolling flings the front one off-screen and promotes the rest forward
  // in depth — a deck of cards being worked through, not a tab menu.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        renderStack(0);

        const st = ScrollTrigger.create({
          trigger: pinRef.current,
          start: "top top+=80",
          end: () => `+=${STEPS.length * window.innerHeight * 0.8}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
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
            <span>Nasıl Çalışır</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Bir kere kurulmuyor, <span className="spectrum-text">her yayında daha akıllı hale geliyor.</span>
          </h2>
          <p className="mt-3 font-body text-base text-muted leading-relaxed">
            Çoğu araç içerik üretip bırakır. Tentamark&apos;ta döngü hiç kapanmaz: Her yayından öğrenilen sonuç, bir sonraki haftanın stratejisine geri beslenir.
          </p>
        </div>
      </div>

      {/* Pinned while scrolling. The calc(50% - 50vw) margin trick breaks
          this out to the true viewport edge regardless of the section's own
          px-6 or any ancestor padding — a guessed -mx-6 left a visible gap
          on the right because it only cancels this element's own parent
          padding, not whatever else sits between it and the viewport edge.
          min-h-[78vh] keeps it viewport-relative and short — decoupled from
          the intro text's height above — so the video box stays close to
          its own 16:9 aspect and object-cover doesn't have to crop in hard
          to fill it. */}
      <div
        ref={pinRef}
        className="relative mt-10 flex min-h-[78vh] w-screen flex-col items-center justify-center"
        style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
      >
        {/* Video/scrim bleed past pinRef's own bottom edge into the
            section's pb-24/sm:pb-32 — that space has no content in it (only
            the top has the intro text to protect), so nothing stops the
            color from reaching the section's true bottom edge instead of
            stopping short and leaving a plain band. No overflow-hidden on
            pinRef itself — that would clip this bleed right back off; the
            section's own overflow-hidden (for its rounded corners) is the
            only clip boundary that should apply here. */}
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
            {STEPS.map((step, i) => (
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
            <span aria-hidden="true">↓</span> kaydırdıkça ilerler
          </span>
      </div>
    </section>
  );
}

"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import { PLATFORM_REGISTRY } from "@/lib/platformData";
import {
  InstagramGridPreview,
  LinkedInPreviewCard,
  TikTokPreviewCard,
  YouTubePreviewCard,
  WooCommercePreviewCard,
  BlueskyPreviewCard,
  ShopifyPreviewCard,
  GoogleBusinessPreviewCard,
  DiscordPreviewCard,
  WhatsAppPreviewCard,
  CanvaPreviewCard,
  GenericSocialPreviewCard,
} from "@/components/platformlar/PlatformPreviews";
import {
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineBookmark,
  HiOutlineBolt,
  HiOutlineChevronRight,
} from "react-icons/hi2";

export default function PlatformDetailPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.platform as PlatformName;
  const config = PLATFORM_REGISTRY[slug];

  if (!config) {
    notFound();
  }

  const otherPlatforms = (Object.keys(PLATFORM_REGISTRY) as PlatformName[]).filter(
    (p) => p !== slug
  );

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-bg text-ink selection:bg-accent selection:text-white">
        <SiteHeader />

        <main className="flex-1">
          {/* ================= HERO SECTION (Ocoya Pure Light SaaS Style) ================= */}
          <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
            {/* Ambient subtle colorful glow */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(250,82,82,0.12),rgba(109,79,235,0.08),transparent_70%)]"
              aria-hidden="true"
            />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
                {/* Left Column: Interactive / Live Visual Card */}
                <div className="order-2 lg:order-1">
                  {slug === "instagram" && <InstagramGridPreview />}
                  {slug === "linkedin" && <LinkedInPreviewCard />}
                  {slug === "tiktok" && <TikTokPreviewCard />}
                  {slug === "youtube" && <YouTubePreviewCard />}
                  {slug === "woocommerce" && <WooCommercePreviewCard />}
                  {slug === "bluesky" && <BlueskyPreviewCard />}
                  {slug === "shopify" && <ShopifyPreviewCard />}
                  {slug === "google-business" && <GoogleBusinessPreviewCard />}
                  {slug === "discord" && <DiscordPreviewCard />}
                  {slug === "whatsapp" && <WhatsAppPreviewCard />}
                  {slug === "canva" && <CanvaPreviewCard />}
                  {slug !== "instagram" &&
                    slug !== "linkedin" &&
                    slug !== "tiktok" &&
                    slug !== "youtube" &&
                    slug !== "woocommerce" &&
                    slug !== "bluesky" &&
                    slug !== "shopify" &&
                    slug !== "google-business" &&
                    slug !== "discord" &&
                    slug !== "whatsapp" &&
                    slug !== "canva" && (
                      <GenericSocialPreviewCard name={slug} />
                    )}
                </div>

                {/* Right Column: Hero Content */}
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-3">
                    <PlatformIcon
                      name={config.slug}
                      variant="tile"
                      className="h-12 w-12 rounded-2xl shadow-md"
                    />
                    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-800">
                      {config.categoryBadge}
                    </span>
                  </div>

                  <h1 className="mt-6 max-w-xl font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                    {config.headline}
                  </h1>

                  <p className="mt-5 max-w-lg font-body text-base leading-relaxed text-muted sm:text-lg">
                    {config.subhead}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3.5">
                    <Link
                      href="/kayit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-body text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgb(109_79_235/0.6)] transition-all hover:bg-accent-hover hover:shadow-xl sm:text-base"
                    >
                      {config.connectCta}
                      <HiOutlineArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/platformlar"
                      className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3.5 font-body text-sm font-semibold text-ink shadow-xs transition-colors hover:border-slate-300 hover:bg-surface-soft sm:text-base"
                    >
                      Tüm Platformlar
                    </Link>
                  </div>

                  <div className="mt-7 flex items-center gap-4 text-xs font-medium text-muted">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
                      {config.statusLabel}
                    </span>
                    <span>•</span>
                    <span>Telefonsuz doğrudan otonom yayın</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= EVERY FORMAT SECTION (Light Slate Contrast) ================= */}
          <section className="bg-surface-soft/60 border-y border-line py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text shadow-xs">
                  {config.formatSection.badge}
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                  {config.formatSection.title}
                </h2>
                <p className="mt-4 text-base text-muted sm:text-lg">
                  {config.formatSection.sub}
                </p>
              </div>

              <div className="mt-14 grid gap-6 md:grid-cols-3">
                {config.formatSection.cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-[#FA5252]">
                          <HiOutlineSparkles className="h-5 w-5" />
                        </span>
                        <span className="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-muted">
                          {card.badge}
                        </span>
                      </div>

                      <div className="mt-6 flex items-end gap-3.5">
                        <div
                          className={`relative w-20 shrink-0 overflow-hidden rounded-xl border border-line/60 shadow-xs ${card.ratio}`}
                        >
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-bold text-ink">
                            {card.title}
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-muted">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ================= HASHTAGS & AI CAPTIONS ================= */}
          <section className="bg-bg py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <span className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
                    {config.featureSection.badge}
                  </span>
                  <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    {config.featureSection.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                    {config.featureSection.sub}
                  </p>

                  <div className="mt-6">
                    <Link
                      href="/nasil-calisir"
                      className="inline-flex items-center gap-2 text-sm font-bold text-accent transition-colors hover:text-accent-hover"
                    >
                      AI İçerik Motoru Nasıl Çalışır?
                      <HiOutlineChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Right: Realistic Caption Preview Box */}
                <div className="rounded-3xl border border-line bg-surface p-7 shadow-[0_20px_50px_rgba(28,20,48,0.06)]">
                  <p className="font-body text-sm font-medium leading-relaxed text-ink">
                    {config.featureSection.captionSample}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {config.featureSection.tagsSample.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-sky-50 border border-sky-200/60 px-3 py-1 text-xs font-bold text-sky-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-line/60 pt-3.5 text-xs font-medium text-faint">
                    <HiOutlineBookmark className="h-4 w-4 text-accent" />
                    <span>{config.featureSection.sourceLibrary}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= 3-STEP SETUP GUIDE ================= */}
          <section className="bg-surface-soft/60 border-y border-line py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text shadow-xs">
                  KURULUM REHBERİ
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                  Üç adımda yayına hazır.
                </h2>
              </div>

              <div className="relative mt-14 grid gap-6 md:grid-cols-3">
                {/* Connecting subtle line behind step cards */}
                <div
                  className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-6 bg-gradient-to-r from-transparent via-line to-transparent md:block"
                  aria-hidden="true"
                />

                {config.setupSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-3xl border border-line bg-surface p-7 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
                  >
                    <div className="mb-3 font-mono text-xs font-extrabold tracking-widest text-accent">
                      {s.step}
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ================= ALSO CONNECTS WITH ================= */}
          <section className="border-t border-line bg-bg py-16">
            <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
              <p className="text-xs font-bold uppercase tracking-widest text-faint">
                Tentamark ile Birlikte Çalışan Diğer Platformlar
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                {otherPlatforms.map((otherSlug) => {
                  const other = PLATFORM_REGISTRY[otherSlug];
                  return (
                    <Link
                      key={otherSlug}
                      href={`/platformlar/${otherSlug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted shadow-xs transition-all hover:border-accent/40 hover:bg-surface-soft hover:text-ink"
                    >
                      <PlatformIcon
                        name={other.slug}
                        variant="bare"
                        className="h-4 w-4"
                      />
                      <span>{other.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= HIGH-CONVERTING CTA (Light SaaS Card with Tentamark Tokens) ================= */}
          <section className="bg-bg py-16 px-6">
            <div className="mx-auto max-w-5xl rounded-3xl border border-line bg-gradient-to-br from-bg-violet via-surface to-bg-coral p-10 text-center text-ink shadow-[0_20px_50px_rgba(28,20,48,0.06)] sm:p-14 lg:p-16">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle border border-accent/20 px-3.5 py-1 text-xs font-bold text-accent-text">
                <HiOutlineBolt className="h-3.5 w-3.5 text-accent" />
                14 Günlük Ücretsiz Deneme
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-ink">
                {config.name} içeriklerinizi <span className="spectrum-text">otonom yayına geçirin.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
                Haftalık içerik planınızı 10 dakikada hazırlayın. Marka dilinizi öğrenen yapay zeka ile son söz sizde kalsın.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/kayit"
                  className="rounded-full bg-accent px-8 py-3.5 font-body text-base font-bold text-white shadow-[0_10px_24px_-10px_rgb(109_79_235/0.6)] transition-all hover:bg-accent-hover hover:shadow-xl"
                >
                  {config.connectCta} — Ücretsiz Başla
                </Link>
                <Link
                  href="/platformlar"
                  className="rounded-full border border-line bg-surface px-6 py-3.5 font-body text-base font-semibold text-ink hover:bg-surface-soft transition-colors shadow-xs"
                >
                  Tüm Entegrasyonları İncele
                </Link>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </LanguageProvider>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import { PLATFORM_REGISTRY, type PlatformConfig } from "@/lib/platformData";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineBolt,
  HiOutlineSquares2X2,
} from "react-icons/hi2";

type FilterCategory = "all" | "social" | "video" | "messaging" | "creative";

function PlatformlarHubContent() {
  const { t, locale } = useLanguage();
  const copy = t.pages.platforms;
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allPlatforms = useMemo(() => Object.values(PLATFORM_REGISTRY), []);

  const filteredPlatforms = useMemo(() => {
    return allPlatforms.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.headline.toLowerCase().includes(query) ||
        p.shortDesc.toLowerCase().includes(query) ||
        t.platformSummaries[p.slug].headline.toLowerCase().includes(query) ||
        t.platformSummaries[p.slug].shortDesc.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [allPlatforms, selectedCategory, searchQuery, t]);

  const categories: { id: FilterCategory; label: string }[] = [
    { id: "all", label: copy.categories.all },
    { id: "social", label: copy.categories.social },
    { id: "video", label: copy.categories.video },
    { id: "creative", label: copy.categories.creative },
    { id: "messaging", label: copy.categories.messaging },
  ];

  return (
      <div className="flex min-h-screen flex-col bg-bg text-ink selection:bg-accent selection:text-white">
        <SiteHeader />

        <main className="flex-1">
          {/* ================= HERO & SEARCH ================= */}
          <section className="relative overflow-hidden pt-14 pb-14 sm:pt-18 sm:pb-18 lg:pt-20 lg:pb-20">
            {/* Soft Ambient Radial Light */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(109,79,235,0.12),rgba(250,82,82,0.08),transparent_70%)]"
              aria-hidden="true"
            />

            <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text shadow-xs">
                <HiOutlineSparkles className="h-3.5 w-3.5 text-accent" />
                {copy.eyebrow}
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                {copy.titleBefore}<span className="spectrum-text">{copy.titleHighlight}</span>{copy.titleAfter}
              </h1>

              <p className="mx-auto mt-4 max-w-2xl font-body text-base text-muted sm:text-lg">
                {copy.description}
              </p>

              {/* Search & Filter Bar */}
              <div className="mx-auto mt-10 max-w-2xl">
                <div className="relative flex items-center">
                  <HiOutlineMagnifyingGlass className="absolute left-4 h-5 w-5 text-faint" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={copy.searchPlaceholder}
                    className="w-full rounded-full border border-line bg-surface py-3.5 pr-4 pl-12 font-body text-sm text-ink shadow-[0_4px_20px_rgba(28,20,48,0.04)] placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                    >
                      {copy.clear}
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === c.id
                          ? "bg-accent text-white shadow-md shadow-accent/25"
                          : "border border-line bg-surface text-muted hover:border-slate-300 hover:bg-surface-soft hover:text-ink"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ================= SPOTLIGHT FEATURED HERO BANNER ================= */}
          <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
            <Link
              href="/platformlar/instagram"
              className="group relative block overflow-hidden rounded-3xl border border-rose-200/70 bg-gradient-to-br from-[#fff7f7] via-surface to-[#fff2f4] p-8 shadow-[0_12px_36px_rgba(250,82,82,0.08)] transition-all hover:-translate-y-1 hover:border-rose-300 hover:shadow-[0_20px_48px_rgba(250,82,82,0.12)] sm:p-10"
            >
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/90 border border-rose-200/80 px-3 py-1 text-[11px] font-bold text-rose-700">
                    <HiOutlineBolt className="h-3.5 w-3.5 text-[#FA5252]" />
                    {copy.featured}
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                    {copy.featuredTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    {copy.featuredDescription}
                  </p>
                  <div className="mt-6 flex items-center gap-2 font-display text-sm font-bold text-[#FA5252] transition-transform group-hover:translate-x-1">
                    <span>{copy.featuredCta}</span>
                    <HiOutlineArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Mini Visual Preview */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-full max-w-xs rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-lg">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <PlatformIcon name="instagram" className="h-6 w-6" variant="tile" />
                      <span className="text-xs font-bold text-slate-900">@tastybites.co</span>
                      <span className="ml-auto rounded-full bg-rose-50 border border-rose-200/60 px-2 py-0.5 text-[9px] font-bold text-rose-600">
                        {copy.liveGrid}
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-50 p-1 border border-slate-100">
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image src="/images/mock-data/orange-slices.jpg" alt="" fill className="object-cover" />
                        <span className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[6px] font-bold text-white">REEL</span>
                      </div>
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image src="/images/mock-data/acai-bowl.jpg" alt="" fill className="object-cover" />
                        <span className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[6px] font-bold text-white">1/4</span>
                      </div>
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image src="/images/mock-data/iced-latte.jpg" alt="" fill className="object-cover" />
                        <span className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[6px] font-bold text-white">{copy.new}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>

          {/* ================= PLATFORMS GRID (Pure Light Directory Style) ================= */}
          <section className="bg-surface-soft/60 border-y border-line py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <p className="text-sm font-bold text-ink">
                  {copy.resultCount.replace("{count}", String(filteredPlatforms.length))}
                </p>
                <span className="text-xs font-medium text-muted">
                  {copy.officialApis}
                </span>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlatforms.map((platform) => (
                  <Link
                    key={platform.slug}
                    href={`/platformlar/${platform.slug}`}
                    className="group relative flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <PlatformIcon
                            name={platform.slug}
                            variant="tile"
                            className="h-11 w-11 rounded-2xl shadow-sm transition-transform group-hover:scale-105"
                          />
                          <div>
                            <h3 className="font-display text-base font-bold text-ink group-hover:text-accent transition-colors">
                              {platform.name}
                            </h3>
                            <span className="text-[11px] font-medium text-muted">
                              {locale === "en" ? copy.categories[platform.category === "creative" ? "creative" : platform.category === "video" ? "video" : platform.category === "social" ? "social" : "messaging"] : platform.categoryBadge.split("·")[0].trim()}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          {copy.active}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-4 text-xs leading-relaxed text-muted line-clamp-2">
                        {locale === "en" ? t.platformSummaries[platform.slug].shortDesc : platform.headline}
                      </p>

                      {/* Format Pills */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {platform.formatSection.cards.map((card, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-surface-soft border border-line/60 px-2 py-0.5 text-[10px] font-medium text-muted"
                          >
                            {locale === "en" ? t.platformSummaries[platform.slug].formats[i] ?? card.title : card.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4">
                      <span className="text-xs font-semibold text-faint group-hover:text-muted">
                        {platform.statusLabel}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-accent transition-transform group-hover:translate-x-1">
                        {copy.explore}
                        <HiOutlineArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ================= ENTERPRISE / API CALLOUT (Colorful White Card) ================= */}
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="rounded-3xl border border-line bg-gradient-to-br from-bg-violet via-surface to-bg-sky p-8 shadow-[0_20px_50px_rgba(28,20,48,0.06)] sm:p-12 lg:p-16">
                <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle border border-accent/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
                      <HiOutlineBolt className="h-3.5 w-3.5 text-accent" />
                      {copy.developer}
                    </span>
                    <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                      {copy.developerTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                      {copy.developerDescription}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        href="/kayit"
                        className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-md shadow-accent/25 hover:bg-accent-hover transition-all"
                      >
                        {copy.getApiKey}
                      </Link>
                      <Link
                        href="/gelistiriciler"
                        className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-surface-soft transition-colors"
                      >
                        {copy.viewDocs}
                      </Link>
                    </div>
                  </div>

                  {/* Clean Code Preview Block — mirrors the real MCP connect snippet on /gelistiriciler */}
                  <div className="overflow-hidden rounded-2xl border border-line bg-surface p-5 font-mono text-xs leading-relaxed text-ink shadow-lg">
                    <p className="text-faint">{copy.codeComment}</p>
                    <p className="mt-1 font-bold text-accent">npx mcp-remote https://tentamark.com/api/mcp</p>
                    <p className="text-muted mt-2">&#123;</p>
                    <p className="pl-4 text-ink">&quot;tool&quot;: &quot;create_post_draft&quot;,</p>
                    <p className="pl-4 text-ink">&quot;idea&quot;: &quot;{copy.codeTopic}&quot;,</p>
                    <p className="pl-4 text-ink">&quot;platforms&quot;: [&quot;instagram&quot;]</p>
                    <p className="text-muted">&#125;</p>
                    <p className="mt-3 font-semibold text-emerald-600">{copy.codeSuccess}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
  );
}

export default function PlatformlarHubPage() {
  return <LanguageProvider><PlatformlarHubContent /></LanguageProvider>;
}

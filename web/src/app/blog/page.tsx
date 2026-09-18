"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlogCard from "@/components/blog/BlogCard";
import { getAllPosts, getFeaturedPost, getCategoryMeta } from "@/lib/blog/blogUtils";
import { BLOG_CATEGORIES } from "@/lib/blog/blogCategories";
import { BlogCategory } from "@/lib/blog/blogTypes";
import { formatPublishedAt } from "@/lib/blog/formatPublishedAt";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineClock,
  HiOutlineArrowRight,
} from "react-icons/hi2";

function BlogIndexContent() {
  const { t, locale } = useLanguage();
  const copy = t.pages.blog;
  const allPosts = useMemo(() => getAllPosts(), []);
  const featuredPost = useMemo(() => getFeaturedPost(), []);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCat = selectedCategory === "all" || post.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = post.title.toLowerCase().includes(q);
      const inExcerpt = post.excerpt.toLowerCase().includes(q);
      const inTags = post.tags.some((t) => t.toLowerCase().includes(q));

      return inTitle || inExcerpt || inTags;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  const activeCategoryMeta = selectedCategory !== "all" 
    ? getCategoryMeta(selectedCategory as BlogCategory) 
    : null;
  const showFeatured = selectedCategory === "all" && !searchQuery.trim() && !!featuredPost;
  const visiblePosts = showFeatured
    ? filteredPosts.filter((post) => post.id !== featuredPost.id)
    : filteredPosts;

  return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#172B46] selection:bg-rose-100 selection:text-[#172B46]">
        <SiteHeader />

        <main className="pt-20 pb-20">
          <section className="border-b border-[#E3E6E9] px-4 pb-9 pt-10 sm:px-6 sm:pt-14 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#C92E35]">{copy.eyebrow}</p>
                  <h1 className="font-body text-4xl font-bold leading-[1.13] tracking-[-0.045em] text-[#172B46] sm:text-5xl lg:text-[3.5rem]">
                    {copy.titleBefore}<span className="text-[#D74444]">{copy.titleHighlight}</span>
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-[#536276] sm:text-lg">
                    {copy.description}
                  </p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-80 md:shrink-0">
                  <div className="relative">
                    <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <label htmlFor="blog-search" className="sr-only">{copy.searchLabel}</label>
                    <input
                      id="blog-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={copy.searchPlaceholder}
                      className="w-full rounded-xl border border-[#D9DEE3] bg-white py-3 pl-11 pr-4 text-sm text-[#172B46] placeholder:text-[#8691A0] focus:border-[#FA5252] focus:outline-none focus:ring-4 focus:ring-[#FA5252]/10 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" aria-label={copy.categoryLabel}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  aria-pressed={selectedCategory === "all"}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === "all"
                      ? "border-[#172B46] bg-[#172B46] text-white"
                      : "border-[#D9DEE3] bg-white text-[#536276] hover:border-[#172B46] hover:text-[#172B46]"
                  }`}
                >
                  {copy.allTopics.replace("{count}", String(allPosts.length))}
                </button>

                {BLOG_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = allPosts.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? "border-[#172B46] bg-[#172B46] text-white"
                          : "border-[#D9DEE3] bg-white text-[#536276] hover:border-[#172B46] hover:text-[#172B46]"
                      }`}
                    >
                      <span>{copy.categories[cat.id as keyof typeof copy.categories]?.name ?? cat.name}</span>
                      <span className={isSelected ? "text-white/70" : "text-[#8691A0]"}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {showFeatured && (
            <section className="mx-auto max-w-6xl px-4 pb-4 pt-10 sm:px-6 lg:px-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#C92E35]">{copy.featured}</p>
              <div className="group overflow-hidden rounded-2xl border border-[#E3E6E9] bg-white transition-colors hover:border-[#C6CED6]">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Image Column */}
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto w-full overflow-hidden bg-slate-100 block"
                  >
                    <Image
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </Link>

                  {/* Content Column */}
                  <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#C92E35]">
                          {copy.categories[featuredPost.category]?.name ?? featuredPost.categoryLabel}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          {copy.readingTime.replace("{count}", String(featuredPost.readingTime))}
                        </span>
                      </div>

                      <h2 className="font-body text-2xl font-bold leading-tight tracking-[-0.025em] text-[#172B46] transition-colors group-hover:text-[#C92E35] sm:text-3xl">
                        <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                      </h2>
                      {locale === "en" && <p className="mt-2 text-xs font-semibold text-amber-700">{copy.articleLanguage}</p>}

                      <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#536276] sm:text-base">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#E3E6E9] pt-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#E3E6E9] bg-[#FAF9F6]">
                          <Image
                            src={featuredPost.author.avatar}
                            alt={featuredPost.author.name}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{featuredPost.author.name}</p>
                          <p className="text-[11px] text-slate-400">{formatPublishedAt(featuredPost.publishedAt, locale)}</p>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C92E35] hover:text-[#A5202B] transition-colors"
                      >
                        <span>{copy.readGuide}</span>
                        <HiOutlineArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Category Banner if filtered */}
          {activeCategoryMeta && (
            <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
              <div className="border-l-2 border-[#FA5252] bg-white px-6 py-5">
                <h2 className="font-body text-xl font-bold text-[#172B46]">
                  {copy.categories[activeCategoryMeta.id]?.name ?? activeCategoryMeta.name}
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  {copy.categories[activeCategoryMeta.id]?.description ?? activeCategoryMeta.description}
                </p>
              </div>
            </div>
          )}

          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#E3E6E9] pb-5">
              <div>
                <h2 className="font-body text-2xl font-bold tracking-[-0.025em] text-[#172B46]">
                  {searchQuery ? copy.searchResults.replace("{query}", searchQuery) : selectedCategory !== "all" ? copy.categoryArticles.replace("{category}", copy.categories[selectedCategory as keyof typeof copy.categories]?.name ?? activeCategoryMeta?.name ?? "") : copy.allArticles}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {copy.guideCount.replace("{count}", String(filteredPosts.length))}
                </p>
              </div>

              {(searchQuery || selectedCategory !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                >
                  {copy.clearFilters}
                </button>
              )}
            </div>

            {visiblePosts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center my-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                  <HiOutlineMagnifyingGlass className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{copy.noResults}</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {copy.noResultsHelp}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  {copy.showAll}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
                {visiblePosts.map((post) => <BlogCard key={post.id} post={post} />)}
              </div>
            )}
          </section>
        </main>

        <SiteFooter />
      </div>
  );
}

export default function BlogIndexPage() {
  return <LanguageProvider><BlogIndexContent /></LanguageProvider>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { getDashboardBriefing } from "@/lib/ai/getDashboardBriefing";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";

type Stats = {
  needsReview: number;
  scheduledThisWeek: number;
  publishedThisWeek: number;
};

type TodayPost = {
  id: string;
  title: string;
  hook?: string;
  status: string;
  scheduledAt?: string;
  platforms: PlatformName[];
  imageUrl?: string | null;
};

function parseCoreIdea(coreIdea?: string | null): { hook: string | null; visualPrompt: string | null } {
  if (!coreIdea) return { hook: null, visualPrompt: null };
  const hookMatch = coreIdea.match(/Kanca(?:\s*\(Hook\))?:\s*([^\n]+)/i);
  const visualMatch = coreIdea.match(/Görsel\/Video Konsepti:\s*([\s\S]+)/i);
  return {
    hook: hookMatch ? hookMatch[1].trim() : null,
    visualPrompt: visualMatch ? visualMatch[1].trim() : (!hookMatch ? coreIdea : null),
  };
}

function firstImageUrl(contentMedia: unknown): string | null {
  const rows = Array.isArray(contentMedia) ? contentMedia : contentMedia ? [contentMedia] : [];
  for (const row of rows as { media?: unknown }[]) {
    const media = Array.isArray(row.media) ? row.media[0] : row.media;
    const url = (media as { file_url?: string } | undefined)?.file_url;
    if (url) return url;
  }
  return null;
}

export default function DashboardHomePage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [briefing, setBriefing] = useState("");
  const [showInsightWhy, setShowInsightWhy] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayPosts, setTodayPosts] = useState<TodayPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Today's formatted date string in Turkish
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      weekday: "long",
    });
  }, []);

  // Fetch AI briefing
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const text = await getDashboardBriefing(brand.id);
        if (!ignore) setBriefing(text);
      } catch (err) {
        console.error("Briefing error:", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [brand.id]);

  // Fetch KPI statistics and recent/today's posts
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingPosts(true);
      const now = new Date();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      try {
        const [
          { count: needsReview },
          { count: scheduledThisWeek },
          { count: publishedThisWeek },
          postsRes,
        ] = await Promise.all([
          supabase
            .from("content")
            .select("id", { count: "exact", head: true })
            .eq("brand_id", brand.id)
            .eq("status", "NEEDS_REVIEW"),
          supabase
            .from("content_platforms")
            .select("id, content!inner(brand_id)", { count: "exact", head: true })
            .eq("content.brand_id", brand.id)
            .in("status", ["QUEUED", "PENDING"])
            .gte("scheduled_at", now.toISOString())
            .lt("scheduled_at", weekEnd.toISOString()),
          supabase
            .from("content_platforms")
            .select("id, content!inner(brand_id)", { count: "exact", head: true })
            .eq("content.brand_id", brand.id)
            .eq("status", "PUBLISHED")
            .gte("published_at", weekAgo.toISOString()),
          supabase
            .from("content")
            .select(
              "id, title, core_idea, category, status, created_at, content_media(media(file_url)), content_platforms(id, platform, status, scheduled_at)"
            )
            .eq("brand_id", brand.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (ignore) return;

        setStats({
          needsReview: needsReview ?? 0,
          scheduledThisWeek: scheduledThisWeek ?? 0,
          publishedThisWeek: publishedThisWeek ?? 0,
        });

        if (postsRes.data) {
          const mapped: TodayPost[] = postsRes.data.map((item) => {
            const { hook } = parseCoreIdea(item.core_idea);
            const imgUrl = firstImageUrl(item.content_media);
            const plats = (item.content_platforms as Array<{ platform: string; scheduled_at?: string }>) || [];
            const platformNames = Array.from(new Set(plats.map((p) => p.platform as PlatformName)));

            return {
              id: String(item.id),
              title: String(item.title || "Yeni İçerik"),
              hook: hook || undefined,
              status: String(item.status),
              scheduledAt: plats[0]?.scheduled_at,
              platforms: platformNames.length > 0 ? platformNames : ["instagram"],
              imageUrl: imgUrl,
            };
          });
          setTodayPosts(mapped);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (!ignore) setLoadingPosts(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Greeting & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            İyi çalışmalar, {brand.name} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Pazarlama motorunuz otopilotta çalışıyor · {todayFormatted}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/compose"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>İçerik Oluştur</span>
          </Link>
          <Link
            href="/dashboard/compose/weekly"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:bg-indigo-600"
          >
            <span>Haftalık Paket</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">⚡ AI</span>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards (4 Pure White Cards with Soft Shadow) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Toplam Erişim */}
        <div className="group rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Toplam Erişim
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              Yakında
            </span>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-300 sm:text-3xl">
              —
            </span>
            <p className="mt-1 text-xs text-slate-500">Analiz özelliği tamamlandığında burada görünecek</p>
          </div>
        </div>

        {/* KPI 2: Etkileşim Oranı */}
        <div className="group rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Etkileşim Oranı
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              Yakında
            </span>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-300 sm:text-3xl">
              —
            </span>
            <p className="mt-1 text-xs text-slate-500">Analiz özelliği tamamlandığında burada görünecek</p>
          </div>
        </div>

        {/* KPI 3: Takipçi Artışı */}
        <div className="group rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Takipçi Artışı
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              Yakında
            </span>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-300 sm:text-3xl">
              —
            </span>
            <p className="mt-1 text-xs text-slate-500">Analiz özelliği tamamlandığında burada görünecek</p>
          </div>
        </div>

        {/* KPI 4: Planlanan İçerik */}
        <Link
          href="/dashboard/posts"
          className="group rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Planlanan İçerik
            </span>
            {stats && stats.needsReview > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {stats.needsReview} Onay Bekliyor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Takvim Aktif
              </span>
            )}
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {stats?.scheduledThisWeek ?? 12}
            </span>
            <p className="mt-1 text-xs text-slate-500">Önümüzdeki 7 günde yayınlanacak</p>
          </div>
          <div className="mt-3.5 flex items-end gap-1 h-2 w-full">
            <div className="h-1 w-full rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#6366F1] w-[90%]"></div>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Hero AI Marketing Insight Card (Violet/Purple Gradient with Mascot) */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-violet-700 via-indigo-600 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        {/* Ambient Decorative Blurs */}
        <div className="pointer-events-none absolute -right-8 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Content side */}
          <div className="max-w-2xl space-y-3.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <span>✨</span>
              <span>AI MARKETING INSIGHT</span>
            </div>

            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl text-white">
              Kısa video ve Reels formatları genellikle statik gönderilerden daha yüksek etkileşim alır.
            </h2>

            <p className="text-sm leading-relaxed text-indigo-100/90 font-normal">
              Bu, farklı sektörlerdeki hesaplarda gözlemlenen genel bir platform davranış kalıbı — markanıza özel
              performans verileri (Analiz sekmesi tamamlandığında) burayı gerçek sayılarınızla güncelleyecek. Bu
              haftaki takvime bir video içerik eklemeyi deneyebilirsiniz.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard/compose"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-95"
              >
                <span>Öneriyi Uygula</span>
                <span>→</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowInsightWhy(!showInsightWhy)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                {showInsightWhy ? "Açıklamayı Kapat" : "Neden?"}
              </button>
            </div>

            {/* Expandable Explanation if "Neden?" is clicked */}
            {showInsightWhy && (
              <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-indigo-100 backdrop-blur-md animate-in fade-in duration-200">
                <p className="font-semibold text-white mb-1">Genel Kaynak:</p>
                <p>
                  Bu öneri, farklı sektörlerdeki hesaplarda gözlemlenen yaygın platform davranış kalıplarına
                  dayanıyor — markanıza özel bir analiz değildir. İlk 3 saniye kancası güçlü dikey videolar
                  genellikle en yüksek kaydetme ve paylaşım oranını yakalıyor.
                </p>
              </div>
            )}
          </div>

          {/* Mascot Side */}
          <div className="relative flex shrink-0 items-center justify-center sm:self-center">
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:scale-105">
              <Image
                src="/tenta-avatar-wink.png"
                alt="Tentamark AI maskotu"
                fill
                priority
                sizes="(max-width: 640px) 128px, 160px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Layout (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Bugün Post Feed & Quick Composer (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Section: Bugün (Scheduled / Queued Posts) */}
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#6366F1]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Bugün</h3>
                  <p className="text-xs text-slate-400">Planlanmış ve onay bekleyen içerikler</p>
                </div>
              </div>

              <Link
                href="/dashboard/calendar"
                className="text-xs font-semibold text-[#6366F1] hover:text-indigo-700 transition flex items-center gap-1"
              >
                <span>Tüm Takvim</span>
                <span>→</span>
              </Link>
            </div>

            {/* Posts List */}
            <div className="mt-4 divide-y divide-slate-100">
              {loadingPosts ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Gönderiler yükleniyor...
                </div>
              ) : todayPosts.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="font-display text-sm font-semibold text-slate-700">
                    Bugün için planlanmış gönderi yok
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    AI ile haftalık içerik takviminizi saniyeler içinde doldurun.
                  </p>
                  <Link
                    href="/dashboard/compose/weekly"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-600 transition"
                  >
                    Haftalık Paket Oluştur 🚀
                  </Link>
                </div>
              ) : (
                todayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 group hover:bg-slate-50/60 rounded-xl px-2.5 -mx-2.5 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Platform Icon or Image thumbnail */}
                      {post.imageUrl ? (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 shadow-xs">
                          <Image src={post.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          {post.platforms[0] ? (
                            <PlatformIcon name={post.platforms[0]} className="h-6 w-6" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">POST</span>
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                          {post.hook || post.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="capitalize">{post.platforms.join(", ")}</span>
                          <span>·</span>
                          <span>
                            {post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleTimeString("tr-TR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Taslak"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {/* Status badge */}
                      {post.status === "NEEDS_REVIEW" ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                          Onay Bekliyor
                        </span>
                      ) : post.status === "PUBLISHED" ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          Yayınlandı
                        </span>
                      ) : (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                          Planlandı
                        </span>
                      )}

                      <Link
                        href="/dashboard/posts"
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition shadow-2xs"
                      >
                        İncele
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick AI Generator Banner */}
          <div className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg shadow-slate-900/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                  AI Marketing Engine
                </span>
                <h4 className="font-display text-base font-bold text-white">
                  Yeni içerik fikrine mi ihtiyacınız var?
                </h4>
                <p className="text-xs text-slate-300">
                  Marka DNA&apos;nıza uygun metin, görsel prompt ve hashtag&apos;leri saniyeler içinde otomatik hazırlayın.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href="/dashboard/compose"
                  className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition"
                >
                  Tekli İçerik
                </Link>
                <Link
                  href="/dashboard/compose/weekly"
                  className="rounded-xl bg-[#6366F1] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-600 transition"
                >
                  7 Günlük Paket ⚡
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Marketing Pulse & AI To-Dos (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card 1: Marketing Pulse (Platform Performance Breakdown) */}
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Marketing Pulse</h3>
                  <p className="text-xs text-slate-400">Kanal bazlı performans dağılımı</p>
                </div>
              </div>

              {/* Coming Soon Pill */}
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                Yakında
              </div>
            </div>

            {/* Platform performance: not yet available, no fabricated per-channel numbers */}
            <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-400">
                soon
              </span>
              <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                Kanal bazlı performans dağılımı, Analiz özelliği tamamlandığında burada gerçek verilerinizle
                görünecek.
              </p>
            </div>

            {/* Weekly Publish Footer (real data) */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Bu hafta yayınlanan</span>
              <span className="font-bold text-slate-800">{stats?.publishedThisWeek ?? 0} gönderi</span>
            </div>
          </div>

          {/* Card 2: AI Yapılacaklar (Smart Actions Checklist) */}
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">AI Yapılacaklar</h3>
                  <p className="text-xs text-slate-400">Akıllı eylem önerileri</p>
                </div>
              </div>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-[#6366F1]">
                4 Görev
              </span>
            </div>

            {/* Checklist Items */}
            <div className="mt-4 space-y-2.5">
              <Link
                href="/dashboard/posts"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-indigo-600 group-hover:border-indigo-400">
                    <svg className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    {stats?.needsReview ?? 3} onay bekleyen gönderiyi gözden geçir
                  </span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-indigo-600">→</span>
              </Link>

              <Link
                href="/dashboard/compose/weekly"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-indigo-600 group-hover:border-indigo-400">
                    <svg className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    Haftalık içerik takvimini tamamla
                  </span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-indigo-600">→</span>
              </Link>

              <Link
                href="/dashboard/campaigns"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-indigo-600 group-hover:border-indigo-400">
                    <svg className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    {brand.name} kampanya hedeflerini güncelle
                  </span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-indigo-600">→</span>
              </Link>

              <Link
                href="/dashboard/connections"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-indigo-600 group-hover:border-indigo-400">
                    <svg className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                    Sosyal medya hesap bağlantılarını doğrula
                  </span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-indigo-600">→</span>
              </Link>
            </div>

            {/* AI Briefing Note if available */}
            {briefing && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-indigo-900 block mb-1">📋 Günlük AI Özeti:</span>
                <p className="whitespace-pre-line text-slate-700">{briefing}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

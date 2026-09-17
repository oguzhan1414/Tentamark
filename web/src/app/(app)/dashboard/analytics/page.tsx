"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import {
  getAnalyticsOverview,
  type AnalyticsOverview,
  type SocialChannelMetric,
} from "@/lib/ai/getAnalyticsOverview";
import { STATUS_LABEL, type UIStatus } from "@/lib/contentStatus";
import { PLATFORM_LABEL } from "@/lib/ai/platforms";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import AnalyticsPageHeader from "@/components/dashboard/analytics/AnalyticsPageHeader";
import { useLanguage } from "@/context/LanguageContext";
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineBolt,
  HiOutlineEye,
  HiOutlineClock,
} from "react-icons/hi2";

const STATUS_ORDER: UIStatus[] = ["published", "scheduled", "review", "draft", "failed"];
const STATUS_BAR_COLOR: Record<UIStatus, string> = {
  published: "bg-emerald-500",
  scheduled: "bg-[#FA5252]",
  review: "bg-amber-500",
  draft: "bg-slate-400",
  failed: "bg-red-500",
};

type DateRange = "7d" | "30d" | "month" | "all";

export default function AnalyticsPage() {
  const brand = useBrand();
  const { locale, t } = useLanguage();
  const an = t.dashboard.analytics;

  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getAnalyticsOverview(brand.id)
      .then((d) => {
        if (!ignore) setData(d);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [brand.id]);

  const filteredChannels = useMemo(() => {
    if (!data) return [];
    if (selectedChannel === "all") return data.channels;
    return data.channels.filter((c) => c.platform === selectedChannel);
  }, [data, selectedChannel]);

  const filteredTopPosts = useMemo(() => {
    if (!data) return [];
    if (selectedChannel === "all") return data.topPosts;
    return data.topPosts.filter((p) => p.platform === selectedChannel);
  }, [data, selectedChannel]);

  const dateLocale = locale === "en" ? "en-US" : "tr-TR";

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        icon={HiOutlineChartBar}
        title={an.title}
        subtitle={`${brand.name} ${an.subtitle}`}
      >
        {/* Date Range Selector Pills */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setDateRange("7d")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              dateRange === "7d" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {an.ranges.d7}
          </button>
          <button
            type="button"
            onClick={() => setDateRange("30d")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              dateRange === "30d" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {an.ranges.d30}
          </button>
          <button
            type="button"
            onClick={() => setDateRange("month")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              dateRange === "month" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {an.ranges.month}
          </button>
          <button
            type="button"
            onClick={() => setDateRange("all")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              dateRange === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {an.ranges.all}
          </button>
        </div>

        <Link
          href="/dashboard/calendar"
          className="rounded-xl bg-[#FA5252] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#E03131] transition"
        >
          {locale === "en" ? "Go to Calendar →" : "Takvime Git →"}
        </Link>
      </AnalyticsPageHeader>

      {loading || !data ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
            <span>{locale === "en" ? "Calculating performance data..." : "Performans verileri hesaplanıyor..."}</span>
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* 2. Primary KPI Cards (Crisp White SaaS Cards)             */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Toplam Takipçi */}
            <WhiteStatCard
              icon={HiOutlineUsers}
              label={an.kpis.audience}
              value={data.totalFollowers.toLocaleString(dateLocale)}
              badge={`↑ +${data.followersGrowthPct}% ${locale === "en" ? "this week" : "bu hafta"}`}
              badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200"
              subtext={locale === "en" ? "Instagram, LinkedIn, Facebook, and TikTok combined" : "Instagram, LinkedIn, Facebook ve TikTok toplamı"}
            />

            {/* Card 2: Haftalık Yayınlanan Gönderi */}
            <WhiteStatCard
              icon={HiOutlineDocumentText}
              label={an.kpis.scheduledPosts}
              value={`${data.totalPosts || 23} ${locale === "en" ? "Posts" : "Gönderi"}`}
              badge={data.publishSuccessRatePct !== null ? `${data.publishSuccessRatePct}% ${locale === "en" ? "success" : "başarı"}` : (locale === "en" ? "Active" : "Aktif")}
              badgeColor="bg-rose-50 text-rose-700 border border-rose-200"
              subtext={locale === "en" ? "All scheduled content published on time" : "Planlanan tüm içerikler zamanında yayında"}
            />

            {/* Card 3: Ortalama Etkileşim Oranı */}
            <WhiteStatCard
              icon={HiOutlineBolt}
              label={an.kpis.engagementRate}
              value={`%${data.avgEngagementRate}`}
              badge={locale === "en" ? "85% above industry avg" : "Sektörün %85 üzerinde"}
              badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200"
              subtext={locale === "en" ? "Likes, comments, saves, and clicks rate" : "Beğeni, yorum, kaydetme ve tıklama oranı"}
            />

            {/* Card 4: Toplam Haftalık Erişim */}
            <WhiteStatCard
              icon={HiOutlineEye}
              label={an.kpis.impressions}
              value={`${(data.weeklyReach / 1000).toFixed(1)}K`}
              badge={`↑ +${data.weeklyReachGrowthPct}% ${locale === "en" ? "growth" : "artış"}`}
              badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200"
              subtext={locale === "en" ? "Unique audience reach volume" : "Tekil kullanıcılara erişim hacmi"}
            />
          </div>

          {/* ========================================================= */}
          {/* 3. Platform Channel Filter & Breakdown Cards              */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold text-slate-900">
                {an.channelsTitle}
              </span>

              {/* Channel switcher buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                {["all", "instagram", "linkedin", "facebook", "tiktok"].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      selectedChannel === ch
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {ch === "all" ? an.allChannels : ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredChannels.map((c) => (
                <ChannelCard key={c.platform} channel={c} locale={locale} />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. Two Column Section: Velocity Chart & Best Hours        */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Velocity Chart (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    {locale === "en" ? "Weekly Publishing & Audience Volume" : "Haftalık Yayın & Kitle Hacmi"}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {locale === "en" ? "Distribution of published posts over the past 8 weeks" : "Son 8 haftada yayınlanan gönderilerin zaman içindeki dağılımı"}
                  </p>
                </div>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                  {locale === "en" ? "Past 8 Weeks" : "Son 8 Hafta"}
                </span>
              </div>

              {/* Bar visualization */}
              <div className="pt-6">
                <div className="flex h-44 items-end gap-3 sm:gap-4 border-b border-slate-100 pb-2">
                  {data.weeklyVelocity.map((w, i) => {
                    const max = Math.max(1, ...data.weeklyVelocity.map((x) => x.count));
                    const heightPercent = w.count === 0 ? 4 : Math.max(10, (w.count / max) * 100);

                    return (
                      <div
                        key={i}
                        className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 hidden rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-xs group-hover:block z-10 whitespace-nowrap">
                          {w.count} {locale === "en" ? "posts" : "gönderi"}
                        </div>

                        <div
                          className="w-full rounded-t-lg bg-[#FA5252]/85 group-hover:bg-[#FA5252] transition-all cursor-pointer"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-900 transition">
                          {w.weekLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Best Posting Hours & Heatmap (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider">
                  <HiOutlineClock className="h-4 w-4 stroke-[2]" />
                  <span>{locale === "en" ? "Best Posting Times" : "En İyi Paylaşım Saatleri"}</span>
                </div>
                <h3 className="font-display text-sm font-bold text-slate-900 mt-1">
                  {locale === "en" ? "Audience Activity Analysis" : "Kitle Aktivite Analizi"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === "en" ? "Peak time windows when followers engage most" : "Takipçilerinizin en çok etkileşime girdiği zaman pencereleri"}
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {data.bestPostingHours.map((slot, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5 hover:border-rose-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">{slot.day}</span>
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        {slot.peakHour}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{slot.note}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{ width: `${slot.activityScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-700">
                        %{slot.activityScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. Top Performing Content Section                         */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {an.topPostsTitle}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {locale === "en" ? "Content generating highest reach and saves in the algorithm" : "Algoritmada en yüksek erişim ve kaydetme getiren içerikleriniz"}
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredTopPosts.length} {locale === "en" ? "top posts listed" : "en iyi içerik listeleniyor"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">{locale === "en" ? "Post" : "Gönderi"}</th>
                    <th className="py-3 px-3">{locale === "en" ? "Channel" : "Kanal"}</th>
                    <th className="py-3 px-3 text-right">{locale === "en" ? "Reach" : "Erişim"}</th>
                    <th className="py-3 px-3 text-right">{locale === "en" ? "Likes" : "Beğeni"}</th>
                    <th className="py-3 px-3 text-right">{locale === "en" ? "Comments" : "Yorum"}</th>
                    <th className="py-3 px-3 text-right">{locale === "en" ? "Saves" : "Kaydetme"}</th>
                    <th className="py-3 px-3 text-right">{locale === "en" ? "Engagement" : "Etkileşim"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body">
                  {filteredTopPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 max-w-sm sm:max-w-md">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{post.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{post.publishedAt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <PlatformIcon name={post.platform as PlatformName} className="h-4 w-4" />
                          <span className="capitalize text-slate-700 font-medium">{post.platform}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        {post.reach}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {post.likes.toLocaleString(dateLocale)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {post.comments.toLocaleString(dateLocale)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {post.saves.toLocaleString(dateLocale)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
                          {post.engagementRate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 6. Content Status & Strategy Adherence Section            */}
          {/* ========================================================= */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Content Pipeline Status */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {locale === "en" ? "Content Pipeline Status" : "İçerik Havuzu Durumu"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {locale === "en" ? "Production and publishing status of all operational posts" : "Operasyondaki tüm gönderilerin üretim ve yayın statüleri"}
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {STATUS_ORDER.map((key) => {
                  const count = data.statusBreakdown[key];
                  const max = Math.max(1, ...Object.values(data.statusBreakdown));
                  const { label, className } = STATUS_LABEL[key];
                  const statusMap: Record<UIStatus, string> = {
                    draft: t.dashboard.posts.tabs.drafts,
                    scheduled: t.dashboard.posts.tabs.scheduled,
                    published: t.dashboard.posts.tabs.published,
                    review: t.dashboard.posts.tabs.needsReview,
                    failed: t.dashboard.posts.tabs.failed,
                  };
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span
                        className={`w-24 shrink-0 rounded-full px-2 py-0.5 text-center font-mono text-[10px] font-bold ${className}`}
                      >
                        {statusMap[key] || label}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${STATUS_BAR_COLOR[key]} transition-all`}
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-mono text-xs font-bold text-slate-700">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategy Adherence */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {locale === "en" ? "Strategy Adherence" : "İçerik Stratejisi Uyumu"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {locale === "en" ? "Target strategic pillar distribution vs actual published content" : "Belirlenen stratejik sütun hedefleri ile gerçekleşen içerik dağılımı"}
                </p>
              </div>

              {data.pillarAdherence.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">
                  {locale === "en" ? "Plan-vs-actual comparison will appear here as strategy is established." : "Strateji oluşturuldukça plan-uyum karşılaştırması burada yer alacaktır."}
                </p>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <span className="w-28 shrink-0">{locale === "en" ? "Pillar" : "Sütun"}</span>
                    <span className="w-16 text-right shrink-0">{locale === "en" ? "Target" : "Hedef"}</span>
                    <span className="flex-1">{locale === "en" ? "Actual" : "Gerçekleşen"}</span>
                  </div>
                  {data.pillarAdherence.map((p) => (
                    <div key={p.name} className="flex items-center gap-4">
                      <span className="w-28 shrink-0 text-xs font-medium text-slate-800 truncate">
                        {p.name}
                      </span>
                      <span className="w-16 shrink-0 text-right font-mono text-xs text-slate-500">
                        %{p.planned}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(100, p.actual)}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right font-mono text-xs font-bold text-slate-700">
                          %{p.actual}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Helper UI Components (Clean White SaaS Design)
// -------------------------------------------------------------

function WhiteStatCard({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
  subtext: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5 stroke-[1.75]" />
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
          {badge}
        </span>
      </div>

      <div>
        <p className="font-mono text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </p>
        <p className="text-xs font-semibold text-slate-600 mt-1">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>
      </div>
    </div>
  );
}

function ChannelCard({ channel, locale }: { channel: SocialChannelMetric; locale?: string }) {
  const isEn = locale === "en";
  const dateLoc = isEn ? "en-US" : "tr-TR";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3 hover:border-slate-300 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformIcon name={channel.platform as PlatformName} className="h-6 w-6 rounded-md" />
          <span className="font-semibold text-xs capitalize text-slate-900">
            {PLATFORM_LABEL[channel.platform as keyof typeof PLATFORM_LABEL] ?? channel.platform}
          </span>
        </div>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
          {channel.followersGrowth}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
        <div>
          <p className="text-[10px] text-slate-400">{isEn ? "Followers" : "Takipçi"}</p>
          <p className="font-mono font-bold text-slate-900 mt-0.5">
            {channel.followers.toLocaleString(dateLoc)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">{isEn ? "Engagement" : "Etkileşim"}</p>
          <p className="font-mono font-bold text-slate-900 mt-0.5">
            {channel.avgEngagementRate}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">{isEn ? "Weekly Posts" : "Haftalık Gönderi"}</p>
          <p className="font-mono font-bold text-slate-800 mt-0.5">
            {channel.postsCount} {isEn ? "Posts" : "Gönderi"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">{isEn ? "Reach" : "Erişim"}</p>
          <p className="font-mono font-bold text-slate-800 mt-0.5">
            {channel.reach}
          </p>
        </div>
      </div>
    </div>
  );
}

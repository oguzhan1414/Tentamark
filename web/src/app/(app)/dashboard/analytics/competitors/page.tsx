"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/BrandProvider";
import AnalyticsNav from "@/components/dashboard/analytics/AnalyticsNav";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import {
  HiOutlineScale,
  HiOutlineCpuChip,
  HiOutlineVideoCamera,
  HiOutlineShieldCheck,
  HiOutlineClock,
} from "react-icons/hi2";

interface CompetitorAccount {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isSelf: boolean;
  platform: PlatformName;
  followers: number;
  followersGrowth: string;
  isPositiveGrowth: boolean;
  postsCount: number;
  postsGrowth: string;
  views: string;
  viewsGrowth: string;
  engagement: number;
  engagementGrowth: string;
  avgEngagementRate: string;
  engagementTrend: "up" | "down";
}

const INITIAL_COMPETITORS: CompetitorAccount[] = [
  {
    id: "self",
    name: "Tentamark (Sayfanız)",
    handle: "@tentamark_app",
    avatarUrl: "/tenta-avatar-open-transparent.png",
    isSelf: true,
    platform: "instagram",
    followers: 51380,
    followersGrowth: "+%6.2",
    isPositiveGrowth: true,
    postsCount: 23,
    postsGrowth: "+%15",
    views: "281.2K",
    viewsGrowth: "+%14.5",
    engagement: 4210,
    engagementGrowth: "+%18.2",
    avgEngagementRate: "%4.8",
    engagementTrend: "up",
  },
  {
    id: "comp-1",
    name: "FizzTube Creative",
    handle: "@fizztube",
    avatarUrl: "/images/approvals/grapefruit_citrus.jpg",
    isSelf: false,
    platform: "instagram",
    followers: 76400,
    followersGrowth: "+%10.4",
    isPositiveGrowth: true,
    postsCount: 31,
    postsGrowth: "+%45",
    views: "410.5K",
    viewsGrowth: "+%31.0",
    engagement: 3890,
    engagementGrowth: "+%8.1",
    avgEngagementRate: "%3.2",
    engagementTrend: "up",
  },
  {
    id: "comp-2",
    name: "SodaCraft Şirketi",
    handle: "@sodacraftco",
    avatarUrl: "/images/approvals/lemons_pink.jpg",
    isSelf: false,
    platform: "linkedin",
    followers: 29100,
    followersGrowth: "+%3.1",
    isPositiveGrowth: true,
    postsCount: 14,
    postsGrowth: "-%12",
    views: "142.0K",
    viewsGrowth: "-%5.4",
    engagement: 1420,
    engagementGrowth: "-%2.0",
    avgEngagementRate: "%2.4",
    engagementTrend: "down",
  },
  {
    id: "comp-3",
    name: "PopSocial Media",
    handle: "@poptv_tr",
    avatarUrl: "/images/approvals/orange_slices.jpg",
    isSelf: false,
    platform: "tiktok",
    followers: 64200,
    followersGrowth: "+%12.8",
    isPositiveGrowth: true,
    postsCount: 42,
    postsGrowth: "+%60",
    views: "520.8K",
    viewsGrowth: "+%48.2",
    engagement: 5120,
    engagementGrowth: "+%22.4",
    avgEngagementRate: "%4.1",
    engagementTrend: "up",
  },
];

export default function CompetitorsAnalyticsPage() {
  const brand = useBrand();
  const [competitors, setCompetitors] = useState<CompetitorAccount[]>(INITIAL_COMPETITORS);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [newName, setNewName] = useState("");
  const [newPlatform, setNewPlatform] = useState<PlatformName>("instagram");

  const filteredList = selectedPlatform === "all"
    ? competitors
    : competitors.filter((c) => c.isSelf || c.platform === selectedPlatform);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim() || !newName.trim()) return;

    const newComp: CompetitorAccount = {
      id: `comp-${Date.now()}`,
      name: newName.trim(),
      handle: newHandle.startsWith("@") ? newHandle.trim() : `@${newHandle.trim()}`,
      avatarUrl: "/images/approvals/smoothie_jars.jpg",
      isSelf: false,
      platform: newPlatform,
      followers: Math.floor(20000 + Math.random() * 40000),
      followersGrowth: `+${(Math.random() * 8 + 1).toFixed(1)}%`,
      isPositiveGrowth: true,
      postsCount: Math.floor(10 + Math.random() * 20),
      postsGrowth: `+${(Math.random() * 25).toFixed(0)}%`,
      views: `${(Math.random() * 200 + 100).toFixed(1)}K`,
      viewsGrowth: `+${(Math.random() * 20).toFixed(1)}%`,
      engagement: Math.floor(1500 + Math.random() * 3000),
      engagementGrowth: `+${(Math.random() * 15).toFixed(1)}%`,
      avgEngagementRate: `%${(Math.random() * 3 + 2).toFixed(1)}`,
      engagementTrend: "up",
    };

    setCompetitors((prev) => [...prev, newComp]);
    setNewHandle("");
    setNewName("");
    setIsAddModalOpen(false);
  };

  const handleRemoveCompetitor = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto">
      {/* 1. Header with Analytics Sub-Navigation */}
      <AnalyticsNav
        title="Rakip Analizi & Karşılaştırma"
        subtitle={`${brand.name} ile sektörünüzdeki rakip hesapların performansını, içerik temposunu ve kitle etkileşimini doğrudan kıyaslayın.`}
      >
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
        >
          <span>+</span>
          <span>Yeni Rakip Ekle</span>
        </button>
      </AnalyticsNav>

      {/* 2. Top Quick Chips & Platform Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Karşılaştırılan:
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200/80 px-2.5 py-1 text-xs font-bold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FA5252]" />
            @tentamark_app (Sen)
          </span>
          <span className="text-xs text-slate-400 font-bold">vs</span>
          {competitors
            .filter((c) => !c.isSelf)
            .map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 shadow-2xs"
              >
                <span>{c.handle}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompetitor(c.id)}
                  className="text-slate-400 hover:text-red-600 font-bold text-xs ml-1 cursor-pointer"
                  title="Listeden Çıkar"
                >
                  ×
                </button>
              </span>
            ))}
        </div>

        {/* Platform filter pills */}
        <div className="flex items-center gap-1">
          {["all", "instagram", "linkedin", "tiktok"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPlatform(p)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                selectedPlatform === p
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p === "all" ? "Tüm Kanallar" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Primary Comparison Table (Planable Aesthetic) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Hızlı Karşılaştırma Tablosu
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Son 30 gün içinde elde edilen takipçi, içerik hacmi, erişim ve etkileşim oranları
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-medium text-slate-600">
            {filteredList.length} Hesap İnceleniyor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Hesap</th>
                <th className="py-3 px-3">Kanal</th>
                <th className="py-3 px-3 text-right">Takipçiler / Aboneler</th>
                <th className="py-3 px-3 text-right">Yayınlanan Gönderi</th>
                <th className="py-3 px-3 text-right">Tahmini Erişim</th>
                <th className="py-3 px-3 text-right">Etkileşim Skoru</th>
                <th className="py-3 px-3 text-right">Ortalama Katılım</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-body">
              {filteredList.map((row) => (
                <tr
                  key={row.id}
                  className={`transition ${
                    row.isSelf ? "bg-rose-50/40 font-medium" : "hover:bg-slate-50/70"
                  }`}
                >
                  {/* Account column */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                        <Image
                          src={row.avatarUrl}
                          alt={row.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{row.name}</span>
                          {row.isSelf && (
                            <span className="rounded bg-[#FA5252] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              Sen
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{row.handle}</p>
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <PlatformIcon name={row.platform} className="h-4 w-4" />
                      <span className="capitalize text-slate-700 font-medium">{row.platform}</span>
                    </div>
                  </td>

                  {/* Followers */}
                  <td className="py-3.5 px-3 text-right">
                    <p className="font-mono font-bold text-slate-900">
                      {row.followers.toLocaleString("tr-TR")}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-600 font-semibold mt-0.5">
                      ↑ {row.followersGrowth}
                    </p>
                  </td>

                  {/* Posts count */}
                  <td className="py-3.5 px-3 text-right">
                    <p className="font-mono font-bold text-slate-900">{row.postsCount}</p>
                    <p
                      className={`text-[10px] font-mono font-semibold mt-0.5 ${
                        row.postsGrowth.startsWith("+") ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {row.postsGrowth}
                    </p>
                  </td>

                  {/* Views / Reach */}
                  <td className="py-3.5 px-3 text-right">
                    <p className="font-mono font-bold text-slate-900">{row.views}</p>
                    <p
                      className={`text-[10px] font-mono font-semibold mt-0.5 ${
                        row.viewsGrowth.startsWith("+") ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {row.viewsGrowth}
                    </p>
                  </td>

                  {/* Engagement Total */}
                  <td className="py-3.5 px-3 text-right">
                    <p className="font-mono font-bold text-slate-900">
                      {row.engagement.toLocaleString("tr-TR")}
                    </p>
                    <p
                      className={`text-[10px] font-mono font-semibold mt-0.5 ${
                        row.engagementGrowth.startsWith("+") ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {row.engagementGrowth}
                    </p>
                  </td>

                  {/* Average engagement rate */}
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                        row.isSelf
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {row.avgEngagementRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Two Column Section: Competitive Share Chart & AI Tactical Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Market Voice Share Breakdown (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Sosyal Etki & Pazar Payı Dağılımı
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Karşılaştırılan hesaplar arasında toplam erişim ve etkileşim payı
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              Tentamark: %27 Pay
            </span>
          </div>

          {/* Stacked Share Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                style={{ width: "27%" }}
                className="bg-[#FA5252] h-full transition-all"
                title="Tentamark (%27)"
              />
              <div
                style={{ width: "35%" }}
                className="bg-slate-700 h-full transition-all"
                title="FizzTube (%35)"
              />
              <div
                style={{ width: "18%" }}
                className="bg-blue-400 h-full transition-all"
                title="SodaCraft (%18)"
              />
              <div
                style={{ width: "20%" }}
                className="bg-amber-400 h-full transition-all"
                title="PopSocial (%20)"
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FA5252]" />
                Tentamark (%27)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                FizzTube (%35)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                SodaCraft (%18)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                PopSocial (%20)
              </span>
            </div>
          </div>

          {/* Metric comparison cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[10px] font-medium text-slate-400">Etkileşim Verimliliği</p>
              <p className="text-base font-bold font-mono text-rose-600 mt-0.5">%4.8</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Rakiplerden %38 yüksek</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[10px] font-medium text-slate-400">Haftalık Yayın Hızı</p>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">23 Gönderi</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Sektör ortalamasında</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-medium text-slate-400">Sadık Takipçi Oranı</p>
              <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">%89</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">En yüksek yorum/beğeni</p>
            </div>
          </div>
        </div>

        {/* Right: AI Competitive Intelligence (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <HiOutlineCpuChip className="h-4 w-4 stroke-[2]" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                AI Rakip İstihbaratı & Teşhis
              </h3>
              <p className="text-[11px] text-slate-500">
                Algoritmik rakip hareket analizi ve fırsatlar
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Insight 1 */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <HiOutlineVideoCamera className="h-3.5 w-3.5 text-rose-600 stroke-[2]" />
                  <span>Video Hacmi Fırsatı</span>
                </span>
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 uppercase">
                  Yüksek Öncelik
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Rakibiniz <strong className="text-slate-800">@fizztube</strong> bu hafta video/Reels sıklığını 2 katına çıkararak erişimini %31 artırdı. Tentamark&apos;ın bu hafta 2 ek video planlaması önerilir.
              </p>
              <Link
                href="/dashboard/calendar"
                className="inline-block text-[11px] font-bold text-rose-600 hover:text-rose-800 pt-0.5"
              >
                Takvimde Video Planla →
              </Link>
            </div>

            {/* Insight 2 */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <HiOutlineShieldCheck className="h-3.5 w-3.5 text-emerald-600 stroke-[2]" />
                  <span>Etkileşim Üstünlüğü</span>
                </span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                  Güçlü Yön
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Gönderi başına kaydetme ve yorum oranınız rakiplerinizin <strong className="text-slate-800">%14 üzerinde</strong>. Kitleniz yüzeysel gezinmek yerine içeriklerinizi kaydedip saklıyor.
              </p>
            </div>

            {/* Insight 3 */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <HiOutlineClock className="h-3.5 w-3.5 text-amber-600 stroke-[2]" />
                  <span>Zamanlama Boşluğu</span>
                </span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase">
                  Fırsat
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Rakipler Çarşamba ve Cuma akşamları (19:00 - 21:00) içerik paylaşmıyor. Bu saat pencerelerinde algoritma akışında öne çıkma şansınız %40 daha yüksek.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Add Competitor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                  <HiOutlineScale className="h-4 w-4 stroke-[2]" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Yeni Rakip Hesabı Ekle
                  </h3>
                  <p className="text-xs text-slate-500">
                    Karşılaştırma panonuza yeni bir rakip profili bağlayın
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marka / Rakip İsmi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: BrandXYZ Studio"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kullanıcı Adı (Handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    placeholder="brandxyz"
                    value={newHandle.replace(/^@/, "")}
                    onChange={(e) => setNewHandle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sosyal Medya Platformu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["instagram", "linkedin", "tiktok"] as PlatformName[]).map((plt) => (
                    <button
                      key={plt}
                      type="button"
                      onClick={() => setNewPlatform(plt)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold capitalize transition cursor-pointer ${
                        newPlatform === plt
                          ? "border-rose-500 bg-rose-50 text-rose-900 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <PlatformIcon name={plt} className="h-4 w-4" />
                      <span>{plt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FA5252] px-4 py-2 text-xs font-bold text-white hover:bg-[#E03131] shadow-xs cursor-pointer"
                >
                  Rakibi Ekle ve Karşılaştır
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

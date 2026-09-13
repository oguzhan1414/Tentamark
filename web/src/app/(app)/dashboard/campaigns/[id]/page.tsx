"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import CampaignFormModal, {
  type CampaignFormValues,
  type CampaignStatus,
} from "@/components/dashboard/CampaignFormModal";
import CampaignPlannerModal from "@/components/dashboard/CampaignPlannerModal";
import { STATUS_LABEL, type UIStatus } from "@/lib/contentStatus";
import { ALL_PLATFORMS, type LaunchPlatform } from "@/lib/ai/platforms";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";

type Campaign = {
  id: string;
  name: string;
  objective: string | null;
  start_date: string | null;
  end_date: string | null;
  status: CampaignStatus;
  platforms: string[];
};

type PlatformRow = { platform: PlatformName; status: string; scheduled_at: string | null };

type ContentRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  content_platforms: PlatformRow[];
};

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-emerald-50 text-emerald-700 border-emerald-200/50" },
  completed: { label: "Tamamlandı", className: "bg-slate-100 text-slate-700 border-slate-200" },
  archived: { label: "Arşivlendi", className: "bg-slate-50 text-slate-400 border-slate-100" },
};

const TABS = [
  { key: "overview", label: "Genel Bakış" },
  { key: "contents", label: "İçerikler" },
  { key: "analytics", label: "Analitik" },
] as const;

function overallStatus(row: ContentRow): UIStatus {
  const platforms = row.content_platforms ?? [];
  if (platforms.some((p) => p.status === "NEEDS_USER_ACTION" || p.status === "FAILED")) return "failed";
  if (row.status === "PUBLISHED" || row.status === "PARTIALLY_PUBLISHED") return "published";
  if (row.status === "APPROVED" || row.status === "SCHEDULED") return "scheduled";
  if (row.status === "DRAFT" || row.status === "IDEA" || row.status === "GENERATING") return "draft";
  return "review";
}

/*
  A campaign's own space — Planable's campaign detail page (Genel Bakış /
  Takvim / Medya / Analitik tabs) was the direct inspiration. "Takvim" here
  is a chronological content list rather than the full drag-and-drop
  calendar grid: reusing that grid scoped to one campaign would mean either
  duplicating a large, actively-changing component or bolting a campaign
  filter onto an already complex page — a real feature gap, not hidden, but
  deliberately out of scope for this pass.
*/
export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [contents, setContents] = useState<ContentRow[] | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const [connectedPlatforms, setConnectedPlatforms] = useState<LaunchPlatform[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [brief, setBrief] = useState("");
  const [savingBrief, setSavingBrief] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, objective, start_date, end_date, status, platforms")
        .eq("id", params.id)
        .eq("brand_id", brand.id)
        .maybeSingle();
      if (ignore) return;
      if (error || !data) {
        console.error("Kampanya yüklenemedi:", error?.message);
        setCampaign(null);
        return;
      }
      setCampaign(data as Campaign);
      setBrief(data.objective ?? "");
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, params.id, refreshKey]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("content")
        .select("id, title, status, created_at, content_platforms(platform, status, scheduled_at)")
        .eq("campaign_id", params.id)
        .order("created_at", { ascending: false });
      if (ignore) return;
      if (error) {
        console.error("Kampanya içerikleri yüklenemedi:", error.message);
        setContents([]);
        return;
      }
      setContents(data as unknown as ContentRow[]);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, params.id, refreshKey]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from("social_accounts")
        .select("platform")
        .eq("brand_id", brand.id)
        .eq("status", "active");
      if (!ignore) setConnectedPlatforms(ALL_PLATFORMS.filter((p) => (data ?? []).some((a) => a.platform === p)));
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  async function saveBrief() {
    if (!campaign) return;
    setSavingBrief(true);
    const { error } = await supabase.from("campaigns").update({ objective: brief || null }).eq("id", campaign.id);
    setSavingBrief(false);
    if (error) {
      console.error("Brief kaydedilemedi:", error.message);
      return;
    }
    setCampaign((prev) => (prev ? { ...prev, objective: brief || null } : prev));
  }

  async function saveCampaign(values: CampaignFormValues): Promise<string | null> {
    if (!campaign) return "Kampanya bulunamadı.";
    const { error } = await supabase
      .from("campaigns")
      .update({
        name: values.name,
        objective: values.objective || null,
        start_date: values.startDate || null,
        end_date: values.endDate || null,
        status: values.status,
        platforms: values.platforms,
      })
      .eq("id", campaign.id);
    if (error) return error.message;
    setRefreshKey((k) => k + 1);
    return null;
  }

  const stats = useMemo(() => {
    const rows = contents ?? [];
    const total = rows.length;
    const published = rows.filter((r) => overallStatus(r) === "published").length;
    const scheduled = rows.filter((r) => overallStatus(r) === "scheduled").length;
    const review = rows.filter((r) => overallStatus(r) === "review").length;
    const perPlatform = new Map<string, number>();
    for (const row of rows) {
      for (const p of row.content_platforms ?? []) {
        perPlatform.set(p.platform, (perPlatform.get(p.platform) ?? 0) + 1);
      }
    }
    return { total, published, scheduled, review, perPlatform };
  }, [contents]);

  const statTiles = [
    { label: "Toplam İçerik", value: stats.total },
    { label: "Yayınlandı", value: stats.published },
    { label: "Zamanlandı", value: stats.scheduled },
    { label: "Onay Bekliyor", value: stats.review },
  ];

  if (campaign === undefined || contents === null) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex h-64 items-center justify-center rounded-[22px] border border-slate-100 bg-white text-sm text-slate-400">
          Kampanya yükleniyor...
        </div>
      </div>
    );
  }

  if (campaign === null) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-3 rounded-[22px] border border-slate-100 bg-white p-12 text-center">
          <h3 className="font-display text-base font-bold text-slate-800">Kampanya bulunamadı</h3>
          <Link href="/dashboard/campaigns" className="text-xs font-semibold text-rose-600 hover:underline">
            ← Kampanyalara dön
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[campaign.status];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700"
        >
          ← Kampanyalar
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {campaign.name}
              </h1>
              <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>
            {(campaign.start_date || campaign.end_date) && (
              <p className="mt-1.5 font-mono text-xs text-slate-400">
                {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString("tr-TR") : "—"} →{" "}
                {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString("tr-TR") : "—"}
              </p>
            )}
            {campaign.platforms.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                {campaign.platforms.map((p) => (
                  <PlatformIcon key={p} name={p as LaunchPlatform} className="h-5 w-5 rounded-md" />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {campaign.start_date && campaign.end_date && (
              <button
                type="button"
                onClick={() => setShowPlanner(true)}
                className="rounded-xl bg-[#FA5252] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#E03131] transition"
              >
                + İçerik Planla
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Düzenle
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative cursor-pointer px-3.5 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "text-slate-900 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-[#FA5252]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-slate-100 bg-white p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kampanya Brief&apos;i
              </label>
              {brief !== (campaign.objective ?? "") && (
                <button
                  type="button"
                  onClick={saveBrief}
                  disabled={savingBrief}
                  className="rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingBrief ? "Kaydediliyor..." : "Kaydet"}
                </button>
              )}
            </div>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onBlur={saveBrief}
              rows={14}
              placeholder="Bu kampanyanın hedefini, temasını ve fazlarını buraya yaz — Compose ve haftalık paket üretimi bu metni referans alacak."
              className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 p-4 font-body text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {statTiles.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-white px-3.5 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</span>
                <p className="mt-0.5 font-display text-lg font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "contents" && (
        <div className="space-y-3">
          {contents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[22px] border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-slate-600">Bu kampanyaya bağlı içerik yok.</p>
              <p className="text-xs text-slate-400">
                {campaign.start_date && campaign.end_date
                  ? "Yukarıdaki \"+ İçerik Planla\" ile başlayabilirsin."
                  : "Kampanyaya bir tarih aralığı ekleyip toplu planlama açabilirsin."}
              </p>
            </div>
          ) : (
            contents.map((row) => {
              const status = overallStatus(row);
              const firstScheduled = row.content_platforms?.[0]?.scheduled_at;
              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-slate-900">{row.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {(row.content_platforms ?? []).map((p, idx) => (
                          <PlatformIcon key={idx} name={p.platform} className="h-4 w-4 rounded" />
                        ))}
                      </div>
                      {firstScheduled && (
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(firstScheduled).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold ${STATUS_LABEL[status].className}`}
                  >
                    {STATUS_LABEL[status].label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {statTiles.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-white px-3.5 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</span>
                <p className="mt-0.5 font-display text-lg font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-slate-100 bg-white p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Dağılımı</span>
            {stats.perPlatform.size === 0 ? (
              <p className="mt-2 text-xs text-slate-400">Henüz platforma atanmış içerik yok.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {Array.from(stats.perPlatform.entries()).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <PlatformIcon name={platform as PlatformName} className="h-5 w-5 rounded-md" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-[#FA5252]"
                        style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-slate-500">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Gerçek etkileşim (beğeni/erişim) metrikleri, ilgili platform bağlantısı yayın sonrası veri döndürünce burada
            görünecek.
          </p>
        </div>
      )}

      {showEdit && (
        <CampaignFormModal
          mode="edit"
          initial={{
            name: campaign.name,
            objective: campaign.objective ?? "",
            startDate: campaign.start_date ?? "",
            endDate: campaign.end_date ?? "",
            status: campaign.status,
            platforms: campaign.platforms as LaunchPlatform[],
          }}
          connectedPlatforms={connectedPlatforms}
          onClose={() => setShowEdit(false)}
          onSubmit={saveCampaign}
        />
      )}

      {showPlanner && campaign.start_date && campaign.end_date && (
        <CampaignPlannerModal
          key={campaign.id}
          campaignId={campaign.id}
          campaignName={campaign.name}
          campaignObjective={campaign.objective}
          startDate={campaign.start_date}
          endDate={campaign.end_date}
          onClose={() => {
            setShowPlanner(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

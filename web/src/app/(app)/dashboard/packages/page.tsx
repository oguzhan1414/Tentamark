"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { ALL_PLATFORMS, PLATFORM_LABEL, type LaunchPlatform } from "@/lib/ai/platforms";

type PackageRow = { id: string; title: string; status: "generating" | "ready" | "failed"; created_at: string };

const STATUS_LABEL: Record<PackageRow["status"], { tr: string; en: string; className: string }> = {
  generating: { tr: "Oluşturuluyor", en: "Generating", className: "bg-amber-50 text-amber-700 border-amber-200/50" },
  ready: { tr: "Hazır", en: "Ready", className: "bg-emerald-50 text-emerald-700 border-emerald-200/50" },
  failed: { tr: "Başarısız", en: "Failed", className: "bg-red-50 text-red-700 border-red-200/50" },
};

export default function PackagesPage() {
  const brand = useBrand();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { isEn } = useLanguage();

  const [topic, setTopic] = useState("");
  const [connectedPlatforms, setConnectedPlatforms] = useState<LaunchPlatform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<LaunchPlatform[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase.from("social_accounts").select("platform").eq("brand_id", brand.id).eq("status", "active");
      if (ignore) return;
      const connected = ALL_PLATFORMS.filter((p) => (data ?? []).some((a) => a.platform === p));
      setConnectedPlatforms(connected);
      setSelectedPlatforms(connected.length > 0 ? connected : (["instagram"] as LaunchPlatform[]));
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingList(true);
      const { data } = await supabase
        .from("content_packages")
        .select("id, title, status, created_at")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (!ignore) {
        setPackages((data ?? []) as PackageRow[]);
        setLoadingList(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  function togglePlatform(p: LaunchPlatform) {
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function handleSubmit() {
    if (!topic.trim() || selectedPlatforms.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), platforms: selectedPlatforms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? (isEn ? "Couldn't create package." : "Paket oluşturulamadı."));
      router.push(`/dashboard/packages/${data.packageId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : isEn ? "Couldn't create package." : "Paket oluşturulamadı.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {isEn ? "Content Packages" : "İçerik Paketleri"}
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          {isEn
            ? "One idea, four publishable outputs: feed, story, carousel, and video."
            : "Tek bir fikirden dört yayınlanabilir çıktı: feed, story, carousel ve video."}
        </p>
      </div>

      <div className="space-y-4 rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isEn ? "Idea / Topic" : "Fikir / Konu"}
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={isEn ? "E.g. Our new season Ethiopian coffee" : "Örn. Yeni sezon Etiyopya kahvemiz"}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800"
          />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isEn ? "Platforms" : "Platformlar"}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(connectedPlatforms.length > 0 ? connectedPlatforms : ALL_PLATFORMS).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  selectedPlatforms.includes(p) ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {PLATFORM_LABEL[p]}
              </button>
            ))}
          </div>
          {connectedPlatforms.length === 0 && (
            <p className="mt-1.5 text-[11px] text-slate-400">
              {isEn ? "No connected platforms found — showing all." : "Bağlı platform bulunamadı — hepsi gösteriliyor."}
            </p>
          )}
        </div>

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

        <button
          type="button"
          disabled={!topic.trim() || selectedPlatforms.length === 0 || submitting}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {submitting ? (isEn ? "Creating package…" : "Paket oluşturuluyor…") : isEn ? "Create Package" : "Paket Oluştur"}
        </button>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isEn ? "Past packages" : "Geçmiş paketler"}
        </span>
        {loadingList ? (
          <p className="text-sm text-slate-400">{isEn ? "Loading…" : "Yükleniyor…"}</p>
        ) : packages.length === 0 ? (
          <p className="text-sm text-slate-400">{isEn ? "No packages yet." : "Henüz paket yok."}</p>
        ) : (
          <div className="space-y-2">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/dashboard/packages/${pkg.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-slate-300 transition"
              >
                <span className="text-sm font-bold text-slate-800">{pkg.title}</span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_LABEL[pkg.status].className}`}>
                  {isEn ? STATUS_LABEL[pkg.status].en : STATUS_LABEL[pkg.status].tr}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

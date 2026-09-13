"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { generateWeeklyPack, type WeeklyPackItem } from "@/lib/ai/generateWeeklyPack";
import { MAX_ITEM_COUNT } from "@/lib/ai/weeklyPackConstants";
import { getLatestStrategy, type BrandStrategyRecord } from "@/lib/ai/generateStrategy";
import { ALL_PLATFORMS, PLATFORM_LABEL, type LaunchPlatform } from "@/lib/ai/platforms";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import DateTimePicker from "@/components/dashboard/DateTimePicker";

const CHAR_LIMIT: Record<PlatformName, number> = {
  instagram: 2200,
  facebook: 500,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  x: 280,
  pinterest: 500,
  threads: 500,
};

const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

type Card = WeeklyPackItem & {
  id: string;
  scheduledAt: string;
  // Holds a data: URL from generation until submit — nothing is written to
  // Storage/media until the card is actually part of a submitted pack (see
  // dataUrlToBlob below and submitAll's upload step).
  imageUrl?: string | null;
  imageLoading?: boolean;
  imageError?: string | null;
};
type Step = "select" | "generating" | "ready" | "submitted";

function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const [header, base64] = dataUrl.split(",");
  const contentType = header.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

function nextMonday(): Date {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 7); // always the UPCOMING Monday, even if today is one
  monday.setHours(10, 0, 0, 0);
  return monday;
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// `base` defaults to next Monday (the plain "Haftalık Paket" flow); a
// campaign passes its own real start date instead, so day_offset lands on
// the campaign's actual timeline, not always "next week".
function scheduleForOffset(dayOffset: number, base: Date, maxOffset: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.max(0, Math.min(maxOffset, dayOffset)));
  d.setHours(10, 0, 0, 0);
  return toDatetimeLocal(d);
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\p{L}0-9_]+/gu) ?? [];
  return Array.from(new Set(matches));
}

function formatDateRange(start: Date, daySpan: number): string {
  const end = new Date(start);
  end.setDate(end.getDate() + daySpan - 1);
  const fmt = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  return daySpan <= 1 ? fmt(start) : `${fmt(start)} → ${fmt(end)}`;
}

export type CampaignRange = { start: Date; daySpan: number };

/*
  The actual multi-day planning studio — extracted so it can run either as
  the standalone /dashboard/compose/weekly page (no campaign context, always
  "next week, 5 items") or embedded in CampaignPlannerModal for a specific
  campaign's real date range, without duplicating this much logic twice.
*/
export default function WeeklyPackForm({
  campaignId,
  campaignName,
  campaignObjective,
  campaignRange,
}: {
  campaignId?: string;
  campaignName?: string;
  campaignObjective?: string | null;
  campaignRange?: CampaignRange | null;
} = {}) {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [selectedPlatforms, setSelectedPlatforms] = useState<LaunchPlatform[]>(ALL_PLATFORMS);
  // Which day offsets (0..daySpan-1) actually get a post — defaults to every
  // day in range, capped at MAX_ITEM_COUNT so the default doesn't silently
  // exceed what one generation can honor. Only meaningful in campaign mode.
  const [selectedDayOffsets, setSelectedDayOffsets] = useState<number[]>(() =>
    campaignRange
      ? Array.from({ length: Math.min(campaignRange.daySpan, MAX_ITEM_COUNT) }, (_, i) => i)
      : []
  );
  const [instructions, setInstructions] = useState("");
  const [step, setStep] = useState<Step>("select");
  const [cards, setCards] = useState<Card[]>([]);
  const [strategy, setStrategy] = useState<BrandStrategyRecord | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bulkImageLoading, setBulkImageLoading] = useState(false);

  // Tab close/refresh with a generated-but-unsubmitted pack loses real
  // work (AI generation cost, any manual edits) even though it no longer
  // leaves orphaned DB rows — still worth a native warning. Doesn't catch
  // in-app navigation (sidebar links) — Next.js App Router has no built-in
  // route-change guard equivalent to this.
  useEffect(() => {
    const hasUnsaved = step === "ready" && cards.length > 0;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!hasUnsaved) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, cards.length]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getLatestStrategy(brand.id);
        if (!ignore) setStrategy(data);
      } catch (err) {
        console.warn("Strateji bilgisi yüklenemedi:", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [brand.id]);

  function togglePlatform(platform: LaunchPlatform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  function toggleDay(offset: number) {
    setSelectedDayOffsets((prev) => {
      if (prev.includes(offset)) return prev.filter((o) => o !== offset);
      if (prev.length >= MAX_ITEM_COUNT) return prev; // hard cap — ignore further picks
      return [...prev, offset].sort((a, b) => a - b);
    });
  }

  async function generate() {
    if (selectedPlatforms.length === 0) return;
    setStep("generating");
    setGenError(null);
    try {
      const items = await generateWeeklyPack(
        brand.id,
        selectedPlatforms,
        campaignRange
          ? { start: campaignRange.start, daySpan: campaignRange.daySpan, selectedDayOffsets }
          : undefined,
        campaignRange
          ? {
              name: campaignName || "Kampanya",
              objective: campaignObjective,
              instructions: instructions.trim() || undefined,
            }
          : undefined
      );
      const scheduleBase = campaignRange?.start ?? nextMonday();
      const maxOffset = campaignRange ? campaignRange.daySpan - 1 : 6;
      setCards(
        items.map((item, i) => ({
          ...item,
          id: `${Date.now()}-${i}`,
          scheduledAt: scheduleForOffset(item.dayOffset, scheduleBase, maxOffset),
          imageUrl: null,
          imageLoading: false,
          imageError: null,
        }))
      );
      setStep("ready");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Haftalık paket üretilemedi.");
      setStep("select");
    }
  }

  function updateCard(id: string, patch: Partial<Card>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function generateCardImage(cardId: string) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    updateCard(cardId, { imageLoading: true, imageError: null });

    try {
      const res = await fetch("/api/media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visualConcept: card.visualPrompt || card.title,
          title: card.title,
          brandName: brand.name,
          brandId: brand.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Görsel üretilemedi.");
      }

      updateCard(cardId, {
        imageUrl: data.dataUrl,
        imageLoading: false,
      });
    } catch (err) {
      updateCard(cardId, {
        imageLoading: false,
        imageError: err instanceof Error ? err.message : "Görsel üretilemedi.",
      });
    }
  }

  async function generateAllImages() {
    if (bulkImageLoading || cards.length === 0) return;
    setBulkImageLoading(true);
    for (const card of cards) {
      if (!card.imageUrl) {
        await generateCardImage(card.id);
        // 2.5s polite pause to prevent triggering 429 rate limiting on public generation endpoints
        await new Promise((r) => setTimeout(r, 2500));
      }
    }
    setBulkImageLoading(false);
  }

  async function submitAll() {
    if (cards.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (const card of cards) {
      const coreDetails = [
        card.hook ? `Kanca (Hook): ${card.hook}` : "",
        card.visualPrompt ? `Görsel/Video Konsepti: ${card.visualPrompt}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data: contentRow, error: contentError } = await supabase
        .from("content")
        .insert({
          brand_id: brand.id,
          campaign_id: campaignId || null,
          title: card.title,
          core_idea: coreDetails || card.title,
          category: card.pillar || card.category || null,
          status: "NEEDS_REVIEW",
          ai_generated: true,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();

      if (contentError || !contentRow) {
        setSubmitError(contentError?.message ?? "İçerik oluşturulamadı.");
        setSubmitting(false);
        return;
      }

      // Only now — with a real content row this card is committed to — do
      // we touch Storage/media. A generated-but-never-submitted image (page
      // closed, or replaced via "Farklı Bir Görsel Dene") never reaches
      // this point, so it never becomes an orphaned row/file.
      if (card.imageUrl?.startsWith("data:")) {
        const { blob, contentType } = dataUrlToBlob(card.imageUrl);
        const ext = contentType === "image/png" ? "png" : "jpg";
        const path = `${brand.id}/${crypto.randomUUID()}-weekly-pack.${ext}`;

        const { error: uploadError } = await supabase.storage.from("media").upload(path, blob, { contentType });
        if (uploadError) {
          setSubmitError(`Görsel yüklenemedi: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }
        const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);

        const { data: mediaRow, error: mediaError } = await supabase
          .from("media")
          .insert({
            brand_id: brand.id,
            file_name: `${card.title.slice(0, 40)}.${ext}`,
            file_url: publicUrl.publicUrl,
            file_type: contentType,
            file_size: blob.size,
            dimensions: { width: 1024, height: 1024 },
            alt_text: (card.visualPrompt || card.title).slice(0, 250),
          })
          .select("id")
          .single();

        if (mediaError || !mediaRow) {
          setSubmitError(mediaError?.message ?? "Görsel kaydı oluşturulamadı.");
          setSubmitting(false);
          return;
        }

        const { error: cmError } = await supabase.from("content_media").insert({
          content_id: contentRow.id,
          media_id: mediaRow.id,
          position: 0,
        });
        if (cmError) {
          console.warn("content_media bağlantısı kaydedilemedi:", cmError.message);
        }
      }

      const scheduledIso = new Date(card.scheduledAt).toISOString();
      const { error: cpError } = await supabase.from("content_platforms").insert(
        selectedPlatforms.map((platform) => {
          const caption = card.captions[platform] ?? "";
          return {
            content_id: contentRow.id,
            platform,
            caption,
            hashtags: extractHashtags(caption),
            status: "PENDING",
            scheduled_at: scheduledIso,
          };
        })
      );

      if (cpError) {
        setSubmitError(cpError.message);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setStep("submitted");
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {campaignRange && (
            <span className="mb-1 inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
              Kampanya İçerik Planı
            </span>
          )}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink">
              {campaignRange ? campaignName || "Kampanya İçerik Planı" : "Haftalık İçerik Paketi"}
            </h1>
            <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 font-mono text-xs font-semibold text-accent-text">
              {brand.name}
            </span>
          </div>
          {campaignRange ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-ink">
                📅 {formatDateRange(campaignRange.start, campaignRange.daySpan)}
                <span className="text-faint">· {campaignRange.daySpan} gün</span>
              </span>
              {campaignObjective && (
                <span className="inline-flex max-w-md items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 font-body text-xs text-muted">
                  🎯 {campaignObjective}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-1 font-body text-sm text-muted">
              Marka DNA&apos;nız ve içerik sütunlarınıza göre önümüzdeki 5 iş günü için hazır gönderi paketi üretin.
            </p>
          )}
        </div>

        {!campaignRange && (
          <Link
            href="/dashboard/brand"
            className="rounded-full border border-line bg-surface px-4 py-1.5 font-body text-xs font-medium text-muted hover:border-accent/40 hover:text-accent"
          >
            ← Marka Stratejisini İncele
          </Link>
        )}
      </div>

      {/* Active strategy preview strip */}
      {strategy?.payload?.content_pillars && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
              Hedeflenen İçerik Sütunları
            </span>
            <span className="font-mono text-[11px] text-mint">
              v{strategy.version}.0 Aktif Strateji
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {strategy.payload.content_pillars.map((p, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1 font-body text-xs text-ink"
              >
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="font-semibold">{p.name}</span>
                <span className="font-mono text-[11px] text-faint">(%{p.percentage})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {step === "submitted" ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-10 text-center sm:p-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/15 text-2xl text-mint">
            ✓
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-ink">İçerik Paketi Onaya Gönderildi!</h2>
            <p className="mx-auto mt-1.5 max-w-md font-body text-sm text-muted">
              {cards.length} adet gönderi oluşturuldu ve takvimde günlerine yerleştirildi. Gönderiler sayfasından inceleyip tek tıkla onaylayabilirsiniz.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/posts"
              className="rounded-full bg-ink px-5 py-2.5 font-body text-sm font-semibold text-bg transition-colors hover:bg-accent"
            >
              Onay Bekleyen Gönderileri Gör →
            </Link>
            <Link
              href="/dashboard/calendar"
              className="rounded-full border border-line bg-surface px-5 py-2.5 font-body text-sm font-semibold text-ink hover:border-accent/40"
            >
              İçerik Takvimine Git
            </Link>
            <button
              type="button"
              onClick={() => {
                setStep("select");
                setCards([]);
              }}
              className="rounded-full border border-line px-5 py-2.5 font-body text-sm text-muted hover:border-accent/40 hover:text-ink"
            >
              Yeni Bir Paket Oluştur
            </button>
          </div>
        </div>
      ) : step === "ready" ? (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                {campaignRange ? `Kampanya Dönemi İçerikleri (${cards.length})` : "Önümüzdeki Haftanın 5 Günlük İçerikleri"}
              </h2>
              <p className="mt-0.5 font-body text-xs text-muted">
                Her gönderi seçtiğiniz platformlara göre optimize edilmiş metin, hashtag ve görsel konsepti içerir.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={generateAllImages}
                disabled={bulkImageLoading || cards.every((c) => Boolean(c.imageUrl))}
                className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-body text-xs font-semibold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400 transition-colors disabled:opacity-40"
              >
                {bulkImageLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Görseller Üretiliyor…</span>
                  </>
                ) : (
                  <>
                    <span>🎨 Tüm Görselleri Üret ({cards.filter((c) => c.imageUrl).length}/{cards.length})</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={generate}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 font-body text-xs font-semibold text-muted hover:border-accent/40 hover:text-accent"
              >
                ↻ Metinleri Yeniden Üret
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {cards.map((card, idx) => (
              <div key={card.id} className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/60 pb-3.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold text-bg">
                      {campaignRange
                        ? `${new Date(card.scheduledAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} · Gün ${idx + 1}`
                        : `${DAY_NAMES[card.dayOffset % 7]} · Gün ${idx + 1}`}
                    </span>
                    <span className="rounded-lg border border-accent/30 bg-accent-subtle px-2.5 py-1 font-body text-xs font-semibold text-accent-text">
                      {card.pillar || card.category || "Genel"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    className="rounded-lg border border-line px-2 py-1 font-body text-xs text-muted hover:border-coral-bright/40 hover:text-coral-bright transition-colors"
                  >
                    Kaldır ✕
                  </button>
                </div>

                {/* Title & Hook */}
                <div className="mt-3.5">
                  <input
                    value={card.title}
                    onChange={(e) => updateCard(card.id, { title: e.target.value })}
                    className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-display text-base font-bold text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Hook Box */}
                {card.hook && (
                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-500">
                      🪝 2 Saniyelik Kanca Cümle (Hook)
                    </span>
                    <p className="mt-1 font-body text-xs leading-relaxed text-ink font-medium">
                      &ldquo;{card.hook}&rdquo;
                    </p>
                  </div>
                )}

                {/* Visual / Video Concept & AI Image Studio */}
                <div className="mt-3.5 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                      🎨 Görsel / Video Çekim Konsepti
                    </span>

                    {!card.imageUrl && !card.imageLoading && (
                      <button
                        type="button"
                        onClick={() => generateCardImage(card.id)}
                        className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-body text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:text-blue-400"
                      >
                        <span>✨ Görseli AI ile Üret</span>
                      </button>
                    )}
                  </div>

                  {card.visualPrompt && (
                    <p className="mt-1.5 font-body text-xs leading-relaxed text-muted">
                      {card.visualPrompt}
                    </p>
                  )}

                  {/* Image Generation State & Preview */}
                  {card.imageLoading && (
                    <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-line/60 bg-bg p-3">
                      <span className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                      <span className="font-body text-xs text-ink font-medium">
                        Flux.1 stüdyo görseli üretiliyor…
                      </span>
                    </div>
                  )}

                  {card.imageError && (
                    <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-coral-bright/30 bg-coral-bright/10 p-2.5">
                      <span className="font-body text-xs text-coral-bright">{card.imageError}</span>
                      <button
                        type="button"
                        onClick={() => generateCardImage(card.id)}
                        className="font-body text-xs font-semibold text-coral-bright underline"
                      >
                        Tekrar Dene
                      </button>
                    </div>
                  )}

                  {card.imageUrl && (
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <div className="relative group overflow-hidden rounded-xl border border-line shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="h-44 w-44 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                        />
                        <a
                          href={card.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity font-body text-xs font-medium text-white"
                        >
                          Tam Boyut ↗
                        </a>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-mint">
                          <span>✓</span> Görsel hazır — onaya gönderince kaydedilecek
                        </span>
                        <button
                          type="button"
                          disabled={card.imageLoading}
                          onClick={() => generateCardImage(card.id)}
                          className="rounded-full border border-line bg-surface px-3 py-1 font-body text-xs text-muted hover:border-accent/40 hover:text-ink transition-colors w-fit"
                        >
                          ↻ Farklı Bir Görsel Dene
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Platform Captions */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {selectedPlatforms.map((platform) => {
                    const text = card.captions[platform] ?? "";
                    const limit = CHAR_LIMIT[platform];
                    const over = text.length > limit;
                    return (
                      <div key={platform} className="flex flex-col rounded-xl border border-line bg-bg p-3.5">
                        <div className="flex items-center gap-1.5">
                          <PlatformIcon name={platform} className="h-5 w-5" />
                          <span className="font-body text-xs font-semibold text-ink">
                            {PLATFORM_LABEL[platform]}
                          </span>
                        </div>
                        <textarea
                          value={text}
                          onChange={(e) =>
                            updateCard(card.id, {
                              captions: { ...card.captions, [platform]: e.target.value },
                            })
                          }
                          rows={6}
                          className="mt-2.5 flex-1 resize-none rounded-lg border border-line bg-surface p-2.5 font-body text-xs leading-relaxed text-ink focus:border-accent focus:outline-none"
                        />
                        <span
                          className={`mt-1.5 self-end font-mono text-[10px] tabular-nums ${
                            over ? "text-coral-bright font-bold" : "text-faint"
                          }`}
                        >
                          {text.length}/{limit}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Scheduled time */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
                  <div className="flex items-center gap-2">
                    <label className="font-body text-xs font-medium text-muted">
                      Planlanan Yayın Zamanı:
                    </label>
                    <DateTimePicker
                      value={card.scheduledAt}
                      onChange={(v) => updateCard(card.id, { scheduledAt: v })}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-faint">{brand.timezone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface-soft p-5">
            <div>
              <p className="font-body text-sm font-semibold text-ink">
                Paket Hazır: Toplam {cards.length} Gönderi
              </p>
              <p className="mt-0.5 font-body text-xs text-muted">
                Onaya gönderildiğinde yöneticiniz tarafından onaylanana kadar taslak olarak saklanır.
              </p>
            </div>
            <button
              type="button"
              onClick={submitAll}
              disabled={cards.length === 0 || submitting}
              className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-bg shadow-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-bg border-t-transparent animate-spin" />
                  <span>Onaya Gönderiliyor…</span>
                </>
              ) : (
                <span>✓ Tümünü Onaya Gönder ({cards.length})</span>
              )}
            </button>
          </div>
          {submitError && <p className="mt-3 font-body text-xs text-coral-bright">{submitError}</p>}
        </div>
      ) : (
        /* Step 1: Select Platforms & Generate */
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-ink">
            Hedef Sosyal Medya Platformları
          </h2>
          <p className="mt-1 font-body text-xs text-muted">
            Her platformun algoritmasına ve metin uzunluğu kurallarına özel içerikler aynı anda hazırlanır.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {ALL_PLATFORMS.map((platform) => {
              const checked = selectedPlatforms.includes(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 font-body text-xs font-medium transition-all ${
                    checked
                      ? "border-accent bg-accent-subtle text-accent-text shadow-sm"
                      : "border-line bg-bg text-muted hover:border-accent/40"
                  }`}
                >
                  <PlatformIcon name={platform} variant="bare" className="h-4 w-4" />
                  <span>{PLATFORM_LABEL[platform]}</span>
                </button>
              );
            })}
          </div>

          {/* Only meaningful for a campaign with a real multi-day span — the
              plain "next week" flow always uses all 5 weekdays. Manual,
              per-day control: the user decides exactly which days get a
              post instead of an inferred pacing guess deciding for them. */}
          {campaignRange && (
            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-body text-xs font-bold uppercase tracking-wider text-muted">
                  Hangi Günler Paylaşım Yapılsın?
                </label>
                <span className="font-mono text-[11px] text-faint">
                  {selectedDayOffsets.length}/{Math.min(campaignRange.daySpan, MAX_ITEM_COUNT)} gün seçili
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {Array.from({ length: campaignRange.daySpan }, (_, i) => i).map((offset) => {
                  const d = new Date(campaignRange.start);
                  d.setDate(d.getDate() + offset);
                  const checked = selectedDayOffsets.includes(offset);
                  const disabled = !checked && selectedDayOffsets.length >= MAX_ITEM_COUNT;
                  return (
                    <button
                      key={offset}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleDay(offset)}
                      title={d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
                      className={`flex h-12 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border font-body text-[10px] font-semibold transition ${
                        checked
                          ? "cursor-pointer border-accent bg-accent text-bg shadow-sm"
                          : disabled
                            ? "cursor-not-allowed border-line/50 bg-bg text-faint/50"
                            : "cursor-pointer border-line bg-bg text-muted hover:border-accent/50 hover:text-ink"
                      }`}
                    >
                      <span className="text-[9px] uppercase opacity-80">
                        {d.toLocaleDateString("tr-TR", { weekday: "short" })}
                      </span>
                      <span className="text-sm font-bold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              {campaignRange.daySpan > MAX_ITEM_COUNT && (
                <p className="mt-2 font-body text-[11px] text-faint">
                  Tek seferde en fazla {MAX_ITEM_COUNT} gün için içerik üretilebilir — kalan günler için paketi daha sonra tekrar çalıştırabilirsiniz.
                </p>
              )}

              <div className="mt-4 space-y-1.5">
                <label className="font-body text-xs font-bold uppercase tracking-wider text-muted">
                  Bu Kampanya İçin AI&apos;a Talimat Ver
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Örn: %30 indirim kampanyası — ürün öncesi/sonrası görselleri, müşteri yorumları ve son gün hatırlatması olsun. Fiyat vurgusu net yapılsın."
                  className="w-full resize-none rounded-xl border border-line bg-bg px-3.5 py-2.5 font-body text-xs text-ink focus:border-accent focus:outline-none"
                />
                <p className="font-body text-[11px] text-faint">
                  Ne kadar net olursan AI de o kadar isabetli üretir — konuyu, teklifi ve öne çıkması gereken noktaları yaz.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-line">
            <button
              type="button"
              onClick={generate}
              disabled={
                selectedPlatforms.length === 0 ||
                step === "generating" ||
                Boolean(campaignRange && selectedDayOffsets.length === 0)
              }
              className="flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-bg shadow-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === "generating" ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-bg border-t-transparent animate-spin" />
                  <span>{campaignRange ? "Kampanya İçerik Planı Üretiliyor…" : "5 Günlük İçerik Paketi Üretiliyor…"}</span>
                </>
              ) : (
                <>
                  <span>
                    {campaignRange
                      ? `✨ ${campaignRange.daySpan} Günlük Kampanya Planını AI ile Üret`
                      : "✨ 5 Günlük İçerik Paketini AI ile Üret"}
                  </span>
                </>
              )}
            </button>
          </div>
          {genError && <p className="mt-3 font-body text-xs text-coral-bright">{genError}</p>}
        </div>
      )}
    </div>
  );
}

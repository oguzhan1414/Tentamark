"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { generateDrafts, type ContentFormat, type GeneratedDrafts, type LaunchPlatform } from "@/lib/ai/generateDrafts";
import { suggestPostIdea } from "@/lib/ai/suggestPostIdea";
import { analyzePostHookAndVirality, type HookAnalysisResult } from "@/lib/ai/analyzePostHookAndVirality";
import { ALL_PLATFORMS } from "@/lib/ai/platforms";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import MediaLibraryModal, { type MediaLibraryItem } from "@/components/dashboard/MediaLibraryModal";

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

const IDEA_CHIPS = [
  "🚀 Yeni Ürün / Özellik Lansmanı",
  "💡 Sektör İpucu & Eğitici İçerik",
  "💬 Müşteri Başarı Hikayesi",
  "🔍 Kulis & Kamera Arkası",
];

const TONE_OPTIONS = [
  { id: "natural", label: "Samimi & Doğal", desc: "Sıcak, içten ve bağ kuran ton" },
  { id: "professional", label: "B2B Profesyonel", desc: "Otoriter, güven veren, net ton" },
  { id: "energetic", label: "Enerjik & Genç", desc: "Heyecan verici, dinamik tempo" },
  { id: "curious", label: "Merak Uyandırıcı", desc: "Tıklama ve kaydetme odaklı kanca" },
];

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\p{L}0-9_]+/gu) ?? [];
  return Array.from(new Set(matches));
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultScheduleValue(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(19, 30, 0, 0); // Default to peak evening time
  return toDatetimeLocalValue(d);
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return { blob: new Blob([array], { type: mime }), contentType: mime };
}

type Mode = "ai" | "manual";
type GenState = "idle" | "generating" | "ready" | "submitted";

/*
  The one real content studio in the app — reachable exclusively through
  ComposeModal.tsx (see useComposeModal() in ComposeModalProvider.tsx). Used
  to also render as a standalone /dashboard/compose page; that page was
  removed once Calendar itself could trigger this same modal with full
  power, so every caller (Calendar's day cells, a campaign's "+ İçerik
  Üret", Gönderiler's empty state, ...) now goes through the shared modal
  instead of duplicating this much logic in a second, simpler composer.
*/
export default function ComposeForm({
  onSubmitted,
  onNavigate,
  initialCampaignId,
  initialDate,
  initialHour,
}: {
  onSubmitted?: () => void;
  // Called when the success screen's "go look at it" links are clicked.
  // Only meaningful inside ComposeModal — the modal's own isOpen state lives
  // in the layout-level provider, so it survives a route change on its own;
  // without this, clicking "Takvimi Gör" would navigate to Calendar with the
  // modal still floating on top of it.
  onNavigate?: () => void;
  // Pre-fills from whoever opened the modal (a campaign card's "+ İçerik
  // Üret", a Calendar day cell's "+") — passed as props now, not read from
  // the URL, since every caller opens this as a modal via useComposeModal()
  // rather than navigating to a page with query params.
  initialCampaignId?: string;
  initialDate?: string;
  initialHour?: number;
} = {}) {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<Mode>("ai");
  const [format, setFormat] = useState<ContentFormat>("post");
  const [selectedPlatforms, setSelectedPlatforms] = useState<LaunchPlatform[]>([]);
  // null = still loading. Only platforms with a real, active connection are
  // offerable here — selecting an unconnected platform would just produce
  // content nothing can ever actually publish to.
  const [connectedPlatforms, setConnectedPlatforms] = useState<LaunchPlatform[] | null>(null);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [campaignId, setCampaignId] = useState<string>(initialCampaignId ?? "");
  const [selectedTone, setSelectedTone] = useState<string>("natural");
  // Free-text labels alongside the campaign link — content.tags already
  // existed in the schema (jsonb array) but nothing wrote to it until now.
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [idea, setIdea] = useState("");
  // A proactive AI-proposed topic, shown above the idea field before the
  // user has typed anything — matches Planable's compose box surfacing a
  // suggestion unprompted instead of waiting for a "generate" click.
  // Dismissed permanently (this mount) once used, skipped, or typed over.
  const [suggestedIdea, setSuggestedIdea] = useState<string | null>(null);
  // Starts true (not set inside an effect) — the mount effect below fetches
  // immediately, so "loading" is true from the very first render already.
  const [suggestingIdea, setSuggestingIdea] = useState(true);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [hook, setHook] = useState("");
  const [visualPrompt, setVisualPrompt] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      if (!Number.isNaN(d.getTime())) {
        if (initialHour !== undefined && !Number.isNaN(initialHour)) {
          d.setHours(initialHour, 0, 0, 0);
        } else {
          d.setHours(19, 30, 0, 0);
        }
        return toDatetimeLocalValue(d);
      }
    }
    return defaultScheduleValue();
  });
  const [state, setState] = useState<GenState>("idle");
  const [drafts, setDrafts] = useState<GeneratedDrafts | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<LaunchPlatform>("instagram");

  // Image generation state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [existingMedia, setExistingMedia] = useState<MediaLibraryItem | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Hook & Virality analysis state
  const [analyzingHook, setAnalyzingHook] = useState(false);
  const [hookAnalysis, setHookAnalysis] = useState<HookAnalysisResult | null>(null);
  const [hookError, setHookError] = useState<string | null>(null);

  // Status & Submit
  const [genError, setGenError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Preview simulator platform
  const [previewPlatform, setPreviewPlatform] = useState<PlatformName>("instagram");

  // TikTok's Direct Post has no text/image-only path — a real video is
  // mandatory (tiktokProvider.publish() throws without one), so selecting it
  // switches the media picker from photo to video mode.
  const requiresVideo = selectedPlatforms.includes("tiktok");

  // Local media preview
  const mediaPreview = useMemo(() => {
    if (existingMedia) return existingMedia.file_url;
    if (imageUrl) return imageUrl;
    if (mediaFile) return URL.createObjectURL(mediaFile);
    return null;
  }, [existingMedia, imageUrl, mediaFile]);
  const mediaPreviewIsVideo = existingMedia
    ? existingMedia.file_type.startsWith("video/")
    : !imageUrl && Boolean(mediaFile?.type.startsWith("video/"));

  useEffect(() => {
    return () => {
      if (mediaFile && mediaPreview && !imageUrl && !existingMedia) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaFile, mediaPreview, imageUrl, existingMedia]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name")
        .eq("brand_id", brand.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (!ignore) setCampaigns(data ?? []);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from("social_accounts")
        .select("platform")
        .eq("brand_id", brand.id)
        .eq("status", "active");
      if (ignore) return;
      const connected = ALL_PLATFORMS.filter((p) => (data ?? []).some((a) => a.platform === p));
      setConnectedPlatforms(connected);
      // Default to selecting every connected platform — the user narrows
      // down from there, same as before this only offered the full list.
      setSelectedPlatforms(connected);
      // Functional-updater form (reads the latest value from React state,
      // not a closure) so this effect doesn't need activePlatformTab as a
      // dependency — adding it would re-run this fetch on every tab switch.
      if (connected.length > 0) {
        setActivePlatformTab((current) => (connected.includes(current) ? current : connected[0]));
        setPreviewPlatform((current) => (connected.includes(current as LaunchPlatform) ? current : connected[0]));
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  // Fires once per mount — proposing a fresh idea on every keystroke would
  // be noise, not help. Inlined directly (not a call to an outer named
  // function) so the React Compiler lint rule can see the setState calls
  // only happen after the await, same shape as every other fetch effect
  // in this file.
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const result = await suggestPostIdea(brand.id);
        if (!ignore) setSuggestedIdea(result);
      } catch (err) {
        console.warn("Fikir önerisi alınamadı:", err);
      } finally {
        if (!ignore) setSuggestingIdea(false);
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Tekrar Dene" — a click handler, not an effect, so there's no lint
  // concern calling this named helper directly from a button's onClick.
  async function retryIdeaSuggestion() {
    setSuggestingIdea(true);
    try {
      const result = await suggestPostIdea(brand.id);
      setSuggestedIdea(result);
    } catch (err) {
      console.warn("Fikir önerisi alınamadı:", err);
    } finally {
      setSuggestingIdea(false);
    }
  }

  function useSuggestedIdea() {
    if (!suggestedIdea) return;
    setIdea(suggestedIdea);
    setSuggestionDismissed(true);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function handleAnalyzeHook() {
    const currentCaption = drafts?.[activePlatformTab] || idea;
    if (!currentCaption.trim()) return;
    setAnalyzingHook(true);
    setHookError(null);
    try {
      const res = await analyzePostHookAndVirality(brand.id, currentCaption, activePlatformTab);
      setHookAnalysis(res);
    } catch (err) {
      setHookError(err instanceof Error ? err.message : "Kanca analiz edilemedi.");
    } finally {
      setAnalyzingHook(false);
    }
  }

  function applyHook(newHook: string) {
    if (!drafts) return;
    const currentText = drafts[activePlatformTab] ?? "";
    const newlineIdx = currentText.indexOf("\n");

    if (newlineIdx === -1) {
      // No line break to anchor on — swap only the first sentence (up to
      // the first ./!/? followed by a space or the end) so the rest of a
      // single-paragraph caption survives. Replacing the whole string here
      // silently discarded everything after the opening line whenever a
      // draft had no hard line break, which most don't.
      const sentenceMatch = currentText.match(/^.*?[.!?](?=\s|$)/);
      if (sentenceMatch && sentenceMatch[0].length < currentText.length) {
        setDrafts({ ...drafts, [activePlatformTab]: newHook + currentText.slice(sentenceMatch[0].length) });
      } else {
        setDrafts({ ...drafts, [activePlatformTab]: newHook });
      }
      return;
    }

    const lines = currentText.split("\n");
    lines[0] = newHook;
    setDrafts({ ...drafts, [activePlatformTab]: lines.join("\n") });
  }

  function applyOptimizedCaption(fullCaption: string) {
    if (!drafts) return;
    setDrafts({ ...drafts, [activePlatformTab]: fullCaption });
  }

  function togglePlatform(platform: LaunchPlatform) {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform];
      if (!next.includes(activePlatformTab) && next.length > 0) {
        setActivePlatformTab(next[0]);
      }
      return next;
    });
  }

  // AI Text & Multi-platform generation
  async function generate() {
    if (!idea.trim() || selectedPlatforms.length === 0) return;
    setState("generating");
    setGenError(null);
    try {
      const toneObj = TONE_OPTIONS.find((t) => t.id === selectedTone);
      const enhancedPrompt = `${idea}\n(Marka Tonu: ${toneObj?.label || "Doğal"}, Hedef: Yüksek Etkileşim ve 2 saniyelik güçlü kanca)`;

      const result = await generateDrafts(brand.id, enhancedPrompt, selectedPlatforms, format);
      setDrafts(result);

      // Auto-extract or suggest hook from the first draft
      const firstText = Object.values(result)[0] || "";
      const lines = firstText.split("\n").map((l) => l.trim()).filter(Boolean);
      setHook(lines[0] || idea.slice(0, 70));
      setVisualPrompt(idea);

      setState("ready");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Taslak üretilemedi.");
      setState("idle");
    }
  }

  // AI Image generation call
  async function triggerImageGeneration() {
    const concept = visualPrompt.trim() || hook.trim() || idea.trim();
    if (!concept) return;

    setGeneratingImage(true);
    setImageError(null);

    try {
      const res = await fetch("/api/media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visualConcept: concept,
          title: hook || idea.slice(0, 50),
          brandName: brand.name,
          brandId: brand.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Görsel üretilemedi.");
      }

      setImageUrl(data.dataUrl);
      setMediaFile(null);
      setExistingMedia(null);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Görsel üretilirken bir hata oluştu.");
    } finally {
      setGeneratingImage(false);
    }
  }

  function prepareManualDrafts() {
    if (selectedPlatforms.length === 0) return;
    setDrafts(Object.fromEntries(selectedPlatforms.map((p) => [p, ""])));
    setState("ready");
  }

  // Submit to Supabase
  async function submit(targetStatus: "DRAFT" | "NEEDS_REVIEW") {
    if (!drafts || !scheduledAt) return;
    if (requiresVideo && !mediaFile?.type.startsWith("video/")) {
      setSubmitError("TikTok seçiliyken bir video dosyası yüklemen gerekiyor — TikTok metin veya fotoğrafla paylaşım yapamıyor.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let mediaId: string | null = null;

      // Handle a library reuse, an AI generated base64 image, or an uploaded file
      if (existingMedia) {
        mediaId = existingMedia.id;
      } else if (imageUrl && imageUrl.startsWith("data:")) {
        const { blob, contentType } = dataUrlToBlob(imageUrl);
        const ext = contentType === "image/png" ? "png" : "jpg";
        const path = `${brand.id}/${crypto.randomUUID()}-ai-compose.${ext}`;

        const { error: uploadError } = await supabase.storage.from("media").upload(path, blob, { contentType });
        if (uploadError) throw new Error(`Görsel yüklenemedi: ${uploadError.message}`);

        const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);

        const { data: mediaRow, error: mediaError } = await supabase
          .from("media")
          .insert({
            brand_id: brand.id,
            file_name: `ai-post-${Date.now()}.${ext}`,
            file_url: publicUrl.publicUrl,
            file_type: contentType,
            file_size: blob.size,
          })
          .select("id")
          .single();

        if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Medya kaydı oluşturulamadı.");
        mediaId = mediaRow.id;
      } else if (mediaFile) {
        const path = `${brand.id}/${crypto.randomUUID()}-${mediaFile.name}`;
        const { error: uploadError } = await supabase.storage.from("media").upload(path, mediaFile);
        if (uploadError) throw new Error(`Dosya yüklenemedi: ${uploadError.message}`);

        const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);

        const { data: mediaRow, error: mediaError } = await supabase
          .from("media")
          .insert({
            brand_id: brand.id,
            file_name: mediaFile.name,
            file_url: publicUrl.publicUrl,
            file_type: mediaFile.type,
            file_size: mediaFile.size,
          })
          .select("id")
          .single();

        if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Medya kaydı oluşturulamadı.");
        mediaId = mediaRow.id;
      }

      const scheduledIso = new Date(scheduledAt).toISOString();
      const title = hook.trim().slice(0, 80) || idea.trim().slice(0, 80) || "Yeni İçerik";

      const coreDetails = [
        hook ? `Kanca (Hook): ${hook}` : "",
        visualPrompt ? `Görsel/Video Konsepti: ${visualPrompt}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data: contentRow, error: contentError } = await supabase
        .from("content")
        .insert({
          brand_id: brand.id,
          campaign_id: campaignId || null,
          title,
          core_idea: coreDetails || idea.trim() || title,
          status: targetStatus,
          format,
          tags,
          ai_generated: mode === "ai",
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();

      if (contentError || !contentRow) throw new Error(contentError?.message ?? "İçerik kaydedilemedi.");

      if (mediaId) {
        await supabase.from("content_media").insert({ content_id: contentRow.id, media_id: mediaId, position: 0 });
      }

      // Insert platform versions
      const { error: cpError } = await supabase.from("content_platforms").insert(
        selectedPlatforms.map((platform) => {
          const caption = drafts[platform] ?? "";
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

      if (cpError) throw new Error(cpError.message);

      setState("submitted");
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gönderi kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setState("idle");
    setDrafts(null);
    setIdea("");
    setHook("");
    setVisualPrompt("");
    setImageUrl(null);
    setMediaFile(null);
    setExistingMedia(null);
    setScheduledAt(defaultScheduleValue());
    setCampaignId("");
    setTags([]);
    setTagInput("");
    setFormat("post");
  }

  // Live active preview text
  const currentPreviewText = useMemo(() => {
    if (drafts && drafts[previewPlatform as LaunchPlatform]) {
      return drafts[previewPlatform as LaunchPlatform] || "";
    }
    if (drafts) {
      const firstAvailable = Object.values(drafts)[0];
      if (firstAvailable) return firstAvailable;
    }
    return (
      idea ||
      "Burada yayınlanacak harika bir içerik metni yer alacak. Soldaki alana bir konu yazıp 'AI ile Üret' butonuna tıklayarak metin ve görselinizi oluşturabilirsiniz. ✨"
    );
  }, [drafts, previewPlatform, idea]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Switch */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            İçerik Oluşturucu & AI Studio
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Markanız için çoklu platform gönderileri üretin, görsel tasarlayın ve gerçek zamanlı simülasyonda görün.
          </p>
        </div>

        <Link
          href="/dashboard/compose/weekly"
          onClick={onNavigate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FA5252] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#E03131] transition self-start sm:self-auto"
        >
          <span>🚀 7 Günlük Haftalık Paket Üret →</span>
        </Link>
      </div>

      {state === "submitted" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border border-slate-100 bg-white p-12 text-center shadow-sm max-w-2xl mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">İçerik Başarıyla Planlandı!</h2>
          <p className="max-w-md text-sm text-slate-500">
            Gönderiniz seçtiğiniz platformlar ve saat için takvime eklendi. Onay masasından veya takvimden takip edebilirsiniz.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/calendar"
              onClick={onNavigate}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
            >
              Takvimi Gör
            </Link>
            <Link
              href="/dashboard/posts"
              onClick={onNavigate}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Gönderiler / Onay Masası
            </Link>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              Yeni Gönderi Oluştur +
            </button>
          </div>
        </div>
      ) : (
        /* 2. Studio 2-Column Layout */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* ================= LEFT COLUMN: Studio Form (7 cols) ================= */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
              {/* Mode Switcher */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("ai");
                      setState("idle");
                      setDrafts(null);
                    }}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                      mode === "ai" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ✨ AI Destekli Üretim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("manual");
                      setState("idle");
                      setDrafts(null);
                    }}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                      mode === "manual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ✍️ Manuel Yazım
                  </button>
                </div>

                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                  {brand.name} Kimliği Aktif
                </span>
              </div>

              {/* Content Format — classification + AI prompt tone only for
                  now (see generateDrafts' FORMAT_RULE); no publish connector
                  branches on this yet, so it doesn't change where a Reel
                  actually posts, only how it reads. */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">İçerik Formatı</label>
                <div className="flex gap-2">
                  {(
                    [
                      { key: "post", label: "📄 Gönderi" },
                      { key: "story", label: "⚡ Hikaye" },
                      { key: "reel", label: "🎬 Makara" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFormat(f.key)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        format === f.key
                          ? "border-rose-500 bg-rose-50/70 text-rose-900 ring-1 ring-rose-500"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Platforms Row — only platforms with a real, active
                  connection are offered here (see the social_accounts fetch
                  above); an unconnected platform could never actually
                  publish, so it has no business being selectable. */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hedef Platformlar
                </label>
                {connectedPlatforms === null ? (
                  <p className="text-xs text-slate-400">Bağlı hesaplar yükleniyor...</p>
                ) : connectedPlatforms.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3.5 text-xs text-slate-500">
                    Henüz bağlı bir sosyal medya hesabın yok.{" "}
                    <Link href="/settings?tab=baglantilar" className="font-semibold text-rose-600 hover:underline">
                      Önce bir hesap bağla →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {connectedPlatforms.map((platform) => {
                      const checked = selectedPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                            checked
                              ? "border-rose-500 bg-rose-50/70 text-rose-900 shadow-2xs ring-1 ring-rose-500"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <PlatformIcon name={platform} className="h-4 w-4" />
                          <span>{platformLabel(platform)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tone of Voice Selector */}
              {mode === "ai" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Marka Sesi & Tonu
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {TONE_OPTIONS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTone(t.id)}
                        className={`rounded-xl border p-2.5 text-left transition ${
                          selectedTone === t.id
                            ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{t.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaign Dropdown */}
              {campaigns.length > 0 && (
                <div className="space-y-1.5">
                  <label htmlFor="campaign_select" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kampanya (Opsiyonel)
                  </label>
                  <select
                    id="campaign_select"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">Genel İçerik (Kampanya Bağlantısız)</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Free-text Tags — separate from the campaign link, matching
                  Planable's pattern of stacking a campaign tag with custom
                  labels ("tarifler", "Makaleler") side by side. */}
              <div className="space-y-1.5">
                <label htmlFor="tag_input" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Etiketler (Opsiyonel)
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="text-amber-600 hover:text-amber-900"
                        aria-label={`${t} etiketini kaldır`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    id="tag_input"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    onBlur={addTag}
                    placeholder="Etiket yaz, Enter'a bas..."
                    className="min-w-[140px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Proactive AI Idea Suggestion — offered unprompted, before
                  the user has typed anything, instead of waiting for a
                  "generate" click. Hides itself once they type their own
                  idea or accept/dismiss this one. */}
              {mode === "ai" && !suggestionDismissed && !idea.trim() && (
                <div className="rounded-xl border border-rose-100/80 bg-rose-50/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                      ⚡ Yapay zekamız bir fikir üretti
                    </span>
                    <button
                      type="button"
                      onClick={() => setSuggestionDismissed(true)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label="Kapat"
                    >
                      ✕
                    </button>
                  </div>
                  {suggestingIdea ? (
                    <p className="text-xs text-slate-600">Markanıza uygun bir fikir düşünüyor...</p>
                  ) : suggestedIdea ? (
                    <>
                      <p className="text-xs font-medium text-slate-900">{suggestedIdea}</p>
                      <div className="flex items-center gap-3 pt-0.5">
                        <button
                          type="button"
                          onClick={retryIdeaSuggestion}
                          className="text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                          Tekrar dene
                        </button>
                        <button
                          type="button"
                          onClick={useSuggestedIdea}
                          className="rounded-lg bg-[#FA5252] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#E03131] transition"
                        >
                          ✓ Kabul et
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {/* Topic / Idea Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="idea_input" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {mode === "ai" ? "Ne hakkında paylaşım yapmak istiyorsunuz?" : "Ana Fikir & Konu"}
                  </label>
                  <span className="text-[11px] text-slate-400">{idea.length} karakter</span>
                </div>
                <textarea
                  id="idea_input"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Örn: Yeni sürdürülebilir keten gömlek koleksiyonumuzun duyurusu. Doğal pamuk dokusu, sıcak yaz günlerinde nefes alan yapı ve şık minimal tasarım vurgulansın..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                />

                {mode === "ai" && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {IDEA_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setIdea(chip)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-rose-200 hover:bg-rose-50/60 hover:text-rose-700 transition"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Drafts Trigger */}
              {mode === "ai" ? (
                <button
                  type="button"
                  onClick={generate}
                  disabled={!idea.trim() || selectedPlatforms.length === 0 || state === "generating"}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-[#FA5252] py-3 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-rose-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {state === "generating" ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>AI Taslakları & Kancayı Hazırlıyor...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>AI ile Çoklu Platform İçeriklerini Üret</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={prepareManualDrafts}
                  disabled={selectedPlatforms.length === 0 || state === "ready"}
                  className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  Metin Alanlarını Hazırla
                </button>
              )}

              {genError && (
                <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                  {genError}
                </p>
              )}

              {/* ================= STEP 2: DRAFTS EDITOR (Once Generated) ================= */}
              {drafts && (
                <div className="pt-4 border-t border-slate-100 space-y-5">
                  {/* Hook Editor */}
                  <div className="space-y-1.5">
                    <label htmlFor="hook_input" className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <span>🪝</span>
                      <span>2 Saniyelik Kanca (Hook)</span>
                    </label>
                    <input
                      id="hook_input"
                      type="text"
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                      placeholder="Dikkat çeken açılış kancası..."
                      className="w-full rounded-xl border border-amber-200/80 bg-amber-50/40 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Platform Specific Draft Editor Tabs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Platform Metinleri
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {drafts[activePlatformTab]?.length || 0} / {CHAR_LIMIT[activePlatformTab]} karakter
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      {selectedPlatforms.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setActivePlatformTab(p);
                            setPreviewPlatform(p);
                          }}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            activePlatformTab === p
                              ? "bg-slate-900 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <PlatformIcon name={p} className="h-3.5 w-3.5" />
                          <span>{platformLabel(p)}</span>
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={drafts[activePlatformTab] ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => (prev ? { ...prev, [activePlatformTab]: e.target.value } : prev))
                      }
                      rows={6}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />

                    {/* AI Hook & Virality Score Optimizer */}
                    <div className="rounded-xl border border-rose-100/80 bg-rose-50/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <span>🪝</span>
                          <span>AI Kanca & Viralite Skoru</span>
                        </div>

                        {!hookAnalysis && (
                          <button
                            type="button"
                            onClick={handleAnalyzeHook}
                            disabled={analyzingHook}
                            className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-700 shadow-2xs hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
                          >
                            {analyzingHook ? "Puanlanıyor…" : "✨ Kanca Gücünü Puanla"}
                          </button>
                        )}
                      </div>

                      {analyzingHook && (
                        <div className="flex items-center gap-2 text-xs text-rose-600 font-medium py-1">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                          <span>Metin algoritma kancalarına göre analiz ediliyor…</span>
                        </div>
                      )}

                      {hookError && !analyzingHook && (
                        <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                          {hookError}
                        </p>
                      )}

                      {hookAnalysis && (
                        <div className="space-y-2 pt-0.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold border border-slate-200 text-slate-900 shadow-2xs">
                              <span>Puan:</span>
                              <span className={hookAnalysis.score >= 80 ? "text-emerald-600" : "text-amber-600"}>
                                {hookAnalysis.score}/100
                              </span>
                            </span>

                            <button
                              type="button"
                              onClick={handleAnalyzeHook}
                              disabled={analyzingHook}
                              className="text-[10px] font-semibold text-rose-600 hover:underline"
                            >
                              Tekrar Puanla
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-600 italic">
                            &ldquo;{hookAnalysis.critique}&rdquo;
                          </p>

                          {hookAnalysis.alternativeHooks.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Alternatif Açılış Kancaları (Tek Tıkla Uygula):
                              </span>
                              <div className="flex flex-col gap-1">
                                {hookAnalysis.alternativeHooks.map((altHook, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => applyHook(altHook)}
                                    title="Bu kancayı ilk cümle yap"
                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-left text-xs font-medium text-slate-800 hover:border-rose-200 hover:bg-rose-50/50 transition group cursor-pointer"
                                  >
                                    <span className="truncate pr-2">💡 &ldquo;{altHook}&rdquo;</span>
                                    <span className="shrink-0 text-[10px] font-bold text-rose-600 opacity-0 group-hover:opacity-100">
                                      Kullan →
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => applyOptimizedCaption(hookAnalysis.optimizedCaption)}
                            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline"
                          >
                            <span>✓ Tüm Metni Optimize Edilmiş Haliyle Değiştir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Media & AI Image Engine Section */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <span>{requiresVideo ? "🎬" : "🎨"}</span>
                        <span>{requiresVideo ? "Video Yükleme" : "AI Görsel Üretim Motoru"}</span>
                      </span>
                      {imageUrl && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Görsel Bağlandı ✓
                        </span>
                      )}
                    </div>

                    {requiresVideo && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
                        TikTok metin veya fotoğrafla paylaşım yapamıyor — Direct Post için gerçek bir video dosyası
                        yüklemen gerekiyor (AI görsel üretimi burada kullanılamaz).
                      </p>
                    )}

                    {!requiresVideo && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={visualPrompt}
                          onChange={(e) => setVisualPrompt(e.target.value)}
                          placeholder="Görsel konsepti veya fotoğraf sahnesi prompt'u..."
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={triggerImageGeneration}
                          disabled={generatingImage || (!visualPrompt.trim() && !idea.trim())}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 shrink-0"
                        >
                          {generatingImage ? (
                            <>
                              <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Üretiliyor...</span>
                            </>
                          ) : (
                            <>
                              <span>Görsel Üret</span>
                              <span className="rounded bg-rose-500/20 text-rose-700 px-1 text-[10px]">⚡ AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {imageError && (
                      <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg">{imageError}</p>
                    )}

                    {/* Media Preview / File Upload Option */}
                    <div className="flex items-center gap-3">
                      {mediaPreview ? (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
                          {mediaPreviewIsVideo ? (
                            <video src={mediaPreview} muted className="h-full w-full object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mediaPreview} alt="Preview" className="h-full w-full object-cover" />
                          )}
                        </div>
                      ) : null}

                      <label
                        htmlFor="compose_media"
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-600 hover:border-rose-300 hover:text-rose-600 transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>
                          {mediaFile
                            ? mediaFile.name
                            : existingMedia
                              ? existingMedia.file_name
                              : requiresVideo
                                ? "Video Yükle (TikTok için zorunlu)"
                                : "veya Bilgisayardan Fotoğraf Yükle"}
                        </span>
                        <input
                          id="compose_media"
                          type="file"
                          accept={requiresVideo ? "video/mp4,video/webm" : "image/*"}
                          className="sr-only"
                          onChange={(e) => {
                            setMediaFile(e.target.files?.[0] ?? null);
                            setImageUrl(null);
                            setExistingMedia(null);
                          }}
                        />
                      </label>

                      {!requiresVideo && (
                        <button
                          type="button"
                          onClick={() => setLibraryOpen(true)}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Kütüphaneden Seç</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scheduling Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="compose_scheduled_at" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Yayın Tarihi & Saati
                      </label>
                      <button
                        type="button"
                        onClick={() => setScheduledAt(defaultScheduleValue())}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        ⚡ En İyi Zaman (Yarın 19:30)
                      </button>
                    </div>

                    <input
                      id="compose_scheduled_at"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={!scheduledAt || submitting}
                      onClick={() => submit("DRAFT")}
                      className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      Taslak Olarak Kaydet
                    </button>

                    <button
                      type="button"
                      disabled={!scheduledAt || submitting}
                      onClick={() => submit("NEEDS_REVIEW")}
                      className="flex-1 rounded-xl bg-[#FA5252] py-3 text-xs font-bold text-white shadow-xs hover:bg-[#E03131] transition disabled:opacity-50"
                    >
                      {submitting ? "Kaydediliyor..." : "Zamanla & Onaya Gönder 🚀"}
                    </button>
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                      {submitError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Live Social Media Device Simulator (5 cols) ================= */}
          <div className="space-y-4 lg:col-span-5 sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Canlı Önizleme Simülatörü
              </span>

              {/* Preview Platform Switcher */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                {(["instagram", "linkedin", "facebook", "x"] as PlatformName[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreviewPlatform(p)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                      previewPlatform === p ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                    title={platformLabel(p)}
                  >
                    <PlatformIcon name={p} className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Realistic Social Phone / Card Mockup */}
            <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              {/* Device Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-[#FA5252] font-bold text-xs text-white shadow-2xs">
                    {brand.name[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-display text-xs font-bold text-slate-900">{brand.name}</span>
                      <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-400">Sponsorlu · Şimdi</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-xs">•••</span>
                </div>
              </div>

              {/* Mockup Media Image */}
              <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                {mediaPreview ? (
                  mediaPreviewIsVideo ? (
                    <video src={mediaPreview} muted loop autoPlay className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaPreview} alt="" className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-slate-50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm mb-2">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-700">Canlı Görsel Alanı</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Görsel ürettiğinizde veya yüklediğinizde anında burada canlanacak.
                    </p>
                  </div>
                )}
              </div>

              {/* Engagement Icons Row */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-800">
                    {/* Heart */}
                    <button type="button" className="hover:text-red-500 transition">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    {/* Comment */}
                    <button type="button" className="hover:text-rose-600 transition">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    {/* Share */}
                    <button type="button" className="hover:text-rose-600 transition">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>

                  {/* Bookmark */}
                  <button type="button" className="text-slate-800 hover:text-rose-600 transition">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                <div className="text-[11px] font-bold text-slate-900">
                  1,428 beğenme
                </div>

                {/* Caption in Simulator */}
                <div className="text-xs text-slate-800 leading-relaxed space-y-1">
                  <p className="whitespace-pre-line">
                    <span className="font-bold text-slate-900 mr-1.5">{brand.name}</span>
                    {currentPreviewText}
                  </p>
                </div>

                {/* Comment Bar Mockup */}
                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Yorum ekle...</span>
                  <span className="text-rose-600 font-bold cursor-pointer">Paylaş</span>
                </div>
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-xs text-slate-500 shadow-2xs">
              <span className="font-bold text-slate-800 block mb-0.5">💡 Simülatör İpucu</span>
              Metin ve görselde yapacağınız tüm değişiklikler sağdaki cihazda anlık olarak canlı yansır.
            </div>
          </div>
        </div>
      )}

      {libraryOpen && (
        <MediaLibraryModal
          brandId={brand.id}
          onClose={() => setLibraryOpen(false)}
          onSelect={(media) => {
            setExistingMedia(media);
            setImageUrl(null);
            setMediaFile(null);
            setLibraryOpen(false);
          }}
        />
      )}
    </div>
  );
}

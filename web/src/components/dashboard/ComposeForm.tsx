"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { generateDrafts, type ContentFormat, type GeneratedDrafts, type LaunchPlatform } from "@/lib/ai/generateDrafts";
import { suggestPostIdea } from "@/lib/ai/suggestPostIdea";
import { analyzePostHookAndVirality, type HookAnalysisResult } from "@/lib/ai/analyzePostHookAndVirality";
import { getBrandVoiceConsistency, type BrandVoiceConsistency } from "@/lib/ai/getBrandVoiceConsistency";
import { suggestPostImprovement } from "@/lib/ai/suggestPostImprovement";
import { ALL_PLATFORMS } from "@/lib/ai/platforms";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import MediaLibraryModal, { type MediaLibraryItem } from "@/components/dashboard/MediaLibraryModal";
import ComposePreviewCard from "@/components/dashboard/ComposePreviewCard";
import { PLATFORM_IMAGE_RATIO } from "@/lib/media/platformAspectRatio";
import { createCroppedMediaVariant } from "@/lib/media/createCroppedMediaVariant";
import { useWooCommerceConnection } from "@/lib/woocommerce/useWooCommerceConnection";
import { stripHtml, type WooCommerceProduct } from "@/lib/woocommerce/client";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";
import { useCanvaDesignFlow } from "@/lib/canva/useCanvaDesignFlow";
import WooCommerceProductPicker from "@/components/dashboard/WooCommerceProductPicker";
import TemplatePickerModal, { type ContentTemplate } from "@/components/dashboard/TemplatePickerModal";
import SaveTemplateModal from "@/components/dashboard/SaveTemplateModal";
import type { TemplateCategoryId } from "@/lib/content/templateCategories";
import { useLanguage } from "@/context/LanguageContext";

const CHAR_LIMIT: Record<PlatformName, number> = {
  instagram: 2200,
  facebook: 500,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  x: 280,
  pinterest: 500,
  threads: 500,
  telegram: 1024,
  bluesky: 300,
  woocommerce: 2000,
  shopify: 2000,
  "google-business": 1500,
  discord: 2000,
  whatsapp: 1024,
  canva: 1000,
};

const IDEA_CHIPS_TR = [
  "🚀 Yeni Ürün / Özellik Lansmanı",
  "💡 Sektör İpucu & Eğitici İçerik",
  "💬 Müşteri Başarı Hikayesi",
  "🔍 Kulis & Kamera Arkası",
];

const IDEA_CHIPS_EN = [
  "🚀 New Product / Feature Launch",
  "💡 Industry Tip & Educational Guide",
  "💬 Customer Success Story",
  "🔍 Behind the Scenes & Roastery",
];

const TONE_OPTIONS_TR = [
  { id: "natural", label: "Samimi & Doğal", desc: "Sıcak, içten ve bağ kuran ton" },
  { id: "professional", label: "B2B Profesyonel", desc: "Otoriter, güven veren, net ton" },
  { id: "energetic", label: "Enerjik & Genç", desc: "Heyecan verici, dinamik tempo" },
  { id: "curious", label: "Merak Uyandırıcı", desc: "Tıklama ve kaydetme odaklı kanca" },
];

const TONE_OPTIONS_EN = [
  { id: "natural", label: "Friendly & Natural", desc: "Warm, genuine, and authentic tone" },
  { id: "professional", label: "B2B Professional", desc: "Authoritative, confident, and clear" },
  { id: "energetic", label: "Energetic & Bold", desc: "Exciting, high-tempo engagement" },
  { id: "curious", label: "Intriguing Hook", desc: "Curiosity and save-driven hook" },
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

// Ordered — index is carousel position for Instagram/Facebook (see
// ComposePreviewCard and metaProvider/instagramProvider's real carousel
// support). Always images: video only ever flows through the separate
// TikTok single-video path below (requiresVideo), never through this list.
type ComposeMediaItem =
  | { kind: "existing"; media: MediaLibraryItem }
  | { kind: "upload"; file: File; previewUrl: string }
  | { kind: "generated"; dataUrl: string };

// Instagram's real carousel cap (Meta Graph API) — used as the shared limit
// since Facebook's album flow comfortably fits under it too.
const MAX_MEDIA_ITEMS = 10;

function mediaItemPreviewUrl(item: ComposeMediaItem): string {
  if (item.kind === "existing") return item.media.file_url;
  if (item.kind === "generated") return item.dataUrl;
  return item.previewUrl;
}

// Always false today — the !requiresVideo add flow (file input, library
// multi-select) is locked to images only — but kept real instead of
// hardcoded so this doesn't quietly lie if that ever changes.
function mediaItemIsVideo(item: ComposeMediaItem): boolean {
  if (item.kind === "existing") return item.media.file_type.startsWith("video/");
  if (item.kind === "upload") return item.file.type.startsWith("video/");
  return false;
}

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
  onDirtyChange,
  initialCampaignId,
  initialDate,
  initialHour,
  initialMedia,
}: {
  onSubmitted?: () => void;
  // Called when the success screen's "go look at it" links are clicked.
  // Only meaningful inside ComposeModal — the modal's own isOpen state lives
  // in the layout-level provider, so it survives a route change on its own;
  // without this, clicking "Takvimi Gör" would navigate to Calendar with the
  // modal still floating on top of it.
  onNavigate?: () => void;
  // Lets ComposeModal ask before discarding real in-progress work — a
  // stray click on the modal's backdrop (real, clickable space either side
  // of the max-w-6xl form on any wider screen) used to close instantly with
  // no confirmation and no way to get a typed idea or generated drafts back.
  onDirtyChange?: (dirty: boolean) => void;
  // Pre-fills from whoever opened the modal (a campaign card's "+ İçerik
  // Üret", a Calendar day cell's "+") — passed as props now, not read from
  // the URL, since every caller opens this as a modal via useComposeModal()
  // rather than navigating to a page with query params.
  initialCampaignId?: string;
  initialDate?: string;
  initialHour?: number;
  // Set when opened by dragging one or more Medya panel thumbnails onto a
  // calendar day — skips the manual attach step entirely, in publish order.
  initialMedia?: MediaLibraryItem[];
} = {}) {
  const brand = useBrand();
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const ideaChips = isEn ? IDEA_CHIPS_EN : IDEA_CHIPS_TR;
  const toneOptions = isEn ? TONE_OPTIONS_EN : TONE_OPTIONS_TR;
  const supabase = useMemo(() => createClient(), []);
  const { connected: woocommerceConnected } = useWooCommerceConnection(brand.id);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const { connected: canvaConnected } = useCanvaConnection(brand.id);

  const [mode, setMode] = useState<Mode>("ai");
  const [founderName, setFounderName] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<"brand" | "founder">("brand");
  const [hashtagsAsFirstComment, setHashtagsAsFirstComment] = useState(false);
  const [format, setFormat] = useState<ContentFormat>("post");
  const [selectedPlatforms, setSelectedPlatforms] = useState<LaunchPlatform[]>([]);
  // null = still loading. Only platforms with a real, active connection are
  // offerable here — selecting an unconnected platform would just produce
  // content nothing can ever actually publish to.
  const [connectedPlatforms, setConnectedPlatforms] = useState<LaunchPlatform[] | null>(null);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [templatesRefreshKey, setTemplatesRefreshKey] = useState(0);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [campaignId, setCampaignId] = useState<string>(initialCampaignId ?? "");
  const [selectedTone, setSelectedTone] = useState<string>("natural");
  // Free-text labels alongside the campaign link — content.tags already
  // existed in the schema (jsonb array) but nothing wrote to it until now.
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Compact-by-default UI: tone/campaign/tags and the hook/voice-consistency
  // AI panels are real, working features but add a lot of vertical weight —
  // tucked behind disclosures so the default view stays as sparse as the
  // reference compose box, without deleting any capability.
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitMenuOpen, setSubmitMenuOpen] = useState(false);
  const submitMenuRef = useRef<HTMLDivElement>(null);
  const [scheduleMenuOpen, setScheduleMenuOpen] = useState(false);
  const scheduleMenuRef = useRef<HTMLDivElement>(null);

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

  // Media state — an ordered list for the (image-only) Instagram/Facebook
  // carousel case, plus a completely separate single-video slot for the
  // video-only platforms (TikTok and YouTube — see requiresVideo below),
  // which never shares state with the carousel list. Named after TikTok
  // since it was the only video-only platform when this was written; it
  // now also carries YouTube's video whenever YouTube is selected instead
  // of (or alongside) TikTok — same one shared upload either way, since
  // content_media is one set per post regardless of which platforms use it.
  const [mediaItems, setMediaItems] = useState<ComposeMediaItem[]>(
    (initialMedia ?? []).map((media) => ({ kind: "existing" as const, media }))
  );
  const [tiktokVideoFile, setTiktokVideoFile] = useState<File | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const {
    busy: canvaBusy,
    error: canvaError,
    start: startCanvaDesign,
  } = useCanvaDesignFlow((item) => {
    setMediaItems((prev) => (prev.length >= MAX_MEDIA_ITEMS ? prev : [...prev, { kind: "existing" as const, media: item }]));
  });

  // Hook & Virality analysis state
  const [analyzingHook, setAnalyzingHook] = useState(false);
  const [hookAnalysis, setHookAnalysis] = useState<HookAnalysisResult | null>(null);
  const [hookError, setHookError] = useState<string | null>(null);
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [voiceConsistency, setVoiceConsistency] = useState<BrandVoiceConsistency | null>(null);
  const [voiceCheckedEmpty, setVoiceCheckedEmpty] = useState(false);

  // "Rewrite with AI" / "Generate hashtags" — quick one-click actions on
  // whatever's currently in the active platform's caption, sitting right
  // under the textarea like the reference compose box's own pill row.
  const [rewriting, setRewriting] = useState(false);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);

  // Status & Submit
  const [genError, setGenError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Preview simulator platform
  const [previewPlatform, setPreviewPlatform] = useState<PlatformName>("instagram");

  // TikTok's Direct Post and YouTube both have no text/image-only path — a
  // real video is mandatory (their providers throw without one), so
  // selecting either switches the media picker from photo to video mode.
  const requiresVideo = selectedPlatforms.includes("tiktok") || selectedPlatforms.includes("youtube");

  // TikTok's own single-video preview — kept on its own useMemo/cleanup pair
  // since, unlike mediaItems' upload entries, this object URL is created on
  // every re-derivation rather than stored once on the item.
  const tiktokVideoPreviewUrl = useMemo(
    () => (tiktokVideoFile ? URL.createObjectURL(tiktokVideoFile) : null),
    [tiktokVideoFile]
  );
  useEffect(() => {
    return () => {
      if (tiktokVideoPreviewUrl) URL.revokeObjectURL(tiktokVideoPreviewUrl);
    };
  }, [tiktokVideoPreviewUrl]);

  // Local media preview — first carousel item, or the TikTok video.
  const mediaPreview = requiresVideo
    ? tiktokVideoPreviewUrl
    : mediaItems.length > 0
      ? mediaItemPreviewUrl(mediaItems[0])
      : null;
  const mediaPreviewIsVideo = requiresVideo && Boolean(tiktokVideoFile);

  // Revokes every still-attached upload's object URL on unmount (removal
  // itself revokes eagerly — see removeMediaItem) via a ref so this doesn't
  // need to re-run, and doesn't revoke, on every mediaItems change.
  const mediaItemsRef = useRef(mediaItems);
  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);
  useEffect(() => {
    return () => {
      mediaItemsRef.current.forEach((item) => {
        if (item.kind === "upload") URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  function removeMediaItem(index: number) {
    setMediaItems((prev) => {
      const target = prev[index];
      if (target?.kind === "upload") URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function moveMediaItem(from: number, to: number) {
    setMediaItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  // Anything worth confirming before a click on ComposeModal's backdrop (or
  // Escape) throws it away. Once actually submitted there's nothing left to
  // lose, so "submitted" is deliberately excluded even though drafts/idea
  // are still technically populated at that point.
  const hasUnsavedChanges =
    state !== "submitted" && Boolean(idea.trim() || drafts || mediaItems.length > 0 || tiktokVideoFile);

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

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
        .from("content_templates")
        .select("id, name, body, category")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false });
      if (!ignore) setTemplates(data ?? []);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, templatesRefreshKey]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from("brand_dna")
        .select("founder_name")
        .eq("brand_id", brand.id)
        .maybeSingle();
      if (!ignore) setFounderName(data?.founder_name || null);
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
      // Exception: a drag-and-drop from Calendar's Medya panel that
      // pre-attached photos (initialMedia) shouldn't silently auto-select
      // TikTok too. All platforms on one piece of content share the same
      // content_media set, so TikTok requiring a real video would force the
      // whole media picker into video-only mode — making the photos the
      // user just dragged in disappear from view with zero explanation.
      const droppedOnlyPhotos =
        initialMedia !== undefined && initialMedia.length > 0 && initialMedia.every((m) => !m.file_type.startsWith("video/"));
      const defaultPlatforms = droppedOnlyPhotos ? connected.filter((p) => p !== "tiktok") : connected;
      setSelectedPlatforms(defaultPlatforms);
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
  }, [supabase, brand.id, initialMedia]);

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

  useEffect(() => {
    if (!submitMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (submitMenuRef.current && !submitMenuRef.current.contains(event.target as Node)) {
        setSubmitMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSubmitMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [submitMenuOpen]);

  useEffect(() => {
    if (!scheduleMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(event.target as Node)) {
        setScheduleMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setScheduleMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [scheduleMenuOpen]);

  // Turns a real WooCommerce product into a content idea — name/price/
  // description become the "ana fikir" AI drafts from, and the product
  // photo (best-effort: the merchant's own WordPress host may not send
  // permissive CORS headers, unlike Supabase Storage) gets attached the
  // same way a manually picked file would.
  async function handleSelectProduct(product: WooCommerceProduct) {
    const priceLine = product.price ? (isEn ? `Price: ${product.price} TL` : `Fiyat: ${product.price} TL`) : "";
    const description = stripHtml(product.short_description || product.description || "");
    setIdea([product.name, description, priceLine].filter(Boolean).join("\n\n"));

    const imageUrl = product.images?.[0]?.src;
    if (imageUrl && mediaItems.length < MAX_MEDIA_ITEMS) {
      try {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error("Ürün görseli indirilemedi.");
        const blob = await res.blob();
        const file = new File([blob], `woocommerce-${product.id}.jpg`, { type: blob.type || "image/jpeg" });
        setMediaItems((prev) =>
          prev.length >= MAX_MEDIA_ITEMS ? prev : [...prev, { kind: "upload", file, previewUrl: URL.createObjectURL(file) }]
        );
      } catch (err) {
        console.error("WooCommerce ürün görseli eklenemedi:", err instanceof Error ? err.message : err);
      }
    }
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

  async function handleCheckVoiceConsistency() {
    const currentCaption = drafts?.[activePlatformTab] || "";
    if (!currentCaption.trim()) return;
    setAnalyzingVoice(true);
    try {
      const res = await getBrandVoiceConsistency(brand.id, currentCaption);
      setVoiceConsistency(res);
      setVoiceCheckedEmpty(res === null);
    } finally {
      setAnalyzingVoice(false);
    }
  }

  // Re-runs generation for just the active platform, seeded with its current
  // text instead of the original idea — a real second AI pass, not a canned
  // rephrase, so it still respects brand voice/founder mode and platform
  // rules the same way the first draft did.
  async function handleRewriteWithAI() {
    const currentText = drafts?.[activePlatformTab];
    if (!currentText?.trim() || rewriting) return;
    setRewriting(true);
    setGenError(null);
    try {
      const rewritePrompt = isEn
        ? `Rewrite the post below to be more engaging while keeping the same core message and facts:\n\n${currentText}`
        : `Aşağıdaki gönderiyi aynı temel mesajı ve bilgileri koruyarak daha akıcı ve ilgi çekici şekilde yeniden yaz:\n\n${currentText}`;
      const result = await generateDrafts(brand.id, rewritePrompt, [activePlatformTab], format, undefined, voiceMode);
      const rewritten = result[activePlatformTab];
      if (rewritten) setDrafts((prev) => (prev ? { ...prev, [activePlatformTab]: rewritten } : prev));
    } catch (err) {
      setGenError(err instanceof Error ? err.message : (isEn ? "Could not rewrite." : "Yeniden yazılamadı."));
    } finally {
      setRewriting(false);
    }
  }

  // Reuses the same brand-aware hashtag suggester already shipped on the
  // Approvals detail modal's "Suggestions" tab, instead of inventing a
  // second hashtag prompt — appends whatever it returns that isn't already
  // in the caption.
  async function handleGenerateHashtags() {
    const currentText = drafts?.[activePlatformTab];
    if (!currentText?.trim() || generatingHashtags) return;
    setGeneratingHashtags(true);
    setGenError(null);
    try {
      const result = await suggestPostImprovement(brand.id, currentText, activePlatformTab);
      const newTags = result.hashtags
        .map((h) => (h.startsWith("#") ? h : `#${h}`))
        .filter((h) => !currentText.includes(h));
      if (newTags.length > 0) {
        setDrafts((prev) =>
          prev ? { ...prev, [activePlatformTab]: `${prev[activePlatformTab]?.trimEnd()}\n\n${newTags.join(" ")}` } : prev
        );
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : (isEn ? "Could not generate hashtags." : "Hashtag üretilemedi."));
    } finally {
      setGeneratingHashtags(false);
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
      // The preview switcher only ever offers currently-selected platforms
      // (see previewablePlatforms) — without this, unchecking the platform
      // that happened to be previewed left previewPlatform pointing at
      // something no longer in the switcher at all.
      if (!next.includes(previewPlatform as LaunchPlatform) && next.length > 0) {
        setPreviewPlatform(next[0]);
      }
      return next;
    });
  }

  // AI Text & Multi-platform generation
  // Resolves whatever media is currently attached into something the vision
  // model can actually fetch — a real URL for a library pick or an
  // AI-generated image, or a base64 data URI for a freshly-picked local
  // file that hasn't been uploaded anywhere yet (Server Actions can carry
  // that inline — see next.config.ts's bumped bodySizeLimit). Video is
  // skipped; this is caption generation from an image, not frame analysis.
  async function resolveMediaForVision(): Promise<string | undefined> {
    if (requiresVideo || mediaItems.length === 0) return undefined;
    const first = mediaItems[0];
    if (first.kind === "existing") {
      return first.media.file_type.startsWith("video/") ? undefined : first.media.file_url;
    }
    if (first.kind === "generated") return first.dataUrl;
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(first.file);
    });
  }

  async function generate() {
    if (!idea.trim() || selectedPlatforms.length === 0) return;
    setState("generating");
    setGenError(null);
    try {
      const toneObj = toneOptions.find((t) => t.id === selectedTone);
      const enhancedPrompt = `${idea}\n(${isEn ? "Brand Tone" : "Marka Tonu"}: ${toneObj?.label || (isEn ? "Natural" : "Doğal")}, ${isEn ? "Goal: High Engagement and strong 2-second hook" : "Hedef: Yüksek Etkileşim ve 2 saniyelik güçlü kanca"})`;

      const visionMediaUrl = await resolveMediaForVision();
      const result = await generateDrafts(brand.id, enhancedPrompt, selectedPlatforms, format, visionMediaUrl, voiceMode);
      setDrafts(result);

      // Auto-extract or suggest hook from the first draft
      const firstText = Object.values(result)[0] || "";
      const lines = firstText.split("\n").map((l) => l.trim()).filter(Boolean);
      setHook(lines[0] || idea.slice(0, 70));
      setVisualPrompt(idea);

      setState("ready");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : (isEn ? "Draft could not be generated." : "Taslak üretilemedi."));
      setState("idle");
    }
  }

  // AI Image generation call — appends to the carousel list rather than
  // replacing it, consistent with file upload and library picks (all three
  // are just different ways to add another item), correctable via each
  // thumbnail's remove button.
  async function triggerImageGeneration() {
    const concept = visualPrompt.trim() || hook.trim() || idea.trim();
    if (!concept || mediaItems.length >= MAX_MEDIA_ITEMS) return;

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
        throw new Error(data.error || (isEn ? "Image could not be generated." : "Görsel üretilemedi."));
      }

      setMediaItems((prev) => (prev.length >= MAX_MEDIA_ITEMS ? prev : [...prev, { kind: "generated", dataUrl: data.dataUrl }]));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : (isEn ? "An error occurred while generating the image." : "Görsel üretilirken bir hata oluştu."));
    } finally {
      setGeneratingImage(false);
    }
  }

  function prepareManualDrafts() {
    if (selectedPlatforms.length === 0) return;
    setDrafts(Object.fromEntries(selectedPlatforms.map((p) => [p, ""])));
    setState("ready");
  }

  // A template's body is the real text (placeholders and all) — unlike
  // IDEA_CHIPS, which just seed the AI's topic input, this skips generation
  // entirely and drops the saved text straight into every selected
  // platform's tab so the user can fill in the [placeholder] parts.
  function applyTemplate(template: ContentTemplate) {
    if (selectedPlatforms.length === 0) return;
    setMode("manual");
    setDrafts(Object.fromEntries(selectedPlatforms.map((p) => [p, template.body])));
    setState("ready");
    setTemplatePickerOpen(false);
  }

  async function handleSaveTemplateConfirm(name: string, category: TemplateCategoryId) {
    if (!drafts) return;
    const currentText = drafts[activePlatformTab]?.trim();
    if (!currentText) return;

    setSavingTemplate(true);
    const { error } = await supabase.from("content_templates").insert({
      brand_id: brand.id,
      name,
      body: currentText,
      category,
    });
    setSavingTemplate(false);
    if (error) {
      alert((isEn ? "Template could not be saved: " : "Şablon kaydedilemedi: ") + error.message);
      return;
    }
    setTemplatesRefreshKey((k) => k + 1);
    setSaveTemplateOpen(false);
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm(isEn ? "Are you sure you want to delete this template?" : "Bu şablonu silmek istediğine emin misin?")) return;
    await supabase.from("content_templates").delete().eq("id", id);
    setTemplatesRefreshKey((k) => k + 1);
  }

  // Submit to Supabase
  async function submit(targetStatus: "DRAFT" | "NEEDS_REVIEW" | "APPROVED", scheduledOverrideIso?: string) {
    if (!drafts || !scheduledAt) return;
    if (requiresVideo && !tiktokVideoFile?.type.startsWith("video/")) {
      setSubmitError(
        isEn
          ? "When TikTok or YouTube is selected, you must upload a video file — neither can post text or photos alone."
          : "TikTok veya YouTube seçiliyken bir video dosyası yüklemen gerekiyor — ikisi de metin veya fotoğrafla paylaşım yapamıyor."
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Resolve every attached item into a real `media` row id, in order —
      // that order becomes content_media.position, which is the carousel
      // order Instagram/Facebook publish in (see metaProvider/
      // instagramProvider). TikTok's single video is a completely separate
      // slot (tiktokVideoFile), never mixed into mediaItems.
      const mediaIds: string[] = [];

      if (requiresVideo) {
        if (tiktokVideoFile) {
          const path = `${brand.id}/${crypto.randomUUID()}-${tiktokVideoFile.name}`;
          const { error: uploadError } = await supabase.storage.from("media").upload(path, tiktokVideoFile);
          if (uploadError) throw new Error(isEn ? `File could not be uploaded: ${uploadError.message}` : `Dosya yüklenemedi: ${uploadError.message}`);

          const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
          const { data: mediaRow, error: mediaError } = await supabase
            .from("media")
            .insert({
              brand_id: brand.id,
              file_name: tiktokVideoFile.name,
              file_url: publicUrl.publicUrl,
              file_type: tiktokVideoFile.type,
              file_size: tiktokVideoFile.size,
            })
            .select("id")
            .single();
          if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? (isEn ? "Media record could not be created." : "Medya kaydı oluşturulamadı."));
          mediaIds.push(mediaRow.id);
        }
      } else {
        for (const item of mediaItems) {
          if (item.kind === "existing") {
            mediaIds.push(item.media.id);
            continue;
          }

          if (item.kind === "generated") {
            const { blob, contentType } = dataUrlToBlob(item.dataUrl);
            const ext = contentType === "image/png" ? "png" : "jpg";
            const path = `${brand.id}/${crypto.randomUUID()}-ai-compose.${ext}`;

            const { error: uploadError } = await supabase.storage.from("media").upload(path, blob, { contentType });
            if (uploadError) throw new Error(isEn ? `Image could not be uploaded: ${uploadError.message}` : `Görsel yüklenemedi: ${uploadError.message}`);

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
            if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? (isEn ? "Media record could not be created." : "Medya kaydı oluşturulamadı."));
            mediaIds.push(mediaRow.id);
            continue;
          }

          // item.kind === "upload"
          const path = `${brand.id}/${crypto.randomUUID()}-${item.file.name}`;
          const { error: uploadError } = await supabase.storage.from("media").upload(path, item.file);
          if (uploadError) throw new Error(isEn ? `File could not be uploaded: ${uploadError.message}` : `Dosya yüklenemedi: ${uploadError.message}`);

          const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
          const { data: mediaRow, error: mediaError } = await supabase
            .from("media")
            .insert({
              brand_id: brand.id,
              file_name: item.file.name,
              file_url: publicUrl.publicUrl,
              file_type: item.file.type,
              file_size: item.file.size,
            })
            .select("id")
            .single();
          if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? (isEn ? "Media record could not be created." : "Medya kaydı oluşturulamadı."));
          mediaIds.push(mediaRow.id);
        }
      }

      // Format uyarlama: a single attached photo goes out to every platform
      // as the same file today unless we override it here — Instagram/
      // Facebook/Threads want 4:5, Pinterest wants 2:3, and whichever
      // platform's ratio didn't match just got auto-cropped by that
      // platform itself. Only handles the single-image case on purpose:
      // cropping just the first photo of a carousel would silently break
      // the rest, so carousels (or video posts) keep using the shared media
      // untouched. Never blocks the submit — a failed crop just means that
      // platform falls back to the original file, exactly like before.
      const mediaOverrideByPlatform: Partial<Record<PlatformName, string>> = {};
      if (!requiresVideo && mediaIds.length === 1) {
        const { data: sourceMedia } = await supabase
          .from("media")
          .select("file_url, file_type")
          .eq("id", mediaIds[0])
          .single();

        if (sourceMedia && !sourceMedia.file_type.startsWith("video/")) {
          const ratiosNeeded = new Map<number, PlatformName[]>();
          for (const platform of selectedPlatforms) {
            const ratio = PLATFORM_IMAGE_RATIO[platform as PlatformName];
            if (!ratio) continue;
            if (!ratiosNeeded.has(ratio)) ratiosNeeded.set(ratio, []);
            ratiosNeeded.get(ratio)!.push(platform as PlatformName);
          }

          for (const [ratio, platforms] of ratiosNeeded) {
            try {
              const croppedId = await createCroppedMediaVariant({
                supabase,
                brandId: brand.id,
                sourceMediaId: mediaIds[0],
                sourceUrl: sourceMedia.file_url,
                targetRatio: ratio,
              });
              if (croppedId) {
                for (const platform of platforms) mediaOverrideByPlatform[platform] = croppedId;
              }
            } catch (err) {
              console.error("Format uyarlama başarısız, orijinal görsel kullanılacak:", err);
            }
          }
        }
      }

      // "Şimdi Yayınla" passes its own timestamp (now) instead of whatever
      // sits in the date picker — content.status:'APPROVED' is what
      // dispatch_due_content() actually watches for, same as the normal
      // review-approval flow, so this just does both steps in one click.
      const scheduledIso = scheduledOverrideIso ?? new Date(scheduledAt).toISOString();
      const title = hook.trim().slice(0, 80) || idea.trim().slice(0, 80) || (isEn ? "New Content" : "Yeni İçerik");

      const coreDetails = [
        hook ? (isEn ? `Hook: ${hook}` : `Kanca (Hook): ${hook}`) : "",
        visualPrompt ? (isEn ? `Visual/Video Concept: ${visualPrompt}` : `Görsel/Video Konsepti: ${visualPrompt}`) : "",
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

      if (contentError || !contentRow) throw new Error(contentError?.message ?? (isEn ? "Content could not be saved." : "İçerik kaydedilemedi."));

      if (mediaIds.length > 0) {
        const { error: mediaLinkError } = await supabase
          .from("content_media")
          .insert(mediaIds.map((id, position) => ({ content_id: contentRow.id, media_id: id, position })));
        if (mediaLinkError) throw new Error(mediaLinkError.message);
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
            media_override_id: mediaOverrideByPlatform[platform as PlatformName] ?? null,
            hashtags_as_first_comment: hashtagsAsFirstComment,
          };
        })
      );

      if (cpError) throw new Error(cpError.message);

      setState("submitted");
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : (isEn ? "Post could not be saved." : "Gönderi kaydedilemedi."));
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
    mediaItems.forEach((item) => {
      if (item.kind === "upload") URL.revokeObjectURL(item.previewUrl);
    });
    setMediaItems([]);
    setTiktokVideoFile(null);
    setScheduledAt(defaultScheduleValue());
    setCampaignId("");
    setTags([]);
    setTagInput("");
    setFormat("post");
  }

  // What the preview switcher actually offers — the platforms this post
  // targets once any are picked, or every connected platform before that
  // (never LinkedIn/X, which this app can't publish to at all — the switcher
  // used to hardcode those in regardless of what was actually selected).
  const previewablePlatforms = useMemo<PlatformName[]>(() => {
    if (selectedPlatforms.length > 0) return selectedPlatforms as PlatformName[];
    return (connectedPlatforms ?? []) as PlatformName[];
  }, [selectedPlatforms, connectedPlatforms]);

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
      (isEn
        ? "Great content copy to be published will appear here. Enter a topic on the left and click 'Generate with AI' to create your text and visual. ✨"
        : "Burada yayınlanacak harika bir içerik metni yer alacak. Soldaki alana bir konu yazıp 'AI ile Üret' butonuna tıklayarak metin ve görselinizi oluşturabilirsiniz. ✨")
    );
  }, [drafts, previewPlatform, idea, isEn]);

  // Every attached item, in order — ComposePreviewCard decides for itself
  // whether the active preview platform actually publishes more than the
  // first one (Instagram/Facebook do, Threads/TikTok don't), so it gets the
  // real list rather than a pre-collapsed single URL.
  const previewMedia = useMemo(() => {
    if (requiresVideo) {
      return tiktokVideoPreviewUrl ? [{ url: tiktokVideoPreviewUrl, isVideo: true }] : [];
    }
    return mediaItems.map((item) => ({ url: mediaItemPreviewUrl(item), isVideo: mediaItemIsVideo(item) }));
  }, [requiresVideo, tiktokVideoPreviewUrl, mediaItems]);

  return (
    <div className="space-y-3">
      {state === "submitted" ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            {isEn ? "Content Successfully Scheduled!" : "İçerik Başarıyla Planlandı!"}
          </h2>
          <p className="max-w-md text-sm text-slate-500">
            {isEn
              ? "Your post has been scheduled on your calendar for the selected platforms and time. You can track it on the review desk or calendar."
              : "Gönderiniz seçtiğiniz platformlar ve saat için takvime eklendi. Onay masasından veya takvimden takip edebilirsiniz."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/calendar"
              onClick={onNavigate}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
            >
              {isEn ? "View in Calendar" : "Takvimi Gör"}
            </Link>
            <Link
              href="/dashboard/posts"
              onClick={onNavigate}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {isEn ? "Posts / Review Desk" : "Gönderiler / Onay Masası"}
            </Link>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              {isEn ? "Create New Post +" : "Yeni Gönderi Oluştur +"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-100 bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              {/* Compact top bar — connected accounts as an avatar rail
                  (click to toggle targeting) instead of a labelled row of
                  text pills, plus the AI/Manual switch and founder-voice
                  toggle. Only platforms with a real, active connection are
                  offered here; an unconnected platform could never actually
                  publish, so it has no business being selectable. */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                {connectedPlatforms === null ? (
                  <p className="text-xs text-slate-400">
                    {isEn ? "Loading connected accounts..." : "Bağlı hesaplar yükleniyor..."}
                  </p>
                ) : connectedPlatforms.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {isEn ? "No connected accounts yet. " : "Henüz bağlı bir hesabın yok. "}
                    <Link href="/settings?tab=baglantilar" className="font-semibold text-blue-600 hover:underline">
                      {isEn ? "Connect one →" : "Bir hesap bağla →"}
                    </Link>
                  </p>
                ) : (
                  <div className="flex items-center -space-x-2">
                    {connectedPlatforms.map((platform) => {
                      const checked = selectedPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          title={platformLabel(platform)}
                          className="relative shrink-0 cursor-pointer transition hover:z-10 hover:-translate-y-0.5"
                        >
                          <PlatformIcon
                            name={platform}
                            variant="tile"
                            className={`h-9 w-9 rounded-full ring-2 ring-white transition ${
                              checked ? "" : "opacity-35 grayscale"
                            }`}
                          />
                          {checked && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                              <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {founderName && mode === "ai" && (
                    <button
                      type="button"
                      onClick={() => setVoiceMode((prev) => (prev === "brand" ? "founder" : "brand"))}
                      title={
                        isEn
                          ? "Switch between brand identity and founder's personal voice"
                          : "Marka kimliği ile kurucunun kişisel sesi arasında geçiş yap"
                      }
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        voiceMode === "founder"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      <span>{voiceMode === "founder" ? `👤 ${founderName}` : brand.name}</span>
                      <span className="text-[10px] opacity-60">{isEn ? "(switch)" : "(değiştir)"}</span>
                    </button>
                  )}

                  <div className="flex rounded-lg bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("ai");
                        setState("idle");
                        setDrafts(null);
                      }}
                      className={`rounded-md px-3 py-1 text-[11px] font-bold transition ${
                        mode === "ai" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {isEn ? "✨ AI" : "✨ AI"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("manual");
                        setState("idle");
                        setDrafts(null);
                      }}
                      className={`rounded-md px-3 py-1 text-[11px] font-bold transition ${
                        mode === "manual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {isEn ? "✍️ Manual" : "✍️ Manuel"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Format — compact segmented control. Classification
                  + AI prompt tone only for now (see generateDrafts'
                  FORMAT_RULE); no publish connector branches on this yet, so
                  it doesn't change where a Reel actually posts, only how it
                  reads. */}
              <div className="flex gap-1.5">
                {(
                  [
                    { key: "post", label: isEn ? "📄 Post" : "📄 Gönderi" },
                    { key: "story", label: isEn ? "⚡ Story" : "⚡ Hikaye" },
                    { key: "reel", label: isEn ? "🎬 Reel" : "🎬 Makara" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFormat(f.key)}
                    className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
                      format === f.key
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Advanced options — tone, campaign, tags. Real settings, just
                  not needed to write and schedule a straightforward post, so
                  they stay tucked away until asked for. */}
              <div>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <svg
                    className={`h-3 w-3 transition-transform ${advancedOpen ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{isEn ? "Advanced options" : "Gelişmiş seçenekler"}</span>
                  {(campaignId || tags.length > 0) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </button>

                {advancedOpen && (
                  <div className="mt-3 space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    {/* Tone of Voice Selector */}
                    {mode === "ai" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {isEn ? "Brand Voice & Tone" : "Marka Sesi & Tonu"}
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {toneOptions.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedTone(t.id)}
                              className={`rounded-xl border p-2.5 text-left transition ${
                                selectedTone === t.id
                                  ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
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
                          {isEn ? "Campaign (Optional)" : "Kampanya (Opsiyonel)"}
                        </label>
                        <select
                          id="campaign_select"
                          value={campaignId}
                          onChange={(e) => setCampaignId(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                        >
                          <option value="">{isEn ? "General Content (No Campaign)" : "Genel İçerik (Kampanya Bağlantısız)"}</option>
                          {campaigns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Free-text Tags — separate from the campaign link,
                        matching Planable's pattern of stacking a campaign tag
                        with custom labels ("tarifler", "Makaleler") side by
                        side. */}
                    <div className="space-y-1.5">
                      <label htmlFor="tag_input" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {isEn ? "Tags (Optional)" : "Etiketler (Opsiyonel)"}
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
                              aria-label={isEn ? `Remove tag ${t}` : `${t} etiketini kaldır`}
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
                          placeholder={isEn ? "Type a tag, press Enter..." : "Etiket yaz, Enter'a bas..."}
                          className="min-w-[140px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Proactive AI Idea Suggestion — offered unprompted, before
                  the user has typed anything, instead of waiting for a
                  "generate" click. Hides itself once they type their own
                  idea or accept/dismiss this one. */}
              {mode === "ai" && !suggestionDismissed && !idea.trim() && (
                <div className="rounded-xl border border-blue-100/80 bg-blue-50/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      {isEn ? "⚡ Our AI generated an idea" : "⚡ Yapay zekamız bir fikir üretti"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSuggestionDismissed(true)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label={isEn ? "Dismiss" : "Kapat"}
                    >
                      ✕
                    </button>
                  </div>
                  {suggestingIdea ? (
                    <p className="text-xs text-slate-600">
                      {isEn ? "Thinking of an idea tailored to your brand..." : "Markanıza uygun bir fikir düşünüyor..."}
                    </p>
                  ) : suggestedIdea ? (
                    <>
                      <p className="text-xs font-medium text-slate-900">{suggestedIdea}</p>
                      <div className="flex items-center gap-3 pt-0.5">
                        <button
                          type="button"
                          onClick={retryIdeaSuggestion}
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          {isEn ? "Try again" : "Tekrar dene"}
                        </button>
                        <button
                          type="button"
                          onClick={useSuggestedIdea}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition"
                        >
                          {isEn ? "✓ Accept" : "✓ Kabul et"}
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
                    {mode === "ai"
                      ? isEn
                        ? "What would you like to post about?"
                        : "Ne hakkında paylaşım yapmak istiyorsunuz?"
                      : isEn
                        ? "Core Idea & Topic"
                        : "Ana Fikir & Konu"}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {idea.length} {isEn ? "characters" : "karakter"}
                  </span>
                </div>
                <textarea
                  id="idea_input"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder={
                    isEn
                      ? "e.g. Announcement of our new sustainable linen shirt collection. Highlight natural cotton texture, breathable fabric for summer, and elegant minimal design..."
                      : "Örn: Yeni sürdürülebilir keten gömlek koleksiyonumuzun duyurusu. Doğal pamuk dokusu, sıcak yaz günlerinde nefes alan yapı ve şık minimal tasarım vurgulansın..."
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                />

                {mode === "ai" && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ideaChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setIdea(chip)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700 transition"
                      >
                        {chip}
                      </button>
                    ))}
                    {woocommerceConnected && (
                      <button
                        type="button"
                        onClick={() => setProductPickerOpen(true)}
                        className="rounded-lg border border-[#96588A]/30 bg-[#96588A]/5 px-2.5 py-1 text-[11px] font-medium text-[#96588A] hover:bg-[#96588A]/10 transition"
                      >
                        {isEn ? "🛍️ Use WooCommerce Product" : "🛍️ WooCommerce Ürünü Kullan"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Visual Media & AI Image Engine Section — a compact icon row
                  (photo, library, Canva, AI-generate) instead of a stack of
                  labelled dropzone buttons, matching the reference compose
                  box's bottom icon rail. */}
              <div className="space-y-2">
                {requiresVideo && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
                    {isEn
                      ? "TikTok and YouTube cannot post text or photos alone — a real video file must be uploaded (AI image generation is not available here)."
                      : "TikTok ve YouTube metin veya fotoğrafla paylaşım yapamıyor — gerçek bir video dosyası yüklemen gerekiyor (AI görsel üretimi burada kullanılamaz)."}
                  </p>
                )}

                {!requiresVideo && mediaItems.length > 1 && selectedPlatforms.includes("threads") && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
                    {isEn
                      ? "Threads does not support carousels — only the first image will be published on this platform."
                      : "Threads carousel'i desteklemiyor — bu platformda yalnızca ilk görsel paylaşılacak."}
                  </p>
                )}

                {!requiresVideo && (
                  <input
                    type="text"
                    value={visualPrompt}
                    onChange={(e) => setVisualPrompt(e.target.value)}
                    placeholder={
                      isEn ? "Visual concept for AI image (optional)…" : "AI görseli için konsept (opsiyonel)…"
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                  />
                )}

                {imageError && <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg">{imageError}</p>}
                {canvaError && <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg">{canvaError}</p>}

                {/* Carousel thumbnail strip / video preview */}
                {requiresVideo ? (
                  mediaPreview && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
                      <video src={mediaPreview} muted className="h-full w-full object-cover" />
                    </div>
                  )
                ) : (
                  mediaItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mediaItems.map((item, index) => (
                        <div
                          key={index}
                          className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-xs bg-slate-100"
                        >
                          {mediaItemIsVideo(item) ? (
                            <video src={mediaItemPreviewUrl(item)} muted className="h-full w-full object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mediaItemPreviewUrl(item)} alt="" className="h-full w-full object-cover" />
                          )}
                          {mediaItems.length > 1 && (
                            <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[9px] font-bold text-white">
                              {index + 1}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMediaItem(index)}
                            aria-label={isEn ? "Remove media" : "Görseli kaldır"}
                            className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] leading-none text-white opacity-0 transition group-hover:opacity-100 cursor-pointer"
                          >
                            ✕
                          </button>
                          {mediaItems.length > 1 && (
                            <div className="absolute inset-x-0 bottom-0 flex justify-between px-0.5 pb-0.5 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => moveMediaItem(index, index - 1)}
                                disabled={index === 0}
                                aria-label={isEn ? "Move left" : "Öne al"}
                                className="flex h-4 w-4 items-center justify-center rounded bg-black/60 text-[10px] leading-none text-white disabled:opacity-0 cursor-pointer"
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() => moveMediaItem(index, index + 1)}
                                disabled={index === mediaItems.length - 1}
                                aria-label={isEn ? "Move right" : "Sona al"}
                                className="flex h-4 w-4 items-center justify-center rounded bg-black/60 text-[10px] leading-none text-white disabled:opacity-0 cursor-pointer"
                              >
                                ›
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Icon row */}
                <div className="flex items-center gap-1.5">
                  {requiresVideo ? (
                    <label
                      htmlFor="compose_media_video"
                      title={isEn ? "Upload video (required)" : "Video yükle (zorunlu)"}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition cursor-pointer"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="max-w-[10rem] truncate">
                        {tiktokVideoFile
                          ? tiktokVideoFile.name
                          : isEn
                            ? "Upload video"
                            : "Video yükle"}
                      </span>
                      <input
                        id="compose_media_video"
                        type="file"
                        accept="video/mp4,video/webm"
                        className="sr-only"
                        onChange={(e) => setTiktokVideoFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  ) : (
                    <>
                      <label
                        htmlFor="compose_media"
                        aria-disabled={mediaItems.length >= MAX_MEDIA_ITEMS}
                        title={isEn ? "Upload photo" : "Fotoğraf yükle"}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input
                          id="compose_media"
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={mediaItems.length >= MAX_MEDIA_ITEMS}
                          className="sr-only"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            e.target.value = "";
                            if (files.length === 0) return;
                            setMediaItems((prev) => {
                              const remaining = MAX_MEDIA_ITEMS - prev.length;
                              const toAdd = files.slice(0, remaining).map((file) => ({
                                kind: "upload" as const,
                                file,
                                previewUrl: URL.createObjectURL(file),
                              }));
                              return [...prev, ...toAdd];
                            });
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setLibraryOpen(true)}
                        disabled={mediaItems.length >= MAX_MEDIA_ITEMS}
                        title={isEn ? "Choose from library" : "Kütüphaneden seç"}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => (canvaConnected ? startCanvaDesign() : undefined)}
                        disabled={!canvaConnected || canvaBusy || mediaItems.length >= MAX_MEDIA_ITEMS}
                        title={
                          canvaConnected
                            ? isEn ? "Design with Canva" : "Canva ile tasarla"
                            : isEn ? "Connect Canva from Settings first" : "Önce Ayarlar'dan Canva'yı bağla"
                        }
                        className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg transition hover:ring-2 hover:ring-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {canvaBusy ? (
                          <span className="flex h-full w-full items-center justify-center border border-slate-200 bg-white">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                          </span>
                        ) : (
                          <PlatformIcon name="canva" variant="tile" className="h-9 w-9 rounded-lg" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={triggerImageGeneration}
                        disabled={generatingImage || (!visualPrompt.trim() && !idea.trim()) || mediaItems.length >= MAX_MEDIA_ITEMS}
                        title={isEn ? "Generate image with AI" : "AI ile görsel üret"}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {generatingImage ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                          </svg>
                        )}
                      </button>

                      <div className="ml-auto flex items-center gap-1.5">
                        {mediaItems.length > 1 && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {mediaItems.length} / {MAX_MEDIA_ITEMS}
                          </span>
                        )}
                        {mediaPreview && !mediaPreviewIsVideo && (
                          <span
                            title={
                              isEn
                                ? "AI will analyze the first image and tailor the copy to its content."
                                : "AI, metni üretirken ilk görseli gerçekten inceleyip içeriğine göre yazacak."
                            }
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md"
                          >
                            {isEn ? "✨ AI sees image" : "✨ AI görseli görüyor"}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Generate Drafts Trigger, with the saved-templates shortcut
                  tucked beside it rather than its own full-width row. */}
              <div className="flex items-center gap-2">
                {!drafts && selectedPlatforms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTemplatePickerOpen(true)}
                    title={isEn ? "My Templates" : "Şablonlarım"}
                    className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold text-slate-500 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700 transition cursor-pointer"
                  >
                    <span>📂</span>
                    {templates.length > 0 && <span>{templates.length}</span>}
                  </button>
                )}

                {mode === "ai" ? (
                  <button
                    type="button"
                    onClick={generate}
                    disabled={!idea.trim() || selectedPlatforms.length === 0 || state === "generating"}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {state === "generating" ? (
                      <>
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{isEn ? "Generating..." : "Üretiliyor..."}</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>{isEn ? "Generate with AI" : "AI ile Üret"}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={prepareManualDrafts}
                    disabled={selectedPlatforms.length === 0 || state === "ready"}
                    className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    {isEn ? "Prepare Text Areas" : "Metin Alanlarını Hazırla"}
                  </button>
                )}
              </div>

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
                      <span>{isEn ? "2-Second Hook" : "2 Saniyelik Kanca (Hook)"}</span>
                    </label>
                    <input
                      id="hook_input"
                      type="text"
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                      placeholder={isEn ? "Catchy opening hook..." : "Dikkat çeken açılış kancası..."}
                      className="w-full rounded-xl border border-amber-200/80 bg-amber-50/40 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Platform Specific Draft Editor Tabs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {isEn ? "Platform Captions" : "Platform Metinleri"}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSaveTemplateOpen(true)}
                          disabled={!drafts[activePlatformTab]?.trim()}
                          className="text-[11px] font-semibold text-slate-500 hover:text-blue-700 transition disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer"
                        >
                          {isEn ? "💾 Save as Template" : "💾 Şablon Olarak Kaydet"}
                        </button>
                        <span className="text-[11px] text-slate-400">
                          {drafts[activePlatformTab]?.length || 0} / {CHAR_LIMIT[activePlatformTab]} {isEn ? "chars" : "karakter"}
                        </span>
                      </div>
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

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={handleRewriteWithAI}
                        disabled={rewriting || !drafts[activePlatformTab]?.trim()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                      >
                        {rewriting ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                        ) : (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                        <span>{isEn ? "Rewrite with AI" : "AI ile Yeniden Yaz"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateHashtags}
                        disabled={generatingHashtags || !drafts[activePlatformTab]?.trim()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                      >
                        {generatingHashtags ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                        ) : (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        )}
                        <span>{isEn ? "Generate hashtags" : "Hashtag Üret"}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI insights — hook/virality scoring and brand voice
                      consistency are real, working differentiators, but
                      they're optimization tools, not required to schedule a
                      post, so they stay collapsed until asked for. */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setAiInsightsOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      <svg
                        className={`h-3 w-3 transition-transform ${aiInsightsOpen ? "rotate-90" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{isEn ? "✨ AI insights (hook score & brand voice)" : "✨ AI içgörüleri (kanca puanı & marka sesi)"}</span>
                      {(hookAnalysis || voiceConsistency) && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                    </button>

                    {aiInsightsOpen && (
                      <div className="mt-3 space-y-3">
                        {/* AI Hook & Virality Score Optimizer */}
                        <div className="rounded-xl border border-blue-100/80 bg-blue-50/30 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <span>🪝</span>
                              <span>{isEn ? "AI Hook & Virality Score" : "AI Kanca & Viralite Skoru"}</span>
                            </div>

                            {!hookAnalysis && (
                              <button
                                type="button"
                                onClick={handleAnalyzeHook}
                                disabled={analyzingHook}
                                className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 shadow-2xs hover:bg-blue-50 transition disabled:opacity-50 cursor-pointer"
                              >
                                {analyzingHook
                                  ? isEn
                                    ? "Scoring…"
                                    : "Puanlanıyor…"
                                  : isEn
                                    ? "✨ Score Hook Strength"
                                    : "✨ Kanca Gücünü Puanla"}
                              </button>
                            )}
                          </div>

                          {analyzingHook && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium py-1">
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                              <span>
                                {isEn
                                  ? "Analyzing copy against algorithm hooks…"
                                  : "Metin algoritma kancalarına göre analiz ediliyor…"}
                              </span>
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
                                  <span>{isEn ? "Score:" : "Puan:"}</span>
                                  <span className={hookAnalysis.score >= 80 ? "text-emerald-600" : "text-amber-600"}>
                                    {hookAnalysis.score}/100
                                  </span>
                                </span>

                                <button
                                  type="button"
                                  onClick={handleAnalyzeHook}
                                  disabled={analyzingHook}
                                  className="text-[10px] font-semibold text-blue-600 hover:underline"
                                >
                                  {isEn ? "Score Again" : "Tekrar Puanla"}
                                </button>
                              </div>

                              <p className="text-[11px] text-slate-600 italic">
                                &ldquo;{hookAnalysis.critique}&rdquo;
                              </p>

                              {hookAnalysis.alternativeHooks.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    {isEn
                                      ? "Alternative Opening Hooks (Apply with One Click):"
                                      : "Alternatif Açılış Kancaları (Tek Tıkla Uygula):"}
                                  </span>
                                  <div className="flex flex-col gap-1">
                                    {[...hookAnalysis.alternativeHooks]
                                      .sort((a, b) => b.stopScore - a.stopScore)
                                      .map((altHook, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => applyHook(altHook.text)}
                                          title={isEn ? "Make this hook the first sentence" : "Bu kancayı ilk cümle yap"}
                                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 text-left text-xs font-medium text-slate-800 hover:border-blue-200 hover:bg-blue-50/50 transition group cursor-pointer"
                                        >
                                          <span className="truncate">💡 &ldquo;{altHook.text}&rdquo;</span>
                                          <span className="shrink-0 flex items-center gap-1.5">
                                            <span
                                              className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                                altHook.stopScore >= 80
                                                  ? "bg-emerald-50 text-emerald-700"
                                                  : "bg-amber-50 text-amber-700"
                                              }`}
                                            >
                                              %{altHook.stopScore}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100">
                                              {isEn ? "Use →" : "Kullan →"}
                                            </span>
                                          </span>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => applyOptimizedCaption(hookAnalysis.optimizedCaption)}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                              >
                                <span>{isEn ? "✓ Replace Entire Caption with Optimized Version" : "✓ Tüm Metni Optimize Edilmiş Haliyle Değiştir"}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Brand Voice Consistency */}
                        <div className="rounded-xl border border-indigo-100/80 bg-indigo-50/30 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <span>🎯</span>
                              <span>{isEn ? "Brand Voice Consistency" : "Marka Sesi Tutarlılığı"}</span>
                            </div>
                            {!voiceConsistency && (
                              <button
                                type="button"
                                onClick={handleCheckVoiceConsistency}
                                disabled={analyzingVoice}
                                className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs hover:bg-indigo-50 transition disabled:opacity-50 cursor-pointer"
                              >
                                {analyzingVoice
                                  ? isEn
                                    ? "Measuring…"
                                    : "Ölçülüyor…"
                                  : isEn
                                    ? "✨ Check Brand Voice"
                                    : "✨ Marka Sesini Ölç"}
                              </button>
                            )}
                          </div>

                          {analyzingVoice && (
                            <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium py-1">
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                              <span>
                                {isEn
                                  ? "Comparing against your published post history…"
                                  : "Geçmiş yayınlarınızla karşılaştırılıyor…"}
                              </span>
                            </div>
                          )}

                          {voiceCheckedEmpty && !analyzingVoice && (
                            <p className="text-[11px] text-slate-500">
                              {isEn
                                ? "Not enough published history yet (at least 5 real posts required) — this feature will automatically activate as your brand publishes content."
                                : "Henüz yeterli yayınlanmış geçmiş yok (en az 5 gerçek gönderi gerekiyor) — bu özellik markanız gerçek içerik yayınladıkça kendiliğinden aktif olacak."}
                            </p>
                          )}

                          {voiceConsistency && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold border border-slate-200 text-slate-900 shadow-2xs">
                                <span>{isEn ? "Alignment:" : "Uyum:"}</span>
                                <span className={voiceConsistency.score >= 70 ? "text-emerald-600" : "text-amber-600"}>
                                  {voiceConsistency.score}/100
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isEn
                                  ? `compared with ${voiceConsistency.sampleSize} published posts`
                                  : `${voiceConsistency.sampleSize} yayınlanmış gönderiyle karşılaştırıldı`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scheduling Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="compose_scheduled_at" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {isEn ? "Publish Date & Time" : "Yayın Tarihi & Saati"}
                      </label>
                      <span className="text-[11px] text-slate-400">{brand.timezone}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        id="compose_scheduled_at"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
                      />

                      <div ref={scheduleMenuRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setScheduleMenuOpen((prev) => !prev)}
                          aria-label={isEn ? "Scheduling shortcuts" : "Zamanlama kısayolları"}
                          aria-expanded={scheduleMenuOpen}
                          className="flex h-full items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <svg className={`h-3 w-3 transition-transform ${scheduleMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {scheduleMenuOpen && (
                          <div className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                            <span className="block px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {isEn ? "Scheduling" : "Zamanlama"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setScheduledAt(defaultScheduleValue());
                                setScheduleMenuOpen(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              <span>⚡</span>
                              <span>{isEn ? "Best time (tomorrow, 19:30)" : "En iyi zaman (yarın, 19:30)"}</span>
                            </button>
                            <Link
                              href="/settings?tab=genel"
                              onClick={() => setScheduleMenuOpen(false)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18" />
                              </svg>
                              <span>
                                {isEn ? "Change workspace time zone" : "Çalışma alanı saat dilimini değiştir"}
                                <span className="block text-[10px] font-normal text-slate-400">{brand.timezone}</span>
                              </span>
                            </Link>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewOpen((prev) => !prev)}
                        aria-label={isEn ? "Toggle preview" : "Önizlemeyi aç/kapat"}
                        aria-expanded={previewOpen}
                        className={`flex h-full items-center justify-center rounded-xl border px-2.5 transition cursor-pointer ${
                          previewOpen
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>

                    {previewOpen && (
                      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {isEn ? "Preview" : "Önizleme"}
                          </span>
                          {previewablePlatforms.length > 0 && (
                            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                              {previewablePlatforms.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setPreviewPlatform(p)}
                                  className={`flex h-6 w-6 items-center justify-center rounded-md transition cursor-pointer ${
                                    previewPlatform === p ? "bg-slate-900 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
                                  }`}
                                  title={platformLabel(p)}
                                >
                                  <PlatformIcon name={p} className="h-3 w-3" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mx-auto max-w-[220px]">
                          <ComposePreviewCard
                            platform={previewPlatform}
                            brandName={brand.name}
                            caption={currentPreviewText}
                            media={previewMedia}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* First-comment hashtags */}
                  {selectedPlatforms.some((p) => p === "instagram" || p === "facebook") && (
                    <label className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hashtagsAsFirstComment}
                        onChange={(e) => setHashtagsAsFirstComment(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {isEn ? "🏷️ Post hashtags as first comment" : "🏷️ Hashtag'leri ilk yoruma at"}
                        <span className="ml-1 text-slate-400 font-normal">
                          {isEn ? "(Instagram/Facebook only)" : "(yalnızca Instagram/Facebook)"}
                        </span>
                      </span>
                    </label>
                  )}

                  {/* Action — one primary button plus a dropdown for the
                      two secondary paths (save as draft, skip-review
                      publish), instead of three stacked full-width buttons
                      and a helper paragraph. */}
                  <div ref={submitMenuRef} className="relative flex pt-2">
                    <button
                      type="button"
                      disabled={!scheduledAt || submitting}
                      onClick={() => submit("NEEDS_REVIEW")}
                      className="flex-1 rounded-l-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting
                        ? isEn
                          ? "Saving..."
                          : "Kaydediliyor..."
                        : isEn
                          ? "Schedule & Send for Review 🚀"
                          : "Zamanla & Onaya Gönder 🚀"}
                    </button>
                    <button
                      type="button"
                      disabled={!scheduledAt || submitting}
                      onClick={() => setSubmitMenuOpen((prev) => !prev)}
                      aria-label={isEn ? "More publish options" : "Diğer yayın seçenekleri"}
                      aria-expanded={submitMenuOpen}
                      className="rounded-r-xl border-l border-white/25 bg-blue-600 px-3 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {submitMenuOpen && (
                      <div className="absolute right-0 top-full z-20 mt-1.5 w-72 space-y-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                        <button
                          type="button"
                          disabled={!scheduledAt || submitting}
                          onClick={() => {
                            setSubmitMenuOpen(false);
                            submit("DRAFT");
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                        >
                          {isEn ? "Save as Draft" : "Taslak Olarak Kaydet"}
                        </button>
                        <button
                          type="button"
                          disabled={!scheduledAt || submitting}
                          onClick={() => {
                            setSubmitMenuOpen(false);
                            if (
                              !confirm(
                                isEn
                                  ? "This post will be published to your real accounts in about 1 minute without going through review. Are you sure?"
                                  : "Bu gönderi incelemeden geçmeden, yaklaşık 1 dakika içinde gerçek hesaplarınızda yayınlanacak. Emin misiniz?"
                              )
                            )
                              return;
                            submit("APPROVED", new Date().toISOString());
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-amber-800 hover:bg-amber-50 transition disabled:opacity-50 cursor-pointer"
                        >
                          {isEn ? "⚡ Publish Now (Skip Review)" : "⚡ Şimdi Yayınla (İncelemeyi Atla)"}
                          <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                            {isEn ? "Ignores the scheduled date — live in ~1 minute." : "Seçili tarihi yok sayar — ~1 dakikada yayında."}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                      {submitError}
                    </p>
                  )}
                </div>
              )}
        </div>
      )}

      {libraryOpen && (
        <MediaLibraryModal
          brandId={brand.id}
          multiple
          maxSelectable={MAX_MEDIA_ITEMS - mediaItems.length}
          onClose={() => setLibraryOpen(false)}
          onSelectMultiple={(selected) => {
            setMediaItems((prev) => [...prev, ...selected.map((media) => ({ kind: "existing" as const, media }))]);
            setLibraryOpen(false);
          }}
        />
      )}

      {productPickerOpen && (
        <WooCommerceProductPicker
          onSelect={handleSelectProduct}
          onClose={() => setProductPickerOpen(false)}
        />
      )}

      <TemplatePickerModal
        isOpen={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        templates={templates}
        onApply={applyTemplate}
        onDelete={handleDeleteTemplate}
      />

      {saveTemplateOpen && (
        <SaveTemplateModal
          onCancel={() => setSaveTemplateOpen(false)}
          onSave={handleSaveTemplateConfirm}
          bodyPreview={drafts?.[activePlatformTab] ?? ""}
          saving={savingTemplate}
        />
      )}
    </div>
  );
}

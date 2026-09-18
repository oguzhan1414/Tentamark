"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { getBrandTeam } from "@/lib/brandTeam";
import { createClient } from "@/lib/supabase/client";
import {
  generateDrafts,
  type ContentFormat,
  type GeneratedDrafts,
  type LaunchPlatform,
} from "@/lib/ai/generateDrafts";
import { suggestPostIdea } from "@/lib/ai/suggestPostIdea";
import {
  analyzePostHookAndVirality,
  type HookAnalysisResult,
} from "@/lib/ai/analyzePostHookAndVirality";
import {
  getBrandVoiceConsistency,
  type BrandVoiceConsistency,
} from "@/lib/ai/getBrandVoiceConsistency";
import { suggestPostImprovement } from "@/lib/ai/suggestPostImprovement";
import { ALL_PLATFORMS } from "@/lib/ai/platforms";
import { type PlatformName } from "@/components/PlatformIcon";
import MediaLibraryModal, {
  type MediaLibraryItem,
} from "@/components/dashboard/MediaLibraryModal";
import { PLATFORM_IMAGE_RATIO } from "@/lib/media/platformAspectRatio";
import { createCroppedMediaVariant } from "@/lib/media/createCroppedMediaVariant";
import { useWooCommerceConnection } from "@/lib/woocommerce/useWooCommerceConnection";
import { stripHtml, type WooCommerceProduct } from "@/lib/woocommerce/client";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";
import { useCanvaDesignFlow } from "@/lib/canva/useCanvaDesignFlow";
import WooCommerceProductPicker from "@/components/dashboard/WooCommerceProductPicker";
import TemplatePickerModal, {
  type ContentTemplate,
} from "@/components/dashboard/TemplatePickerModal";
import SaveTemplateModal from "@/components/dashboard/SaveTemplateModal";
import type { TemplateCategoryId } from "@/lib/content/templateCategories";
import { useLanguage } from "@/context/LanguageContext";
import { useComposeAutosave } from "@/lib/hooks/useComposeAutosave";
import {
  generateCaptionLab,
  type CaptionLabResult,
} from "@/lib/ai/generateCaptionLab";

// Subcomponents
import ComposePlatformSelector from "./compose/ComposePlatformSelector";
import ComposeIdeaSection from "./compose/ComposeIdeaSection";
import ComposeEditorTabs from "./compose/ComposeEditorTabs";
import ComposeMediaSection, {
  type ComposeMediaItem,
} from "./compose/ComposeMediaSection";
import ComposePublishBar from "./compose/ComposePublishBar";
import CaptionLabModal from "./compose/CaptionLabModal";
import ContentMultiplierModal from "./compose/ContentMultiplierModal";

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
  d.setHours(19, 30, 0, 0);
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

const MAX_MEDIA_ITEMS = 10;

function mediaItemPreviewUrl(item: ComposeMediaItem): string {
  if (item.kind === "existing") return item.media.file_url;
  if (item.kind === "generated") return item.dataUrl;
  return item.previewUrl;
}

function mediaItemIsVideo(item: ComposeMediaItem): boolean {
  if (item.kind === "existing") return item.media.file_type.startsWith("video/");
  if (item.kind === "upload") return item.file.type.startsWith("video/");
  return false;
}

export default function ComposeForm({
  onSubmitted,
  onNavigate,
  onDirtyChange,
  initialCampaignId,
  initialDate,
  initialHour,
  initialIdea,
  initialMedia,
}: {
  onSubmitted?: () => void;
  onNavigate?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  initialCampaignId?: string;
  initialDate?: string;
  initialHour?: number;
  initialIdea?: string;
  initialMedia?: MediaLibraryItem[];
} = {}) {
  const brand = useBrand();
  const { t, isEn } = useLanguage();
  const ideaChips = t.dashboard.compose.ideaChips;
  const toneOptions = t.dashboard.compose.toneOptions;
  const supabase = useMemo(() => createClient(), []);
  const { connected: woocommerceConnected } = useWooCommerceConnection(brand.id);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const { connected: canvaConnected } = useCanvaConnection(brand.id);

  // Autosave hook
  const { hasSavedDraft, saveDraft, getDraft, clearDraft } = useComposeAutosave(brand.id);

  const [mode, setMode] = useState<Mode>(initialIdea ? "ai" : "manual");
  const [founderName, setFounderName] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<"brand" | "founder">("brand");
  const [hashtagsAsFirstComment, setHashtagsAsFirstComment] = useState(false);
  const [format, setFormat] = useState<ContentFormat>("post");
  const [selectedPlatforms, setSelectedPlatforms] = useState<LaunchPlatform[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<LaunchPlatform[] | null>(null);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [templatesRefreshKey, setTemplatesRefreshKey] = useState(0);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [campaignId, setCampaignId] = useState<string>(initialCampaignId ?? "");
  const [selectedTone, setSelectedTone] = useState<string>("natural");
  const [tags, setTags] = useState<string[]>([]);
  const [draftAssigneeId, setDraftAssigneeId] = useState("");
  const [draftAssignees, setDraftAssignees] = useState<{ id: string; name: string }[]>([]);
  const [canAssignDraft, setCanAssignDraft] = useState(false);

  const [metadataPanel, setMetadataPanel] = useState<"campaign" | "labels" | "more" | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitMenuOpen, setSubmitMenuOpen] = useState(false);
  const [scheduleMenuOpen, setScheduleMenuOpen] = useState(false);

  const [idea, setIdea] = useState(initialIdea ?? "");
  const [suggestedIdea, setSuggestedIdea] = useState<string | null>(null);
  const [suggestingIdea, setSuggestingIdea] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [ideaExamplesOpen, setIdeaExamplesOpen] = useState(false);
  const [visualPromptOpen, setVisualPromptOpen] = useState(false);
  const [hook, setHook] = useState("");
  const [visualPrompt, setVisualPrompt] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      const [year, month, day] = initialDate.split("-").map(Number);
      const hour =
        initialHour !== undefined && Number.isInteger(initialHour) && initialHour >= 0 && initialHour <= 23
          ? initialHour
          : 19;
      const minute =
        initialHour !== undefined && Number.isInteger(initialHour) && initialHour >= 0 && initialHour <= 23
          ? 0
          : 30;
      const d = new Date(year, month - 1, day, hour, minute);
      if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
        return toDatetimeLocalValue(d);
      }
    }
    return defaultScheduleValue();
  });
  const [state, setState] = useState<GenState>("idle");
  const [drafts, setDrafts] = useState<GeneratedDrafts | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<LaunchPlatform>("instagram");

  const [mediaItems, setMediaItems] = useState<ComposeMediaItem[]>(
    (initialMedia ?? []).map((media) => ({ kind: "existing" as const, media }))
  );
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [tiktokVideoFile, setTiktokVideoFile] = useState<File | null>(null);

  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<Record<string, string[]>>({});
  const [previewPlatform, setPreviewPlatform] = useState<PlatformName>("instagram");

  const [hookAnalysis, setHookAnalysis] = useState<HookAnalysisResult | null>(null);
  const [analyzingHook, setAnalyzingHook] = useState(false);
  const [hookError, setHookError] = useState<string | null>(null);

  const [voiceConsistency, setVoiceConsistency] = useState<BrandVoiceConsistency | null>(null);
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [voiceCheckedEmpty, setVoiceCheckedEmpty] = useState(false);

  // Caption Lab State
  const [captionLabOpen, setCaptionLabOpen] = useState(false);
  const [captionLabResult, setCaptionLabResult] = useState<CaptionLabResult | null>(null);
  const [captionLabLoading, setCaptionLabLoading] = useState(false);
  const [captionLabError, setCaptionLabError] = useState<string | null>(null);

  // Content Multiplier (1 -> 7) State
  const [multiplierOpen, setMultiplierOpen] = useState(false);

  async function handleOpenCaptionLab() {
    const currentText = drafts?.[activePlatformTab] || idea;
    if (!currentText?.trim()) return;
    setCaptionLabOpen(true);
    setCaptionLabLoading(true);
    setCaptionLabError(null);
    try {
      const res = await generateCaptionLab(brand.id, currentText, activePlatformTab, format);
      setCaptionLabResult(res);
    } catch (err) {
      setCaptionLabError(
        err instanceof Error
          ? err.message
          : isEn
          ? "Could not generate variants."
          : "Varyantlar üretilemedi."
      );
    } finally {
      setCaptionLabLoading(false);
    }
  }

  // Auto-save triggers
  useEffect(() => {
    if (state === "submitted") return;
    saveDraft({
      idea,
      selectedPlatforms,
      format,
      tone: selectedTone,
      drafts,
      activePlatformTab,
      draftAssigneeId,
    });
  }, [idea, selectedPlatforms, format, selectedTone, drafts, activePlatformTab, draftAssigneeId, state, saveDraft]);

  function handleRestoreDraft() {
    const saved = getDraft();
    if (!saved) return;
    if (saved.idea) setIdea(saved.idea);
    if (saved.selectedPlatforms?.length) setSelectedPlatforms(saved.selectedPlatforms);
    if (saved.format) setFormat(saved.format);
    if (saved.tone) setSelectedTone(saved.tone);
    if (saved.draftAssigneeId) setDraftAssigneeId(saved.draftAssigneeId);
    if (saved.drafts) {
      setDrafts(saved.drafts);
      setState("ready");
    }
    if (saved.activePlatformTab) setActivePlatformTab(saved.activePlatformTab);
  }

  // Canva Design Flow
  const { busy: canvaBusy, error: canvaError, start: startCanvaDesign } = useCanvaDesignFlow(
    (exportedMedia) => {
      setMediaItems((prev) =>
        prev.length >= MAX_MEDIA_ITEMS
          ? prev
          : [
              ...prev,
              {
                kind: "existing",
                media: exportedMedia,
              },
            ]
      );
    }
  );

  const requiresVideo = selectedPlatforms.includes("tiktok") || selectedPlatforms.includes("youtube");

  const tiktokVideoPreviewUrl = useMemo(() => {
    if (!tiktokVideoFile) return null;
    return URL.createObjectURL(tiktokVideoFile);
  }, [tiktokVideoFile]);

  useEffect(() => {
    return () => {
      if (tiktokVideoPreviewUrl) {
        URL.revokeObjectURL(tiktokVideoPreviewUrl);
      }
    };
  }, [tiktokVideoPreviewUrl]);

  const mediaPreview = requiresVideo
    ? tiktokVideoPreviewUrl
    : mediaItems[0]
    ? mediaItemPreviewUrl(mediaItems[0])
    : null;
  const mediaPreviewIsVideo = requiresVideo && Boolean(tiktokVideoFile);

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

  const hasUnsavedChanges =
    state !== "submitted" && Boolean(idea.trim() || drafts || mediaItems.length > 0 || tiktokVideoFile);

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  // Load campaigns, templates, founder name, connected accounts
  useEffect(() => {
    let ignore = false;
    (async () => {
      const [{ data: auth }, members] = await Promise.all([
        supabase.auth.getUser(), getBrandTeam(supabase, brand.id),
      ]);
      if (ignore) return;
      setCanAssignDraft(Boolean(members.some((member) => member.userId === auth.user?.id && ["owner", "admin"].includes(member.role))));
      setDraftAssignees(members.map((member) => ({ id: member.userId, name: member.name })));
    })();
    return () => { ignore = true; };
  }, [supabase, brand.id]);

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

      const droppedOnlyPhotos =
        initialMedia !== undefined &&
        initialMedia.length > 0 &&
        initialMedia.every((m) => !m.file_type.startsWith("video/"));
      const defaultPlatforms = droppedOnlyPhotos ? connected.filter((p) => p !== "tiktok") : connected;
      setSelectedPlatforms(defaultPlatforms);

      if (connected.length > 0) {
        setActivePlatformTab((current) => (connected.includes(current) ? current : connected[0]));
        setPreviewPlatform((current) => (connected.includes(current as LaunchPlatform) ? current : connected[0]));
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, initialMedia]);

  useEffect(() => {
    if (!aiPanelOpen || suggestionDismissed || suggestedIdea) return;
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
  }, [brand.id, aiPanelOpen, suggestionDismissed, suggestedIdea]);

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

  function addTag(t: string) {
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
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

  async function handleGenerateHashtags() {
    const currentText = drafts?.[activePlatformTab];
    if (!currentText?.trim() || generatingHashtags) return;
    setGeneratingHashtags(true);
    setGenError(null);
    try {
      const result = await suggestPostImprovement(brand.id, currentText, activePlatformTab);
      const normalized = Array.from(
        new Set(
          result.hashtags
            .map((tag) => tag.trim().replace(/^#+/, "").replace(/\s+/g, ""))
            .filter((tag) => /^[\p{L}\p{N}_]{2,40}$/u.test(tag))
            .map((tag) => `#${tag}`)
        )
      ).slice(0, 5);
      setHashtagSuggestions((prev) => ({ ...prev, [activePlatformTab]: normalized }));
    } catch (err) {
      setGenError(err instanceof Error ? err.message : (isEn ? "Could not generate hashtags." : "Hashtag üretilemedi."));
    } finally {
      setGeneratingHashtags(false);
    }
  }

  function toggleCaptionHashtag(tag: string) {
    setDrafts((prev) => {
      if (!prev) return prev;
      const caption = prev[activePlatformTab] ?? "";
      const existing = extractHashtags(caption).some((value) => value.toLocaleLowerCase() === tag.toLocaleLowerCase());
      if (!existing) return { ...prev, [activePlatformTab]: `${caption.trimEnd()}${caption.trim() ? "\n\n" : ""}${tag}` };
      const withoutTag = caption.replace(new RegExp(`(^|\\s)${tag}(?![\\p{L}\\p{N}_])`, "giu"), "$1").trimEnd();
      return { ...prev, [activePlatformTab]: withoutTag };
    });
  }

  function applyHook(newHook: string) {
    if (!drafts) return;
    const currentText = drafts[activePlatformTab] ?? "";
    const newlineIdx = currentText.indexOf("\n");

    if (newlineIdx === -1) {
      const match = currentText.match(/^([^.!?]+[.!?]?)([\s\S]*)$/);
      if (match) {
        setDrafts({ ...drafts, [activePlatformTab]: `${newHook}${match[2]}` });
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
      if (!next.includes(previewPlatform as LaunchPlatform) && next.length > 0) {
        setPreviewPlatform(next[0]);
      }
      return next;
    });
  }

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
      const enhancedPrompt = `${idea}\n(${isEn ? "Brand Tone" : "Marka Tonu"}: ${toneObj?.label || (isEn ? "Natural" : "Doğal")}, ${
        isEn ? "Goal: High Engagement and strong 2-second hook" : "Hedef: Yüksek Etkileşim ve 2 saniyelik güçlü kanca"
      })`;

      const visionMediaUrl = await resolveMediaForVision();
      const result = await generateDrafts(brand.id, enhancedPrompt, selectedPlatforms, format, visionMediaUrl, voiceMode);
      setDrafts(result);

      const firstText = Object.values(result)[0] || "";
      const lines = firstText.split("\n").map((l) => l.trim()).filter(Boolean);
      setHook(lines[0] || idea.slice(0, 70));
      setVisualPrompt(idea);

      setState("ready");
      setAiPanelOpen(false);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : isEn ? "Draft could not be generated." : "Taslak üretilemedi.");
      setState("idle");
    }
  }

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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || (isEn ? "Image could not be generated." : "Görsel üretilemedi."));
      }

      const data = await res.json();
      if (!data.imageUrl) throw new Error(isEn ? "Görsel URL'si alınamadı." : "Image URL not received.");

      setMediaItems((prev) =>
        prev.length >= MAX_MEDIA_ITEMS ? prev : [...prev, { kind: "generated", dataUrl: data.imageUrl }]
      );
    } catch (err) {
      setImageError(err instanceof Error ? err.message : isEn ? "Visual generation failed." : "Görsel üretimi başarısız oldu.");
    } finally {
      setGeneratingImage(false);
    }
  }

  function prepareManualDrafts() {
    if (selectedPlatforms.length === 0) return;
    const initialDrafts: GeneratedDrafts = {};
    for (const p of selectedPlatforms) initialDrafts[p] = idea || "";
    setDrafts(initialDrafts);
    setState("ready");
    if (!selectedPlatforms.includes(activePlatformTab)) setActivePlatformTab(selectedPlatforms[0]);
    if (!selectedPlatforms.includes(previewPlatform as LaunchPlatform)) setPreviewPlatform(selectedPlatforms[0]);
  }

  function applyTemplate(template: ContentTemplate) {
    if (selectedPlatforms.length === 0) return;
    const next: GeneratedDrafts = {};
    for (const p of selectedPlatforms) next[p] = template.body;
    setDrafts(next);
    setIdea(template.body);
    setState("ready");
    setTemplatePickerOpen(false);
  }

  async function handleSaveTemplateConfirm(name: string, category: TemplateCategoryId) {
    const currentText = drafts?.[activePlatformTab];
    if (!currentText?.trim()) return;
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
    if (!drafts || (targetStatus !== "DRAFT" && !scheduledAt)) return;
    if (targetStatus !== "DRAFT" && requiresVideo && !tiktokVideoFile?.type.startsWith("video/")) {
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
              console.warn(`En-boy oranı uyarlanamadı (${ratio}):`, err);
            }
          }
        }
      }

      const primaryPlatform = selectedPlatforms[0];
      const primaryCaption = drafts[primaryPlatform] || "";
      const scheduledIso = scheduledOverrideIso || (scheduledAt ? new Date(scheduledAt).toISOString() : null);

      const { data: contentRow, error: contentError } = await supabase
        .from("content")
        .insert({
          brand_id: brand.id,
          campaign_id: campaignId || null,
          title: hook || idea.slice(0, 60) || "Yeni Gönderi",
          core_idea: idea.trim() || primaryCaption,
          format,
          status: targetStatus,
          created_by: user?.id,
          draft_assignee_id: targetStatus === "DRAFT" && canAssignDraft ? draftAssigneeId || null : null,
          tags,
        })
        .select("id")
        .single();

      if (contentError || !contentRow) throw new Error(contentError?.message ?? (isEn ? "Content could not be created." : "İçerik kaydı oluşturulamadı."));

      if (mediaIds.length > 0) {
        const contentMediaRows = mediaIds.map((mediaId, position) => ({
          content_id: contentRow.id,
          media_id: mediaId,
          position,
        }));
        const { error: cmError } = await supabase.from("content_media").insert(contentMediaRows);
        if (cmError) console.warn("content_media eklenemedi:", cmError.message);
      }

      const platformRows = selectedPlatforms.map((platform) => {
        const platformCaption = drafts[platform] || primaryCaption;
        // The scheduler claims PENDING variants only after the parent is approved.
        const platformStatus = "PENDING";
        const overriddenMediaId = mediaOverrideByPlatform[platform as PlatformName];
        return {
          content_id: contentRow.id,
          platform,
          caption: platformCaption,
          status: platformStatus,
          scheduled_at: scheduledIso,
          hashtags: extractHashtags(platformCaption),
          hashtags_as_first_comment: hashtagsAsFirstComment && (platform === "instagram" || platform === "facebook"),
          media_override_id: overriddenMediaId || null,
        };
      });

      const { error: platformError } = await supabase.from("content_platforms").insert(platformRows);
      if (platformError) throw new Error(platformError.message);

      // Clear draft on successful submit
      clearDraft();

      setState("submitted");
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : (isEn ? "An unexpected error occurred." : "Beklenmeyen bir hata oluştu."));
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setIdea("");
    setDrafts(null);
    setHook("");
    setVisualPrompt("");
    setMediaItems([]);
    setTiktokVideoFile(null);
    setScheduledAt(defaultScheduleValue());
    setState("idle");
    setSubmitError(null);
    setGenError(null);
    setImageError(null);
    setTags([]);
    setDraftAssigneeId("");
    setHookAnalysis(null);
    setVoiceConsistency(null);
    clearDraft();
  }

  const previewablePlatforms = useMemo<PlatformName[]>(() => {
    if (selectedPlatforms.length > 0) return selectedPlatforms as PlatformName[];
    return (connectedPlatforms ?? []) as PlatformName[];
  }, [selectedPlatforms, connectedPlatforms]);

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

  const previewMedia = useMemo<{ url: string; isVideo: boolean }[]>(() => {
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
        <div className="space-y-4 bg-white px-4 pb-5 pt-5 sm:px-5">
          {/* Draft Autosave Restore Alert */}
          {hasSavedDraft && !drafts && !idea.trim() && (
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <span>💾</span>
                <span>
                  {isEn
                    ? "You have an unsaved draft from a previous session."
                    : "Önceki oturumdan kaydedilmiş bir taslağınız var."}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                >
                  {isEn ? "Restore" : "Geri Yükle"}
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-amber-700 hover:text-amber-900 cursor-pointer text-[11px]"
                >
                  ✕ {isEn ? "Dismiss" : "Sil"}
                </button>
              </div>
            </div>
          )}

          {/* Platform Selector & Format & Metadata Badges */}
          <ComposePlatformSelector
            connectedPlatforms={connectedPlatforms}
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={togglePlatform}
            format={format}
            onChangeFormat={setFormat}
            campaignId={campaignId}
            campaigns={campaigns}
            onChangeCampaign={setCampaignId}
            tags={tags}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            selectedTone={selectedTone}
            onChangeTone={setSelectedTone}
            toneOptions={toneOptions}
            mode={mode}
            metadataPanel={metadataPanel}
            setMetadataPanel={setMetadataPanel}
            onOpenTemplatePicker={() => setTemplatePickerOpen(true)}
            isEn={isEn}
          />

          {/* Idea & AI Idea Generator Section */}
          {!drafts && (
            <ComposeIdeaSection
              mode={mode}
              setMode={setMode}
              aiPanelOpen={aiPanelOpen}
              setAiPanelOpen={setAiPanelOpen}
              prepareManualDrafts={prepareManualDrafts}
              selectedPlatforms={selectedPlatforms}
              idea={idea}
              setIdea={setIdea}
              founderName={founderName}
              brandName={brand.name}
              voiceMode={voiceMode}
              setVoiceMode={setVoiceMode}
              toneOptions={toneOptions}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              suggestionDismissed={suggestionDismissed}
              setSuggestionDismissed={setSuggestionDismissed}
              suggestionOpen={suggestionOpen}
              setSuggestionOpen={setSuggestionOpen}
              suggestingIdea={suggestingIdea}
              suggestedIdea={suggestedIdea}
              retryIdeaSuggestion={retryIdeaSuggestion}
              useSuggestedIdea={useSuggestedIdea}
              ideaExamplesOpen={ideaExamplesOpen}
              setIdeaExamplesOpen={setIdeaExamplesOpen}
              ideaChips={ideaChips}
              woocommerceConnected={woocommerceConnected}
              onOpenProductPicker={() => setProductPickerOpen(true)}
              onGenerate={generate}
              generating={state === "generating"}
              genError={genError}
              onOpenMultiplier={() => setMultiplierOpen(true)}
              isEn={isEn}
            />
          )}

          {/* Media Attachments Section */}
          <ComposeMediaSection
            mediaItems={mediaItems}
            removeMediaItem={removeMediaItem}
            moveMediaItem={moveMediaItem}
            mediaItemIsVideo={mediaItemIsVideo}
            mediaItemPreviewUrl={mediaItemPreviewUrl}
            requiresVideo={requiresVideo}
            mediaPreview={mediaPreview}
            mediaPreviewIsVideo={mediaPreviewIsVideo}
            visualPromptOpen={visualPromptOpen}
            setVisualPromptOpen={setVisualPromptOpen}
            visualPrompt={visualPrompt}
            setVisualPrompt={setVisualPrompt}
            imageError={imageError}
            canvaError={canvaError}
            selectedPlatforms={selectedPlatforms}
            tiktokVideoFile={tiktokVideoFile}
            onTiktokVideoChange={setTiktokVideoFile}
            onAddUploadFiles={(files) => {
              const remaining = MAX_MEDIA_ITEMS - mediaItems.length;
              const toAdd = files.slice(0, remaining).map((file) => ({
                kind: "upload" as const,
                file,
                previewUrl: URL.createObjectURL(file),
              }));
              setMediaItems((prev) => [...prev, ...toAdd]);
            }}
            onOpenLibrary={() => setLibraryOpen(true)}
            canvaConnected={canvaConnected}
            canvaBusy={canvaBusy}
            onStartCanvaDesign={startCanvaDesign}
            generatingImage={generatingImage}
            onTriggerImageGeneration={triggerImageGeneration}
            conceptAvailable={Boolean(visualPrompt.trim() || hook.trim() || idea.trim())}
            maxMediaItems={MAX_MEDIA_ITEMS}
            isEn={isEn}
          />

          {/* Initial Schedule before drafts are generated */}
          {!drafts && (
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <label htmlFor="compose_initial_schedule" className="shrink-0 text-[11px] font-semibold text-slate-500">
                {isEn ? "Schedule" : "Yayın zamanı"}
              </label>
              <input
                id="compose_initial_schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-400 focus:outline-none"
              />
              <span className="hidden text-[10px] text-slate-400 sm:inline">{brand.timezone}</span>
            </div>
          )}

          {/* Drafts Editor with Platform Tabs, Hooks, and AI Insights */}
          {drafts && (
            <ComposeEditorTabs
              brandId={brand.id}
              drafts={drafts}
              setDrafts={setDrafts}
              activePlatformTab={activePlatformTab}
              setActivePlatformTab={setActivePlatformTab}
              setPreviewPlatform={setPreviewPlatform}
              selectedPlatforms={selectedPlatforms}
              hook={hook}
              setHook={setHook}
              charLimit={CHAR_LIMIT}
              onOpenSaveTemplate={() => setSaveTemplateOpen(true)}
              handleRewriteWithAI={handleRewriteWithAI}
              rewriting={rewriting}
              handleGenerateHashtags={handleGenerateHashtags}
              generatingHashtags={generatingHashtags}
              hashtagSuggestions={hashtagSuggestions}
              toggleCaptionHashtag={toggleCaptionHashtag}
              extractHashtags={extractHashtags}
              aiInsightsOpen={aiInsightsOpen}
              setAiInsightsOpen={setAiInsightsOpen}
              hookAnalysis={hookAnalysis}
              voiceConsistency={voiceConsistency}
              voiceCheckedEmpty={voiceCheckedEmpty}
              analyzingHook={analyzingHook}
              handleAnalyzeHook={handleAnalyzeHook}
              hookError={hookError}
              applyHook={applyHook}
              applyOptimizedCaption={applyOptimizedCaption}
              analyzingVoice={analyzingVoice}
              handleCheckVoiceConsistency={handleCheckVoiceConsistency}
              onOpenCaptionLab={handleOpenCaptionLab}
              onOpenMultiplier={() => setMultiplierOpen(true)}
              isEn={isEn}
            />
          )}

          {/* Publish / Scheduling Bar */}
          {drafts && (
            <>
            {canAssignDraft && (
              <label className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                <span>{isEn ? "Draft task" : "Taslak görevi"}</span>
                <select value={draftAssigneeId} onChange={(event) => setDraftAssigneeId(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700">
                  <option value="">{isEn ? "No assignee" : "Atanmamış"}</option>
                  {draftAssignees.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
                <span className="w-full text-[11px] font-normal text-slate-400">{isEn ? "Assigned when saved as draft." : "Taslak olarak kaydedilince atanır."}</span>
              </label>
            )}
            <ComposePublishBar
              brandId={brand.id}
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
              timezone={brand.timezone}
              scheduleMenuOpen={scheduleMenuOpen}
              setScheduleMenuOpen={setScheduleMenuOpen}
              defaultScheduleValue={defaultScheduleValue}
              previewOpen={previewOpen}
              setPreviewOpen={setPreviewOpen}
              previewablePlatforms={previewablePlatforms}
              previewPlatform={previewPlatform}
              setPreviewPlatform={setPreviewPlatform}
              brandName={brand.name}
              currentPreviewText={currentPreviewText}
              previewMedia={previewMedia}
              selectedPlatforms={selectedPlatforms}
              hashtagsAsFirstComment={hashtagsAsFirstComment}
              setHashtagsAsFirstComment={setHashtagsAsFirstComment}
              submitting={submitting}
              submitMenuOpen={submitMenuOpen}
              setSubmitMenuOpen={setSubmitMenuOpen}
              submit={submit}
              submitError={submitError}
              isEn={isEn}
              canInstantPublish={canAssignDraft}
            />
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {libraryOpen && (
        <MediaLibraryModal
          brandId={brand.id}
          multiple
          maxSelectable={MAX_MEDIA_ITEMS - mediaItems.length}
          onClose={() => setLibraryOpen(false)}
          onSelectMultiple={(selected) => {
            setMediaItems((prev) => [
              ...prev,
              ...selected.map((media) => ({ kind: "existing" as const, media })),
            ]);
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

      <CaptionLabModal
        isOpen={captionLabOpen}
        onClose={() => setCaptionLabOpen(false)}
        platform={activePlatformTab}
        onApplyVariant={(newCaption) => {
          applyOptimizedCaption(newCaption);
        }}
        onApplyHook={(hookText) => {
          applyHook(hookText);
        }}
        result={captionLabResult}
        loading={captionLabLoading}
        error={captionLabError}
        onRegenerate={handleOpenCaptionLab}
        isEn={isEn}
      />

      {multiplierOpen && <ContentMultiplierModal
        isOpen={multiplierOpen}
        onClose={() => setMultiplierOpen(false)}
        brandId={brand.id}
        initialText={drafts?.[activePlatformTab] || hook || idea}
        onApplyAll={(multipliedDrafts, platformsToSelect) => {
          setDrafts((prev) => ({ ...(prev ?? {}), ...multipliedDrafts }));
          setSelectedPlatforms((prev) => Array.from(new Set([...prev, ...platformsToSelect])));
          if (platformsToSelect.length > 0) {
            setActivePlatformTab(platformsToSelect[0]);
            setPreviewPlatform(platformsToSelect[0]);
          }
          if (state !== "ready") {
            setState("ready");
          }
        }}
        onApplySingle={(platform, text) => {
          setDrafts((prev) => ({ ...(prev ?? {}), [platform]: text }));
          if (!selectedPlatforms.includes(platform)) {
            setSelectedPlatforms((prev) => [...prev, platform]);
          }
          setActivePlatformTab(platform);
          setPreviewPlatform(platform);
          if (state !== "ready") {
            setState("ready");
          }
        }}
        isEn={isEn}
      />}
    </div>
  );
}

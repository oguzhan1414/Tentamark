import { resolveAndValidateUrl } from "@/lib/brand/htmlSignals";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import {
  renderHtmlToImage,
  renderHtmlSetToImages,
  type ImageDimensions,
} from "./renderHtmlToImage";
import { CARD_TYPE_SUPPORTED_FORMATS, type CardFormat } from "./cardFormats";

export type { CardFormat };

import { quoteCardDimensions, type QuoteCardProps } from "./quote/types";
import { pickQuoteVariant } from "./quote/registry";
import { comparisonCardDimensions, type ComparisonCardProps } from "./comparison/types";
import { pickComparisonVariant } from "./comparison/registry";
import { carouselCardDimensions, type CarouselCardProps } from "./carousel/types";
import { pickCarouselVariant } from "./carousel/registry";
import { notificationCardDimensions, type NotificationCardProps } from "./notification/types";
import { pickNotificationVariant } from "./notification/registry";
import { socialPostCardDimensions, type SocialPostCardProps } from "./socialpost/types";
import { pickSocialPostVariant } from "./socialpost/registry";
import { trendCardDimensions, type TrendCardProps } from "./trend/types";
import { pickTrendVariant } from "./trend/registry";
import { problemSolutionCardDimensions, type ProblemSolutionCardProps } from "./problemsolution/types";
import { pickProblemSolutionVariant } from "./problemsolution/registry";
import { productCardDimensions, type ProductCardProps } from "./product/types";
import { pickProductVariant } from "./product/registry";
import { statCardDimensions, type StatCardProps } from "./stat/types";
import { pickStatVariant } from "./stat/registry";
import { testimonialCardDimensions, type TestimonialCardProps } from "./testimonial/types";
import { pickTestimonialVariant } from "./testimonial/registry";
import { changelogCardDimensions, type ChangelogCardProps } from "./changelog/types";
import { pickChangelogVariant } from "./changelog/registry";
import { checklistCardDimensions, type ChecklistCardProps } from "./checklist/types";
import { pickChecklistVariant } from "./checklist/registry";
import { eventCardDimensions, type EventCardProps } from "./event/types";
import { pickEventVariant } from "./event/registry";
import { thisOrThatCardDimensions, type ThisOrThatCardProps } from "./thisorthat/types";
import { pickThisOrThatVariant } from "./thisorthat/registry";
import { matrixCardDimensions, type MatrixCardProps } from "./matrix/types";
import { pickMatrixVariant } from "./matrix/registry";
import { chatCardDimensions, type ChatCardProps } from "./chat/types";
import { pickChatVariant } from "./chat/registry";
import { notesCardDimensions, type NotesCardProps } from "./notes/types";
import { pickNotesVariant } from "./notes/registry";
import { couponCardDimensions, type CouponCardProps } from "./coupon/types";
import { pickCouponVariant } from "./coupon/registry";
import { featureTableCardDimensions, type FeatureTableCardProps } from "./featuretable/types";
import { pickFeatureTableVariant } from "./featuretable/registry";
import { podcastCardDimensions, type PodcastCardProps } from "./podcast/types";
import { pickPodcastVariant } from "./podcast/registry";
import { photoReviewCardDimensions, type PhotoReviewCardProps } from "./photoreview/types";
import { pickPhotoReviewVariant } from "./photoreview/registry";
import { dealCardDimensions, type DealCardProps } from "./deal/types";
import { pickDealVariant } from "./deal/registry";
import { newsFlashCardDimensions, type NewsFlashCardProps } from "./newsflash/types";
import { pickNewsFlashVariant } from "./newsflash/registry";

export type CommonCardFields = {
  brandName: string;
  logoUrl: string | null;
  accentColor?: string;
  format: CardFormat;
};

export type CardTypeEntry = {
  label: string;
  fileNamePrefix: string;
  // Which of the 3 global formats this type actually has layouts/dimensions
  // for — drives both the UI's format picker and the API route's validation.
  supportedFormats: readonly CardFormat[];
  dimensions: (format: CardFormat) => ImageDimensions;
  // Throws a user-facing (Turkish) Error message on invalid input — the API
  // route relays err.message straight to a 400 response.
  parseBody: (body: Record<string, unknown>, common: CommonCardFields) => Promise<unknown>;
  // Builds pure HTML string(s) without spawning a Chromium process (super-fast for live previews).
  // tokens is optional: only the 4 card types wired to BrandDesignTokens so far read it.
  buildHtml: (props: unknown, variantKey?: string, tokens?: BrandDesignTokens) => string[];
  // Parses props for live preview with graceful aesthetic fallbacks if fields are empty.
  parsePreviewProps: (body: Record<string, unknown>, common: CommonCardFields) => unknown | Promise<unknown>;
  // Normalized to always return an array of PNG buffers.
  render: (props: unknown, variantKey?: string, tokens?: BrandDesignTokens) => Promise<Buffer[]>;
};

function requireString(value: unknown, fieldLabel: string, maxLen: number): string {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) throw new Error(`${fieldLabel} boş olamaz.`);
  if (str.length > maxLen) throw new Error(`${fieldLabel} en fazla ${maxLen} karakter olabilir.`);
  return str;
}

function optionalString(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const str = value.trim();
  if (!str) return undefined;
  if (str.length > maxLen) throw new Error(`Metin en fazla ${maxLen} karakter olabilir.`);
  return str;
}

function previewStr(val: unknown, fallback: string): string {
  if (typeof val === "string" && val.trim().length > 0) return val.trim();
  return fallback;
}

// Image fields can now arrive as either a data:image/...;base64,... URI (the
// dashboard's drag-drop upload compresses to this client-side) or a plain
// http/https URL (the "veya URL gir" toggle, or an API caller). Every image
// field across every card type should go through one of these two so a new
// field never accidentally skips the SSRF check that resolveAndValidateUrl
// does for the URL case.
const MAX_IMAGE_DATA_URI_LENGTH = 5_000_000;
const DATA_IMAGE_URI_RE = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+=*$/i;

async function validateImageValue(trimmed: string, fieldLabel: string): Promise<string> {
  if (trimmed.startsWith("data:")) {
    if (!DATA_IMAGE_URI_RE.test(trimmed)) {
      throw new Error(`${fieldLabel} geçerli bir görsel dosyası değil.`);
    }
    if (trimmed.length > MAX_IMAGE_DATA_URI_LENGTH) {
      throw new Error(`${fieldLabel} çok büyük, lütfen daha küçük bir görsel yükleyin.`);
    }
    return trimmed;
  }
  const url = await resolveAndValidateUrl(trimmed);
  return url.toString();
}

async function requireImageValue(value: unknown, fieldLabel: string): Promise<string> {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${fieldLabel} boş olamaz.`);
  return validateImageValue(value.trim(), fieldLabel);
}

async function optionalImageValue(value: unknown, fieldLabel: string): Promise<string | undefined> {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return validateImageValue(value.trim(), fieldLabel);
}

// parseBody/parsePreviewProps both build their result by spreading `common`
// (format: CardFormat, the registry-wide union) into an object typed against
// each card type's own Props (format: <that type's own narrower union>, e.g.
// QuoteCardFormat = "square" | "story"). WithWideFormat lets those two
// callbacks return the wider, spread-shaped type instead of fighting the
// narrower Props type; buildHtml/render still receive the narrowed Props via
// an `as Props` cast below, safe because supportedFormats (enforced by the
// API route and the UI's format picker) guarantees the format field is
// always actually one of that type's own supported values.
type WithWideFormat<P> = Omit<P, "format"> & { format: CardFormat };

function defineCardType<Props>(
  label: string,
  fileNamePrefix: string,
  supportedFormats: readonly CardFormat[],
  // Each type's own dimensions function is typed against its own local,
  // narrower format union (e.g. QuoteCardFormat = "square" | "story") since
  // that's genuinely all it supports. Call sites for types that don't
  // support the full CardFormat union cast their dimensions fn to this wide
  // signature — safe because supportedFormats (checked by the API route and
  // the UI's format picker) guarantees dims is never actually invoked with a
  // format the underlying function can't handle.
  dimensions: (format: CardFormat) => ImageDimensions,
  parseBody: (body: Record<string, unknown>, common: CommonCardFields) => WithWideFormat<Props> | Promise<WithWideFormat<Props>>,
  buildHtml: (props: Props, variantKey?: string, tokens?: BrandDesignTokens) => string | string[],
  parsePreviewProps?: (body: Record<string, unknown>, common: CommonCardFields) => WithWideFormat<Props> | Promise<WithWideFormat<Props>>
): CardTypeEntry {
  const dims = (format: CardFormat): ImageDimensions => dimensions(format) || { width: 1080, height: 1080 };
  return {
    label,
    fileNamePrefix,
    supportedFormats,
    dimensions: dims,
    parseBody: (body, common) => Promise.resolve(parseBody(body, common)),
    buildHtml: (props, variantKey, tokens) => {
      const result = buildHtml(props as Props, variantKey, tokens);
      return Array.isArray(result) ? result : [result];
    },
    parsePreviewProps: (body, common) => {
      if (parsePreviewProps) {
        return Promise.resolve(parsePreviewProps(body, common));
      }
      return Promise.resolve(parseBody(body, common));
    },
    render: async (props, variantKey, tokens) => {
      const result = buildHtml(props as Props, variantKey, tokens);
      const htmls = Array.isArray(result) ? result : [result];
      const cardDims = dims((props as CommonCardFields).format);
      if (htmls.length > 1) {
        return renderHtmlSetToImages(htmls.map((html) => ({ html, dimensions: cardDims })));
      }
      return [await renderHtmlToImage(htmls[0], cardDims)];
    },
  };
}

export const CARD_TYPES: Record<string, CardTypeEntry> = {
  quote: defineCardType<QuoteCardProps>(
    "Alıntı Kartı",
    "alinti-karti",
    CARD_TYPE_SUPPORTED_FORMATS.quote,
    quoteCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({ quote: requireString(body.quote, "Alıntı metni", 280), ...common }),
    (props, variantKey, tokens) => pickQuoteVariant(variantKey)(props, tokens),
    (body, common) => ({
      quote: previewStr(body.quote, "Markanızın sesini yansıtan, ilham verici ve akılda kalıcı bir alıntı buraya gelecek."),
      ...common,
    })
  ),

  comparison: defineCardType<ComparisonCardProps>(
    "Karşılaştırma (Vs.) Kartı",
    "karsilastirma-karti",
    CARD_TYPE_SUPPORTED_FORMATS.comparison,
    comparisonCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      leftLabel: requireString(body.leftLabel, "Sol etiket", 40),
      leftText: requireString(body.leftText, "Sol metin", 160),
      rightLabel: requireString(body.rightLabel, "Sağ etiket", 40),
      rightText: requireString(body.rightText, "Sağ metin", 160),
      ...common,
    }),
    (props, variantKey, tokens) => pickComparisonVariant(variantKey)(props, tokens),
    (body, common) => ({
      leftLabel: previewStr(body.leftLabel, "Eski Yöntem"),
      leftText: previewStr(body.leftText, "Saatler süren manuel tasarım ve dağınık notlar arasında kaybolmak."),
      rightLabel: previewStr(body.rightLabel, "Tentamark"),
      rightText: previewStr(body.rightText, "Marka DNA'sına uygun otonom taslaklar ve tek tıkla onay."),
      ...common,
    })
  ),

  carousel: defineCardType<CarouselCardProps>(
    "Carousel Serisi",
    "carousel",
    CARD_TYPE_SUPPORTED_FORMATS.carousel,
    carouselCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => {
      const title = requireString(body.title, "Başlık", 80);
      const rawItems = Array.isArray(body.items) ? body.items : [];
      const items = rawItems.map((v) => String(v).trim()).filter(Boolean).slice(0, 8);
      if (items.length === 0) throw new Error("En az bir madde girin.");
      return { title, items, ctaLabel: optionalString(body.ctaLabel, 60), ...common };
    },
    (props, variantKey, tokens) => {
      const layout = pickCarouselVariant(variantKey);
      const totalSlides = props.items.length + 2;
      return [
        layout.cover(props, totalSlides, tokens),
        ...props.items.map((text, i) =>
          layout.item(props, { text, slideIndex: i + 1, itemNumber: i + 1, totalSlides }, tokens)
        ),
        layout.cta(props, totalSlides, tokens),
      ];
    },
    (body, common) => {
      const rawItems = Array.isArray(body.items) ? body.items : [];
      const items = rawItems.map(String).map((s) => s.trim()).filter(Boolean);
      return {
        title: previewStr(body.title, "Sosyal Medyada Büyümenin 3 Altın Kuralı"),
        items:
          items.length > 0
            ? items
            : [
                "Tutarlı bir görsel kimlik ve marka tonu oluşturun.",
                "Her platformun kendi formatına uygun kancalar kullanın.",
                "İçeriklerinizi önceden takvimde organize edip onaylayın.",
              ],
        ctaLabel: previewStr(body.ctaLabel, "Daha fazlası için kaydet ve takip et"),
        ...common,
      };
    }
  ),

  notification: defineCardType<NotificationCardProps>(
    "Bildirim Kartı",
    "bildirim-karti",
    CARD_TYPE_SUPPORTED_FORMATS.notification,
    notificationCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      headline: requireString(body.headline, "Başlık", 80),
      subtext: requireString(body.subtext, "Alt metin", 160),
      timeLabel: optionalString(body.timeLabel, 20),
      ...common,
    }),
    (props, variantKey, tokens) => pickNotificationVariant(variantKey)(props, tokens),
    (body, common) => ({
      headline: previewStr(body.headline, "Yeni Bildirim"),
      subtext: previewStr(body.subtext, "Haftalık içerik takviminiz Marka DNA'nıza göre hazırlandı."),
      timeLabel: previewStr(body.timeLabel, "şimdi"),
      ...common,
    })
  ),

  socialpost: defineCardType<SocialPostCardProps>(
    "Sosyal Post Simülasyonu",
    "sosyal-post-karti",
    CARD_TYPE_SUPPORTED_FORMATS.socialpost,
    socialPostCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      text: requireString(body.text, "Gönderi metni", 280),
      handle: optionalString(body.handle, 30),
      ...common,
    }),
    (props, variantKey, tokens) => pickSocialPostVariant(variantKey)(props, tokens),
    (body, common) => ({
      text: previewStr(
        body.text,
        "Bir markanın en büyük gücü, her platformda aynı tutarlı ve samimi ses tonuyla konuşabilmesidir. 🚀"
      ),
      handle: previewStr(body.handle, `@${common.brandName.toLowerCase().replace(/\s+/g, "") || "markaniz"}`),
      ...common,
    })
  ),

  trend: defineCardType<TrendCardProps>(
    "Trend / Grafik Kartı",
    "trend-karti",
    CARD_TYPE_SUPPORTED_FORMATS.trend,
    trendCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => {
      const statNumber = requireString(body.statNumber, "İstatistik", 20);
      const statLabel = requireString(body.statLabel, "Etiket", 80);
      const rawPoints = Array.isArray(body.trendPoints) ? body.trendPoints : [];
      const trendPoints = rawPoints.map((v) => Number(v)).filter((n) => Number.isFinite(n));
      if (trendPoints.length < 2) throw new Error("Trend grafiği için en az 2 sayı gerekir.");
      return { statNumber, statLabel, trendPoints, ...common };
    },
    (props, variantKey, tokens) => pickTrendVariant(variantKey)(props, tokens),
    (body, common) => {
      const rawPoints = Array.isArray(body.trendPoints) ? body.trendPoints : [];
      const trendPoints = rawPoints.map(Number).filter(Number.isFinite);
      return {
        statNumber: previewStr(body.statNumber, "+340%"),
        statLabel: previewStr(body.statLabel, "Aylık Organik Büyüme"),
        trendPoints: trendPoints.length >= 2 ? trendPoints : [20, 38, 55, 68, 92, 120],
        ...common,
      };
    }
  ),

  problemsolution: defineCardType<ProblemSolutionCardProps>(
    "Problem & Çözüm Kartı",
    "problem-cozum-karti",
    CARD_TYPE_SUPPORTED_FORMATS.problemsolution,
    problemSolutionCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      problem: requireString(body.problem, "Sorun", 160),
      solution: requireString(body.solution, "Çözüm", 160),
      ...common,
    }),
    (props, variantKey, tokens) => pickProblemSolutionVariant(variantKey)(props, tokens),
    (body, common) => ({
      problem: previewStr(body.problem, "Her gün 'Bugün ne paylaşacağım?' diye düşünmekten asıl işinize vakit kalmıyor mu?"),
      solution: previewStr(body.solution, "Tentamark ile tüm haftanın içeriklerini 5 dakikada planlayın ve onaylayın."),
      ...common,
    })
  ),

  product: defineCardType<ProductCardProps>(
    "Ürün Kartı",
    "urun-karti",
    CARD_TYPE_SUPPORTED_FORMATS.product,
    productCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    async (body, common) => ({
      imageUrl: await requireImageValue(body.imageUrl, "Ürün görseli"),
      title: requireString(body.title, "Başlık", 80),
      description: requireString(body.description, "Açıklama", 160),
      ...common,
    }),
    (props, variantKey, tokens) => pickProductVariant(variantKey)(props, tokens),
    (body, common) => ({
      title: previewStr(body.title, "Öne Çıkan Ürününüz"),
      description: previewStr(body.description, "Yüksek kaliteli malzemeler ve modern tasarımın mükemmel buluşması."),
      imageUrl: previewStr(body.imageUrl, "/brand/tentamark-mark-512.png"),
      ...common,
    })
  ),

  stat: defineCardType<StatCardProps>(
    "İstatistik Kartı",
    "istatistik-karti",
    CARD_TYPE_SUPPORTED_FORMATS.stat,
    statCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      statNumber: requireString(body.statNumber, "İstatistik", 20),
      statLabel: requireString(body.statLabel, "Etiket", 80),
      supportingText: optionalString(body.supportingText, 120),
      ...common,
    }),
    (props, variantKey, tokens) => pickStatVariant(variantKey)(props, tokens),
    (body, common) => ({
      statNumber: previewStr(body.statNumber, "%94"),
      statLabel: previewStr(body.statLabel, "Zaman Tasarrufu"),
      supportingText: previewStr(
        body.supportingText,
        "Sosyal medya içerik üretim ve onay süreçlerinde harcanan sürede ortalama düşüş."
      ),
      ...common,
    })
  ),

  testimonial: defineCardType<TestimonialCardProps>(
    "Müşteri Yorumu Kartı",
    "musteri-yorumu-karti",
    CARD_TYPE_SUPPORTED_FORMATS.testimonial,
    testimonialCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    async (body, common) => {
      const ratingRaw = typeof body.rating === "number" ? Math.round(body.rating) : undefined;
      const rating = ratingRaw && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined;
      return {
        testimonialText: requireString(body.testimonialText, "Yorum metni", 220),
        customerName: requireString(body.customerName, "Müşteri adı", 40),
        customerRole: optionalString(body.customerRole, 60),
        customerAvatarUrl: await optionalImageValue(body.customerAvatarUrl, "Müşteri fotoğrafı"),
        rating,
        ...common,
      };
    },
    (props, variantKey, tokens) => pickTestimonialVariant(variantKey)(props, tokens),
    (body, common) => {
      const ratingRaw = typeof body.rating === "number" ? Math.round(body.rating) : 5;
      const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : 5;
      return {
        testimonialText: previewStr(
          body.testimonialText,
          "Tentamark sayesinde sosyal medya içeriklerimizi haftalar öncesinden planlayıp onaylıyoruz. Sürecimiz inanılmaz hızlandı."
        ),
        customerName: previewStr(body.customerName, "Zeynep Yılmaz"),
        customerRole: previewStr(body.customerRole, "Kurucu & CEO"),
        customerAvatarUrl: previewStr(body.customerAvatarUrl, "/brand/tentamark-mark-512.png"),
        rating,
        ...common,
      };
    }
  ),

  changelog: defineCardType<ChangelogCardProps>(
    "Changelog / Sürüm Notu",
    "changelog-karti",
    CARD_TYPE_SUPPORTED_FORMATS.changelog,
    changelogCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      badge: requireString(body.badge, "Sürüm veya etiket", 40),
      title: requireString(body.title, "Başlık", 80),
      description: requireString(body.description, "Açıklama", 280),
      codeSnippet: optionalString(body.codeSnippet, 300),
      ...common,
    }),
    (props, variantKey, tokens) => pickChangelogVariant(variantKey)(props, tokens),
    (body, common) => ({
      badge: previewStr(body.badge, "v2.4 YAYINDA 🚀"),
      title: previewStr(body.title, "Shopify ve Meta Otomatik Entegrasyonu"),
      description: previewStr(body.description, "Artık e-ticaret mağazanızdaki ürün katalogları tek tıkla Tentamark stüdyosuna aktarılıyor."),
      codeSnippet: previewStr(body.codeSnippet, "// Yeni entegrasyon tek satırda aktif:\nnpm i @tentamark/shopify-sync\nawait tentamark.syncCatalog();"),
      ...common,
    })
  ),

  checklist: defineCardType<ChecklistCardProps>(
    "Kontrol Listesi / Adım Adım",
    "checklist-karti",
    CARD_TYPE_SUPPORTED_FORMATS.checklist,
    checklistCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => {
      const title = requireString(body.title, "Başlık", 80);
      const rawItems = Array.isArray(body.items) ? body.items : [];
      const items = rawItems.map((v) => String(v).trim()).filter(Boolean).slice(0, 6);
      if (items.length === 0) throw new Error("En az bir kontrol maddesi girin.");
      return {
        title,
        items,
        subtitle: optionalString(body.subtitle, 40),
        ...common,
      };
    },
    (props, variantKey, tokens) => pickChecklistVariant(variantKey)(props, tokens),
    (body, common) => {
      const rawItems = Array.isArray(body.items) ? body.items : [];
      const items = rawItems.map(String).map((s) => s.trim()).filter(Boolean);
      return {
        title: previewStr(body.title, "E-Ticarette Dönüşüm Artıran 4 Kural"),
        subtitle: previewStr(body.subtitle, "Lansman Öncesi Kontrol Listesi"),
        items: items.length > 0 ? items : [
          "İlk 2 saniyede merak uyandıran bir kanca seçin.",
          "Açıklama ve bio bağlantınızı net bir CTA ile bağlayın.",
          "Gelen ilk yorumlara 1 saat içinde cevap verin.",
          "Verileri 24 saat sonra Trend analizinden inceleyin."
        ],
        ...common,
      };
    }
  ),

  event: defineCardType<EventCardProps>(
    "Webinar / Canlı Yayın Kartı",
    "etkinlik-karti",
    CARD_TYPE_SUPPORTED_FORMATS.event,
    eventCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    async (body, common) => ({
      eventTitle: requireString(body.eventTitle, "Etkinlik başlığı", 80),
      dateText: requireString(body.dateText, "Tarih ve saat", 60),
      speaker1Name: requireString(body.speaker1Name, "1. Konuşmacı adı", 40),
      speaker1Role: requireString(body.speaker1Role, "1. Konuşmacı rolü", 60),
      speaker1AvatarUrl: await optionalImageValue(body.speaker1AvatarUrl, "1. Konuşmacı fotoğrafı"),
      speaker2Name: optionalString(body.speaker2Name, 40),
      speaker2Role: optionalString(body.speaker2Role, 60),
      speaker2AvatarUrl: await optionalImageValue(body.speaker2AvatarUrl, "2. Konuşmacı fotoğrafı"),
      badgeText: optionalString(body.badgeText, 30),
      ...common,
    }),
    (props, variantKey, tokens) => pickEventVariant(variantKey)(props, tokens),
    (body, common) => ({
      eventTitle: previewStr(body.eventTitle, "Yapay Zeka ile E-Ticarette 10x Büyüme"),
      dateText: previewStr(body.dateText, "28 Eylül Perşembe • 20:00"),
      speaker1Name: previewStr(body.speaker1Name, "Ahmet Yılmaz"),
      speaker1Role: previewStr(body.speaker1Role, "Growth Lead @ Tentamark"),
      speaker1AvatarUrl: previewStr(body.speaker1AvatarUrl, "/brand/tentamark-mark-512.png"),
      speaker2Name: previewStr(body.speaker2Name, "Mert Kaya"),
      speaker2Role: previewStr(body.speaker2Role, "E-Ticaret Danışmanı"),
      speaker2AvatarUrl: previewStr(body.speaker2AvatarUrl, "/brand/tentamark-mark-512.png"),
      badgeText: previewStr(body.badgeText, "CANLI YAYIN 🔴"),
      ...common,
    })
  ),

  thisorthat: defineCardType<ThisOrThatCardProps>(
    "Hangisi? / Etkileşim Kartı",
    "hangisi-karti",
    CARD_TYPE_SUPPORTED_FORMATS.thisorthat,
    thisOrThatCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      question: requireString(body.question, "Soru başlığı", 90),
      optionA: requireString(body.optionA, "A seçeneği", 100),
      optionB: requireString(body.optionB, "B seçeneği", 100),
      ctaText: optionalString(body.ctaText, 60),
      ...common,
    }),
    (props, variantKey, tokens) => pickThisOrThatVariant(variantKey)(props, tokens),
    (body, common) => ({
      question: previewStr(body.question, "Sence Büyümede Hangisi Daha Etkili?"),
      optionA: previewStr(body.optionA, "Tutarlı ve Değerli Organik İçerik"),
      optionB: previewStr(body.optionB, "Agresif ve Yüksek Reklam Bütçesi"),
      ctaText: previewStr(body.ctaText, common.format === "story" ? "Hikayede Oy Ver 👆" : "Fikrini Yorumda Belirt 👇"),
      ...common,
    })
  ),

  matrix: defineCardType<MatrixCardProps>(
    "2x2 Matris / Çeyrek Kartı",
    "matris-karti",
    CARD_TYPE_SUPPORTED_FORMATS.matrix,
    matrixCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      title: requireString(body.title, "Matris başlığı", 80),
      q1Label: requireString(body.q1Label, "1. Çeyrek başlığı", 30),
      q1Text: requireString(body.q1Text, "1. Çeyrek içeriği", 120),
      q2Label: requireString(body.q2Label, "2. Çeyrek başlığı", 30),
      q2Text: requireString(body.q2Text, "2. Çeyrek içeriği", 120),
      q3Label: requireString(body.q3Label, "3. Çeyrek başlığı", 30),
      q3Text: requireString(body.q3Text, "3. Çeyrek içeriği", 120),
      q4Label: requireString(body.q4Label, "4. Çeyrek başlığı", 30),
      q4Text: requireString(body.q4Text, "4. Çeyrek içeriği", 120),
      ...common,
    }),
    (props, variantKey, tokens) => pickMatrixVariant(variantKey)(props, tokens),
    (body, common) => ({
      title: previewStr(body.title, "Sosyal Medya Araçları Matrisi"),
      q1Label: previewStr(body.q1Label, "Fikir & Metin"),
      q1Text: previewStr(body.q1Text, "ChatGPT, Claude, Notion AI"),
      q2Label: previewStr(body.q2Label, "Görsel & Tasarım"),
      q2Text: previewStr(body.q2Text, "Midjourney, Figma, Canva"),
      q3Label: previewStr(body.q3Label, "Video & Reels"),
      q3Text: previewStr(body.q3Text, "CapCut, Premiere, Runway"),
      q4Label: previewStr(body.q4Label, "Otonomi & Dağıtım"),
      q4Text: previewStr(body.q4Text, "Tentamark, Buffer, Typefully"),
      ...common,
    })
  ),

  chat: defineCardType<ChatCardProps>(
    "Sohbet / DM Simülasyonu",
    "sohbet-karti",
    CARD_TYPE_SUPPORTED_FORMATS.chat,
    chatCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      senderName: requireString(body.senderName, "Müşteri adı", 40),
      incomingMessage: requireString(body.incomingMessage, "Müşteri sorusu / mesajı", 200),
      outgoingMessage: requireString(body.outgoingMessage, "Cevabınız / çözüm", 240),
      timeText: optionalString(body.timeText, 30),
      ...common,
    }),
    (props, variantKey, tokens) => pickChatVariant(variantKey)(props, tokens),
    (body, common) => ({
      senderName: previewStr(body.senderName, "Ayşe Yılmaz"),
      incomingMessage: previewStr(body.incomingMessage, "Sipariş verdim ama ne zaman kargolanır acaba? Çok heyecanlıyım!"),
      outgoingMessage: previewStr(body.outgoingMessage, "Harika bir haberimiz var! Siparişiniz hazırlandı ve aynı gün kargoya verildi. 🚀"),
      timeText: previewStr(body.timeText, "14:32 • İletildi"),
      ...common,
    })
  ),

  notes: defineCardType<NotesCardProps>(
    "Kişisel Not Kartı",
    "not-karti",
    CARD_TYPE_SUPPORTED_FORMATS.notes,
    notesCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      noteTitle: requireString(body.noteTitle, "Not başlığı", 80),
      content: requireString(body.content, "Not içeriği", 400),
      dateLabel: requireString(body.dateLabel, "Tarih", 40),
      folderName: optionalString(body.folderName, 40),
      ...common,
    }),
    (props, variantKey, tokens) => pickNotesVariant(variantKey)(props, tokens),
    (body, common) => ({
      noteTitle: previewStr(body.noteTitle, "2026'da Büyümek İsteyen Markalar İçin 3 Altın Not:"),
      content: previewStr(
        body.content,
        "1. Her gün sıfırdan içerik düşünmeyi bırak, sistem kur.\n2. Marka DNA'nı ve renklerini her görselde kilitli tut.\n3. Sosyal kanıt (müşteri yorumları) en güçlü satış silahındır."
      ),
      dateLabel: previewStr(body.dateLabel, "23 Eylül 2026, 10:45"),
      folderName: previewStr(body.folderName, "📌 Gizli Notlar"),
      ...common,
    })
  ),

  coupon: defineCardType<CouponCardProps>(
    "İndirim Kuponu / Bilet",
    "kupon-karti",
    CARD_TYPE_SUPPORTED_FORMATS.coupon,
    couponCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      discountText: requireString(body.discountText, "İndirim oranı", 30),
      couponCode: requireString(body.couponCode, "Kupon kodu", 30),
      headline: requireString(body.headline, "Kampanya başlığı", 80),
      expiryText: optionalString(body.expiryText, 40),
      ...common,
    }),
    (props, variantKey, tokens) => pickCouponVariant(variantKey)(props, tokens),
    (body, common) => ({
      discountText: previewStr(body.discountText, "%30 İNDİRİM"),
      couponCode: previewStr(body.couponCode, "TENTA30"),
      headline: previewStr(body.headline, "Büyük Sezon Sonu Fırsatı Başladı"),
      expiryText: previewStr(body.expiryText, "Son Gün: Pazar 23:59"),
      ...common,
    })
  ),

  featuretable: defineCardType<FeatureTableCardProps>(
    "Özellik Kıyaslama Tablosu",
    "kiyas-tablosu",
    CARD_TYPE_SUPPORTED_FORMATS.featuretable,
    featureTableCardDimensions as unknown as (format: CardFormat) => ImageDimensions,
    (body, common) => ({
      title: requireString(body.title, "Tablo başlığı", 80),
      feature1: requireString(body.feature1, "1. Kriter", 40),
      competitor1: requireString(body.competitor1, "1. Rakip/Eski Yöntem", 40),
      tentamark1: requireString(body.tentamark1, "1. Çözümünüz", 40),
      feature2: requireString(body.feature2, "2. Kriter", 40),
      competitor2: requireString(body.competitor2, "2. Rakip/Eski Yöntem", 40),
      tentamark2: requireString(body.tentamark2, "2. Çözümünüz", 40),
      feature3: requireString(body.feature3, "3. Kriter", 40),
      competitor3: requireString(body.competitor3, "3. Rakip/Eski Yöntem", 40),
      tentamark3: requireString(body.tentamark3, "3. Çözümünüz", 40),
      feature4: optionalString(body.feature4, 40),
      competitor4: optionalString(body.competitor4, 40),
      tentamark4: optionalString(body.tentamark4, 40),
      ...common,
    }),
    (props, variantKey, tokens) => pickFeatureTableVariant(variantKey)(props, tokens),
    (body, common) => ({
      title: previewStr(body.title, "Neden Tentamark?"),
      feature1: previewStr(body.feature1, "Haftalık İçerik Üretimi"),
      competitor1: previewStr(body.competitor1, "15 - 20 Saat (Manuel) ❌"),
      tentamark1: previewStr(body.tentamark1, "5 Dakika (Otonom) ✅"),
      feature2: previewStr(body.feature2, "Görsel Tasarım & Safe Zone"),
      competitor2: previewStr(body.competitor2, "Bozuk Şablonlar ❌"),
      tentamark2: previewStr(body.tentamark2, "Pixel-Perfect Güvenli Alan ✅"),
      feature3: previewStr(body.feature3, "Marka DNA & Renk Uyumu"),
      competitor3: previewStr(body.competitor3, "Her Seferinde Sıfırdan ❌"),
      tentamark3: previewStr(body.tentamark3, "Otomatik Logo & Renk Kilidi ✅"),
      feature4: previewStr(body.feature4, "Aylık Maliyet"),
      competitor4: previewStr(body.competitor4, "Ajans Faturası: 30K+ TL ❌"),
      tentamark4: previewStr(body.tentamark4, "Tek Platform: 0 TL Ek Masraf ✅"),
      ...common,
    })
  ),

  podcast: defineCardType<PodcastCardProps>(
    "Podcast & YouTube Kapağı",
    "podcast-kapak",
    CARD_TYPE_SUPPORTED_FORMATS.podcast,
    podcastCardDimensions,
    async (body, common) => ({
      title: requireString(body.title, "Başlık", 100),
      hostImageUrl: await requireImageValue(body.hostImageUrl, "Konuşmacı görseli"),
      hostName: requireString(body.hostName, "Konuşmacı adı", 50),
      guestImageUrl: await optionalImageValue(body.guestImageUrl, "Konuk görseli"),
      guestName: optionalString(body.guestName, 50),
      episodeTag: optionalString(body.episodeTag, 40),
      subtitle: optionalString(body.subtitle, 80),
      ...common,
    }),
    (props, variantKey, tokens) => [pickPodcastVariant(variantKey)(props, tokens)],
    (body, common) => ({
      title: previewStr(body.title, "Sosyal Medyadan Milyonluk Satışa Giden Yol"),
      hostImageUrl: previewStr(
        body.hostImageUrl,
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"
      ),
      hostName: previewStr(body.hostName, "Oğuzhan Kaya"),
      guestImageUrl: previewStr(body.guestImageUrl, ""),
      guestName: previewStr(body.guestName, ""),
      episodeTag: previewStr(body.episodeTag, "ÖZEL BÖLÜM #24"),
      subtitle: previewStr(body.subtitle, "Büyüme & Pazarlama Sohbetleri"),
      ...common,
    })
  ),

  photoreview: defineCardType<PhotoReviewCardProps>(
    "Arka Plan Fotoğraflı Yorum",
    "fotograf-yorum",
    CARD_TYPE_SUPPORTED_FORMATS.photoreview,
    photoReviewCardDimensions,
    async (body, common) => ({
      bgImageUrl: await requireImageValue(body.bgImageUrl, "Arka plan görseli"),
      headerText: requireString(body.headerText, "Başlık", 60),
      reviewText: requireString(body.reviewText, "Yorum metni", 350),
      customerName: requireString(body.customerName, "Müşteri adı", 50),
      customerAvatarUrl: await optionalImageValue(body.customerAvatarUrl, "Müşteri profil fotoğrafı"),
      rating: body.rating ? Math.max(1, Math.min(5, Number(body.rating))) : 5,
      badgeText: optionalString(body.badgeText, 40),
      ...common,
    }),
    (props, variantKey, tokens) => [pickPhotoReviewVariant(variantKey)(props, tokens)],
    (body, common) => ({
      bgImageUrl: previewStr(
        body.bgImageUrl,
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1080&q=80"
      ),
      headerText: previewStr(body.headerText, "MÜŞTERİ DENEYİMİ"),
      reviewText: previewStr(
        body.reviewText,
        "Hizmet kalitesi ve hız gerçekten beklentilerimizin çok ötesindeydi. Kesinlikle herkese tavsiye ediyorum!"
      ),
      customerName: previewStr(body.customerName, "Amanda S."),
      customerAvatarUrl: previewStr(
        body.customerAvatarUrl,
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
      ),
      rating: body.rating ? Number(body.rating) : 5,
      badgeText: previewStr(body.badgeText, "Doğrulanmış Misafir ✅"),
      ...common,
    })
  ),

  deal: defineCardType<DealCardProps>(
    "Fiyat Rozetli Ürün Vitrini",
    "urun-firsat",
    CARD_TYPE_SUPPORTED_FORMATS.deal,
    dealCardDimensions,
    async (body, common) => {
      const rawFeatures = Array.isArray(body.features) ? body.features : [];
      const features = rawFeatures.map(String).map((s) => s.trim()).filter(Boolean);
      return {
        productImageUrl: await requireImageValue(body.productImageUrl, "Ürün görseli"),
        title: requireString(body.title, "Ürün başlığı", 70),
        priceText: requireString(body.priceText, "Fiyat etiketi", 30),
        badgeText: optionalString(body.badgeText, 40),
        features: features.length > 0 ? features : ["Yüksek Kaliteli Kasa", "2 Yıl Garanti", "Aynı Gün Kargo"],
        ctaText: optionalString(body.ctaText, 40),
        ...common,
      };
    },
    (props, variantKey, tokens) => [pickDealVariant(variantKey)(props, tokens)],
    (body, common) => {
      const rawFeatures = Array.isArray(body.features) ? body.features : [];
      const features = rawFeatures.map(String).map((s) => s.trim()).filter(Boolean);
      return {
        productImageUrl: previewStr(
          body.productImageUrl,
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
        ),
        title: previewStr(body.title, "TimeFlex Pro Akıllı Saat"),
        priceText: previewStr(body.priceText, "1.490 TL"),
        badgeText: previewStr(body.badgeText, "GÜNÜN FIRSATI"),
        features:
          features.length > 0
            ? features
            : ["Suya Dayanıklı Titanyum", "AI Sağlık ve Nabız Koçu", "7 Gün Kesintisiz Pil"],
        ctaText: previewStr(body.ctaText, "Hemen İncele ↗"),
        ...common,
      };
    }
  ),

  newsflash: defineCardType<NewsFlashCardProps>(
    "Son Dakika / Canlı Haber",
    "son-dakika",
    CARD_TYPE_SUPPORTED_FORMATS.newsflash,
    newsFlashCardDimensions,
    async (body, common) => ({
      bgImageUrl: await requireImageValue(body.bgImageUrl, "Haber görseli"),
      badgeText: requireString(body.badgeText, "Rozet", 40),
      headline: requireString(body.headline, "Haber başlığı", 140),
      sourceText: optionalString(body.sourceText, 50),
      ctaText: optionalString(body.ctaText, 60),
      bubbleText: optionalString(body.bubbleText, 60),
      ...common,
    }),
    (props, variantKey, tokens) => [pickNewsFlashVariant(variantKey)(props, tokens)],
    (body, common) => ({
      bgImageUrl: previewStr(
        body.bgImageUrl,
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1080&q=80"
      ),
      badgeText: previewStr(body.badgeText, "🔴 SON DAKİKA"),
      headline: previewStr(body.headline, "Yapay Zeka ile Sosyal Medya Yönetiminde Yeni Çağ Başladı"),
      sourceText: previewStr(body.sourceText, "kaynak: @tentamark"),
      ctaText: previewStr(body.ctaText, "Sizce bu gelişme sektörü nasıl etkiler? 👇"),
      bubbleText: previewStr(body.bubbleText, "Gerçekten inanılmaz bir adım 🔥"),
      ...common,
    })
  ),
};

export function getCardType(typeKey: string): CardTypeEntry | undefined {
  return CARD_TYPES[typeKey];
}

export async function buildCardPreview(
  typeKey: string,
  body: Record<string, unknown>,
  common: CommonCardFields,
  variantKey?: string,
  tokens?: BrandDesignTokens
): Promise<{ htmls: string[]; dimensions: ImageDimensions }> {
  const cardType = getCardType(typeKey);
  if (!cardType) throw new Error("Geçersiz şablon türü.");

  const props = await cardType.parsePreviewProps(body, common);
  const htmls = cardType.buildHtml(props, variantKey, tokens);
  const dimensions = cardType.dimensions(common.format);

  return { htmls, dimensions };
}

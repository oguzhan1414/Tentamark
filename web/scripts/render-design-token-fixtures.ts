import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { deriveBrandDesignTokens, type DesignTokenInput } from "../src/lib/brand/designTokens";
import { renderQuoteEditorial } from "../src/lib/cards/quote/editorial";
import { renderStatEditorial } from "../src/lib/cards/stat/editorial";
import { renderProductEditorial } from "../src/lib/cards/product/editorial";
import { renderTestimonialEditorial } from "../src/lib/cards/testimonial/editorial";
import { renderComparisonEditorial } from "../src/lib/cards/comparison/editorial";
import { renderEventEditorial } from "../src/lib/cards/event/editorial";
import { renderChangelogEditorial } from "../src/lib/cards/changelog/editorial";
import { renderChecklistEditorial } from "../src/lib/cards/checklist/editorial";
import { renderFeatureTableEditorial } from "../src/lib/cards/featuretable/editorial";
import { renderMatrixEditorial } from "../src/lib/cards/matrix/editorial";
import { renderThisOrThatEditorial } from "../src/lib/cards/thisorthat/editorial";
import { renderCarouselCoverEditorial } from "../src/lib/cards/carousel/editorial";
import { renderTrendEditorial } from "../src/lib/cards/trend/editorial";
import { renderProblemSolutionEditorial } from "../src/lib/cards/problemsolution/editorial";
import { renderNotificationLight } from "../src/lib/cards/notification/light";
import { renderSocialPost } from "../src/lib/cards/socialpost/post";
import { renderChatIos } from "../src/lib/cards/chat/ios";
import { renderNotesNotion } from "../src/lib/cards/notes/notion";
import { renderCouponModern } from "../src/lib/cards/coupon/modern";
import { renderPodcastNeonPurple } from "../src/lib/cards/podcast/neonPurple";
import { renderPhotoReviewWarmEditorial } from "../src/lib/cards/photoreview/warmEditorial";
import { renderDealLifestyleSplit } from "../src/lib/cards/deal/lifestyleSplit";
import { renderNewsFlashBreakingRed } from "../src/lib/cards/newsflash/breakingRed";
import { renderHtmlToImage } from "../src/lib/cards/renderHtmlToImage";
import { closeBrowserPool } from "../src/lib/cards/browserPool";

/*
  Faz 2 proof-of-concept verification: 3 fake brand_dna inputs, spanning a
  real color signal + visual_style keyword hit, a trait_scores-only signal,
  and the "brand never ran autofill" empty case — checked both mechanically
  (a few hard assertions the derivation must never collapse) and visually
  (12 real PNGs rendered through the actual Playwright pipeline, meant to be
  read back and eyeballed, not just type-checked). Run with:
    npx tsx scripts/render-design-token-fixtures.ts
*/

const OUTPUT_DIR = path.join(import.meta.dirname, "design-token-fixtures", "output");

type FakeBrand = { name: string; input: DesignTokenInput };

const FAKE_BRANDS: FakeBrand[] = [
  {
    name: "minimal-pastel",
    input: { colorPalette: ["#F2C7C1", "#EDE6DD", "#8FA998"], visualStyle: "minimal ve pastel", traitScores: null },
  },
  {
    name: "maksimalist-enerjik",
    input: {
      colorPalette: ["#FF3366", "#FFD400", "#111111"],
      visualStyle: "maksimalist ve enerjik renkli",
      traitScores: { enerjik: 90, samimi: 70, profesyonel: 40, teknolojik: 30, destekleyici: 60, luks: 20 },
    },
  },
  {
    name: "empty-brand",
    input: { colorPalette: [], visualStyle: null, traitScores: null },
  },
];

async function main() {
  const avatarBuffer = await readFile(path.join(import.meta.dirname, "..", "public", "tenta-avatar-open.png"));
  const avatarDataUri = `data:image/png;base64,${avatarBuffer.toString("base64")}`;

  const resolved = FAKE_BRANDS.map((brand) => ({ brand, tokens: deriveBrandDesignTokens(brand.input) }));

  console.log("Resolved BrandDesignTokens per fake brand:\n");
  for (const { brand, tokens } of resolved) {
    console.log(`--- ${brand.name} ---`);
    console.log(JSON.stringify(tokens, null, 2));
  }

  const [minimal, maksimalist, empty] = resolved.map((r) => r.tokens);

  assert.notStrictEqual(minimal.colors.accent, maksimalist.colors.accent, "accent should differ between minimal-pastel and maksimalist-enerjik");
  // Not shape.radiusStyle: "warm" and "bold_playful" are both intentionally
  // rounded (the "friendly, not corporate" side of the archetype table) —
  // shadowStyle is the dimension that's guaranteed to separate them instead.
  assert.notStrictEqual(minimal.shape.shadowStyle, maksimalist.shape.shadowStyle, "shadowStyle should differ");
  assert.notStrictEqual(minimal.layout.ctaStyle, maksimalist.layout.ctaStyle, "ctaStyle should differ");
  assert.notStrictEqual(minimal.typography.headingFamily, maksimalist.typography.headingFamily, "headingFamily should differ");

  const HEX = /^#[0-9a-fA-F]{6}$/;
  for (const key of ["primary", "secondary", "accent", "background", "surface", "text"] as const) {
    assert.match(empty.colors[key], HEX, `empty-brand colors.${key} should still be a valid hex`);
  }

  console.log("\nAll sanity assertions passed.\n");

  for (const { brand, tokens } of resolved) {
    const dir = path.join(OUTPUT_DIR, brand.name);
    await mkdir(dir, { recursive: true });

    const common = { brandName: brand.name.replace(/-/g, " "), logoUrl: null, format: "square" as const };
    const dimensions = { width: 1080, height: 1080 };

    const renders: Array<{ type: string; html: string }> = [
      {
        type: "quote",
        html: renderQuoteEditorial({ quote: "İyi tasarım, markanın sessizce konuşmasıdır.", ...common }, tokens),
      },
      {
        type: "stat",
        html: renderStatEditorial(
          {
            statNumber: "%87",
            statLabel: "Daha hızlı içerik üretimi",
            supportingText: "Ekipler artık tek platformda çalışıyor.",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "product",
        html: renderProductEditorial(
          { imageUrl: avatarDataUri, title: "Özel Seri Kahve", description: "Küçük partiler halinde özenle kavrulur.", ...common },
          tokens
        ),
      },
      {
        type: "testimonial",
        html: renderTestimonialEditorial(
          {
            testimonialText: "Kurulumdan bir hafta sonra tüm ekibimiz aynı sistemden çalışıyordu.",
            customerName: "Ayşe Kaya",
            customerRole: "Pazarlama Direktörü",
            customerAvatarUrl: avatarDataUri,
            rating: 5,
            ...common,
          },
          tokens
        ),
      },
      {
        type: "comparison",
        html: renderComparisonEditorial(
          {
            leftLabel: "Eski Yöntem",
            leftText: "Saatler süren manuel tasarım ve dağınık notlar arasında kaybolmak.",
            rightLabel: "Tentamark",
            rightText: "Marka DNA'sına uygun otonom taslaklar ve tek tıkla onay.",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "event",
        html: renderEventEditorial(
          {
            eventTitle: "Ürün Lansmanı: Sonbahar Koleksiyonu",
            dateText: "28 Eylül Pazartesi • 20:00",
            speaker1Name: "Ayşe Kaya",
            speaker1Role: "Kurucu & CEO",
            speaker1AvatarUrl: avatarDataUri,
            speaker2Name: "Mert Demir",
            speaker2Role: "Ürün Direktörü",
            speaker2AvatarUrl: avatarDataUri,
            badgeText: "CANLI YAYIN 🔴",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "changelog",
        html: renderChangelogEditorial(
          {
            badge: "v2.4 Yayında",
            title: "Sahne bazlı yeniden üretim geldi",
            description: "Tüm videoyu yeniden oluşturmadan tek bir sahneyi düzenleyin.",
            codeSnippet: "POST /api/video/scenes/:id/regenerate",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "checklist",
        html: renderChecklistEditorial(
          {
            title: "Yayına hazır bir gönderi için kontrol listesi",
            subtitle: "ADIM ADIM REHBER",
            items: [
              "Marka renkleri ve fontu doğru mu?",
              "Görsel metinle çakışmıyor mu?",
              "CTA net ve tek bir eylem mi?",
            ],
            ...common,
          },
          tokens
        ),
      },
      {
        type: "featuretable",
        html: renderFeatureTableEditorial(
          {
            title: "Neden Tentamark?",
            feature1: "Kurulum süresi",
            competitor1: "2-3 hafta",
            tentamark1: "10 dakika",
            feature2: "Marka tutarlılığı",
            competitor2: "Manuel kontrol",
            tentamark2: "Otomatik",
            feature3: "Aylık maliyet",
            competitor3: "₺15.000+",
            tentamark3: "₺990'dan başlar",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "matrix",
        html: renderMatrixEditorial(
          {
            title: "İçerik Stratejisi Matrisi",
            q1Label: "Hızlı & Kolay",
            q1Text: "Hazır şablonlar, tek tık üretim.",
            q2Label: "Hızlı & Zor",
            q2Text: "Özel animasyonlar, video düzenleme.",
            q3Label: "Yavaş & Kolay",
            q3Text: "Manuel tasarım, basit araçlar.",
            q4Label: "Yavaş & Zor",
            q4Text: "Ekip koordinasyonu, çoklu onay.",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "thisorthat",
        html: renderThisOrThatEditorial(
          {
            question: "Hangisi markanı daha iyi anlatıyor?",
            optionA: "Sade ve minimal bir görsel dil",
            optionB: "Enerjik ve renkli bir görsel dil",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "carousel",
        html: renderCarouselCoverEditorial(
          { title: "Sosyal Medyada Büyümenin 3 Altın Kuralı", items: [], ...common },
          5,
          tokens
        ),
      },
      {
        type: "trend",
        html: renderTrendEditorial(
          { statNumber: "%94", statLabel: "Zaman Tasarrufu", trendPoints: [10, 22, 18, 34, 40, 52, 61, 78], ...common },
          tokens
        ),
      },
      {
        type: "problemsolution",
        html: renderProblemSolutionEditorial(
          {
            problem: "İçerik üretimi haftalar sürüyor, ekipler dağınık araçlar kullanıyor.",
            solution: "Tentamark ile marka DNA'sına uygun içerik dakikalar içinde hazır.",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "notification",
        html: renderNotificationLight(
          { headline: "Yeni gönderin onaylandı!", subtext: "Instagram'da yayına hazır.", ...common },
          tokens
        ),
      },
      {
        type: "socialpost",
        html: renderSocialPost(
          { text: "Bugün markanız için yeni bir içerik planı hazırladık. Takvimde inceleyebilirsiniz.", ...common },
          tokens
        ),
      },
      {
        type: "chat",
        html: renderChatIos(
          {
            senderName: "Mutlu Müşteri",
            incomingMessage: "Siparişim ne zaman kargoya verilir acaba?",
            outgoingMessage: "Tüm siparişlerimiz aynı gün kargoda! 🚀",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "notes",
        html: renderNotesNotion(
          {
            noteTitle: "İçerik Stratejisi Notları",
            content: "Bu ay odak: marka tutarlılığı ve yayın sıklığı.",
            dateLabel: "27 Eylül 2026",
            ...common,
          },
          tokens
        ),
      },
      {
        type: "coupon",
        html: renderCouponModern(
          { discountText: "%30 İNDİRİM", couponCode: "TENTA30", headline: "Büyük Sezon Sonu İndirimi Başladı", ...common },
          tokens
        ),
      },
      {
        type: "podcast",
        html: renderPodcastNeonPurple(
          { title: "Büyüme Sırları", hostImageUrl: avatarDataUri, hostName: "Ayşe Kaya", ...common },
          tokens
        ),
      },
      {
        type: "photoreview",
        html: renderPhotoReviewWarmEditorial(
          {
            bgImageUrl: avatarDataUri,
            headerText: "Müşterilerimiz Ne Diyor?",
            reviewText: "Kokusu paketi açar açmaz bütün mutfağı sardı.",
            customerName: "Doğrulanmış Müşteri",
            rating: 5,
            ...common,
          },
          tokens
        ),
      },
      {
        type: "deal",
        html: renderDealLifestyleSplit(
          {
            productImageUrl: avatarDataUri,
            title: "Özel Seri Kahve",
            priceText: "₺349",
            features: ["Taze Kavrum", "Hızlı Kargo", "%100 Doğal"],
            ...common,
          },
          tokens
        ),
      },
      {
        type: "newsflash",
        html: renderNewsFlashBreakingRed(
          { bgImageUrl: avatarDataUri, badgeText: "🔴 SON DAKİKA", headline: "Yeni koleksiyon şimdi satışta", ...common },
          tokens
        ),
      },
    ];

    for (const render of renders) {
      const buffer = await renderHtmlToImage(render.html, dimensions);
      const outPath = path.join(dir, `${render.type}.png`);
      await writeFile(outPath, buffer);
      console.log(`Wrote ${outPath}`);
    }
  }

  console.log("\nDone. Inspect the PNGs under scripts/design-token-fixtures/output/.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeBrowserPool());

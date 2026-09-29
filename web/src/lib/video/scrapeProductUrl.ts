import { resolveAndValidateUrl, extractSignals } from "@/lib/brand/htmlSignals";

const FETCH_TIMEOUT_MS = 10000;
const MAX_IMAGES = 5;

export type ScrapedProduct = {
  title: string;
  description: string;
  price: string | null;
  imageUrls: string[];
  review: { quote: string; author: string; rating: number } | null;
};

function flattenLdNodes(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) return parsed.flatMap((n) => flattenLdNodes(n));
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj["@graph"])) return flattenLdNodes(obj["@graph"]);
    return [obj];
  }
  return [];
}

function normalizeImages(raw: unknown): string[] {
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === "string" ? v : v && typeof v === "object" ? String((v as Record<string, unknown>).url ?? "") : ""))
      .filter(Boolean);
  }
  if (raw && typeof raw === "object") {
    const url = (raw as Record<string, unknown>).url;
    return typeof url === "string" ? [url] : [];
  }
  return [];
}

type LdProduct = {
  name?: string;
  description?: string;
  images: string[];
  price?: string;
  currency?: string;
  review?: { quote: string; author: string; rating: number };
};

// schema.org Product/Offer markup — what every mainstream e-commerce
// platform (Shopify, WooCommerce, Trendyol-style storefronts...) already
// emits for Google's own product rich results, so it's a reliable,
// deterministic signal rather than something an AI has to guess from prose.
function extractLdJsonProducts(html: string): LdProduct[] {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const products: LdProduct[] = [];
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1].trim());
    } catch {
      continue;
    }
    for (const node of flattenLdNodes(parsed)) {
      const type = node["@type"];
      const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
      if (!isProduct) continue;
      const offersRaw = node.offers;
      const offer = Array.isArray(offersRaw) ? offersRaw[0] : offersRaw;
      const offerObj = offer && typeof offer === "object" ? (offer as Record<string, unknown>) : null;
      const reviewsRaw = Array.isArray(node.review) ? node.review : node.review ? [node.review] : [];
      const reviewObj = reviewsRaw[0] && typeof reviewsRaw[0] === "object" ? (reviewsRaw[0] as Record<string, unknown>) : null;
      const authorRaw = reviewObj?.author;
      const author = typeof authorRaw === "string"
        ? authorRaw
        : authorRaw && typeof authorRaw === "object" && typeof (authorRaw as Record<string, unknown>).name === "string"
          ? String((authorRaw as Record<string, unknown>).name)
          : "Doğrulanmış müşteri";
      const ratingRaw = reviewObj?.reviewRating;
      const ratingObj = ratingRaw && typeof ratingRaw === "object" ? (ratingRaw as Record<string, unknown>) : null;
      const rating = Math.max(1, Math.min(5, Number(ratingObj?.ratingValue ?? 5) || 5));
      const reviewBody = typeof reviewObj?.reviewBody === "string" ? reviewObj.reviewBody.trim() : "";
      products.push({
        name: typeof node.name === "string" ? node.name : undefined,
        description: typeof node.description === "string" ? node.description : undefined,
        images: normalizeImages(node.image),
        price: offerObj && offerObj.price !== undefined && offerObj.price !== null ? String(offerObj.price) : undefined,
        currency: offerObj && typeof offerObj.priceCurrency === "string" ? offerObj.priceCurrency : undefined,
        review: reviewBody ? { quote: reviewBody.slice(0, 220), author, rating } : undefined,
      });
    }
  }
  return products;
}

function resolveImageUrl(raw: string, pageUrl: URL): string | null {
  try {
    return new URL(raw, pageUrl).toString();
  } catch {
    return null;
  }
}

/*
  Deterministic product-page extraction — no AI call here on purpose. The
  actual ad-style copywriting already happens downstream in
  buildVideoInputProps.ts's generateSceneCopy(), fed by this function's
  plain `title/price/description` text — adding a second AI call here would
  just double the cost for no benefit. This function's only job is pulling
  real, structured facts (schema.org Product markup first, meta tags as
  fallback) so that downstream text isn't inventing a price that was never
  actually on the page.
*/
export async function scrapeProductUrl(rawUrl: string): Promise<ScrapedProduct> {
  const url = await resolveAndValidateUrl(rawUrl);

  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error("Ürün sayfası açılamadı.");

  const html = await res.text();
  const signals = extractSignals(html);
  const ldProducts = extractLdJsonProducts(html);
  const primary = ldProducts[0];

  const title = primary?.name || signals.ogTitle || signals.title || "";
  const description = primary?.description || signals.ogDescription || signals.description || "";
  const price = primary?.price ? `${primary.price}${primary.currency ? ` ${primary.currency}` : ""}` : null;

  const rawImages = ldProducts.flatMap((p) => p.images);
  if (rawImages.length === 0 && signals.ogTitle) {
    const ogImageMatch = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(html);
    if (ogImageMatch?.[1]) rawImages.push(ogImageMatch[1]);
  }

  const imageUrls = Array.from(
    new Set(rawImages.map((img) => resolveImageUrl(img, url)).filter((v): v is string => Boolean(v)))
  ).slice(0, MAX_IMAGES);

  if (!title && !description && imageUrls.length === 0) {
    throw new Error("Sayfada ürün bilgisi bulunamadı. Sayfa gerçekten bir ürün sayfası mı kontrol edin.");
  }

  return { title, description, price, imageUrls, review: primary?.review ?? null };
}

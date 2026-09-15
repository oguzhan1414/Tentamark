/*
  WooCommerce has no central developer portal the way Canva/Meta/Google do —
  each store generates its own Consumer Key/Secret from its own WordPress
  admin (WooCommerce → Settings → Advanced → REST API), and every store IS
  its own API host (there's no single api.woocommerce.com to call).

  NOT verified against a real live store (none was available while building
  this — see the Bluesky/WooCommerce rollout conversation). The endpoint
  namespace (/wp-json/wc/v3/) and Basic Auth approach are extremely stable,
  long-standing WooCommerce/WordPress REST API conventions and unlikely to
  have changed, but the exact product field shapes below should be treated
  as best-effort until confirmed against a real store.
*/

export type WooCommerceProduct = {
  id: number;
  name: string;
  permalink: string;
  price: string;
  regular_price: string;
  description: string;
  short_description: string;
  images: { src: string }[];
};

function normalizeStoreUrl(url: string): string {
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/+$/, "");
}

function authHeader(consumerKey: string, consumerSecret: string): string {
  return `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;
}

/*
  Strips HTML tags WooCommerce leaves in description/short_description
  (they're stored as post content, rendered as HTML) — Compose's "idea"
  field is plain text, not a rich-text editor.
*/
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function verifyWooCommerceConnection(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<{ storeName: string | null }> {
  const base = normalizeStoreUrl(storeUrl);

  const res = await fetch(`${base}/wp-json/wc/v3/products?per_page=1`, {
    headers: { Authorization: authHeader(consumerKey, consumerSecret) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Mağazaya bağlanılamadı (HTTP ${res.status}). URL ve API anahtarlarını kontrol et.`);
  }

  // Best-effort — WordPress's own public REST discovery root (no auth
  // needed) returns the site name; a failure here shouldn't fail the whole
  // connection since the product check above already proved it works.
  let storeName: string | null = null;
  try {
    const rootRes = await fetch(`${base}/wp-json`);
    const root = await rootRes.json().catch(() => null);
    storeName = typeof root?.name === "string" ? root.name : null;
  } catch {
    // ignore — cosmetic only
  }

  return { storeName };
}

export async function fetchWooCommerceProducts(opts: {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  search?: string;
}): Promise<WooCommerceProduct[]> {
  const base = normalizeStoreUrl(opts.storeUrl);
  const url = new URL(`${base}/wp-json/wc/v3/products`);
  url.searchParams.set("per_page", "24");
  url.searchParams.set("status", "publish");
  if (opts.search) url.searchParams.set("search", opts.search);

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader(opts.consumerKey, opts.consumerSecret) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message ?? "Ürünler alınamadı.");
  }
  return (Array.isArray(json) ? json : []) as WooCommerceProduct[];
}

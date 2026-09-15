import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { decryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";
import { fetchWooCommerceProducts } from "@/lib/woocommerce/client";

// Product data goes through the server so the Consumer Secret never reaches
// the browser — the client only ever sees the resulting product list.
export async function GET(request: Request) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  const supabase = await createClient();
  const { data: conn } = await supabase
    .from("woocommerce_connections")
    .select("store_url, consumer_key_encrypted, consumer_secret_encrypted, status")
    .eq("brand_id", brand.id)
    .maybeSingle();

  if (!conn || conn.status !== "active") {
    return NextResponse.json({ error: "WooCommerce bağlı değil.", code: "not_connected" }, { status: 409 });
  }

  const search = new URL(request.url).searchParams.get("search") ?? undefined;

  try {
    const products = await fetchWooCommerceProducts({
      storeUrl: conn.store_url,
      consumerKey: decryptToken(conn.consumer_key_encrypted, brand.id),
      consumerSecret: decryptToken(conn.consumer_secret_encrypted, brand.id),
      search,
    });
    return NextResponse.json({ products });
  } catch (err) {
    console.error("WooCommerce products fetch failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Ürünler alınamadı." }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto/tokenCipher";
import { createClient } from "@/lib/supabase/server";
import { verifyWooCommerceConnection } from "@/lib/woocommerce/client";

/*
  No OAuth — same shape as Telegram/Bluesky's connect routes: a plain form
  POST with credentials the merchant generates themselves (WooCommerce ->
  Settings -> Advanced -> REST API on their own store), proven real by
  actually calling the store's API before anything gets saved.
*/
export async function POST(request: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const storeUrl = typeof body?.storeUrl === "string" ? body.storeUrl.trim() : "";
  const consumerKey = typeof body?.consumerKey === "string" ? body.consumerKey.trim() : "";
  const consumerSecret = typeof body?.consumerSecret === "string" ? body.consumerSecret.trim() : "";
  if (!storeUrl || !consumerKey || !consumerSecret) {
    return NextResponse.json({ error: "Mağaza URL'si, Consumer Key ve Consumer Secret gerekli." }, { status: 400 });
  }

  let storeName: string | null;
  try {
    const result = await verifyWooCommerceConnection(storeUrl, consumerKey, consumerSecret);
    storeName = result.storeName;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Mağazaya bağlanılamadı." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error: saveError } = await supabase.from("woocommerce_connections").upsert(
    {
      brand_id: brand.id,
      store_url: storeUrl,
      store_name: storeName,
      consumer_key_encrypted: encryptToken(consumerKey, brand.id),
      consumer_secret_encrypted: encryptToken(consumerSecret, brand.id),
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "brand_id" }
  );
  if (saveError) {
    console.error("woocommerce_connections upsert failed:", saveError.message);
    return NextResponse.json({ error: "Doğrulandı ama veritabanına kaydedilemedi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, storeName });
}

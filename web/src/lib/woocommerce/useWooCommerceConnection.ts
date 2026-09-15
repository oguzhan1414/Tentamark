"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Same shape as useCanvaConnection — its own tiny table/hook because
// WooCommerce isn't a publish target either, just a connected data source.
export function useWooCommerceConnection(brandId: string) {
  const [connected, setConnected] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("woocommerce_connections")
        .select("store_name")
        .eq("brand_id", brandId)
        .eq("status", "active")
        .maybeSingle();
      if (ignore) return;
      setConnected(Boolean(data));
      setStoreName(data?.store_name ?? null);
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [brandId]);

  return { connected, storeName, loading };
}

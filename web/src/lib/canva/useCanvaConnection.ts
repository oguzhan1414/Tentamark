"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Deliberately its own tiny table/hook rather than reusing social_accounts —
// Canva isn't a publish target (no SocialProvider, no capabilities), just a
// design tool a brand connects once. See supabase/patches/0031.
export function useCanvaConnection(brandId: string) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("canva_connections")
        .select("id")
        .eq("brand_id", brandId)
        .eq("status", "active")
        .maybeSingle();
      if (ignore) return;
      setConnected(Boolean(data));
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [brandId]);

  return { connected, loading };
}

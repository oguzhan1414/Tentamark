"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MediaLibraryItem = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  alt_text: string | null;
};

/*
  Shared between MediaLibraryModal (the picker inside ComposeForm) and
  CalendarMediaPanel (the docked browse/drag-to-schedule panel) — same
  fetch/upload/rename, two different presentations. `enabled` lets a caller
  defer the first fetch until the panel is actually opened; once loaded, it
  stays cached for the component's lifetime instead of refetching on every
  open/close.
*/
export function useMediaLibrary(brandId: string, enabled = true) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || loaded) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("media")
        .select("id, file_name, file_url, file_type, alt_text")
        .eq("brand_id", brandId)
        // Per-platform crop variants (see createCroppedMediaVariant) aren't
        // something anyone meant to browse or reuse — only the original
        // they were cropped from belongs in the picker.
        .is("derived_from_media_id", null)
        .order("created_at", { ascending: false })
        .limit(60);
      if (ignore) return;
      if (fetchError) setError(fetchError.message);
      setItems((data ?? []) as MediaLibraryItem[]);
      setLoading(false);
      setLoaded(true);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brandId, enabled, loaded]);

  async function rename(id: string, label: string) {
    const trimmed = label.trim();
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, alt_text: trimmed || null } : m)));
    const { error: renameError } = await supabase.from("media").update({ alt_text: trimmed || null }).eq("id", id);
    if (renameError) console.error("Medya etiketi kaydedilemedi:", renameError.message);
  }

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const path = `${brandId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
      const { data: mediaRow, error: mediaError } = await supabase
        .from("media")
        .insert({
          brand_id: brandId,
          file_name: file.name,
          file_url: publicUrl.publicUrl,
          file_type: file.type,
          file_size: file.size,
        })
        .select("id, file_name, file_url, file_type, alt_text")
        .single();
      if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Medya kaydedilemedi.");

      setItems((prev) => [mediaRow as MediaLibraryItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  // For media created server-side (e.g. /api/canva/design/finalize, which
  // downloads a Canva export and inserts it into `media` itself) — the row
  // already exists, this just makes it show up without a refetch.
  function addItem(item: MediaLibraryItem) {
    setItems((prev) => [item, ...prev]);
  }

  return { items, loading, uploading, error, upload, addItem, rename };
}

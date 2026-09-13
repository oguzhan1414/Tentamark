"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MediaLibraryItem = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
};

type Props = {
  brandId: string;
  onSelect: (media: MediaLibraryItem) => void;
  onClose: () => void;
};

/*
  Browse-and-reuse picker over the existing `media` table — nothing here is
  new AT THE DATA LAYER (ComposeForm already uploads into `media` +
  Storage's `media` bucket), the gap was purely UI: there was no way to see
  or reuse anything uploaded before. Upload-from-here writes through the
  exact same Storage path + `media` insert shape ComposeForm already uses.

  No delete here on purpose — `content_media.media_id` cascades on delete,
  so removing a library item would silently blank out the image on any
  existing post that used it. Not worth that risk for a v1 picker.
*/
export default function MediaLibraryModal({ brandId, onSelect, onClose }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("media")
        .select("id, file_name, file_url, file_type")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false })
        .limit(60);
      if (ignore) return;
      if (fetchError) setError(fetchError.message);
      setItems((data ?? []) as MediaLibraryItem[]);
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brandId]);

  async function handleUpload(file: File) {
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
        .select("id, file_name, file_url, file_type")
        .single();
      if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Medya kaydedilemedi.");

      setItems((prev) => [mediaRow as MediaLibraryItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <span className="text-sm font-bold text-slate-900">Medya Kütüphanesi</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-100 px-5 py-3">
          <label
            htmlFor="media_library_upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-600 transition"
          >
            {uploading ? "Yükleniyor..." : "+ Yeni Dosya Yükle"}
            <input
              id="media_library_upload"
              type="file"
              accept="image/*,video/mp4,video/webm"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
          </label>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-center text-xs text-slate-400">Yükleniyor...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-xs text-slate-400">Henüz yüklenmiş medya yok — yukarıdan ekleyebilirsin.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition hover:ring-2 hover:ring-rose-400"
                  title={m.file_name}
                >
                  {m.file_type.startsWith("video/") ? (
                    <video src={m.file_url} muted className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.file_url} alt={m.file_name} className="h-full w-full object-cover" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] font-bold text-transparent transition group-hover:bg-black/40 group-hover:text-white">
                    Seç
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

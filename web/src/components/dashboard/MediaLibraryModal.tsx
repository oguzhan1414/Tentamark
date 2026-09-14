"use client";

import { useState } from "react";
import { useMediaLibrary, type MediaLibraryItem } from "@/lib/media/useMediaLibrary";

export type { MediaLibraryItem };

type Props = {
  brandId: string;
  // Omitted when opened standalone — browse/upload/label only, nothing to
  // hand back to a caller. (Calendar now uses the docked CalendarMediaPanel
  // instead, but this stays the picker ComposeForm opens mid-form.)
  onSelect?: (media: MediaLibraryItem) => void;
  onClose: () => void;
};

type MediaFilter = "all" | "image" | "video";

/*
  Browse-and-reuse picker over the existing `media` table — nothing here is
  new AT THE DATA LAYER (ComposeForm already uploads into `media` +
  Storage's `media` bucket), the gap was purely UI: there was no way to see
  or reuse anything uploaded before. Upload-from-here writes through the
  exact same Storage path + `media` insert shape ComposeForm already uses.

  No delete here on purpose — `content_media.media_id` cascades on delete,
  so removing a library item would silently blank out the image on any
  existing post that used it. Not worth that risk for a v1 picker.

  Each item's label (media.alt_text) is user-editable — the point is being
  able to tell the AI "use the one labeled X" later, not just recognize
  thumbnails by eye.
*/
export default function MediaLibraryModal({ brandId, onSelect, onClose }: Props) {
  const { items, loading, uploading, error, upload, rename } = useMediaLibrary(brandId);
  const [filter, setFilter] = useState<MediaFilter>("all");

  const filteredItems = items.filter((m) =>
    filter === "all" ? true : filter === "video" ? m.file_type.startsWith("video/") : !m.file_type.startsWith("video/")
  );

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

        <div className="shrink-0 border-b border-slate-100 px-5 py-3 space-y-2.5">
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
                if (file) upload(file);
                e.target.value = "";
              }}
            />
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-semibold w-fit">
            {([
              { key: "all", label: "Tümü" },
              { key: "image", label: "Fotoğraf" },
              { key: "video", label: "Video" },
            ] as const).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-3 py-1 transition cursor-pointer ${
                  filter === f.key ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-center text-xs text-slate-400">Yükleniyor...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400">
              {items.length === 0 ? "Henüz yüklenmiş medya yok — yukarıdan ekleyebilirsin." : "Bu filtrede medya yok."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filteredItems.map((m) => (
                <div key={m.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => onSelect?.(m)}
                    disabled={!onSelect}
                    className={`group relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition ${
                      onSelect ? "hover:ring-2 hover:ring-rose-400 cursor-pointer" : "cursor-default"
                    }`}
                    title={m.alt_text || m.file_name}
                  >
                    {m.file_type.startsWith("video/") ? (
                      <video src={m.file_url} muted className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.file_url} alt={m.alt_text || m.file_name} className="h-full w-full object-cover" />
                    )}
                    {onSelect && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] font-bold text-transparent transition group-hover:bg-black/40 group-hover:text-white">
                        Seç
                      </span>
                    )}
                  </button>
                  <input
                    type="text"
                    defaultValue={m.alt_text ?? ""}
                    placeholder="Etiket ekle..."
                    onBlur={(e) => {
                      if (e.target.value.trim() !== (m.alt_text ?? "")) rename(m.id, e.target.value);
                    }}
                    className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-700 placeholder-slate-400 focus:border-rose-300 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

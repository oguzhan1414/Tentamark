"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaLibrary, type MediaLibraryItem } from "@/lib/media/useMediaLibrary";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";

export type { MediaLibraryItem };

type Props = {
  brandId: string;
  // Omitted when opened standalone — browse/upload/label only, nothing to
  // hand back to a caller. (Calendar now uses the docked CalendarMediaPanel
  // instead, but this stays the picker ComposeForm opens mid-form.)
  onSelect?: (media: MediaLibraryItem) => void;
  // Checkbox multi-select mode (for building an Instagram/Facebook
  // carousel) — mutually exclusive with onSelect. Locked to images only:
  // a carousel that mixes in video needs a different Graph API shape per
  // child (media_type=VIDEO vs image_url) that ComposeForm doesn't build,
  // so video stays single-select-only via onSelect.
  multiple?: boolean;
  onSelectMultiple?: (media: MediaLibraryItem[]) => void;
  // Remaining carousel slots (10 - already attached) — once reached,
  // unselected items are disabled rather than silently ignored on submit.
  maxSelectable?: number;
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
export default function MediaLibraryModal({
  brandId,
  onSelect,
  multiple = false,
  onSelectMultiple,
  maxSelectable,
  onClose,
}: Props) {
  const { items, loading, uploading, error, upload, addItem, rename } = useMediaLibrary(brandId);
  const { connected: canvaConnected } = useCanvaConnection(brandId);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [canvaBusy, setCanvaBusy] = useState(false);
  const [canvaError, setCanvaError] = useState<string | null>(null);
  const canvaPopupRef = useRef<Window | null>(null);

  // "Canva ile Tasarla": open a blank design in a popup, wait for
  // /api/canva/design/return to postMessage the finished design's id back
  // once the user clicks Done in Canva, then export+import it as a normal
  // media item. The listener stays mounted for the modal's lifetime so it
  // still catches the message if the popup finishes after a slow export.
  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "canva-design-complete") return;
      const designId = event.data.designId;
      if (typeof designId !== "string") return;

      setCanvaBusy(true);
      setCanvaError(null);
      try {
        const res = await fetch("/api/canva/design/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tasarım içeri aktarılamadı.");
        addItem(data.media as MediaLibraryItem);
      } catch (err) {
        setCanvaError(err instanceof Error ? err.message : "Tasarım içeri aktarılamadı.");
      } finally {
        setCanvaBusy(false);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [addItem]);

  async function handleCanvaClick() {
    setCanvaError(null);
    // Open the popup synchronously (before the await) so browsers don't
    // treat it as an unrequested popup and block it.
    const popup = window.open("about:blank", "canva-editor", "width=1200,height=850");
    canvaPopupRef.current = popup;
    try {
      const res = await fetch("/api/canva/design/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Canva tasarımı başlatılamadı.");
      if (popup) popup.location.href = data.editUrl;
    } catch (err) {
      popup?.close();
      setCanvaError(err instanceof Error ? err.message : "Canva tasarımı başlatılamadı.");
    }
  }

  // Carousel building has no video story yet (see the `multiple` prop
  // comment) — the filter toggle would just let someone check a video that
  // silently never makes it into the post, so it's hidden entirely instead.
  const filteredItems = multiple
    ? items.filter((m) => !m.file_type.startsWith("video/"))
    : items.filter((m) =>
        filter === "all" ? true : filter === "video" ? m.file_type.startsWith("video/") : !m.file_type.startsWith("video/")
      );

  const atLimit = maxSelectable !== undefined && checked.size >= maxSelectable;

  function toggleChecked(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (maxSelectable !== undefined && next.size >= maxSelectable) return prev;
        next.add(id);
      }
      return next;
    });
  }

  function confirmSelection() {
    const selected = filteredItems.filter((m) => checked.has(m.id));
    if (selected.length > 0) onSelectMultiple?.(selected);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <span className="text-sm font-bold text-slate-900">
            {multiple ? "Medyadan Seç" : "Medya Kütüphanesi"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-100 px-5 py-3 space-y-2.5">
          <div className="flex gap-2">
            <label
              htmlFor="media_library_upload"
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-600 transition"
            >
              {uploading ? "Yükleniyor..." : "+ Yeni Dosya Yükle"}
              <input
                id="media_library_upload"
                type="file"
                accept={multiple ? "image/*" : "image/*,video/mp4,video/webm"}
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                  e.target.value = "";
                }}
              />
            </label>

            {canvaConnected ? (
              <button
                type="button"
                onClick={handleCanvaClick}
                disabled={canvaBusy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50 py-2.5 text-xs font-semibold text-violet-700 hover:border-violet-400 hover:bg-violet-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {canvaBusy ? "Tasarım alınıyor..." : "🎨 Canva ile Tasarla"}
              </button>
            ) : (
              <a
                href="/settings?tab=baglantilar"
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-400 hover:border-violet-300 hover:text-violet-600 transition"
                title="Canva ile tasarlamak için önce Ayarlar'dan bağlayın"
              >
                🎨 Canva&apos;yı Bağla
              </a>
            )}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {canvaError && <p className="text-xs text-red-600">{canvaError}</p>}

          {multiple ? (
            <p className="text-[11px] text-slate-500">
              Sadece fotoğraf seçilebilir — video, carousel gönderilerde henüz desteklenmiyor.
              {maxSelectable !== undefined && ` En fazla ${maxSelectable} görsel daha ekleyebilirsin.`}
            </p>
          ) : (
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
          )}
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
              {filteredItems.map((m) => {
                const isChecked = checked.has(m.id);
                const disabled = multiple && !isChecked && atLimit;
                return (
                  <div key={m.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => (multiple ? toggleChecked(m.id) : onSelect?.(m))}
                      disabled={multiple ? disabled : !onSelect}
                      className={`group relative aspect-square w-full overflow-hidden rounded-xl border bg-slate-100 transition ${
                        isChecked
                          ? "border-rose-400 ring-2 ring-rose-400"
                          : disabled
                            ? "border-slate-200 opacity-40 cursor-not-allowed"
                            : "border-slate-200"
                      } ${(multiple ? !disabled : Boolean(onSelect)) ? "hover:ring-2 hover:ring-rose-400 cursor-pointer" : "cursor-default"}`}
                      title={m.alt_text || m.file_name}
                    >
                      {m.file_type.startsWith("video/") ? (
                        <video src={m.file_url} muted className="h-full w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.file_url} alt={m.alt_text || m.file_name} className="h-full w-full object-cover" />
                      )}
                      {multiple ? (
                        <span
                          className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition ${
                            isChecked
                              ? "border-rose-500 bg-rose-500 text-white"
                              : "border-white/80 bg-black/30 text-transparent group-hover:bg-black/50"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </span>
                      ) : (
                        onSelect && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] font-bold text-transparent transition group-hover:bg-black/40 group-hover:text-white">
                            Seç
                          </span>
                        )
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
                );
              })}
            </div>
          )}
        </div>

        {multiple && (
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-800">{checked.size} seçildi</span>
              {filteredItems.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setChecked(new Set(filteredItems.slice(0, maxSelectable ?? filteredItems.length).map((m) => m.id)))
                  }
                  className="font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Tümünü seç
                </button>
              )}
              {checked.size > 0 && (
                <button
                  type="button"
                  onClick={() => setChecked(new Set())}
                  className="font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Temizle
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={confirmSelection}
              disabled={checked.size === 0}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Gönderiye Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useMediaLibrary, type MediaLibraryItem } from "@/lib/media/useMediaLibrary";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";
import { useCanvaDesignFlow } from "@/lib/canva/useCanvaDesignFlow";
import { useLanguage } from "@/context/LanguageContext";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";

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
  const { t, isEn } = useLanguage();
  const ml = t.dashboard.mediaLibrary;
  const { items, loading, uploading, error, uploadMany, remove, removeMany, addItem, rename } = useMediaLibrary(brandId);
  const { connected: canvaConnected } = useCanvaConnection(brandId);
  const { busy: canvaBusy, error: canvaError, start: handleCanvaClick } = useCanvaDesignFlow(addItem);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [zoomedItem, setZoomedItem] = useState<MediaLibraryItem | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<MediaLibraryItem | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  async function performDelete(item: MediaLibraryItem) {
    setDeleteNotice(null);
    setDeletingId(item.id);
    const result = await remove(item.id);
    setDeletingId(null);
    if (result.inUseCount) {
      setDeleteNotice(
        isEn
          ? `Can't delete — this is used in ${result.inUseCount} post${result.inUseCount > 1 ? "s" : ""}. Remove it from ${result.inUseCount > 1 ? "those posts" : "that post"} first.`
          : `Silinemedi — bu görsel ${result.inUseCount} gönderide kullanılıyor. Önce o gönderi${result.inUseCount > 1 ? "lerden" : "den"} kaldırmanız gerekiyor.`
      );
    } else if (result.error) {
      setDeleteNotice(result.error);
    }
  }

  async function performBulkDelete() {
    const ids = Array.from(checked);
    if (ids.length === 0) return;
    setDeleteNotice(null);
    setBulkDeleting(true);
    const { deletedCount, blockedCount } = await removeMany(ids);
    setBulkDeleting(false);
    setChecked(new Set());
    if (blockedCount > 0) {
      setDeleteNotice(
        isEn
          ? `Deleted ${deletedCount}. ${blockedCount} couldn't be deleted because ${blockedCount > 1 ? "they're" : "it's"} used in an existing post.`
          : `${deletedCount} görsel silindi. ${blockedCount} görsel mevcut bir gönderide kullanıldığı için silinemedi.`
      );
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
            {multiple ? ml.selectTitle : ml.title}
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
              {uploading ? (isEn ? "Uploading..." : "Yükleniyor...") : (isEn ? "+ Upload New File" : "+ Yeni Dosya Yükle")}
              <input
                id="media_library_upload"
                type="file"
                accept={multiple ? "image/*" : "image/*,video/mp4,video/webm"}
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length > 0) uploadMany(files);
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
                {canvaBusy ? (isEn ? "Fetching design..." : "Tasarım alınıyor...") : (isEn ? "🎨 Design with Canva" : "🎨 Canva ile Tasarla")}
              </button>
            ) : (
              <a
                href="/settings?tab=baglantilar"
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-400 hover:border-violet-300 hover:text-violet-600 transition"
                title={isEn ? "Connect from Settings first to design with Canva" : "Canva ile tasarlamak için önce Ayarlar'dan bağlayın"}
              >
                {isEn ? "🎨 Connect Canva" : "🎨 Canva'yı Bağla"}
              </a>
            )}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {canvaError && <p className="text-xs text-red-600">{canvaError}</p>}
          {deleteNotice && <p className="text-xs text-red-600">{deleteNotice}</p>}

          {multiple ? (
            <p className="text-[11px] text-slate-500">
              {isEn
                ? "Only photos can be selected — video is not yet supported for carousel posts."
                : "Sadece fotoğraf seçilebilir — video, carousel gönderilerde henüz desteklenmiyor."}
              {maxSelectable !== undefined &&
                (isEn
                  ? ` You can add up to ${maxSelectable} more image${maxSelectable > 1 ? "s" : ""}.`
                  : ` En fazla ${maxSelectable} görsel daha ekleyebilirsin.`)}
            </p>
          ) : (
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-semibold w-fit">
              {([
                { key: "all", label: ml.tabs.all },
                { key: "image", label: ml.tabs.image },
                { key: "video", label: ml.tabs.video },
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
            <p className="text-center text-xs text-slate-400">{isEn ? "Loading..." : "Yükleniyor..."}</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400">
              {items.length === 0
                ? isEn ? "No uploaded media yet — you can add one above." : "Henüz yüklenmiş medya yok — yukarıdan ekleyebilirsin."
                : isEn ? "No media found for this filter." : "Bu filtrede medya yok."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filteredItems.map((m) => {
                const isChecked = checked.has(m.id);
                const disabled = multiple && !isChecked && atLimit;
                return (
                  <div key={m.id} className="space-y-1">
                    <div
                      className={`group relative aspect-square w-full overflow-hidden rounded-xl border bg-slate-100 transition ${
                        isChecked
                          ? "border-rose-400 ring-2 ring-rose-400"
                          : disabled
                            ? "border-slate-200 opacity-40"
                            : "border-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => (multiple ? toggleChecked(m.id) : onSelect?.(m))}
                        disabled={multiple ? disabled : !onSelect}
                        className={`absolute inset-0 ${
                          (multiple ? !disabled : Boolean(onSelect)) ? "hover:ring-2 hover:ring-rose-400 cursor-pointer" : "cursor-default"
                        }`}
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
                              {isEn ? "Select" : "Seç"}
                            </span>
                          )
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedItem(m);
                        }}
                        aria-label={isEn ? "Enlarge" : "Büyüt"}
                        className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white shadow-sm transition hover:bg-black/70 cursor-pointer"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.2-5.2m1.7-5.3a7 7 0 11-14 0 7 7 0 0114 0zM10.5 7.5v6m-3-3h6" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmTarget(m);
                        }}
                        disabled={deletingId === m.id}
                        aria-label={isEn ? "Delete" : "Sil"}
                        className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                      >
                        {deletingId === m.id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      defaultValue={m.alt_text ?? ""}
                      placeholder={isEn ? "Add tag..." : "Etiket ekle..."}
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
              <span className="font-bold text-slate-800">
                {checked.size} {isEn ? "selected" : "seçildi"}
              </span>
              {filteredItems.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setChecked(new Set(filteredItems.slice(0, maxSelectable ?? filteredItems.length).map((m) => m.id)))
                  }
                  className="font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  {isEn ? "Select all" : "Tümünü seç"}
                </button>
              )}
              {checked.size > 0 && (
                <button
                  type="button"
                  onClick={() => setChecked(new Set())}
                  className="font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  {isEn ? "Clear" : "Temizle"}
                </button>
              )}
              {checked.size > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmBulk(true)}
                  disabled={bulkDeleting}
                  className="font-semibold text-red-600 hover:text-red-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {bulkDeleting
                    ? isEn ? "Deleting..." : "Siliniyor..."
                    : isEn ? `Delete selected (${checked.size})` : `Seçilenleri Sil (${checked.size})`}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={confirmSelection}
              disabled={checked.size === 0}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isEn ? "Add to Post" : "Gönderiye Ekle"}
            </button>
          </div>
        )}
      </div>

      {zoomedItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomedItem(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-6 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setZoomedItem(null)}
            aria-label={isEn ? "Close" : "Kapat"}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white hover:bg-white/20 cursor-pointer"
          >
            ✕
          </button>
          {zoomedItem.file_type.startsWith("video/") ? (
            <video
              src={zoomedItem.file_url}
              controls
              autoPlay
              className="max-h-full max-w-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={zoomedItem.file_url}
              alt={zoomedItem.alt_text || zoomedItem.file_name}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      <ConfirmDiscardDialog
        isOpen={confirmTarget !== null}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => {
          const item = confirmTarget;
          setConfirmTarget(null);
          if (item) performDelete(item);
        }}
        title={isEn ? "Delete this media?" : "Bu görsel silinsin mi?"}
        message={
          confirmTarget
            ? isEn
              ? `"${confirmTarget.alt_text || confirmTarget.file_name}" will be permanently deleted. This cannot be undone.`
              : `"${confirmTarget.alt_text || confirmTarget.file_name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`
            : ""
        }
        badgeLabel={isEn ? "Delete" : "Silme"}
        noticeText=""
        cancelLabel={isEn ? "Cancel" : "Vazgeç"}
        confirmLabel={isEn ? "Delete" : "Sil"}
      />

      <ConfirmDiscardDialog
        isOpen={confirmBulk}
        onCancel={() => setConfirmBulk(false)}
        onConfirm={() => {
          setConfirmBulk(false);
          performBulkDelete();
        }}
        title={isEn ? `Delete ${checked.size} selected item${checked.size > 1 ? "s" : ""}?` : `Seçili ${checked.size} görsel silinsin mi?`}
        message={
          isEn
            ? "These will be permanently deleted. This cannot be undone."
            : "Bu görseller kalıcı olarak silinecek. Bu işlem geri alınamaz."
        }
        badgeLabel={isEn ? "Delete" : "Silme"}
        noticeText=""
        cancelLabel={isEn ? "Cancel" : "Vazgeç"}
        confirmLabel={isEn ? "Delete" : "Sil"}
      />
    </div>
  );
}

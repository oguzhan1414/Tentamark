"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useMediaLibrary, type MediaLibraryItem } from "@/lib/media/useMediaLibrary";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";
import { useCanvaDesignFlow } from "@/lib/canva/useCanvaDesignFlow";
import { useLanguage } from "@/context/LanguageContext";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";

type Props = {
  brandId: string;
  isOpen: boolean;
  onClose: () => void;
};

type MediaFilter = "all" | "image" | "video";

const PANEL_WIDTH = 320;

function DraggableThumb({
  item,
  isSelected,
  selectedItems,
  onToggle,
  onRename,
  onZoom,
  onDelete,
  deleting,
  isEn,
}: {
  item: MediaLibraryItem;
  isSelected: boolean;
  selectedItems: MediaLibraryItem[];
  onToggle: (id: string) => void;
  onRename: (id: string, label: string) => void;
  onZoom: (item: MediaLibraryItem) => void;
  onDelete: (item: MediaLibraryItem) => void;
  deleting: boolean;
  isEn: boolean;
}) {
  const { t } = useLanguage();
  const mp = t.dashboard.calendar.mediaPanel;
  const isVideo = item.file_type.startsWith("video/");
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `media:${item.id}`,
    data: { type: "media", items: isSelected && selectedItems.length > 1 ? selectedItems : [item] },
  });

  return (
    <div className="space-y-1">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        title={item.alt_text || item.file_name}
        style={
          transform
            ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: isDragging ? 30 : undefined }
            : undefined
        }
        className={`group relative aspect-square w-full touch-none select-none overflow-hidden rounded-xl border bg-slate-100 shadow-2xs transition hover:shadow-sm ${
          isSelected ? "border-rose-400 ring-2 ring-rose-400" : "border-slate-200 hover:border-rose-300"
        } ${isDragging ? "cursor-grabbing opacity-40" : "cursor-grab"}`}
      >
        {isVideo ? (
          <video src={item.file_url} muted className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.file_url} alt={item.alt_text || item.file_name} className="h-full w-full object-cover" />
        )}

        {!isVideo && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
            aria-label={isSelected ? mp.deselect : mp.select}
            className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition ${
              isSelected
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-white/80 bg-black/30 text-transparent opacity-0 group-hover:opacity-100 hover:bg-black/50"
            }`}
          >
            {isSelected ? "✓" : ""}
          </button>
        )}

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onZoom(item);
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
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          disabled={deleting}
          aria-label={isEn ? "Delete" : "Sil"}
          className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50 cursor-pointer"
        >
          {deleting ? (
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
        defaultValue={item.alt_text ?? ""}
        placeholder={mp.addTag}
        onBlur={(e) => {
          if (e.target.value.trim() !== (item.alt_text ?? "")) onRename(item.id, e.target.value);
        }}
        className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-700 placeholder-slate-400 focus:border-rose-300 focus:outline-none"
      />
    </div>
  );
}

export default function CalendarMediaPanel({ brandId, isOpen, onClose }: Props) {
  const { t, isEn } = useLanguage();
  const mp = t.dashboard.calendar.mediaPanel;
  // enabled=isOpen — no fetch until the panel is opened at least once;
  // stays loaded afterwards (see useMediaLibrary), so re-opening is instant.
  const { items, loading, uploading, error, uploadMany, remove, removeMany, addItem, rename } = useMediaLibrary(brandId, isOpen);
  const { connected: canvaConnected } = useCanvaConnection(brandId);
  const { busy: canvaBusy, error: canvaError, start: handleCanvaClick } = useCanvaDesignFlow(addItem);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
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
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setDeleteNotice(null);
    setBulkDeleting(true);
    const { deletedCount, blockedCount } = await removeMany(ids);
    setBulkDeleting(false);
    setSelected(new Set());
    if (blockedCount > 0) {
      setDeleteNotice(
        isEn
          ? `Deleted ${deletedCount}. ${blockedCount} couldn't be deleted because ${blockedCount > 1 ? "they're" : "it's"} used in an existing post.`
          : `${deletedCount} görsel silindi. ${blockedCount} görsel mevcut bir gönderide kullanıldığı için silinemedi.`
      );
    }
  }

  const filteredItems = items.filter((m) =>
    filter === "all" ? true : filter === "video" ? m.file_type.startsWith("video/") : !m.file_type.startsWith("video/")
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedItems = items.filter((m) => selected.has(m.id));

  return (
    <div
      className="shrink-0 overflow-hidden border-l border-slate-200 bg-white transition-[width] duration-300 ease-in-out"
      style={{ width: isOpen ? PANEL_WIDTH : 0 }}
    >
      <div className="flex h-full flex-col" style={{ width: PANEL_WIDTH }}>
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <span className="text-sm font-bold text-slate-900">{mp.title}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-100 px-4 py-3 space-y-2.5">
          <p className="text-[11px] text-slate-400">
            {mp.dragDropHint}
          </p>

          {selected.size > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-rose-700">
                {selected.size} {mp.selectedCount}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                >
                  {mp.clear}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBulk(true)}
                  disabled={bulkDeleting}
                  className="text-[11px] font-semibold text-red-700 hover:text-red-900 transition disabled:opacity-50 cursor-pointer"
                >
                  {bulkDeleting ? (isEn ? "Deleting..." : "Siliniyor...") : isEn ? "Delete" : "Sil"}
                </button>
              </div>
            </div>
          )}

          <label
            htmlFor="calendar_media_upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-600 transition"
          >
            {uploading ? mp.uploading : mp.uploadNewFile}
            <input
              id="calendar_media_upload"
              type="file"
              accept="image/*,video/mp4,video/webm"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50 py-2 text-xs font-semibold text-violet-700 hover:border-violet-400 hover:bg-violet-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {canvaBusy ? mp.fetchingDesign : mp.designWithCanva}
            </button>
          ) : (
            <a
              href="/settings?tab=baglantilar"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-400 hover:border-violet-300 hover:text-violet-600 transition"
              title={mp.connectCanvaHint}
            >
              {mp.connectCanva}
            </a>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          {canvaError && <p className="text-xs text-red-600">{canvaError}</p>}
          {deleteNotice && <p className="text-xs text-red-600">{deleteNotice}</p>}

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-semibold w-fit">
            {([
              { key: "all", label: mp.all },
              { key: "image", label: mp.photos },
              { key: "video", label: mp.videos },
            ] as const).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  filter === f.key ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-xs text-slate-400">{mp.loading}</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400">
              {items.length === 0 ? mp.emptyUploaded : mp.emptyFilter}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((m) => (
                <DraggableThumb
                  key={m.id}
                  item={m}
                  isSelected={selected.has(m.id)}
                  selectedItems={selectedItems}
                  onToggle={toggle}
                  onRename={rename}
                  onZoom={setZoomedItem}
                  onDelete={setConfirmTarget}
                  deleting={deletingId === m.id}
                  isEn={isEn}
                />
              ))}
            </div>
          )}
        </div>
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
        title={isEn ? `Delete ${selected.size} selected item${selected.size > 1 ? "s" : ""}?` : `Seçili ${selected.size} görsel silinsin mi?`}
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

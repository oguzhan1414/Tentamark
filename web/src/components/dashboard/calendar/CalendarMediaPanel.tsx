"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useMediaLibrary, type MediaLibraryItem } from "@/lib/media/useMediaLibrary";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";
import { useCanvaDesignFlow } from "@/lib/canva/useCanvaDesignFlow";

import { useLanguage } from "@/context/LanguageContext";

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
}: {
  item: MediaLibraryItem;
  isSelected: boolean;
  selectedItems: MediaLibraryItem[];
  onToggle: (id: string) => void;
  onRename: (id: string, label: string) => void;
}) {
  const { locale } = useLanguage();
  const isEn = locale === "en";
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
            aria-label={isSelected ? (isEn ? "Deselect" : "Seçimi kaldır") : (isEn ? "Select" : "Seç")}
            className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition ${
              isSelected
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-white/80 bg-black/30 text-transparent opacity-0 group-hover:opacity-100 hover:bg-black/50"
            }`}
          >
            {isSelected ? "✓" : ""}
          </button>
        )}
      </div>
      <input
        type="text"
        defaultValue={item.alt_text ?? ""}
        placeholder={isEn ? "Add tag..." : "Etiket ekle..."}
        onBlur={(e) => {
          if (e.target.value.trim() !== (item.alt_text ?? "")) onRename(item.id, e.target.value);
        }}
        className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] text-slate-700 placeholder-slate-400 focus:border-rose-300 focus:outline-none"
      />
    </div>
  );
}

export default function CalendarMediaPanel({ brandId, isOpen, onClose }: Props) {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  // enabled=isOpen — no fetch until the panel is opened at least once;
  // stays loaded afterwards (see useMediaLibrary), so re-opening is instant.
  const { items, loading, uploading, error, upload, addItem, rename } = useMediaLibrary(brandId, isOpen);
  const { connected: canvaConnected } = useCanvaConnection(brandId);
  const { busy: canvaBusy, error: canvaError, start: handleCanvaClick } = useCanvaDesignFlow(addItem);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
          <span className="text-sm font-bold text-slate-900">{isEn ? "Media" : "Medya"}</span>
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
            {isEn
              ? "Drag and drop onto a date to quickly schedule a post. Check multiple photos and drag them together to create a carousel."
              : "Bir tarihe sürükleyip bırakarak hızlıca gönderi oluştur. Fotoğrafları işaretleyip birlikte sürükleyerek carousel oluşturabilirsin."}
          </p>

          {selected.size > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-rose-700">
                {selected.size} {isEn ? "selected" : "seçildi"}
              </span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
              >
                {isEn ? "Clear" : "Temizle"}
              </button>
            </div>
          )}

          <label
            htmlFor="calendar_media_upload"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-600 transition"
          >
            {uploading ? (isEn ? "Uploading..." : "Yükleniyor...") : (isEn ? "+ Upload New File" : "+ Yeni Dosya Yükle")}
            <input
              id="calendar_media_upload"
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

          {canvaConnected ? (
            <button
              type="button"
              onClick={handleCanvaClick}
              disabled={canvaBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50 py-2 text-xs font-semibold text-violet-700 hover:border-violet-400 hover:bg-violet-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {canvaBusy ? (isEn ? "Fetching design..." : "Tasarım alınıyor...") : (isEn ? "🎨 Design with Canva" : "🎨 Canva ile Tasarla")}
            </button>
          ) : (
            <a
              href="/settings?tab=baglantilar"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-400 hover:border-violet-300 hover:text-violet-600 transition"
              title={isEn ? "Connect from Settings first to design with Canva" : "Canva ile tasarlamak için önce Ayarlar'dan bağlayın"}
            >
              {isEn ? "🎨 Connect Canva" : "🎨 Canva'yı Bağla"}
            </a>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {canvaError && <p className="text-xs text-red-600">{canvaError}</p>}

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-semibold w-fit">
            {([
              { key: "all", label: isEn ? "All" : "Tümü" },
              { key: "image", label: isEn ? "Photos" : "Fotoğraf" },
              { key: "video", label: isEn ? "Videos" : "Video" },
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
            <p className="text-center text-xs text-slate-400">{isEn ? "Loading..." : "Yükleniyor..."}</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400">
              {items.length === 0
                ? (isEn ? "No uploaded media yet." : "Henüz yüklenmiş medya yok.")
                : (isEn ? "No media found for this filter." : "Bu filtrede medya yok.")}
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

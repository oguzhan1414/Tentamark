"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ScenePlanItem } from "@/lib/video/types";
import { SCENE_FIELD_CONFIG, SCENE_IMAGE_FIELD, canDeleteOrDuplicate, canRegenerateWithAI } from "@/lib/video/sceneFieldConfig";
import MediaLibraryModal, { type MediaLibraryItem } from "@/components/dashboard/MediaLibraryModal";

const ARCHETYPE_LABELS: Record<string, { tr: string; en: string }> = {
  hook: { tr: "Açılış", en: "Hook" },
  feature: { tr: "Özellik", en: "Feature" },
  product: { tr: "Ürün", en: "Product" },
  review: { tr: "Müşteri Yorumu", en: "Review" },
  wrapped: { tr: "Özet", en: "Wrapped" },
  ugc_split: { tr: "UGC", en: "UGC" },
  stat: { tr: "İstatistik", en: "Stat" },
  carousel: { tr: "Carousel", en: "Carousel" },
  user_clip: { tr: "Video Klibi", en: "Video Clip" },
  outro: { tr: "Kapanış", en: "Outro" },
};

type Props = {
  id: string;
  scene: ScenePlanItem;
  index: number;
  brandId: string;
  isEn: boolean;
  regenerating: boolean;
  onSelect: () => void;
  onFramesChange: (frames: number) => void;
  onCopyChange: (patch: Partial<ScenePlanItem>) => void;
  onImageChange: (imageUrl: string) => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

function formatSeconds(frames: number): string {
  const seconds = frames / 30;
  return `${seconds.toFixed(1)}s`;
}

export function StoryboardSceneCard({
  id,
  scene,
  index,
  brandId,
  isEn,
  regenerating,
  onSelect,
  onFramesChange,
  onCopyChange,
  onImageChange,
  onRegenerate,
  onDelete,
  onDuplicate,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const record = scene as unknown as Record<string, unknown>;
  const fields = SCENE_FIELD_CONFIG[scene.archetype] ?? [];
  const imageField = SCENE_IMAGE_FIELD[scene.archetype];
  const label = ARCHETYPE_LABELS[scene.archetype] ?? { tr: scene.archetype, en: scene.archetype };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
          aria-label={isEn ? "Drag to reorder" : "Sürükleyip sırala"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h8M8 12h8M8 18h8" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-left text-xs font-bold text-slate-800 cursor-pointer"
        >
          {index + 1}. {isEn ? label.en : label.tr}
        </button>
        <span className="text-[11px] font-semibold text-slate-400">{formatSeconds(scene.frames)}</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {fields.map((field) => {
          if (field.kind === "lines2" && scene.archetype === "hook") {
            const lines = Array.isArray(record.lines) ? (record.lines as string[]) : ["", ""];
            return (
              <div key={field.key} className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <input
                    key={i}
                    type="text"
                    value={lines[i] ?? ""}
                    onChange={(e) => {
                      const next = [...lines];
                      next[i] = e.target.value;
                      onCopyChange({ lines: next } as Partial<ScenePlanItem>);
                    }}
                    placeholder={`${isEn ? "Line" : "Satır"} ${i + 1}`}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800"
                  />
                ))}
              </div>
            );
          }
          if (field.kind === "stringList") {
            const arr = Array.isArray(record[field.key]) ? (record[field.key] as string[]) : [];
            return (
              <div key={field.key}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? field.label.en : field.label.tr}
                </label>
                <textarea
                  value={arr.join("\n")}
                  onChange={(e) =>
                    onCopyChange({ [field.key]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) } as Partial<ScenePlanItem>)
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            );
          }
          if (field.kind === "textarea") {
            return (
              <div key={field.key}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? field.label.en : field.label.tr}
                </label>
                <textarea
                  value={typeof record[field.key] === "string" ? (record[field.key] as string) : ""}
                  onChange={(e) => onCopyChange({ [field.key]: e.target.value } as Partial<ScenePlanItem>)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            );
          }
          return (
            <div key={field.key}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isEn ? field.label.en : field.label.tr}
              </label>
              <input
                type="text"
                value={typeof record[field.key] === "string" ? (record[field.key] as string) : ""}
                onChange={(e) => onCopyChange({ [field.key]: e.target.value } as Partial<ScenePlanItem>)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {isEn ? "Duration" : "Süre"} — {formatSeconds(scene.frames)}
        </label>
        <input
          type="range"
          min={45}
          max={300}
          step={5}
          value={scene.frames}
          onChange={(e) => onFramesChange(Number(e.target.value))}
          className="mt-1 w-full cursor-pointer"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {imageField === "imageUrl" && (
          <button
            type="button"
            onClick={() => setShowMediaPicker(true)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {isEn ? "Change image" : "Görseli Değiştir"}
          </button>
        )}
        {canRegenerateWithAI(scene.archetype) && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition disabled:opacity-50 cursor-pointer"
          >
            {regenerating ? (isEn ? "Regenerating…" : "Yeniden üretiliyor…") : isEn ? "✨ Regenerate with AI" : "✨ AI ile Yeniden Üret"}
          </button>
        )}
        {canDeleteOrDuplicate(scene.archetype) && (
          <>
            <button
              type="button"
              onClick={onDuplicate}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {isEn ? "Duplicate" : "Çoğalt"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              {isEn ? "Delete" : "Sil"}
            </button>
          </>
        )}
      </div>

      {showMediaPicker && (
        <MediaLibraryModal
          brandId={brandId}
          defaultFilter="image"
          onSelect={(item: MediaLibraryItem) => {
            onImageChange(item.file_url);
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}

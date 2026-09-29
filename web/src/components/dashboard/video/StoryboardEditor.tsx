"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Main } from "../../../../remotion/Main";
import { getRenderedDurationInFrames, TRANSITION_FRAMES, type VideoRecipeId } from "@/lib/video/scenePlan";
import { deleteScene, duplicateScene, setSceneFrames, updateSceneCopy } from "@/lib/video/scenePlanEditor";
import type { Caption } from "@remotion/captions";
import type { ScenePlanItem, VideoFormat, VideoInputProps, VideoMusicTrack } from "@/lib/video/types";
import { StoryboardSceneCard } from "./StoryboardSceneCard";

type EditableScene = { id: string; scene: ScenePlanItem };

function makeEditable(scenes: ScenePlanItem[]): EditableScene[] {
  return scenes.map((scene) => ({ id: crypto.randomUUID(), scene }));
}

// Mirrors Main.tsx's own TransitionSeries cut math exactly: every cut EXCEPT
// the one into the final (outro) scene is a regular Transition that
// shortens the timeline by TRANSITION_FRAMES — the last cut is a light-leak
// Overlay that doesn't. Same formula getRenderedDurationInFrames uses,
// generalized to a per-scene start offset for Player.seekTo().
function sceneStartFrame(scenes: ScenePlanItem[], index: number): number {
  const sumBefore = scenes.slice(0, index).reduce((total, s) => total + s.frames, 0);
  const cutsBefore = Math.min(index, Math.max(scenes.length - 2, 0));
  return sumBefore - TRANSITION_FRAMES * cutsBefore;
}

const AUTOSAVE_DELAY_MS = 800;

export function StoryboardEditor({
  jobId,
  brandId,
  brandName,
  format,
  initialScenes,
  voiceoverAudio,
  captions,
  recipeId,
  videoBackgroundUrl,
  musicTrack,
  accentColors,
  visualStyle,
  traitScores,
  isEn,
  onRenderStarted,
}: {
  jobId: string;
  brandId: string;
  brandName: string;
  format: VideoFormat;
  initialScenes: ScenePlanItem[];
  voiceoverAudio?: string | null;
  captions?: Caption[] | null;
  recipeId?: string;
  videoBackgroundUrl?: string;
  musicTrack: VideoMusicTrack;
  accentColors?: string[];
  visualStyle?: VideoInputProps["visualStyle"];
  traitScores?: VideoInputProps["traitScores"];
  isEn: boolean;
  onRenderStarted: () => void;
}) {
  const [editableScenes, setEditableScenes] = useState<EditableScene[]>(() => makeEditable(initialScenes));
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const playerRef = useRef<PlayerRef>(null);
  const isFirstRender = useRef(true);

  const scenes = useMemo(() => editableScenes.map((e) => e.scene), [editableScenes]);
  const isVertical = format === "vertical";
  const durationInFrames = getRenderedDurationInFrames(scenes);

  // Debounced autosave — every local edit (reorder/delete/duplicate/
  // duration/text/media) lands here, not a round-trip per keystroke.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveState("saving");
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/video/jobs/${jobId}/scene`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenes, settings: { videoBackgroundUrl: videoBackgroundUrl || null, musicTrack } }),
        });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [scenes, jobId, videoBackgroundUrl, musicTrack]);

  function selectScene(index: number) {
    playerRef.current?.seekTo(Math.max(sceneStartFrame(scenes, index), 0));
  }

  function withValidation(action: () => void) {
    setSceneError(null);
    try {
      action();
    } catch (err) {
      setSceneError(err instanceof Error ? err.message : isEn ? "Something went wrong." : "Bir şeyler ters gitti.");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEditableScenes((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === active.id);
      const newIndex = prev.findIndex((e) => e.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleFramesChange(id: string, frames: number) {
    setEditableScenes((prev) => {
      const index = prev.findIndex((e) => e.id === id);
      if (index === -1) return prev;
      const next = setSceneFrames(prev.map((e) => e.scene), index, frames);
      return prev.map((e, i) => ({ ...e, scene: next[i] }));
    });
  }

  function handleCopyChange(id: string, patch: Partial<ScenePlanItem>) {
    setEditableScenes((prev) => {
      const index = prev.findIndex((e) => e.id === id);
      if (index === -1) return prev;
      const next = updateSceneCopy(prev.map((e) => e.scene), index, patch);
      return prev.map((e, i) => ({ ...e, scene: next[i] }));
    });
  }

  function handleImageChange(id: string, imageUrl: string) {
    handleCopyChange(id, { imageUrl } as Partial<ScenePlanItem>);
  }

  function handleDelete(id: string) {
    withValidation(() => {
      const index = editableScenes.findIndex((e) => e.id === id);
      if (index === -1) return;
      deleteScene(editableScenes.map((e) => e.scene), index); // throws on invalid removal
      setEditableScenes((prev) => prev.filter((e) => e.id !== id));
    });
  }

  function handleDuplicate(id: string) {
    withValidation(() => {
      const index = editableScenes.findIndex((e) => e.id === id);
      if (index === -1) return;
      duplicateScene(editableScenes.map((e) => e.scene), index); // throws if not allowed
      setEditableScenes((prev) => {
        const next = [...prev];
        next.splice(index + 1, 0, { id: crypto.randomUUID(), scene: { ...prev[index].scene } });
        return next;
      });
    });
  }

  async function handleRegenerate(id: string) {
    const index = editableScenes.findIndex((e) => e.id === id);
    if (index === -1) return;
    setRegeneratingId(id);
    setSceneError(null);
    try {
      const res = await fetch(`/api/video/jobs/${jobId}/regenerate-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneIndex: index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? (isEn ? "Regeneration failed." : "Yeniden üretilemedi."));
      setEditableScenes((prev) => prev.map((e) => (e.id === id ? { ...e, scene: data.scene } : e)));
    } catch (err) {
      setSceneError(err instanceof Error ? err.message : isEn ? "Regeneration failed." : "Yeniden üretilemedi.");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function handleRender() {
    setRendering(true);
    setRenderError(null);
    try {
      const res = await fetch(`/api/video/jobs/${jobId}/render`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? (isEn ? "Couldn't start render." : "Render başlatılamadı."));
      onRenderStarted();
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : isEn ? "Couldn't start render." : "Render başlatılamadı.");
      setRendering(false);
    }
  }

  const previewInputProps = {
    format,
    durationSeconds: (Math.round(durationInFrames / 30) || 10) as 10 | 15 | 20,
    fps: 30 as const,
    accentColors: accentColors?.length ? accentColors : ["#fa5252"],
    visualStyle,
    traitScores,
    brandName,
    recipeId: recipeId as VideoRecipeId | undefined,
    videoBackgroundUrl: videoBackgroundUrl || undefined,
    musicTrack,
    voiceoverAudio: voiceoverAudio ?? undefined,
    captions: captions ?? undefined,
    scenePlan: scenes,
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-8 space-y-3">
          <div className={`mx-auto overflow-hidden rounded-2xl bg-black ${isVertical ? "max-w-[280px]" : "w-full"}`}>
            <Player
              ref={playerRef}
              component={Main}
              inputProps={previewInputProps}
              durationInFrames={Math.max(durationInFrames, 30)}
              compositionWidth={isVertical ? 1080 : 1920}
              compositionHeight={isVertical ? 1920 : 1080}
              fps={30}
              controls
              clickToPlay
              style={{ width: "100%", aspectRatio: isVertical ? "9 / 16" : "16 / 9" }}
            />
          </div>
          <p className="text-center text-[11px] text-slate-400">
            {isEn ? "Total" : "Toplam"}: {(durationInFrames / 30).toFixed(1)}s
          </p>
          {renderError && <p className="text-center text-xs font-semibold text-red-600">{renderError}</p>}
          <button
            type="button"
            onClick={handleRender}
            disabled={rendering}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {rendering ? (isEn ? "Starting render…" : "Render başlatılıyor…") : isEn ? "Render Video" : "Videoyu Oluştur"}
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isEn ? "Storyboard" : "Storyboard"}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {saveState === "saving"
              ? isEn ? "Saving…" : "Kaydediliyor…"
              : saveState === "saved"
              ? isEn ? "Saved" : "Kaydedildi"
              : saveState === "error"
              ? isEn ? "Save failed" : "Kaydedilemedi"
              : ""}
          </span>
        </div>

        {sceneError && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600">{sceneError}</p>
        )}

        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={editableScenes.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {editableScenes.map((e, index) => (
                <StoryboardSceneCard
                  key={e.id}
                  id={e.id}
                  scene={e.scene}
                  index={index}
                  brandId={brandId}
                  isEn={isEn}
                  regenerating={regeneratingId === e.id}
                  onSelect={() => selectScene(index)}
                  onFramesChange={(frames) => handleFramesChange(e.id, frames)}
                  onCopyChange={(patch) => handleCopyChange(e.id, patch)}
                  onImageChange={(url) => handleImageChange(e.id, url)}
                  onRegenerate={() => handleRegenerate(e.id)}
                  onDelete={() => handleDelete(e.id)}
                  onDuplicate={() => handleDuplicate(e.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

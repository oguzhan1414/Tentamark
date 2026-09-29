import { MIN_SCENE_FRAMES } from "./scenePlan";
import type { ScenePlanItem } from "./types";

export type EditableScenePlan = ReadonlyArray<ScenePlanItem>;

// hook/outro bookend every recipe (see scenePlan.ts's planScenes()) — a
// storyboard with neither would have nothing to open/close on, and
// duplicating either would produce two of the same bookend. The UI hides
// delete/duplicate for these two archetypes; these checks are the
// defense-in-depth backstop.
function isBookend(scene: ScenePlanItem): boolean {
  return scene.archetype === "hook" || scene.archetype === "outro";
}

export function replaceScene(
  scenePlan: EditableScenePlan,
  index: number,
  replacement: ScenePlanItem
): ScenePlanItem[] {
  if (!Number.isInteger(index) || index < 0 || index >= scenePlan.length) {
    throw new RangeError("Geçersiz sahne index'i.");
  }
  return scenePlan.map((scene, sceneIndex) =>
    sceneIndex === index ? { ...replacement, frames: scene.frames } : scene
  );
}

export function reorderScene(scenePlan: EditableScenePlan, fromIndex: number, toIndex: number): ScenePlanItem[] {
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= scenePlan.length ||
    toIndex >= scenePlan.length
  ) {
    throw new RangeError("Geçersiz sahne sıralaması.");
  }
  const next = [...scenePlan];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function deleteScene(scenePlan: EditableScenePlan, index: number): ScenePlanItem[] {
  const target = scenePlan[index];
  if (!target) throw new RangeError("Geçersiz sahne index'i.");
  if (isBookend(target)) throw new Error("Açılış veya kapanış sahnesi silinemez.");
  if (scenePlan.length <= 3) throw new Error("En az bir orta sahne kalmalı.");
  return scenePlan.filter((_, sceneIndex) => sceneIndex !== index);
}

export function duplicateScene(scenePlan: EditableScenePlan, index: number): ScenePlanItem[] {
  const target = scenePlan[index];
  if (!target) throw new RangeError("Geçersiz sahne index'i.");
  if (isBookend(target)) throw new Error("Açılış veya kapanış sahnesi çoğaltılamaz.");
  const next = [...scenePlan];
  next.splice(index + 1, 0, { ...target });
  return next;
}

// Only ever touches the ONE targeted scene — no borrowing frames from
// neighbors, no auto-rebalancing. Changing one scene's duration is meant to
// be a direct, predictable action; the total video length simply changes by
// the same delta (shown live in the storyboard UI), rather than silently
// nudging other scenes the user didn't touch.
export function setSceneFrames(scenePlan: EditableScenePlan, index: number, frames: number): ScenePlanItem[] {
  if (!scenePlan[index]) throw new RangeError("Geçersiz sahne index'i.");
  const clamped = Math.max(Math.round(frames), MIN_SCENE_FRAMES);
  return scenePlan.map((scene, sceneIndex) => (sceneIndex === index ? { ...scene, frames: clamped } : scene));
}

export function updateSceneCopy(
  scenePlan: EditableScenePlan,
  index: number,
  copyPatch: Partial<ScenePlanItem>
): ScenePlanItem[] {
  const current = scenePlan[index];
  if (!current) throw new RangeError("Geçersiz sahne index'i.");
  if (copyPatch.archetype && copyPatch.archetype !== current.archetype) {
    throw new Error("Metin güncellemesi sahne türünü değiştiremez.");
  }
  return scenePlan.map((scene, sceneIndex) =>
    sceneIndex === index ? ({ ...scene, ...copyPatch, archetype: scene.archetype, frames: scene.frames } as ScenePlanItem) : scene
  );
}

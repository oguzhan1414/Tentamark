import assert from "node:assert/strict";
import {
  replaceScene,
  reorderScene,
  updateSceneCopy,
  deleteScene,
  duplicateScene,
  setSceneFrames,
} from "../src/lib/video/scenePlanEditor";
import type { ScenePlanItem } from "../src/lib/video/types";

let failures = 0;
function fail(message: string) {
  console.error(`FAIL: ${message}`);
  failures++;
}

function fixture(): ScenePlanItem[] {
  return [
    { archetype: "hook", frames: 100, lines: ["Merhaba", "Dünya"] },
    { archetype: "feature", frames: 150, eyebrow: "01", title: "Özellik A", description: "Açıklama A", imageUrl: "a.png", reverse: false, badges: [] },
    { archetype: "stat", frames: 120, headline: "%100", supporting: "Destek metni" },
    { archetype: "outro", frames: 90, brandName: "Tentamark", logoUrl: null, tagline: "Bitiş", ctaLabel: "Keşfet" },
  ];
}

function testReplaceScene() {
  const plan = fixture();
  const replacement: ScenePlanItem = { archetype: "stat", frames: 999, headline: "Yeni", supporting: "Yeni destek" };
  const next = replaceScene(plan, 2, replacement);
  assert.equal(next[2].frames, 120, "replaceScene should pin frames to the original scene's frames");
  assert.equal((next[2] as { headline: string }).headline, "Yeni");
  console.log("OK: replaceScene swaps content but pins frames.");
}

function testReorderScene() {
  const plan = fixture();
  const next = reorderScene(plan, 1, 2);
  assert.equal(next[1].archetype, "stat");
  assert.equal(next[2].archetype, "feature");
  assert.equal(next.length, plan.length);
  console.log("OK: reorderScene moves a scene to a new index without changing the count.");
}

function testUpdateSceneCopy() {
  const plan = fixture();
  const next = updateSceneCopy(plan, 1, { title: "Yeni Başlık" });
  assert.equal((next[1] as { title: string }).title, "Yeni Başlık");
  assert.equal((next[1] as { imageUrl: string }).imageUrl, "a.png", "unpatched fields must survive the shallow merge");
  assert.throws(() => updateSceneCopy(plan, 1, { archetype: "stat" } as Partial<ScenePlanItem>), /sahne türünü değiştiremez/);
  console.log("OK: updateSceneCopy patches fields, preserves the rest, and rejects an archetype change.");
}

function testDeleteScene() {
  const plan = fixture();
  const next = deleteScene(plan, 1);
  assert.equal(next.length, 3);
  assert.deepEqual(next.map((s) => s.archetype), ["hook", "stat", "outro"]);

  assert.throws(() => deleteScene(plan, 0), /Açılış veya kapanış/, "deleting the hook must be rejected");
  assert.throws(() => deleteScene(plan, 3), /Açılış veya kapanış/, "deleting the outro must be rejected");

  const twoMiddle: ScenePlanItem[] = [plan[0], plan[1], plan[3]];
  assert.throws(() => deleteScene(twoMiddle, 1), /En az bir orta sahne/, "deleting the only middle scene must be rejected");
  console.log("OK: deleteScene removes a middle scene, rejects bookends, and enforces a minimum middle-scene count.");
}

function testDuplicateScene() {
  const plan = fixture();
  const next = duplicateScene(plan, 1);
  assert.equal(next.length, plan.length + 1);
  assert.equal(next[1].archetype, "feature");
  assert.equal(next[2].archetype, "feature");
  assert.notEqual(next[1], next[2], "the duplicate must be a distinct object, not the same reference");

  assert.throws(() => duplicateScene(plan, 0), /Açılış veya kapanış/, "duplicating the hook must be rejected");
  assert.throws(() => duplicateScene(plan, 3), /Açılış veya kapanış/, "duplicating the outro must be rejected");
  console.log("OK: duplicateScene inserts a copy right after the original and rejects bookends.");
}

function testSetSceneFrames() {
  const plan = fixture();
  const next = setSceneFrames(plan, 2, 200);
  assert.equal(next[2].frames, 200);
  assert.equal(next[0].frames, plan[0].frames, "setSceneFrames must not touch other scenes");
  assert.equal(next[1].frames, plan[1].frames);
  assert.equal(next[3].frames, plan[3].frames);

  const clamped = setSceneFrames(plan, 2, 5);
  assert.equal(clamped[2].frames, 45, "setSceneFrames must clamp to MIN_SCENE_FRAMES");
  console.log("OK: setSceneFrames changes only the targeted scene and clamps to the minimum.");
}

function main() {
  testReplaceScene();
  testReorderScene();
  testUpdateSceneCopy();
  testDeleteScene();
  testDuplicateScene();
  testSetSceneFrames();

  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nAll storyboard editor checks passed.");
  }
}

main();

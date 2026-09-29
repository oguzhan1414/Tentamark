/*
  Network-independent checks only — everything here is pure glue/math logic.
  Explicitly OUT of scope (left to manual/live testing, see Faz 5 plan):
  - generateVoiceoverAudio() / transcribeAudio() real API calls (need
    OPENAI_API_KEY / GROQ_API_KEY) — the Groq Whisper endpoint shape itself
    WAS smoke-tested live once during implementation (confirmed response
    has `duration` + `words:[{word,start,end}]`), but isn't re-verified here.
  - End-to-end audio/scene/caption sync in an actual rendered MP4 — needs a
    real video job submitted through the dashboard, watched by eye.
  - The Storage bucket patch (0063) actually applied against the live
    Supabase project.
*/
import assert from "node:assert/strict";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { rescaleSlotsToDuration, TRANSITION_FRAMES, type SceneSlot } from "../src/lib/video/scenePlan";
import { wordsToCaptions } from "../src/lib/ai/transcribeAudio";
import { clampTargetFrames } from "../src/lib/video/buildVideoInputProps";

let failures = 0;

function fail(message: string) {
  console.error(`FAIL: ${message}`);
  failures++;
}

// Mirrors scenePlan.ts's own private MIN_SCENE_FRAMES — not exported, so
// duplicated here as a known constant rather than importing.
const MIN_SCENE_FRAMES = 45;

function testRescaleSlotsToDuration() {
  const slots: SceneSlot[] = [
    { archetype: "hook", frames: 130 },
    { archetype: "stat", frames: 200 },
    { archetype: "outro", frames: 140 },
  ];

  // Stretch case: target much longer than the plan's original allocation.
  const stretched = rescaleSlotsToDuration(slots, 900);
  const transitionCutCount = Math.max(slots.length - 2, 0);
  const stretchedRendered = stretched.reduce((sum, s) => sum + s.frames, 0) - TRANSITION_FRAMES * transitionCutCount;
  if (Math.abs(stretchedRendered - 900) > 2) {
    fail(`rescaleSlotsToDuration: expected rendered duration close to 900 frames, got ${stretchedRendered}.`);
  } else {
    console.log(`OK: rescaleSlotsToDuration hits the target duration when stretching (${stretchedRendered} ~= 900).`);
  }
  if (stretched.some((s) => s.frames < MIN_SCENE_FRAMES)) {
    fail("rescaleSlotsToDuration: a stretched slot fell below MIN_SCENE_FRAMES.");
  } else {
    console.log("OK: rescaleSlotsToDuration respects MIN_SCENE_FRAMES when stretching.");
  }
  const middleIsLongest = stretched[1].frames > stretched[0].frames && stretched[1].frames > stretched[2].frames;
  if (!middleIsLongest) fail("rescaleSlotsToDuration: expected the middle scene to stay the longest after stretching.");
  else console.log("OK: rescaleSlotsToDuration preserves relative pacing (middle scene longest) when stretching.");

  // Shrink case: target far shorter — MIN_SCENE_FRAMES floor should kick in
  // and win over hitting the exact target (a real, accepted tradeoff).
  const shrunk = rescaleSlotsToDuration(slots, 60);
  if (shrunk.some((s) => s.frames < MIN_SCENE_FRAMES)) {
    fail("rescaleSlotsToDuration: a shrunk slot fell below MIN_SCENE_FRAMES.");
  } else {
    console.log("OK: rescaleSlotsToDuration respects MIN_SCENE_FRAMES when shrinking below the floor.");
  }
}

function testWordsToCaptions() {
  const words = [
    { word: "Kahve", start: 0.24, end: 0.66 },
    { word: "tutkunları", start: 0.66, end: 1.26 },
  ];
  const captions = wordsToCaptions(words);
  assert.equal(captions.length, 2);
  assert.equal(captions[0].text, "Kahve");
  assert.equal(captions[1].text, " tutkunları");
  assert.equal(captions[0].startMs, 240);
  assert.equal(captions[0].endMs, 660);
  assert.equal(captions[1].startMs, 660);
  console.log("OK: wordsToCaptions converts seconds->ms and applies the leading-space convention correctly.");
}

function testClampTargetFrames() {
  const current = 400;
  assert.equal(clampTargetFrames(50, current), Math.round(current * 0.5), "below 0.5x should clamp up");
  assert.equal(clampTargetFrames(2000, current), Math.round(current * 2.5), "above 2.5x should clamp down");
  assert.equal(clampTargetFrames(500, current), 500, "in-range should pass through unchanged");
  console.log("OK: clampTargetFrames clamps below/above range and passes through in-range values.");
}

function testCreateTikTokStyleCaptionsIntegration() {
  const captions: Caption[] = [
    { text: "Kahve", startMs: 0, endMs: 400, timestampMs: null, confidence: null },
    { text: " tutkunları", startMs: 400, endMs: 900, timestampMs: null, confidence: null },
    { text: " buraya", startMs: 900, endMs: 1400, timestampMs: null, confidence: null },
  ];
  const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 });
  if (pages.length === 0) {
    fail("createTikTokStyleCaptions: expected at least one page for a non-empty caption list.");
    return;
  }
  const totalTokens = pages.reduce((sum, p) => sum + p.tokens.length, 0);
  if (totalTokens !== captions.length) {
    fail(`createTikTokStyleCaptions: expected ${captions.length} total tokens across pages, got ${totalTokens}.`);
  } else {
    console.log(`OK: createTikTokStyleCaptions (real, installed package) pages ${captions.length} captions into ${pages.length} page(s) without dropping tokens.`);
  }
}

function main() {
  testRescaleSlotsToDuration();
  testWordsToCaptions();
  testClampTargetFrames();
  testCreateTikTokStyleCaptionsIntegration();

  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nAll voice-over checks passed.");
  }
}

main();

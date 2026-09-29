import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const checkMode = process.argv.includes("--check");

const files = {
  types: path.join(root, "src/lib/video/types.ts"),
  planner: path.join(root, "src/lib/video/scenePlan.ts"),
  renderer: path.join(root, "remotion/Main.tsx"),
  cards: path.join(root, "src/lib/cards/typeRegistry.ts"),
  fixtures: path.join(root, "remotion/fixtures"),
};

async function text(file) {
  return readFile(file, "utf8");
}

function unique(matches) {
  return [...new Set(matches)].sort();
}

function captureAll(source, regex) {
  return unique([...source.matchAll(regex)].map((match) => match[1]));
}

async function listFilesRecursively(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory() ? listFilesRecursively(absolute) : [absolute];
    })
  );
  return nested.flat();
}

const [typesSource, plannerSource, rendererSource, cardsSource] = await Promise.all([
  text(files.types),
  text(files.planner),
  text(files.renderer),
  text(files.cards),
]);

const definedArchetypes = captureAll(typesSource, /archetype:\s*"([a-z_]+)"/g);
const renderedArchetypes = captureAll(rendererSource, /case\s+"([a-z_]+)"/g);

// The planner uses unions and array literals, so scan quoted known archetypes
// instead of depending on one exact TypeScript formatting style.
const plannerCoverage = definedArchetypes.filter((name) => new RegExp(`"${name}"`).test(plannerSource));
const dormantArchetypes = definedArchetypes.filter((name) => !plannerCoverage.includes(name));
const unrenderedArchetypes = definedArchetypes.filter((name) => !renderedArchetypes.includes(name));

const cardTypes = captureAll(cardsSource, /^\s{2}([a-z][a-z0-9]*):\s*defineCardType/gm);
const cardSourceFiles = (await listFilesRecursively(path.join(root, "src/lib/cards"))).filter((file) => file.endsWith(".ts"));
const fixtureFiles = (await readdir(files.fixtures)).filter((file) => file.endsWith(".json")).sort();

const fixtures = [];
for (const file of fixtureFiles) {
  const absolute = path.join(files.fixtures, file);
  const parsed = JSON.parse(await text(absolute));
  fixtures.push({
    file,
    format: parsed.format,
    durationSeconds: parsed.durationSeconds,
    scenes: Array.isArray(parsed.scenePlan) ? parsed.scenePlan.map((scene) => scene.archetype) : [],
    bytes: (await stat(absolute)).size,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  video: {
    definedArchetypes,
    renderedArchetypes,
    plannerCoverage,
    dormantArchetypes,
    unrenderedArchetypes,
    fixtures,
  },
  image: {
    cardTypeCount: cardTypes.length,
    cardTypes,
    sourceFileCount: cardSourceFiles.length,
  },
};

console.log("Tentamark Creative Studio inventory");
console.log(`Video archetypes: ${definedArchetypes.length} defined, ${renderedArchetypes.length} rendered, ${plannerCoverage.length} planner-visible`);
console.log(`Dormant planner archetypes: ${dormantArchetypes.length ? dormantArchetypes.join(", ") : "none"}`);
console.log(`Card types: ${cardTypes.length} across ${cardSourceFiles.length} TypeScript files`);
console.log(`Fixtures: ${fixtures.map((fixture) => fixture.file).join(", ") || "none"}`);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
}

if (checkMode) {
  const failures = [];
  if (definedArchetypes.length === 0) failures.push("No video archetypes were found.");
  if (unrenderedArchetypes.length > 0) failures.push(`Archetypes missing from Main renderer: ${unrenderedArchetypes.join(", ")}`);
  if (cardTypes.length === 0) failures.push("No card types were found.");
  if (fixtures.length < 2) failures.push("At least one vertical and one horizontal fixture are required.");
  if (!fixtures.some((fixture) => fixture.format === "vertical")) failures.push("Vertical fixture is missing.");
  if (!fixtures.some((fixture) => fixture.format === "horizontal")) failures.push("Horizontal fixture is missing.");

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(`ERROR: ${failure}`));
    process.exitCode = 1;
  } else {
    console.log("Creative inventory checks passed.");
  }
}

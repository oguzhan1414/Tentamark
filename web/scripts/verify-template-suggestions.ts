import assert from "node:assert/strict";
import { CARD_TEMPLATES, getCardTemplate } from "../src/lib/cards/templateFieldConfig";
import { CONTENT_PURPOSES, TEMPLATE_SUGGESTIONS, getTemplateSuggestions } from "../src/lib/cards/contentPurpose";

/*
  Guards against exactly the bug this feature's own research turned up:
  templateFieldConfig.ts's variant keys silently drifting out of sync with
  each type's real registry.ts keys (podcast/photoreview/deal/newsflash used
  kebab-case here while the registries were camelCase — the UI's variant
  picker for those 3 types quietly no-op'd). Every {templateKey, variantKey}
  pair TEMPLATE_SUGGESTIONS references must resolve to a REAL template and a
  REAL variant on that template, not just "getCardTemplate didn't throw."
*/
let failures = 0;

for (const purpose of CONTENT_PURPOSES) {
  const slots = TEMPLATE_SUGGESTIONS[purpose];
  assert.equal(slots.length, 3, `${purpose}: expected exactly 3 suggestion slots, got ${slots.length}`);

  const tiers = slots.map((s) => s.tier).sort();
  assert.deepEqual(tiers, ["bold", "experimental", "safe"], `${purpose}: expected one safe/bold/experimental each`);

  for (const slot of slots) {
    const template = getCardTemplate(slot.templateKey);
    if (!template) {
      console.error(`FAIL: ${purpose} -> templateKey "${slot.templateKey}" does not exist in CARD_TEMPLATES.`);
      failures++;
      continue;
    }
    const variant = template.variants?.find((v) => v.key === slot.variantKey);
    if (!variant) {
      const available = template.variants?.map((v) => v.key).join(", ") ?? "(no variants)";
      console.error(
        `FAIL: ${purpose} -> ${slot.templateKey}/${slot.variantKey} not found. Available: ${available}`
      );
      failures++;
    }
  }

  const resolved = getTemplateSuggestions(purpose);
  if (resolved.length !== 3) {
    console.error(`FAIL: ${purpose} -> getTemplateSuggestions() resolved only ${resolved.length}/3 (should match slot check above).`);
    failures++;
  }
}

console.log(`Checked ${CONTENT_PURPOSES.length} purposes x 3 slots against ${CARD_TEMPLATES.length} templates.`);

if (failures > 0) {
  console.error(`\n${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("All template suggestions resolve to real templates and variants.");
}

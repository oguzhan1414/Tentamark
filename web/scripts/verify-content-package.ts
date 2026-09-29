import assert from "node:assert/strict";
import { resolveContentPackageStatus } from "../src/lib/content/contentPackageStatus";
import { hasExactOwnedIds } from "../src/lib/video/videoJobSecurity";

assert.equal(resolveContentPackageStatus(0), "failed");
assert.equal(resolveContentPackageStatus(3), "partial_ready");
assert.equal(resolveContentPackageStatus(4), "ready");
assert.equal(hasExactOwnedIds(["a", "b"], ["b", "a"]), true);
assert.equal(hasExactOwnedIds(["a", "foreign"], ["a"]), false);

console.log("OK: package completion states and cross-brand media rejection contract verified.");

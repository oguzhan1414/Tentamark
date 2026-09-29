import assert from "node:assert/strict";
import { estimateRenderCostUsd, retryBackoffSeconds } from "../src/lib/video/renderMetrics";
import { resolveRenderProvider } from "../src/lib/video/renderProvider";

assert.deepEqual([1, 2, 3, 6].map(retryBackoffSeconds), [15, 30, 60, 300]);
assert.equal(estimateRenderCostUsd(90_000, 0.12), 0.18);
assert.equal(estimateRenderCostUsd(-1, 0.12), 0);
assert.equal(resolveRenderProvider("local").name, "local");
assert.throws(() => resolveRenderProvider("missing"), /Desteklenmeyen/);

console.log("OK: retry backoff, render cost and provider transition seam verified.");

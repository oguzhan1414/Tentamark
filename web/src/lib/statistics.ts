// Small, dependency-free statistics helpers — real math instead of the
// arbitrary fixed thresholds ("if the gap is more than 10 points") that used
// to stand in for significance testing across this codebase.

// Standard normal CDF, Zelen & Severo approximation (Abramowitz & Stegun
// 26.2.17) — accurate to ~7.5e-8, more than enough precision for a p-value
// threshold check. No stats library needed for this.
export function normalCdf(z: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228; // 1/sqrt(2*pi)

  if (z >= 0) {
    const t = 1 / (1 + p * z);
    return 1 - c * Math.exp((-z * z) / 2) * t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  }
  return 1 - normalCdf(-z);
}

export type ProportionTestResult = {
  zScore: number;
  pValue: number;
  /** p < 0.05, two-tailed. */
  significant: boolean;
};

/*
  One-proportion z-test with continuity correction: given a planned/expected
  proportion (p0) and an observed count out of n trials, is the deviation
  real or just noise from a small sample? A flat "gap > 10 points" rule
  treats a 10-point gap on 3 posts the same as a 10-point gap on 100 posts —
  the first is statistically meaningless, the second isn't. This accounts
  for sample size the way a fixed threshold structurally can't.
*/
export function oneProportionZTest(observedCount: number, n: number, plannedProportion: number): ProportionTestResult {
  const p0 = Math.max(0.0001, Math.min(0.9999, plannedProportion));
  const phat = observedCount / n;
  const se = Math.sqrt((p0 * (1 - p0)) / n);
  if (se === 0) return { zScore: 0, pValue: 1, significant: false };

  const rawDiff = Math.abs(phat - p0) - 1 / (2 * n);
  const z = Math.max(0, rawDiff) / se;
  const pValue = 2 * (1 - normalCdf(z));
  return { zScore: z, pValue, significant: pValue < 0.05 };
}

// Mean of a set of equal-length numeric vectors, element-wise — the
// "centroid" used for brand-voice consistency scoring (see
// getBrandVoiceConsistency.ts).
export function vectorCentroid(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) sum[i] += v[i];
  }
  return sum.map((s) => s / vectors.length);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

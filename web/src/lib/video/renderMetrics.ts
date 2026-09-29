export function retryBackoffSeconds(attemptNumber: number): number {
  return Math.min(300, 15 * 2 ** Math.max(0, attemptNumber - 1));
}

export function estimateRenderCostUsd(renderDurationMs: number, costPerMinute: number): number {
  if (!Number.isFinite(costPerMinute) || costPerMinute < 0) return 0;
  return Number(((Math.max(0, renderDurationMs) / 60_000) * costPerMinute).toFixed(6));
}

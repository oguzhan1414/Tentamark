export type ContentPackageStatus = "failed" | "partial_ready" | "ready";

export function resolveContentPackageStatus(successfulOutputs: number, expectedOutputs = 4): ContentPackageStatus {
  if (successfulOutputs <= 0) return "failed";
  if (successfulOutputs >= expectedOutputs) return "ready";
  return "partial_ready";
}

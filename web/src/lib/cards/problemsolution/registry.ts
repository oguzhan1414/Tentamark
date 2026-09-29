import type { ProblemSolutionCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderProblemSolutionStacked } from "./stacked";
import { renderProblemSolutionEditorial } from "./editorial";
import { renderProblemSolutionBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderProblemSolutionEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const PROBLEM_SOLUTION_VARIANTS: Record<string, (props: ProblemSolutionCardProps, tokens?: BrandDesignTokens) => string> = {
  stacked: renderProblemSolutionStacked,
  editorial: renderProblemSolutionEditorial,
  brutalist: renderProblemSolutionBrutalist,
};

export function pickProblemSolutionVariant(
  variantKey?: string
): (props: ProblemSolutionCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && PROBLEM_SOLUTION_VARIANTS[variantKey]) return PROBLEM_SOLUTION_VARIANTS[variantKey];
  return PROBLEM_SOLUTION_VARIANTS.stacked;
}

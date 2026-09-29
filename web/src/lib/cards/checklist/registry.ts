import type { ChecklistCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderChecklistAurora } from "./aurora";
import { renderChecklistCyber } from "./cyber";
import { renderChecklistDark } from "./dark";
import { renderChecklistEditorial } from "./editorial";
import { renderChecklistBrutalist } from "./brutalist";

// tokens is optional and only actually read by renderChecklistEditorial
// today — the other variants' character is untouched by BrandDesignTokens
// this pass.
export const CHECKLIST_VARIANTS: Record<string, (props: ChecklistCardProps, tokens?: BrandDesignTokens) => string> = {
  aurora: renderChecklistAurora,
  cyber: renderChecklistCyber,
  dark: renderChecklistDark,
  editorial: renderChecklistEditorial,
  brutalist: renderChecklistBrutalist,
};

export function pickChecklistVariant(
  variantKey?: string
): (props: ChecklistCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && CHECKLIST_VARIANTS[variantKey]) return CHECKLIST_VARIANTS[variantKey];
  return CHECKLIST_VARIANTS.aurora; // Default to Aurora Glass!
}

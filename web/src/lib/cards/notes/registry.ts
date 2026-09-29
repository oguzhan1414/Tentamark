import type { NotesCardProps } from "./types";
import type { BrandDesignTokens } from "@/lib/brand/designTokens";
import { renderNotesApple } from "./applenotes";
import { renderNotesNotion } from "./notion";
import { renderNotesDark } from "./darknotes";

// tokens is optional and only actually read by renderNotesNotion today —
// the other variants' character is untouched by BrandDesignTokens this pass.
export const NOTES_VARIANTS: Record<string, (props: NotesCardProps, tokens?: BrandDesignTokens) => string> = {
  applenotes: renderNotesApple,
  notion: renderNotesNotion,
  darknotes: renderNotesDark,
};

export function pickNotesVariant(variantKey?: string): (props: NotesCardProps, tokens?: BrandDesignTokens) => string {
  if (variantKey && NOTES_VARIANTS[variantKey]) return NOTES_VARIANTS[variantKey];
  return NOTES_VARIANTS.applenotes;
}

"use client";

import { useRef, useState, useCallback } from "react";
import type { ContentFormat, GeneratedDrafts, LaunchPlatform } from "@/lib/ai/generateDrafts";

export interface ComposeDraftState {
  idea: string;
  selectedPlatforms: LaunchPlatform[];
  format: ContentFormat;
  tone: string;
  drafts: GeneratedDrafts | null;
  activePlatformTab: LaunchPlatform;
  draftAssigneeId?: string;
  timestamp: number;
}

const STORAGE_PREFIX = "tentamark_compose_draft_";

export function useComposeAutosave(brandId: string | undefined) {
  const storageKey = brandId ? `${STORAGE_PREFIX}${brandId}` : null;

  const [hasSavedDraft, setHasSavedDraft] = useState(() => {
    if (!storageKey || typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ComposeDraftState;
        if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
          if (parsed.idea?.trim() || (parsed.drafts && Object.keys(parsed.drafts).length > 0)) {
            return true;
          }
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      // Ignore
    }
    return false;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save draft with debounce
  const saveDraft = useCallback(
    (data: Omit<ComposeDraftState, "timestamp">) => {
      if (!storageKey || typeof window === "undefined") return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        try {
          const hasContent =
            data.idea?.trim().length > 0 ||
            (data.drafts &&
              Object.values(data.drafts).some((d) => d && d.trim().length > 0));

          if (hasContent) {
            const payload: ComposeDraftState = {
              ...data,
              timestamp: Date.now(),
            };
            localStorage.setItem(storageKey, JSON.stringify(payload));
            setHasSavedDraft(true);
          }
        } catch {
          // localStorage full or disabled
        }
      }, 1200);
    },
    [storageKey]
  );

  // Read saved draft
  const getDraft = useCallback((): ComposeDraftState | null => {
    if (!storageKey || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as ComposeDraftState;
    } catch {
      return null;
    }
  }, [storageKey]);

  // Clear saved draft
  const clearDraft = useCallback(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      if (timerRef.current) clearTimeout(timerRef.current);
      localStorage.removeItem(storageKey);
      setHasSavedDraft(false);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return {
    hasSavedDraft,
    saveDraft,
    getDraft,
    clearDraft,
  };
}

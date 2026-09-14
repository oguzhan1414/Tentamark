"use client";

import { createContext, useContext, useState } from "react";
import ComposeModal from "@/components/dashboard/ComposeModal";
import type { MediaLibraryItem } from "@/lib/media/useMediaLibrary";

type ComposeModalOptions = {
  campaignId?: string;
  date?: string;
  hour?: number;
  // Set when opened by dragging one or more Medya panel thumbnails onto a
  // calendar day — pre-attaches them instead of leaving Compose's media
  // step empty (the whole point of drag-to-schedule being faster than the
  // normal flow). A checkbox-selected group drags together as a real
  // carousel; a lone thumbnail is just a one-item array.
  initialMedia?: MediaLibraryItem[];
  // Fires right after a successful save — lets the calling page (e.g.
  // Calendar) refetch its own list without the modal needing to know
  // anything about who opened it.
  onSaved?: () => void;
};

const ComposeModalContext = createContext<{ open: (options?: ComposeModalOptions) => void } | null>(null);

// Lets any component under the dashboard shell (a calendar day cell, a
// campaign's "+ İçerik Üret", an empty-state CTA, ...) trigger the one real
// content studio without needing to know about each other — same pattern as
// BrandProvider. This is now the ONLY way content gets created anywhere in
// the app (the standalone /dashboard/compose page was removed once Calendar
// itself could reach full studio power through this same modal).
export function useComposeModal() {
  const ctx = useContext(ComposeModalContext);
  if (!ctx) throw new Error("useComposeModal must be used within a ComposeModalProvider");
  return ctx;
}

export function ComposeModalProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ComposeModalOptions | null>(null);

  return (
    <ComposeModalContext.Provider value={{ open: (opts) => setOptions(opts ?? {}) }}>
      {children}
      {options && (
        <ComposeModal
          onClose={() => setOptions(null)}
          initialCampaignId={options.campaignId}
          initialDate={options.date}
          initialHour={options.hour}
          initialMedia={options.initialMedia}
          onSubmitted={options.onSaved}
        />
      )}
    </ComposeModalContext.Provider>
  );
}

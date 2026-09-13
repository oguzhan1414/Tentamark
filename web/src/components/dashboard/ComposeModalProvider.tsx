"use client";

import { createContext, useContext, useState } from "react";
import ComposeModal from "@/components/dashboard/ComposeModal";

type ComposeModalOptions = {
  campaignId?: string;
  date?: string;
  hour?: number;
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
          onSubmitted={options.onSaved}
        />
      )}
    </ComposeModalContext.Provider>
  );
}

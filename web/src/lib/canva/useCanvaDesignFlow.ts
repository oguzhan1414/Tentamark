"use client";

import { useEffect, useState } from "react";
import type { MediaLibraryItem } from "@/lib/media/useMediaLibrary";

/*
  Shared by every surface that offers "Canva ile Tasarla" (MediaLibraryModal,
  CalendarMediaPanel, and anywhere else media gets attached) — the popup +
  postMessage + finalize handshake is identical everywhere it appears, only
  the button/empty-state chrome around it differs per surface.
*/
export function useCanvaDesignFlow(onImported: (item: MediaLibraryItem) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "canva-design-complete") return;
      const designId = event.data.designId;
      if (typeof designId !== "string") return;

      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/canva/design/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tasarım içeri aktarılamadı.");
        onImported(data.media as MediaLibraryItem);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tasarım içeri aktarılamadı.");
      } finally {
        setBusy(false);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onImported]);

  async function start() {
    setError(null);
    // Open synchronously (before the await) so browsers don't treat it as
    // an unrequested popup and block it.
    const popup = window.open("about:blank", "canva-editor", "width=1200,height=850");
    try {
      const res = await fetch("/api/canva/design/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Canva tasarımı başlatılamadı.");
      if (popup) popup.location.href = data.editUrl;
    } catch (err) {
      popup?.close();
      setError(err instanceof Error ? err.message : "Canva tasarımı başlatılamadı.");
    }
  }

  return { busy, error, start };
}

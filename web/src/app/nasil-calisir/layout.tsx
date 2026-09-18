import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tentamark Nasıl Çalışır? | İçerik Planlama ve Onay",
  description: "Tentamark ile marka bilgisi, AI içerik taslakları, takvim ve yayın öncesi onay akışını inceleyin.",
  alternates: { canonical: "https://tentamark.com/nasil-calisir" },
};

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return children;
}

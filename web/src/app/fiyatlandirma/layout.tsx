import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fiyatlandırma ve Planlar | Tentamark",
  description: "Tentamark planlarını, çalışma alanı ve içerik sınırlarını karşılaştırın. İşletmenize uygun planı seçin.",
  alternates: { canonical: "https://tentamark.com/fiyatlandirma" },
};

export default function PricingLayout({ children }: LayoutProps<"/fiyatlandirma">) {
  return children;
}

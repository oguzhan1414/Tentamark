import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sosyal Medya Platformları | Tentamark",
  description:
    "Tentamark ile içerik hazırlama ve planlama akışlarını platform bazında keşfedin. Kullanılabilir bağlantıları ve yakında gelecek entegrasyonları inceleyin.",
  alternates: { canonical: "https://tentamark.com/platformlar" },
};

export default function PlatformsLayout({ children }: LayoutProps<"/platformlar">) {
  return children;
}

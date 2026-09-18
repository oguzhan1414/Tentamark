import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sosyal Medya ve AI Pazarlama Rehberleri | Tentamark Blog",
  description:
    "Küçük işletmeler için sosyal medya planlama, içerik üretimi, onay akışı ve performans ölçümü üzerine uygulanabilir rehberler.",
  alternates: { canonical: "https://tentamark.com/blog" },
  openGraph: {
    title: "Tentamark Blog",
    description: "Sosyal medya ve AI pazarlama üzerine uygulanabilir rehberler.",
    url: "https://tentamark.com/blog",
    type: "website",
    locale: "tr_TR",
  },
};

export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return children;
}

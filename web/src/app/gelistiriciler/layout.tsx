import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API & MCP Dokümantasyonu | Tentamark",
  description:
    "Tentamark'ın Model Context Protocol (MCP) sunucusuyla Claude, ChatGPT veya Cursor'ı markanızın takvimine bağlayın. 13 araç, OAuth veya kişisel erişim jetonuyla bağlanma, ve her yazma işleminin nasıl güvenli tutulduğu.",
  alternates: { canonical: "https://tentamark.com/gelistiriciler" },
};

export default function DevelopersLayout({ children }: LayoutProps<"/gelistiriciler">) {
  return children;
}

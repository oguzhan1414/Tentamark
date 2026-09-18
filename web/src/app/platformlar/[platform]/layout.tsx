import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PLATFORM_REGISTRY } from "@/lib/platformData";
import type { PlatformName } from "@/components/PlatformIcon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const { platform } = await params;
  const config = PLATFORM_REGISTRY[platform as PlatformName];
  if (!config) return { title: "Platform bulunamadı | Tentamark", robots: { index: false } };

  const url = `https://tentamark.com/platformlar/${platform}`;
  return {
    title: `${config.name} İçerik Planlama | Tentamark`,
    description: config.shortDesc,
    alternates: { canonical: url },
    openGraph: {
      title: `${config.name} İçerik Planlama | Tentamark`,
      description: config.shortDesc,
      url,
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default function PlatformDetailLayout({
  children,
}: { children: ReactNode }) {
  return children;
}

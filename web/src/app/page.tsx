import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import LandingPageClient from "./LandingPageClient";

const siteUrl = "https://tentamark.com";

export const metadata: Metadata = {
  title: "Tentamark - Markanız İçin Çalışan AI Marketing Manager",
  description:
    "Marka bilgilerinize göre sosyal medya içerik taslakları ve haftalık plan hazırlayın; platformlara özel kancalar ve insan onaylı yayın akışını tek yerden yönetin.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Tentamark | Markanız İçin Çalışan AI Marketing Manager",
    description:
      "Markanıza uygun içerikleri planlayın, gözden geçirin ve yayın sürecini tek yerden yönetin. 14 gün ücretsiz deneyin.",
    url: siteUrl,
    siteName: "Tentamark",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/footer.png`,
        width: 1200,
        height: 630,
        alt: "Tentamark AI Marketing Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentamark | AI Marketing Manager",
    description:
      "Sosyal medya içerik planlama, AI taslak hazırlama ve yayın onay akışı tek çatı altında.",
  },
};

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Tentamark",
      description: "Markanız İçin Çalışan AI Marketing Manager",
      inLanguage: ["tr-TR", "en-US"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Tentamark",
      url: siteUrl,
      logo: `${siteUrl}/brand/tentamark-mark.svg`,
      sameAs: [
        "https://instagram.com",
        "https://tiktok.com",
        "https://linkedin.com",
        "https://x.com",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "support@tentamark.com",
          contactType: "customer support",
          availableLanguage: ["Turkish", "English"],
        },
        {
          "@type": "ContactPoint",
          email: "info@tentamark.com",
          contactType: "sales",
          availableLanguage: ["Turkish", "English"],
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Tentamark AI Marketing Manager",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "14 Günlük Ücretsiz Deneme",
      },
    },
  ],
};

export default function Home() {
  return (
    <LanguageProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <LandingPageClient />
    </LanguageProvider>
  );
}

import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import ContactContent from "./ContactContent";

const url = "https://tentamark.com/iletisim";

export const metadata: Metadata = {
  title: "İletişim & Destek | Tentamark - Bir Sorunuz mu Var? Konuşalım",
  description:
    "Tentamark müşteri desteği ve kurumsal satış ekibine ulaşın. Teknik destek, hesap yönetimi, ajans ortaklıkları ve özel demo talepleri için bize yazın.",
  alternates: { canonical: url },
  openGraph: {
    title: "İletişim & Destek | Tentamark",
    description:
      "Tentamark müşteri desteği ve satış ekibine ulaşın. Sorularınız için mesai saatlerinde ortalama 2 saat içinde yanıt veriyoruz.",
    url,
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "İletişim & Destek | Tentamark",
    description:
      "Tentamark müşteri desteği ve kurumsal satış ekibine ulaşın.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tentamark.com/#organization",
      name: "Tentamark",
      url: "https://tentamark.com/",
      logo: "https://tentamark.com/brand/tentamark-mark.svg",
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
      "@type": "ContactPage",
      "@id": `${url}#webpage`,
      url,
      name: "İletişim & Destek | Tentamark",
      inLanguage: ["tr-TR", "en-US"],
      isPartOf: { "@id": "https://tentamark.com/#website" },
      about: { "@id": "https://tentamark.com/#organization" },
      description:
        "Tentamark müşteri desteği ve satış ekibi iletişim kanalları.",
    },
  ],
};

export default function ContactPage() {
  return (
    <LanguageProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <ContactContent />
    </LanguageProvider>
  );
}

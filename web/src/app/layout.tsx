import type { Metadata } from "next";
import { Baloo_2, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tentamark - Markanız için çalışan AI Marketing Manager",
  description:
    "Marka bilgilerinize göre sosyal medya içerik taslakları ve haftalık plan hazırlayın; içerikleri gözden geçirip onay akışını yönetin.",
  metadataBase: new URL("https://tentamark.com"),
  icons: {
    icon: [
      { url: "/brand/tentamark-mark-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Tentamark | AI Marketing Manager",
    description: "Markanıza uygun içerikleri planlayın, gözden geçirin ve yayın sürecini tek yerden yönetin.",
    url: "https://tentamark.com",
    siteName: "Tentamark",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://tentamark.com/brand/tentamark-mark-512.png",
        width: 512,
        height: 512,
        alt: "Tentamark Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Tentamark | AI Marketing Manager",
    description: "Markanıza uygun içerikleri planlayın, gözden geçirin ve yayın sürecini tek yerden yönetin.",
    images: ["https://tentamark.com/brand/tentamark-mark-512.png"],
  },
  verification: {
    other: {
      "msvalidate.01": "6CD13901A3F4BF273863522FE5935BCF",
    },
  },
};

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tentamark.com/#organization",
      name: "Tentamark",
      alternateName: ["Tentamark AI", "Tentamark AI Marketing Manager"],
      url: "https://tentamark.com",
      logo: {
        "@type": "ImageObject",
        url: "https://tentamark.com/brand/tentamark-mark-512.png",
        width: 512,
        height: 512,
      },
      description:
        "Tentamark, markanız için çalışan otonom AI Marketing Manager platformudur. Sosyal medya içerik planlama, editoryal takvim ve insan onaylı yayın akışı sunar.",
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@tentamark.com",
        contactType: "customer service",
        availableLanguage: ["Turkish", "English"],
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tentamark.com/#software",
      name: "Tentamark AI Marketing Manager",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      url: "https://tentamark.com",
      description: "Yapay zeka destekli otonom sosyal medya yönetim ve içerik planlama yazılımı.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        description: "14 Gün Ücretsiz Deneme",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://tentamark.com/#website",
      url: "https://tentamark.com",
      name: "Tentamark",
      publisher: {
        "@id": "https://tentamark.com/#organization",
      },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink font-body">
        {children}
      </body>
    </html>
  );
}

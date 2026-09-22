import type { Metadata } from "next";
import WhyTentamarkContent from "./WhyTentamarkContent";

const url = "https://tentamark.com/neden-tentamark";

export const metadata: Metadata = {
  title: "AI Sosyal Medya Yönetim Aracı ve Karşılaştırma Rehberi | Tentamark",
  description:
    "En iyi AI sosyal medya yönetim aracı karşılaştırması. Geleneksel zamanlayıcılar ve genel yapay zekalar karşısında kalıcı Marka DNA'sı, kanca analitiği ve otonom içerik planlama.",
  keywords: [
    "AI sosyal medya yönetim aracı",
    "sosyal medya yönetim araçları",
    "sosyal medya içerik planlama",
    "yapay zeka pazarlama yöneticisi",
    "Buffer alternatifi",
    "Hootsuite alternatifi",
    "marka DNA sosyal medya",
    "otonom sosyal medya planlayıcı",
    "sosyal medya yönetim aracı karşılaştırması",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "AI Sosyal Medya Yönetim Aracı ve Karşılaştırma Rehberi | Tentamark",
    description:
      "Boş bir takvim değil, markanızı tanıyan bir pazarlama aklı. Geleneksel zamanlayıcılar ve genel AI araçları ile detaylı karşılaştırma matrisi.",
    url,
    type: "website",
    locale: "tr_TR",
    images: [
      {
        url: "https://tentamark.com/images/why-us/why-hero-orchestrator.jpg",
        width: 1280,
        height: 720,
        alt: "Tentamark AI Sosyal Medya Yönetim Aracı Orkestrasyon Mimarisi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Sosyal Medya Yönetim Aracı ve Karşılaştırma Rehberi | Tentamark",
    description:
      "Zamanlayıcılar boş takvim verir, Tentamark ise o takvimi yöneten pazarlama aklını. Detaylı rakip analizi ve mimari karşılaştırma.",
    images: ["https://tentamark.com/images/why-us/why-hero-orchestrator.jpg"],
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
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tentamark.com/#software",
      name: "Tentamark AI Sosyal Medya Yönetim Aracı",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web-based (Cloud SaaS)",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        availability: "https://schema.org/InStock",
      },
      description:
        "Küçük işletmeler ve ekipler için otonom AI sosyal medya yönetim ve içerik planlama yazılımı.",
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "AI Sosyal Medya Yönetim Aracı ve Karşılaştırma Rehberi | Neden Tentamark?",
      inLanguage: "tr-TR",
      about: { "@id": "https://tentamark.com/#organization" },
      description:
        "Sosyal medya zamanlayıcıları, genel yapay zeka araçları ve pazarlama ajansları karşısında Tentamark'ın farkını açıklayan kapsamlı SEO karşılaştırma rehberi.",
      dateModified: "2026-09-22",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Ana Sayfa",
          "item": "https://tentamark.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Neden Tentamark?",
          "item": url
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "ChatGPT varken neden Tentamark gibi özel bir AI sosyal medya yönetim aracı kullanmalıyım?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ChatGPT her yeni sohbette marka dilinizi unutur ve her seferinde uzun promptlar yazmanızı gerektirir. Sosyal medya platformlarına doğrudan bağlı değildir ve takvim oluşturamaz. Tentamark ise kalıcı Marka DNA'sı hafızasına sahiptir, haftalık içerik paketini proaktif olarak hazırlar ve platforma özel formatlar üretir.",
          },
        },
        {
          "@type": "Question",
          name: "Zaten Buffer veya Hootsuite kullanıyorum, Tentamark'a geçmeme gerek var mı?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Buffer ve Hootsuite mekanik zamanlayıcılardır; yalnızca boş bir takvim kutusu sunar ve içeriği kullanıcının sıfırdan yazmasını bekler. Vaktiniz olmadığında takviminiz boş kalır. Tentamark ise içerik stratejisini, kancaları ve taslakları önden hazırlar; siz sadece inceler ve tek tıkla onaylarsınız.",
          },
        },
        {
          "@type": "Question",
          name: "Tentamark benim onayım olmadan sosyal medya hesaplarımda otomatik paylaşım yapar mı?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hayır. Tentamark katı 'İnsan Onaylı Yapay Zeka (Human-in-the-Loop)' mimarisiyle çalışır. Tüm içerikler onay masasında sizin incelemenize sunulur. Siz onaylamadan hiçbir gönderi canlıya çıkmaz.",
          },
        },
        {
          "@type": "Question",
          name: "Bir dijital pazarlama ajansıyla çalışırken Tentamark kullanılabilir mi?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Evet. Butik ajanslar ve pazarlama yöneticileri, rutin taslak üretim süresini hızlandırmak için Tentamark'ı kullanır. Bu sayede ekipler operasyonel metin yazımı yerine strateji ve reklam optimizasyonuna odaklanabilir.",
          },
        },
      ],
    },
  ],
};

export default function WhyTentamarkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <WhyTentamarkContent />
    </>
  );
}

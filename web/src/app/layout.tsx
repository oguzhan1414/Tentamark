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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-body">
        {children}
      </body>
    </html>
  );
}

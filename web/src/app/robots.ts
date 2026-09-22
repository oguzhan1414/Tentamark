import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/onboarding/", "/davet/", "/onay/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "bingbot",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/onboarding/", "/davet/", "/onay/"],
      },
    ],
    sitemap: "https://tentamark.com/sitemap.xml",
  };
}

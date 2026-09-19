import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/blogUtils";
import { PLATFORM_REGISTRY } from "@/lib/platformData";

const baseUrl = "https://tentamark.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/nasil-calisir",
    "/tentamark-nedir",
    "/fiyatlandirma",
    "/platformlar",
    "/blog",
    "/iletisim",
    "/gizlilik",
    "/kullanim-kosullari",
  ];

  return [
    ...pages.map((path) => ({ url: `${baseUrl}${path}` })),
    ...Object.keys(PLATFORM_REGISTRY).map((slug) => ({
      url: `${baseUrl}/platformlar/${slug}`,
    })),
    ...getAllPosts().map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
    })),
  ];
}

import { lookup } from "node:dns/promises";

const MAX_EXTRACT_CHARS = 15000;

// Deliberately NOT in autofillFromWebsite.ts, which is a "use server" file —
// Next.js requires every export of a Server Actions module to be an async
// function, and extractSignals() below is a pure sync parser. These are
// plain utilities shared by autofillFromWebsite.ts and scrapeProductUrl.ts.

function isPrivateIp(ip: string): boolean {
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata 169.254.169.254
    return false;
  }
  const lower = ip.toLowerCase();
  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
}

export async function resolveAndValidateUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Geçersiz URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Sadece http/https adresleri desteklenir.");
  }
  if (url.hostname.toLowerCase() === "localhost") {
    throw new Error("Bu adres desteklenmiyor.");
  }

  let address: string;
  try {
    address = (await lookup(url.hostname)).address;
  } catch {
    throw new Error("Adres çözümlenemedi.");
  }
  if (isPrivateIp(address)) {
    throw new Error("Bu adres desteklenmiyor.");
  }
  return url;
}

function extractTag(html: string, pattern: RegExp): string {
  return pattern.exec(html)?.[1]?.trim() ?? "";
}

export function extractSignals(html: string) {
  const title = extractTag(html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = extractTag(
    html,
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const ogTitle = extractTag(
    html,
    /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const ogDescription = extractTag(
    html,
    /<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const ogSiteName = extractTag(
    html,
    /<meta\s+[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  const lang = extractTag(html, /<html[^>]*\slang=["']([a-zA-Z-]+)["']/i);

  // Extract application/ld+json blocks
  const ldMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const ldJsonText = ldMatches
    .map((m) => m[1].trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 3000);

  // Extract body content and strip scripts/styles/SVGs/tags
  let bodyContent = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) bodyContent = bodyMatch[1];

  const cleanedBody = bodyContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_EXTRACT_CHARS);

  return { title, description, ogTitle, ogDescription, ogSiteName, lang, ldJsonText, cleanedBody };
}

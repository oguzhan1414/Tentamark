// IndexNow URL Submission Script for Tentamark
// Protocol docs: https://www.indexnow.org/documentation

const API_KEY = "3144e97b168a40d2a1d6855df9bdfd7a";
const HOST = "tentamark.com";
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${API_KEY}.txt`;

const STATIC_URLS = [
  "",
  "/tentamark-nedir",
  "/neden-tentamark",
  "/nasil-calisir",
  "/blog",
  "/fiyatlandirma",
  "/platformlar",
  "/iletisim",
  "/gizlilik",
  "/kullanim-kosullari",
];

const PLATFORM_URLS = [
  "/platformlar/instagram",
  "/platformlar/tiktok",
  "/platformlar/youtube",
  "/platformlar/linkedin",
  "/platformlar/x",
  "/platformlar/facebook",
  "/platformlar/pinterest",
  "/platformlar/telegram",
  "/platformlar/threads",
  "/platformlar/bluesky",
  "/platformlar/woocommerce",
  "/platformlar/shopify",
];

const BLOG_SLUGS = [
  // 11 Fresh High-Authority SEO Posts
  "sosyal-medya-icerik-takvimi-nasil-hazirlanir",
  "marka-dna-nedir-nasil-olusturulur",
  "sosyal-medya-kancasi-hook-ornekleri",
  "instagram-carousel-nasil-hazirlanir-algoritma",
  "b2b-linkedin-icerik-stratejisi",
  "otonom-pazarlama-nedir-ai-pazarlama-yoneticisi",
  "e-ticaret-sosyal-medya-pazarlama-rehberi",
  "founder-led-marketing-kurucu-markasi-nasil-yapilir",
  "sosyal-medyada-etkilesim-artirma-yollari",
  "butik-ajanslar-icin-sosyal-medya-otomasyonu",
  // Base SEO Posts
  "kucuk-isletmeler-icin-sosyal-medya-yonetimi",
  "sosyal-medya-gonderi-onay-sureci",
  "sosyal-medya-yonetim-araci-nasil-secilir",
  "yapay-zeka-ile-sosyal-medya-yonetimi",
  // Brand & Strategy Articles
  "7-11-4-kurali-marka-guveni",
  "marka-hafizasinin-psikolojisi",
  "insanlar-neden-bazi-markalara-guvenir",
  "marka-kimligi-nedir-logo-yapmaktan-fazlasi",
  "marka-sesi-nasil-olusturulur",
  "positioning-nedir-zihinde-yer-edinmek",
  "2026-sosyal-medya-stratejisi",
  "content-pillar-nedir-icerik-sutunlari",
  "70-20-10-icerik-kurali",
  "30-gunluk-sosyal-medya-icerik-plani-nasil-hazirlanir",
  "ayni-icerigi-her-platformda-paylasmak-neden-calismaz",
  // Channel Guides
  "instagram-marketing-rehberi-2026",
  "instagram-reels-stratejisi-kanca-ve-buyume",
  "instagram-icerik-fikirleri-markalar-icin-50-fikir",
  "instagram-begeni-degil-hangi-metrikler-onemli",
  "tiktok-marketing-rehberi-2026",
  "tiktok-icin-30-video-fikri",
  "linkedin-marketing-rehberi-2026",
  "founder-led-marketing-nedir",
  "build-in-public-nedir",
  "x-marka-buyutme-rehberi-2026",
  // Growth & AI Articles
  "ai-marketing-nedir-2026-rehber",
  "ai-marketing-manager-nedir",
  "0dan-marka-olusturmak-ilk-100-musteri",
  "product-market-fit-nedir",
  "growth-loop-nedir-funneldan-farki",
  "iyi-urun-neden-tek-basina-yetmez-distribution-problemi",
];

const urlList = [
  ...STATIC_URLS.map((p) => `${BASE_URL}${p}`),
  ...PLATFORM_URLS.map((p) => `${BASE_URL}${p}`),
  ...BLOG_SLUGS.map((slug) => `${BASE_URL}/blog/${slug}`),
];

console.log(`[IndexNow] Preparing to submit ${urlList.length} URLs for ${HOST}...`);

const payload = {
  host: HOST,
  key: API_KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList,
};

async function submitIndexNow() {
  const endpoints = [
    "https://api.indexnow.org/IndexNow",
    "https://www.bing.com/IndexNow",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`[IndexNow] Posting to ${endpoint}...`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log(`[IndexNow] Status from ${endpoint}: ${res.status} ${res.statusText}`);
      const text = await res.text();
      if (text) {
        console.log(`[IndexNow] Response body:`, text);
      }
      if (res.status === 200 || res.status === 202) {
        console.log(`[IndexNow] SUCCESS! URLs successfully submitted to ${endpoint}`);
      }
    } catch (err) {
      console.error(`[IndexNow] Error submitting to ${endpoint}:`, err.message);
    }
  }
}

submitIndexNow();

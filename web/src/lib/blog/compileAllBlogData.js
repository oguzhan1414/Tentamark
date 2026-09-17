const fs = require('fs');
const path = require('path');

// Read the 5 TS parts and parse their exported objects
function loadPart(fileName) {
  const filePath = path.join(__dirname, 'articles', fileName);
  let content = fs.readFileSync(filePath, 'utf8');
  // Strip TypeScript export syntax to eval as JS
  content = content.replace(/export const \w+\s*=\s*/, 'module.exports = ');
  const m = { exports: {} };
  const fn = new Function('module', 'exports', content);
  fn(m, m.exports);
  return m.exports;
}

const p1 = loadPart('part1_brand.ts');
const p2 = loadPart('part2_strategy.ts');
const p3 = loadPart('part3_instagram.ts');
const p4 = loadPart('part4_channels.ts');
const p5 = loadPart('part5_growth_ai.ts');

const allRaw = [...p1, ...p2, ...p3, ...p4, ...p5];
console.log('Loaded articles count:', allRaw.length);

// Load image map
const imageMapPath = path.join(__dirname, 'blogImagesMap.json');
const imageMap = JSON.parse(fs.readFileSync(imageMapPath, 'utf8'));

function getImagesForPost(id) {
  const list = imageMap[String(id)] || [];
  return list.map(f => `/blog/${id}/${f}`);
}

const defaultAuthor = {
  name: "Tentamark Strateji Ekibi",
  role: "Pazarlama ve AI Direktörlüğü",
  avatar: "/brand/tentamark-mark.svg",
  bio: "Tentamark büyüme ekibi; yapay zeka, sosyal medya algoritmaları ve marka psikolojisi üzerine derinlemesine içgörüler ve uygulanabilir büyüme taktikleri üretir."
};

const fullPosts = allRaw.map((art) => {
  const images = getImagesForPost(art.id);
  const coverImage = images[0] || "/brand/tentamark-mark.svg";

  // Map remaining images into sections
  const subImages = images.slice(1);
  const sectionsWithImages = art.sections.map((sec, idx) => {
    const secImage = subImages[idx];
    return {
      ...sec,
      image: secImage ? {
        url: secImage,
        caption: `${art.title} — İlgili Analiz ve Stratejik İnfografik`,
        alt: `${art.title} infografik ${idx + 1}`
      } : undefined
    };
  });

  const tableOfContents = art.sections.map(s => ({
    id: s.id,
    title: s.title
  }));

  return {
    ...art,
    author: defaultAuthor,
    coverImage,
    images,
    tableOfContents,
    sections: sectionsWithImages
  };
});

const fileHeader = `// GENERATED FILE - TENTAMARK BLOG DATA (27 Comprehensive Marketing Masterclasses)
import { BlogPost } from "./blogTypes";

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(fullPosts, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'blogData.ts'), fileHeader, 'utf8');
console.log('Successfully generated blogData.ts with', fullPosts.length, 'articles.');

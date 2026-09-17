export type BlogCategory =
  | "marka-kimlik"
  | "strateji-planlama"
  | "platform-rehberleri"
  | "founder-led"
  | "yapay-zeka"
  | "growth-girisim";

export interface CategoryMeta {
  id: BlogCategory;
  name: string;
  slug: string;
  description: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
  bio?: string;
}

export interface BlogCallout {
  type: "takeaway" | "tip" | "quote" | "checklist";
  title: string;
  text?: string;
  items?: string[];
}

export interface BlogImage {
  url: string;
  caption: string;
  alt: string;
}

export interface BlogSection {
  id: string;
  title: string;
  lead?: string;
  paragraphs: string[];
  image?: BlogImage;
  callout?: BlogCallout;
  keyPoints?: string[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: BlogCategory;
  categoryLabel: string;
  readingTime: number; // in minutes
  publishedAt: string;
  author: BlogAuthor;
  coverImage: string;
  images: string[];
  tags: string[];
  featured?: boolean;
  tableOfContents: { id: string; title: string }[];
  sections: BlogSection[];
}

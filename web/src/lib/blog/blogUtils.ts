import { BlogPost, BlogCategory } from "./blogTypes";
import { BLOG_POSTS } from "./blogData";
import { BLOG_CATEGORIES } from "./blogCategories";

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getFeaturedPost(): BlogPost {
  return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory | "all"): BlogPost[] {
  if (category === "all") return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.category === category);
}

export function getRelatedPosts(currentId: number, limit = 3): BlogPost[] {
  const current = BLOG_POSTS.find((p) => p.id === currentId);
  if (!current) return BLOG_POSTS.slice(0, limit);

  // Match same category first, exclude current
  const sameCategory = BLOG_POSTS.filter((p) => p.id !== currentId && p.category === current.category);
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Otherwise fill with others
  const others = BLOG_POSTS.filter((p) => p.id !== currentId && p.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
}

export function getAdjacentPosts(currentId: number): {
  prev: BlogPost | null;
  next: BlogPost | null;
} {
  const currentIndex = BLOG_POSTS.findIndex((p) => p.id === currentId);
  if (currentIndex === -1) return { prev: null, next: null };

  const prev = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const next = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  return { prev, next };
}

export function searchPosts(query: string, category: string = "all"): BlogPost[] {
  const normalizedQuery = query.toLowerCase().trim();

  return BLOG_POSTS.filter((post) => {
    const matchesCategory = category === "all" || post.category === category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const inTitle = post.title.toLowerCase().includes(normalizedQuery);
    const inExcerpt = post.excerpt.toLowerCase().includes(normalizedQuery);
    const inTags = post.tags.some((t) => t.toLowerCase().includes(normalizedQuery));

    return inTitle || inExcerpt || inTags;
  });
}

export function getCategoryMeta(categoryId: BlogCategory) {
  return BLOG_CATEGORIES.find((c) => c.id === categoryId);
}

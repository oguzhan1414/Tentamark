import type { CalendarPost } from "./types";

export type CalendarPostGroup = {
  key: string;
  // First platform in the group — the one whose image/caption the merged
  // card actually shows. Media is attached at the content level (same
  // imageUrl on every platform row), so which one is "hero" only affects
  // which caption text is previewed, not the thumbnail.
  hero: CalendarPost;
  // Every platform this content is going out to, hero included — order
  // matches the order platforms were selected in Compose.
  members: CalendarPost[];
};

// One idea can target several platforms at once (Instagram + Facebook +
// TikTok...), and realPosts in page.tsx deliberately keeps one CalendarPost
// per (content, platform) pair so each platform's own status/schedule stays
// independent. This is purely a render-time grouping on top of that — it
// merges same-content posts back into a single card (with the other
// platforms shown as small badges) instead of repeating the same idea once
// per platform in a day cell. Falls back to grouping by the post's own id
// for anything without a contentId (demo posts), so nothing accidentally
// merges with something unrelated.
export function groupCalendarPosts(posts: CalendarPost[]): CalendarPostGroup[] {
  const order: string[] = [];
  const map = new Map<string, CalendarPost[]>();
  for (const post of posts) {
    const key = post.contentId ?? post.id;
    if (!map.has(key)) {
      order.push(key);
      map.set(key, []);
    }
    map.get(key)!.push(post);
  }
  return order.map((key) => {
    const members = map.get(key)!;
    return { key, hero: members[0], members };
  });
}

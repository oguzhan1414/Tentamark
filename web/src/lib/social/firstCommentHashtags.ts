// Used only by /api/scheduler/publish when a content_platforms row has
// hashtags_as_first_comment set — the caption stored in the DB always keeps
// its hashtags inline (that's what Compose shows/edits), this just computes
// what actually gets sent to the platform at publish time.
export function stripHashtagsFromCaption(caption: string, hashtags: string[]): string {
  if (hashtags.length === 0) return caption;
  let result = caption;
  for (const tag of hashtags) {
    result = result.split(tag).join("");
  }
  // Collapse the blank lines/trailing spaces the removed tags leave behind.
  return result
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

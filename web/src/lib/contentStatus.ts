export type UIStatus = "review" | "scheduled" | "published" | "failed";

export const STATUS_LABEL: Record<UIStatus, { label: string; className: string }> = {
  published: { label: "Yayınlandı", className: "bg-mint/10 text-mint" },
  scheduled: { label: "Zamanlandı", className: "bg-accent-subtle text-accent-text" },
  review: { label: "Onay bekliyor", className: "bg-coral/10 text-coral-bright" },
  failed: { label: "Hata", className: "bg-coral-bright/10 text-coral-bright" },
};

/*
  content.status decides review-vs-scheduled; content_platforms.status only
  becomes meaningful once the scheduler (checklist phase 7) actually attempts
  a publish — until then every row is PENDING regardless of approval state.
*/
export function deriveStatus(contentStatus: string, cpStatus: string): UIStatus {
  if (cpStatus === "PUBLISHED") return "published";
  if (cpStatus === "FAILED" || cpStatus === "NEEDS_USER_ACTION") return "failed";
  if (contentStatus === "APPROVED" || contentStatus === "SCHEDULED") return "scheduled";
  return "review";
}

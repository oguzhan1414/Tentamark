export type UIStatus = "draft" | "review" | "scheduled" | "published" | "failed";

export const STATUS_LABEL: Record<UIStatus, { label: string; className: string }> = {
  draft: { label: "Taslak", className: "bg-slate-100 text-slate-500" },
  published: { label: "Yayınlandı", className: "bg-mint/10 text-mint" },
  scheduled: { label: "Zamanlandı", className: "bg-accent-subtle text-accent-text" },
  review: { label: "Onay bekliyor", className: "bg-coral/10 text-coral-bright" },
  failed: { label: "Hata", className: "bg-coral-bright/10 text-coral-bright" },
};

/*
  content.status decides draft/review-vs-scheduled; content_platforms.status
  only becomes meaningful once the scheduler (checklist phase 7) actually
  attempts a publish — until then every row is PENDING regardless of
  approval state. DRAFT is checked ahead of the "review" fallback — before
  this, a saved-but-not-submitted draft silently fell into "review" (looked
  like it was awaiting approval when nobody had ever seen it).
*/
export function deriveStatus(contentStatus: string, cpStatus: string): UIStatus {
  if (cpStatus === "PUBLISHED") return "published";
  if (cpStatus === "FAILED" || cpStatus === "NEEDS_USER_ACTION") return "failed";
  if (contentStatus === "APPROVED" || contentStatus === "SCHEDULED") return "scheduled";
  if (contentStatus === "DRAFT" || contentStatus === "IDEA" || contentStatus === "GENERATING") return "draft";
  return "review";
}

/*
  A "scheduled" item (see deriveStatus above) whose time has already passed
  but hasn't published yet — either still PENDING (approved late, waiting
  for the next dispatch_due_content() tick) or QUEUED (already claimed by
  that tick, waiting for process_publish_queue() to actually fire it).
  Neither status value nor scheduled_at alone distinguishes this from a
  normal future-scheduled item; both are needed together. Purely additive —
  doesn't change what deriveStatus returns, just whether to show an extra
  "still going out, just late" note next to its existing "scheduled" pill.
*/
export function isOverdue(contentStatus: string, cpStatus: string, scheduledAt: string | null): boolean {
  if (!scheduledAt) return false;
  if (cpStatus !== "PENDING" && cpStatus !== "QUEUED") return false;
  if (contentStatus !== "APPROVED" && contentStatus !== "SCHEDULED") return false;
  return new Date(scheduledAt).getTime() <= Date.now();
}

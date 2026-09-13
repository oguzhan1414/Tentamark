import { redirect } from "next/navigation";

// Onaylarım was merged into Gönderiler as a Liste/Kanban toggle on one page
// (sidebar/IA density pass) — its 3-column board now lives at
// /dashboard/posts?view=kanban. This route stays alive purely so old links
// still land somewhere real instead of 404ing.
export default function ApprovalsRedirectPage() {
  redirect("/dashboard/posts?view=kanban");
}

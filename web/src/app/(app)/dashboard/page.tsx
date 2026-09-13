import { redirect } from "next/navigation";

// Ana Sayfa was removed as a standalone screen (sidebar/IA density pass) —
// its only two pieces of non-redundant value, the "AI Yapılacaklar"
// checklist and the daily AI briefing, moved into Takvim itself (see
// CalendarAiTodoDrawer.tsx). This route stays alive purely so old links and
// the auth redirect fallback still land somewhere real.
export default function DashboardIndexPage() {
  redirect("/dashboard/calendar");
}

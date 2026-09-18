import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";

/*
  The landing gate every post-login redirect funnels through (giris/kayit/
  auth callback all push here, not straight to /dashboard/calendar).
  1. If user has not completed onboarding, redirect to /onboarding.
  2. If user has 2+ workspaces, show the picker at /calisma-alanlari.
  3. Otherwise, land on Takvim (/dashboard/calendar).
*/
export default async function DashboardIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.onboarding_completed === false) {
      redirect("/onboarding");
    }
  }

  const workspaces = await getUserWorkspaces();

  if (workspaces.length > 1) {
    redirect("/calisma-alanlari");
  }

  redirect("/dashboard/calendar");
}

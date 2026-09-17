import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/lib/brand";

/*
  The landing gate every post-login redirect funnels through (giris/kayit/
  auth callback all push here, not straight to /dashboard/calendar). Most
  users have exactly one workspace, so this is invisible to them — they land
  on Takvim same as before. Anyone with 2+ workspaces sees the picker first
  and chooses which one to enter, Planable-style, instead of silently landing
  in whichever brand happened to be active last.
*/
export default async function DashboardIndexPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length > 1) {
    redirect("/calisma-alanlari");
  }

  redirect("/dashboard/calendar");
}

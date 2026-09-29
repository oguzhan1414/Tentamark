import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";

/*
  "Onayla ve Zamana Ekle" — the one combined action satisfying both Faz 7
  item 4 (toplu onay) and item 5 (takvime paket ekleme). Reuses the exact
  status semantics dashboard/posts/page.tsx's approveAll() already relies on
  (NEEDS_REVIEW -> APPROVED) — no new approval machinery — just scoped by
  package_id instead of an explicit id list, plus a scheduled_at write that
  mirrors what Compose/Calendar already set directly on content_platforms.
*/
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { scheduledAt?: string };
  const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt : null;
  if (scheduledAt && Number.isNaN(new Date(scheduledAt).getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: packageRow, error: packageError } = await supabase
    .from("content_packages")
    .select("id")
    .eq("id", id)
    .eq("brand_id", brand.id)
    .maybeSingle();
  if (packageError || !packageRow) return NextResponse.json({ error: "Paket bulunamadı." }, { status: 404 });

  const { data: approvedRows, error: approveError } = await supabase
    .from("content")
    .update({ status: "APPROVED" })
    .eq("package_id", id)
    .eq("status", "NEEDS_REVIEW")
    .select("id");
  if (approveError) return NextResponse.json({ error: approveError.message }, { status: 500 });

  if (scheduledAt && approvedRows && approvedRows.length > 0) {
    const contentIds = approvedRows.map((r) => r.id);
    const { error: scheduleError } = await supabase
      .from("content_platforms")
      .update({ scheduled_at: scheduledAt })
      .in("content_id", contentIds);
    if (scheduleError) return NextResponse.json({ error: scheduleError.message }, { status: 500 });
  }

  return NextResponse.json({ approvedCount: approvedRows?.length ?? 0 });
}

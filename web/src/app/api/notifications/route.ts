import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NotificationItem, NotificationSeverity } from "@/lib/notifications/notificationTypes";

function severityFor(type: string): NotificationSeverity {
  if (type.includes("fail") || type.includes("reject")) return "error";
  if (type.includes("approval") || type.includes("warn")) return "warning";
  if (type.includes("success") || type.includes("publish")) return "success";
  return "info";
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("active_brand_id").eq("id", user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: "Bildirimler yüklenemedi." }, { status: 500 });

  let query = supabase.from("notifications").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(50);
  if (profile?.active_brand_id) query = query.eq("brand_id", profile.active_brand_id);
  const { data, error } = await query;
  if (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Bildirimler yüklenemedi." }, { status: 500 });
  }

  const notifications: NotificationItem[] = (data ?? []).map((row) => ({
    id: row.id,
    brand_id: row.brand_id,
    category: row.category,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link ?? undefined,
    action_label: row.action_label ?? undefined,
    is_read: row.is_read,
    severity: severityFor(row.type),
    created_at: row.created_at,
    metadata: row.metadata,
  }));
  return NextResponse.json({ notifications, unreadCount: notifications.filter((n) => !n.is_read).length });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });

  let body: { notificationId?: unknown; markAllRead?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (body.markAllRead !== true && (typeof body.notificationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.notificationId))) {
    return NextResponse.json({ error: "Bildirim seçilmedi." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("active_brand_id").eq("id", user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: "Bildirim güncellenemedi." }, { status: 500 });

  let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  if (profile?.active_brand_id) query = query.eq("brand_id", profile.active_brand_id);
  query = body.markAllRead === true
    ? query.eq("is_read", false)
    : query.eq("id", body.notificationId as string);
  const { data, error } = await query.select("id");
  if (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ error: "Bildirim güncellenemedi." }, { status: 500 });
  }
  if (body.markAllRead !== true && data?.length === 0) {
    return NextResponse.json({ error: "Bildirim bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

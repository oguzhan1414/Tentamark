import { NextResponse } from "next/server";
import { verifySignedRequest } from "@/lib/social/signedRequest";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  Meta pings this when a user removes the app's access from their own
  Instagram/Facebook settings — not something our own UI triggers, so this
  is the only way we'd otherwise find out a connection died. Server-to-server
  call, no user session, hence the service-role client (see admin.ts).
*/
export async function POST(request: Request) {
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const form = await request.formData();
  const signedRequest = form.get("signed_request");
  if (typeof signedRequest !== "string") {
    return NextResponse.json({ error: "missing signed_request" }, { status: 400 });
  }

  const payload = verifySignedRequest(signedRequest, appSecret);
  if (!payload) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  const supabase = createAdminClient();
  await supabase
    .from("social_accounts")
    .update({ status: "disconnected" })
    .eq("platform", "instagram")
    .eq("external_account_id", payload.user_id);

  return NextResponse.json({ success: true });
}

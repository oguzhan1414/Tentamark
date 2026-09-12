import { NextResponse } from "next/server";
import { verifySignedRequest } from "@/lib/social/signedRequest";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  Threads pings this when a user removes the app's access from their own
  Threads settings — mirrors instagram/deauthorize/route.ts, same
  signed_request mechanism, but verified against THREADS_APP_SECRET since
  Threads is a separate app/credential pair from Instagram.
*/
export async function POST(request: Request) {
  const appSecret = process.env.THREADS_APP_SECRET;
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
    .eq("platform", "threads")
    .eq("external_account_id", payload.user_id);

  return NextResponse.json({ success: true });
}

import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { verifySignedRequest } from "@/lib/social/signedRequest";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  Meta calls this when a user requests their data be deleted from our app via
  Instagram/Facebook's own settings. Required response shape is fixed by
  Meta's spec: { url, confirmation_code } — both mandatory.

  Our deletion is synchronous (the row's gone before this handler returns),
  unlike systems with a queued/delayed deletion pipeline, so the status page
  can just report "done" unconditionally rather than looking anything up —
  no request-tracking table needed for a same-request-complete operation.
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
    .delete()
    .eq("platform", "instagram")
    .eq("external_account_id", payload.user_id);

  const confirmationCode = randomBytes(8).toString("hex");
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    url: `${origin}/veri-silme-durumu?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

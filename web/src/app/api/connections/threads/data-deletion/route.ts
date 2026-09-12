import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { verifySignedRequest } from "@/lib/social/signedRequest";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  Threads calls this when a user requests their data be deleted via Threads'
  own settings. Mirrors instagram/data-deletion/route.ts — same fixed
  response shape Meta's spec requires ({ url, confirmation_code }), verified
  against THREADS_APP_SECRET since Threads is a separate app/credential pair.
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
    .delete()
    .eq("platform", "threads")
    .eq("external_account_id", payload.user_id);

  const confirmationCode = randomBytes(8).toString("hex");
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    url: `${origin}/veri-silme-durumu?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

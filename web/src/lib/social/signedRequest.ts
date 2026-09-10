import { createHmac, timingSafeEqual } from "crypto";

/*
  Meta's signed_request format, used by both the deauthorize callback and the
  data deletion request callback (same mechanism, confirmed against current
  docs): "<base64url signature>.<base64url JSON payload>", HMAC-SHA256 over
  the payload segment using the app secret. Reject anything that doesn't
  verify — these endpoints are hit directly by Meta's servers with no user
  session, so signature verification is the only thing standing between this
  route and an attacker who can call it with an arbitrary user_id.
*/

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

export function verifySignedRequest(
  signedRequest: string,
  appSecret: string
): { user_id: string; [key: string]: unknown } | null {
  const parts = signedRequest.split(".");
  if (parts.length !== 2) return null;
  const [encodedSig, encodedPayload] = parts;

  const expectedSig = createHmac("sha256", appSecret).update(encodedPayload).digest();
  const actualSig = base64UrlDecode(encodedSig);

  if (expectedSig.length !== actualSig.length || !timingSafeEqual(expectedSig, actualSig)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
    if (typeof payload.user_id !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

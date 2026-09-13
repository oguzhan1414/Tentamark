import { createHmac, timingSafeEqual } from "crypto";

/*
  Meta's event-webhook signing scheme (Graph API "Webhooks" product) —
  distinct from signedRequest.ts's scheme. That one verifies a form-field
  "<sig>.<payload>" string used only by the deauthorize/data-deletion
  callbacks. This one verifies an `X-Hub-Signature-256: sha256=<hex>` HTTP
  header, computed as HMAC-SHA256 of the *raw* POST body — used by every
  comment/DM event webhook (Instagram, Facebook Page). Verified against
  Meta's current docs, not assumed.

  Takes the raw body text, not a parsed object — signing is over the exact
  bytes Meta sent, and re-serializing a parsed JSON object would not
  reliably reproduce them.
*/
export function verifyMetaWebhookSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header || !header.startsWith("sha256=")) return false;
  const expectedHex = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(header.slice("sha256=".length), "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

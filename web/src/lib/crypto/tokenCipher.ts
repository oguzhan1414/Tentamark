import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";

/*
  12-backend-logic.md §12.9: "RLS'e güvenilmez, uygulama katmanında Fernet ile
  per-brand şifreleme uygulanır" (following social-stats' documented pattern).

  Implemented as AES-256-GCM here rather than literal Fernet. Same principle
  (app-layer symmetric encryption, per-brand key separation), different
  primitive: GCM is an AEAD cipher, so the authentication tag is built into
  the cipher itself instead of a separately composed HMAC-then-encrypt step
  (which is how Fernet works) — one less place to get the composition wrong,
  and it needs nothing beyond Node's built-in `crypto` (no dependency, and
  the only `fernet` package on npm ships no types).

  Per-brand keys are derived from ONE master secret via HMAC-SHA256(master,
  brandId) rather than provisioning a key per brand up front — that would
  mean minting secrets before the brand exists, which doesn't fit how brands
  are actually created (handle_new_user, at signup).
*/

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // NIST-recommended IV length for GCM
const TAG_LENGTH = 16;

function masterKey(): Buffer {
  const b64 = process.env.TOKEN_ENCRYPTION_MASTER_KEY;
  if (!b64) throw new Error("TOKEN_ENCRYPTION_MASTER_KEY is not set");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_MASTER_KEY must decode to exactly 32 bytes");
  }
  return key;
}

function deriveBrandKey(brandId: string): Buffer {
  return createHmac("sha256", masterKey()).update(brandId).digest();
}

/** Encrypts a plaintext token for storage. Output: base64(iv || tag || ciphertext). */
export function encryptToken(plaintext: string, brandId: string): string {
  const key = deriveBrandKey(brandId);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

/** Reverses encryptToken. Throws if the payload was tampered with or the brand key doesn't match. */
export function decryptToken(payload: string, brandId: string): string {
  const key = deriveBrandKey(brandId);
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

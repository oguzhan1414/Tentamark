import { createHash } from "crypto";

/*
  PKCE (RFC 7636) — mandatory in OAuth 2.1, and the entire reason a public
  MCP client (no client_secret) can safely use the authorization code grant
  at all. The client generates code_verifier, sends sha256(code_verifier) as
  code_challenge at /oauth/authorize, then proves it holds the original
  verifier at the token endpoint. Only S256 is supported — the "plain"
  method OAuth 2.1 itself deprecates isn't implemented here.
*/
export function verifyPkce(codeVerifier: string, codeChallenge: string): boolean {
  if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(codeVerifier)) return false;
  const computed = createHash("sha256").update(codeVerifier).digest("base64url");
  return computed === codeChallenge;
}

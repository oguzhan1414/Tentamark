import { McpErrors } from "../contracts/errors";
import type { McpActorContext } from "../actorContext";
import { resolveActorFromPat } from "./pat";
import { resolveActorFromOAuthToken, ACCESS_TOKEN_PREFIX } from "./oauthFlow";

/*
  The one function the future /mcp request handler (Aşama 2) calls to turn
  an `Authorization: Bearer <token>` header into an McpActorContext,
  regardless of whether the token was issued by the PAT flow (Settings ->
  Geliştirici) or the OAuth flow (/oauth/authorize). Dispatches on the
  token's own prefix rather than trying both tables — see pat.ts and
  oauthFlow.ts for why each format starts the way it does.
*/
export async function resolveActor(authorizationHeader: string | null): Promise<McpActorContext> {
  if (!authorizationHeader?.startsWith("Bearer ")) throw McpErrors.unauthenticated();
  const rawToken = authorizationHeader.slice("Bearer ".length).trim();
  if (!rawToken) throw McpErrors.unauthenticated();

  if (rawToken.startsWith(ACCESS_TOKEN_PREFIX)) return resolveActorFromOAuthToken(rawToken);
  return resolveActorFromPat(rawToken);
}

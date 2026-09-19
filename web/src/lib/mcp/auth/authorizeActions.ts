"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAuthorizationCode } from "./oauthFlow";
import { getOAuthClient } from "./oauthClients";
import { isMcpScope, type McpScope } from "../contracts/scopes";

/*
  Server Actions backing the /oauth/authorize consent form. Both re-validate
  everything from the submitted form fields rather than trusting that the
  page that rendered the form already did — the same "domain logic checks
  again, never trusts the caller" reasoning as
  lib/mcp/domain/contentMutations.ts.
*/

export async function approveAuthorization(formData: FormData): Promise<void> {
  const clientId = String(formData.get("client_id") ?? "");
  const redirectUri = String(formData.get("redirect_uri") ?? "");
  const codeChallenge = String(formData.get("code_challenge") ?? "");
  const state = String(formData.get("state") ?? "");
  const scopeParam = String(formData.get("scope") ?? "");
  const brandIds = formData.getAll("brand_id").map(String);

  const requestedScopes = scopeParam.split(/\s+/).filter(Boolean);
  const unknownScopes = requestedScopes.filter((scope) => !isMcpScope(scope));
  const client = await getOAuthClient(clientId);
  if (!client || !client.redirect_uris.includes(redirectUri) || unknownScopes.length > 0) {
    redirect("/oauth/authorize?error=invalid_request");
  }
  const scopes = requestedScopes.filter(isMcpScope) as McpScope[];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const resumeQs = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: scopeParam,
      state,
    });
    redirect(`/giris?redirect=${encodeURIComponent(`/oauth/authorize?${resumeQs.toString()}`)}`);
  }

  if (brandIds.length === 0) {
    // Sent back to the same consent screen rather than to redirect_uri — the
    // user simply forgot to check a brand, this isn't a client/protocol
    // error worth reporting back to the OAuth client.
    const qs = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: scopeParam,
      state,
      error: "select_a_brand",
    });
    redirect(`/oauth/authorize?${qs.toString()}`);
  }

  let code: string;
  try {
    code = await createAuthorizationCode({
      clientId,
      redirectUri,
      codeChallenge,
      scopes,
      brandIds,
      userId: user.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not authorize this request.";
    redirect(`${redirectUri}?error=invalid_request&error_description=${encodeURIComponent(message)}&state=${encodeURIComponent(state)}`);
  }

  redirect(`${redirectUri}?code=${encodeURIComponent(code!)}&state=${encodeURIComponent(state)}`);
}

export async function denyAuthorization(formData: FormData): Promise<void> {
  const clientId = String(formData.get("client_id") ?? "");
  const redirectUri = String(formData.get("redirect_uri") ?? "");
  const state = String(formData.get("state") ?? "");
  const client = await getOAuthClient(clientId);
  if (!client || !client.redirect_uris.includes(redirectUri)) {
    redirect("/oauth/authorize?error=invalid_request");
  }
  redirect(`${redirectUri}?error=access_denied&state=${encodeURIComponent(state)}`);
}

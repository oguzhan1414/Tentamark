// Bluesky's chat.bsky.* (DM) namespace is a separate service from the rest
// of the AT Protocol API — requests still go to the account's own PDS
// (bsky.social here, same restriction as blueskyProvider.ts) but need an
// atproto-proxy header telling that PDS to forward the call to the chat
// backend. Reading DMs requires the app password to have been created with
// "Allow access to your direct messages" checked — without it, every call
// below fails with a scope error, not a generic auth error.
const HOST = "https://bsky.social";
const CHAT_PROXY = "did:web:api.bsky.chat#bsky_chat";

export type ChatSession = { accessJwt: string; did: string; handle: string };

export type ConvoMember = { did: string; displayName?: string; handle?: string };
export type ConvoView = {
  id: string;
  members: ConvoMember[];
  unreadCount: number;
  lastMessage?: { id: string; text?: string; sentAt?: string };
};
export type MessageView = {
  id: string;
  text: string;
  sentAt: string;
  sender: { did: string };
};

async function chatFetch(path: string, accessJwt: string, init?: RequestInit) {
  const res = await fetch(`${HOST}/xrpc/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessJwt}`,
      "atproto-proxy": CHAT_PROXY,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message ?? `Bluesky chat API hatası (HTTP ${res.status}).`);
  }
  return json;
}

export async function createSession(identifier: string, password: string): Promise<ChatSession> {
  const res = await fetch(`${HOST}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.accessJwt) {
    throw new Error(json?.message ?? "Bluesky oturumu açılamadı — handle veya app password hatalı olabilir.");
  }
  return { accessJwt: json.accessJwt, did: json.did, handle: json.handle };
}

// cursor undefined -> first page. Only 'accepted' convos (not pending
// message requests) so a stranger's DM request doesn't silently land in
// the inbox as if the account had accepted it.
export async function listConvos(
  accessJwt: string,
  cursor?: string
): Promise<{ convos: ConvoView[]; cursor?: string }> {
  const params = new URLSearchParams({ status: "accepted", limit: "50" });
  if (cursor) params.set("cursor", cursor);
  const json = await chatFetch(`chat.bsky.convo.listConvos?${params.toString()}`, accessJwt);
  return { convos: json.convos ?? [], cursor: json.cursor };
}

// Newest-first from the API — reversed here so callers can upsert in
// chronological order, matching how every other inbox source writes rows.
export async function getMessages(
  accessJwt: string,
  convoId: string,
  cursor?: string
): Promise<{ messages: MessageView[]; cursor?: string }> {
  const params = new URLSearchParams({ convo_id: convoId, limit: "50" });
  if (cursor) params.set("cursor", cursor);
  const json = await chatFetch(`chat.bsky.convo.getMessages?${params.toString()}`, accessJwt);
  const messages = ((json.messages ?? []) as MessageView[]).filter((m) => typeof m.text === "string");
  return { messages: messages.reverse(), cursor: json.cursor };
}

export async function sendMessage(accessJwt: string, convoId: string, text: string): Promise<{ id: string }> {
  const json = await chatFetch("chat.bsky.convo.sendMessage", accessJwt, {
    method: "POST",
    body: JSON.stringify({ convoId, message: { text } }),
  });
  if (!json?.id) throw new Error("Bluesky DM gönderilemedi.");
  return { id: json.id as string };
}

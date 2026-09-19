"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  createPersonalAccessToken,
  getOrgBrands,
  getOrgConnections,
  revokeOrgConnection,
} from "@/lib/mcp/auth/patActions";
import type { ConnectionSummary } from "@/lib/mcp/auth/pat";
import type { McpScope } from "@/lib/mcp/contracts/scopes";
import { MCP_RESOURCE_URL } from "@/lib/mcp/config";

// Claude Desktop's own config file only ever launches local (stdio)
// commands — it has no first-class "remote URL + custom header" entry.
// `mcp-remote` (https://github.com/punkpeye/mcp-remote) is the community
// bridge every current remote-MCP-with-a-bearer-token guide points at: a
// tiny local process Claude launches that forwards stdio to our real
// Streamable HTTP endpoint, carrying the Authorization header the raw
// config format can't express on its own. Claude.ai's own web Connectors
// UI is the OAuth path instead (no token, no file to edit) — see the note
// under this snippet in the UI.
function claudeDesktopConfigSnippet(rawToken: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        tentamark: {
          command: "npx",
          args: ["mcp-remote", MCP_RESOURCE_URL, "--header", `Authorization: Bearer ${rawToken}`],
        },
      },
    },
    null,
    2
  );
}

// Grouped for the create-form's checkbox layout — mirrors
// lib/mcp/contracts/scopes.ts's MCP_SCOPES exactly, just organized by what a
// human is granting rather than the flat list a tool contract checks against.
const SCOPE_GROUPS: { label: { tr: string; en: string }; scopes: McpScope[] }[] = [
  { label: { tr: "Okuma", en: "Read" }, scopes: ["brand:read", "calendar:read", "analytics:read", "media:read"] },
  { label: { tr: "Taslak", en: "Draft" }, scopes: ["draft:create", "draft:update"] },
  { label: { tr: "Onay", en: "Approval" }, scopes: ["approval:request", "approval:decide"] },
  { label: { tr: "Zamanlama", en: "Scheduling" }, scopes: ["schedule:update"] },
  { label: { tr: "Yayın", en: "Publish" }, scopes: ["publish:request"] },
];

/*
  Aşama 1 connection-management UI (docs/mcp-entegrasyon-plani.md). PAT-only
  for now — there's no OAuth authorization server yet, so this is the only
  way anything outside Tentamark's own UI can be granted access. Gated to
  the organization owner both here (isOwner prop, hides the form entirely)
  and again server-side in every lib/mcp/auth/patActions.ts action — the
  client-side gate is a UX nicety, not the real enforcement.
*/
export default function DeveloperAccessTab({ isOwner }: { isOwner: boolean }) {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const [connections, setConnections] = useState<ConnectionSummary[] | null>(null);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [label, setLabel] = useState("");
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<McpScope[]>(["brand:read", "calendar:read"]);
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<{ rawToken: string; expiresAt: string } | null>(null);

  useEffect(() => {
    if (!isOwner) return;
    let ignore = false;
    (async () => {
      const [connectionsResult, brandsResult] = await Promise.all([getOrgConnections(), getOrgBrands()]);
      if (ignore) return;
      if ("error" in connectionsResult) setLoadError(connectionsResult.error);
      else setConnections(connectionsResult);
      if (!("error" in brandsResult)) {
        setBrands(brandsResult);
        setSelectedBrandIds((prev) => (prev.length > 0 ? prev : brandsResult.slice(0, 1).map((b) => b.id)));
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isOwner, refreshKey]);

  function toggleScope(scope: McpScope) {
    setSelectedScopes((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]));
  }

  function toggleBrand(id: string) {
    setSelectedBrandIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  async function handleCreate() {
    if (!label.trim() || selectedBrandIds.length === 0 || selectedScopes.length === 0) return;
    setCreating(true);
    setCreateError(null);
    const result = await createPersonalAccessToken({
      label: label.trim(),
      brandIds: selectedBrandIds,
      scopes: selectedScopes,
      expiresInDays,
    });
    setCreating(false);
    if ("error" in result) {
      setCreateError(result.error);
      return;
    }
    setJustCreated({ rawToken: result.rawToken, expiresAt: result.expiresAt });
    setLabel("");
    setRefreshKey((k) => k + 1);
  }

  async function handleRevoke(id: string) {
    if (
      !confirm(
        isEn
          ? "Revoke this connection? Any client using it will stop working immediately."
          : "Bu bağlantıyı iptal edelim mi? Bunu kullanan istemci hemen çalışmayı durdurur."
      )
    )
      return;
    const result = await revokeOrgConnection(id);
    if ("error" in result) {
      setLoadError(result.error);
      return;
    }
    setRefreshKey((k) => k + 1);
  }

  if (!isOwner) {
    return (
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <p className="text-xs text-slate-500">
          {isEn
            ? "Only the organization owner can manage developer connections."
            : "Geliştirici bağlantılarını yalnızca organizasyon sahibi yönetebilir."}
        </p>
      </div>
    );
  }

  const activeConnections = connections?.filter((c) => c.status === "active") ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-display text-base font-bold text-slate-900">
            {isEn ? "Developer Access (MCP)" : "Geliştirici Erişimi (MCP)"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {isEn
              ? "Create a personal access token so an MCP client (Claude, ChatGPT, Cursor, ...) can read or act on this data on your behalf."
              : "Bir MCP istemcisinin (Claude, ChatGPT, Cursor, ...) bu verilere sizin adınıza erişebilmesi için kişisel erişim jetonu (PAT) oluşturun."}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? "Label" : "Etiket"}</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={isEn ? 'e.g. "Claude Desktop"' : 'Örn. "Claude Desktop"'}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? "Brands" : "Markalar"}</label>
          {brands.length === 0 ? (
            <p className="text-xs text-slate-400">{isEn ? "No brands found." : "Marka bulunamadı."}</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBrand(b.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    selectedBrandIds.includes(b.id)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? "Permissions" : "İzinler"}</label>
          {SCOPE_GROUPS.map((group) => (
            <div key={group.label.en} className="flex flex-wrap items-center gap-1.5">
              <span className="w-20 shrink-0 text-[10px] font-bold text-slate-400">{isEn ? group.label.en : group.label.tr}</span>
              {group.scopes.map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => toggleScope(scope)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-mono font-semibold transition cursor-pointer ${
                    selectedScopes.includes(scope)
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? "Expires in" : "Geçerlilik"}</label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer"
            >
              <option value={30}>30 {isEn ? "days" : "gün"}</option>
              <option value={90}>90 {isEn ? "days" : "gün"}</option>
              <option value={365}>365 {isEn ? "days" : "gün"}</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !label.trim() || selectedBrandIds.length === 0 || selectedScopes.length === 0}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            {creating ? (isEn ? "Creating…" : "Oluşturuluyor…") : isEn ? "Create token" : "Jeton Oluştur"}
          </button>
        </div>

        {createError && <p className="text-xs font-semibold text-red-600">{createError}</p>}

        {justCreated && (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900">
            <p className="font-bold">
              {isEn ? "Copy this token now — it will not be shown again." : "Bu jetonu şimdi kopyalayın — bir daha gösterilmeyecek."}
            </p>
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate rounded-lg bg-white px-2.5 py-1.5 font-mono">{justCreated.rawToken}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(justCreated.rawToken)}
                className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                {isEn ? "Copy" : "Kopyala"}
              </button>
            </div>
            <p className="text-[11px] text-emerald-700">
              {isEn
                ? `Expires ${new Date(justCreated.expiresAt).toLocaleDateString()}.`
                : `Son kullanma: ${new Date(justCreated.expiresAt).toLocaleDateString("tr-TR")}.`}
            </p>

            <div className="space-y-1.5 border-t border-emerald-200/60 pt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                {isEn ? "Connect from Claude Desktop" : "Claude Desktop'tan bağlan"}
              </p>
              <p className="text-[11px] text-emerald-700">
                {isEn
                  ? "Paste this into Claude Desktop's config (Settings → Developer → Edit Config), save, then restart Claude. Requires Node.js to be installed."
                  : "Bunu Claude Desktop'ın ayar dosyasına yapıştır (Settings → Developer → Edit Config), kaydet, sonra Claude'u yeniden başlat. Node.js kurulu olması gerekiyor."}
              </p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-2.5 text-[10px] leading-relaxed text-emerald-50">
                  {claudeDesktopConfigSnippet(justCreated.rawToken)}
                </pre>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(claudeDesktopConfigSnippet(justCreated.rawToken))}
                  className="absolute right-1.5 top-1.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/20 transition cursor-pointer"
                >
                  {isEn ? "Copy" : "Kopyala"}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700">
                {isEn
                  ? "Using Claude.ai's web Connectors instead (no config file)? That path uses the OAuth login screen, not this token — see the OAuth option once it's listed there."
                  : "Claude.ai'ın web Connectors'ını kullanıyorsan (dosya düzenlemeden) — o yol bu jetonu değil, OAuth giriş ekranını kullanır; Tentamark o listeye eklendiğinde oradan bağlanabilirsin."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
          {isEn ? "Active Connections" : "Aktif Bağlantılar"}
        </h3>

        {loadError && <p className="text-xs font-semibold text-red-600">{loadError}</p>}

        {connections === null ? (
          <p className="text-xs text-slate-400">{isEn ? "Loading…" : "Yükleniyor…"}</p>
        ) : activeConnections.length === 0 ? (
          <p className="text-xs text-slate-400">{isEn ? "No active connections yet." : "Henüz aktif bağlantı yok."}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeConnections.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{c.clientName}</h4>
                  <p className="text-[11px] font-mono text-slate-400">{c.tokenPrefix}••••</p>
                  <p className="text-[11px] text-slate-400">
                    {c.scopes.length} {isEn ? "scopes" : "izin"} · {c.brandIds.length} {isEn ? "brand(s)" : "marka"} ·{" "}
                    {isEn ? "created" : "oluşturuldu"} {new Date(c.createdAt).toLocaleDateString(isEn ? "en-US" : "tr-TR")}
                    {c.lastUsedAt &&
                      ` · ${isEn ? "last used" : "son kullanım"} ${new Date(c.lastUsedAt).toLocaleDateString(isEn ? "en-US" : "tr-TR")}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(c.id)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  {isEn ? "Revoke" : "İptal Et"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

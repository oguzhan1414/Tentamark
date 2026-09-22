import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOAuthClient } from "@/lib/mcp/auth/oauthClients";
import { isMcpScope, type McpScope } from "@/lib/mcp/contracts/scopes";
import { approveAuthorization, denyAuthorization } from "@/lib/mcp/auth/authorizeActions";
import TentamarkLogo from "@/components/TentamarkLogo";

const SCOPE_DESCRIPTIONS: Record<McpScope, string> = {
  "brand:read": "Marka kimliğinizi, DNA'nızı ve stratejinizi okuma",
  "calendar:read": "Takviminizi ve gönderilerinizi okuma",
  "analytics:read": "Performans verilerinizi okuma",
  "media:read": "Medya kütüphanenizi okuma",
  "draft:create": "Yeni taslak içerik oluşturma",
  "draft:update": "Mevcut taslakları düzenleme",
  "approval:request": "İçeriği onaya gönderme",
  "approval:decide": "İçeriği onaylama veya reddetme",
  "schedule:update": "Yayın tarihini değiştirme",
  "publish:request": "Yayın onay bağlantısı oluşturma (gerçek yayın yalnızca sizin Tentamark içinde tıklamanızla olur)",
};

/*
  The one screen every MCP OAuth grant passes through — the human-in-the-
  loop moment docs/mcp-entegrasyon-plani.md's authorization section is
  built around. Deliberately a plain Server Component + native <form
  action={serverAction}>: no client JS is needed for checkboxes/radio state,
  and keeping this off the client bundle means the consent decision itself
  can never be tampered with by anything running in the browser.
*/
export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const responseType = String(params.response_type ?? "");
  const clientId = String(params.client_id ?? "");
  const redirectUri = String(params.redirect_uri ?? "");
  const codeChallenge = String(params.code_challenge ?? "");
  const codeChallengeMethod = String(params.code_challenge_method ?? "");
  const scopeParam = String(params.scope ?? "");
  const state = String(params.state ?? "");
  const consentError = String(params.error ?? "");

  // Protocol-level errors never redirect to redirect_uri — an unvalidated
  // client_id/redirect_uri pair is exactly the case where following it
  // would BE the vulnerability. Fail closed with a plain error page instead.
  if (responseType !== "code" || !clientId || !redirectUri || !codeChallenge) {
    return <ErrorScreen message="Eksik veya geçersiz yetkilendirme isteği." />;
  }
  if (codeChallengeMethod !== "S256") {
    return <ErrorScreen message="Yalnızca PKCE S256 destekleniyor." />;
  }

  const client = await getOAuthClient(clientId);
  if (!client) return <ErrorScreen message="Bilinmeyen istemci (client_id)." />;
  const isRedirectAllowed = client.redirect_uris.some(
    (uri: string) => uri === redirectUri || uri.replace(/\/$/, "") === redirectUri.replace(/\/$/, "")
  );
  if (!isRedirectAllowed) {
    return <ErrorScreen message="redirect_uri bu istemci için kayıtlı adreslerden biriyle eşleşmiyor." />;
  }

  const requestedScopes = scopeParam.split(/\s+/).filter(Boolean);
  const unknownScopes = requestedScopes.filter((s) => !isMcpScope(s));
  if (unknownScopes.length > 0) {
    return <ErrorScreen message={`Bilinmeyen izin(ler): ${unknownScopes.join(", ")}`} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const resumeQs = new URLSearchParams({
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      scope: scopeParam,
      state,
    });
    redirect(`/giris?redirect=${encodeURIComponent(`/oauth/authorize?${resumeQs.toString()}`)}`);
  }

  // Org-level "admin" was retired by 0044_brand_access.sql — review rights
  // now live per-brand in brand_memberships. An owner may grant any of their
  // org's brands; anyone else may only grant brands where they hold an
  // 'admin' brand_memberships row (mirrors private.user_can_review_brand,
  // which is `private`-schema and not RPC-callable from application code).
  const [{ data: profile }, { data: ownerMembership }] = await Promise.all([
    supabase.from("profiles").select("full_name, active_brand_id").eq("id", user.id).maybeSingle(),
    supabase.from("organization_members").select("organization_id").eq("user_id", user.id).eq("role", "owner").maybeSingle(),
  ]);

  let organizationId = ownerMembership?.organization_id ?? null;
  let reviewableBrandIds: string[] | null = null;

  if (!organizationId) {
    const { data: adminMemberships } = await supabase
      .from("brand_memberships")
      .select("brand_id, brands!inner(organization_id)")
      .eq("user_id", user.id)
      .eq("role", "admin");
    if (adminMemberships && adminMemberships.length > 0) {
      organizationId = (adminMemberships[0].brands as unknown as { organization_id: string }).organization_id;
      reviewableBrandIds = adminMemberships.map((m) => m.brand_id);
    }
  }

  if (!organizationId) return <ErrorScreen message="Bu hesap herhangi bir organizasyona bağlı değil veya hiçbir markada yönetici yetkisi bulunmuyor." />;

  let brandsQuery = supabase
    .from("brands")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });
  if (reviewableBrandIds) brandsQuery = brandsQuery.in("id", reviewableBrandIds);
  const { data: brands } = await brandsQuery;

  const activeBrandId = profile?.active_brand_id ?? null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-md rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="mb-5 flex justify-center">
          <TentamarkLogo size={28} withWordmark />
        </div>

        <h1 className="text-center font-display text-lg font-bold text-slate-900">
          <span className="text-blue-600">{client.client_name}</span> Tentamark&apos;a bağlanmak istiyor
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          {user.email} olarak giriş yaptınız. İstenen izinleri ve markaları gözden geçirin.
        </p>

        {consentError === "select_a_brand" && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800">
            Devam etmek için en az bir marka seçin.
          </p>
        )}

        <div className="mt-5 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">İstenen izinler</span>
          <ul className="space-y-1">
            {requestedScopes.map((scope) => (
              <li key={scope} className="flex items-start gap-1.5 text-xs text-slate-700">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{SCOPE_DESCRIPTIONS[scope as McpScope] ?? scope}</span>
              </li>
            ))}
          </ul>
        </div>

        <form action={approveAuthorization} className="mt-5 space-y-4">
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="hidden" name="code_challenge" value={codeChallenge} />
          <input type="hidden" name="scope" value={scopeParam} />
          <input type="hidden" name="state" value={state} />

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Erişilecek markalar</span>
            {(brands ?? []).length === 0 ? (
              <p className="text-xs text-slate-400">Bu organizasyonda marka bulunamadı.</p>
            ) : (
              <div className="space-y-1.5">
                {(brands ?? []).map((b) => (
                  <label
                    key={b.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-800 hover:border-slate-300"
                  >
                    <input
                      type="checkbox"
                      name="brand_id"
                      value={b.id}
                      defaultChecked={b.id === activeBrandId}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
          >
            İzin Ver
          </button>
        </form>

        <form action={denyAuthorization} className="mt-2">
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="hidden" name="state" value={state} />
          <button
            type="submit"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
          >
            Reddet
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-slate-400">
          Bu erişimi istediğiniz zaman Ayarlar → Geliştirici sekmesinden iptal edebilirsiniz.
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-sm rounded-[24px] border border-red-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-700">{message}</p>
      </div>
    </div>
  );
}

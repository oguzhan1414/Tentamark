import { revalidatePath } from "next/cache";
import Image from "next/image";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";

async function disconnectAccount(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("social_accounts").delete().eq("id", id);
  revalidatePath("/dashboard/connections");
}

function connectErrorMessage(code: string) {
  const provider = code.startsWith("threads_")
    ? "Threads"
    : code.startsWith("instagram_")
      ? "Instagram"
      : code.startsWith("tiktok_")
        ? "TikTok"
        : "Facebook";
  const reason = code.replace(/^(threads|instagram|tiktok)_/, "");

  switch (reason) {
    case "denied":
      return "Bağlantı iptal edildi.";
    case "state":
      return "Güvenlik doğrulaması başarısız oldu, lütfen tekrar deneyin.";
    case "token":
      return `${provider} ile bağlantı kurulamadı.`;
    case "pages":
      return "Sayfalarınız alınamadı.";
    case "no-pages":
      return "Hesabınıza bağlı bir Facebook Sayfası bulunamadı — önce bir Sayfa oluşturmanız gerekiyor.";
    case "config":
      return `${provider} bağlantısı henüz yapılandırılmadı.`;
    case "save":
      return "Hesap doğrulandı ancak veritabanına kaydedilemedi.";
    default:
      return "Bağlantı sırasında bir sorun oluştu.";
  }
}

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; connect_error?: string }>;
}) {
  const { connected, connect_error } = await searchParams;
  const brand = await getCurrentBrand();
  const supabase = await createClient();

  const { data: accounts } = brand
    ? await supabase
        .from("social_accounts")
        .select("id, platform, username, display_name, avatar_url, status, last_health_check_at")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const activeAccounts = accounts ?? [];

  const availableIntegrations = [
    {
      id: "instagram",
      name: "Instagram Professional",
      desc: "Gönderi, Reels ve Hikayeleri doğrudan profesyonel hesabınızda yayınlayın.",
      icon: "instagram" as PlatformName,
      href: "/api/connections/instagram/start",
      available: true,
    },
    {
      id: "facebook",
      name: "Facebook Sayfası",
      desc: "Topluluk paylaşımlarını ve Facebook gönderilerini otomatik senkronize edin.",
      icon: "facebook" as PlatformName,
      href: "/api/connections/meta/start",
      available: true,
    },
    {
      id: "threads",
      name: "Threads",
      desc: "Metin ve fotoğraf gönderilerinizi doğrudan Threads akışında paylaşın.",
      icon: "threads" as PlatformName,
      href: "/api/connections/threads/start",
      available: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn Şirket Sayfası",
      desc: "B2B makalelerinizi ve profesyonel içeriklerinizi yayınlayın.",
      icon: "linkedin" as PlatformName,
      href: "#",
      available: false,
    },
    {
      id: "x",
      name: "X (Twitter)",
      desc: "Anlık tweet ve flood serilerinizi otomatik zamanlayın.",
      icon: "x" as PlatformName,
      href: "#",
      available: false,
    },
    {
      id: "tiktok",
      name: "TikTok",
      desc: "Dikey video ve kısa kliplerinizi doğrudan TikTok hesabınıza aktarın. TikTok onayı tamamlanana kadar paylaşımlar yalnızca hesabınızda (gizli) görünür.",
      icon: "tiktok" as PlatformName,
      href: "/api/connections/tiktok/start",
      available: true,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Bağlantılar & Sosyal Hesaplar
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          İçeriklerinizin takvimden otomatik olarak yayınlanabilmesi için sosyal medya hesaplarınızı entegre edin.
        </p>
      </div>

      {/* Notifications */}
      {connected && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <span>✓</span>
          <span>Sosyal medya hesabı başarıyla bağlandı ve kullanıma hazır!</span>
        </div>
      )}
      {connect_error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
          <span>✕</span>
          <span>{connectErrorMessage(connect_error)}</span>
        </div>
      )}

      {/* 2. Connected Accounts Section */}
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Aktif Bağlantılar</h3>
            <p className="text-xs text-slate-400">Halihazırda bağlı ve yetkilendirilmiş hesaplar</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            {activeAccounts.length} Hesap Bağlı
          </span>
        </div>

        {activeAccounts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400">Henüz bağlı bir sosyal medya hesabı bulunmuyor.</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Aşağıdaki entegrasyon kartlarını kullanarak hesaplarınızı birkaç tıkla bağlayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                <div className="flex items-center gap-3">
                  {acc.avatar_url ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200">
                      <Image src={acc.avatar_url} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <PlatformIcon name={acc.platform as PlatformName} className="h-10 w-10 rounded-xl" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {acc.display_name ?? acc.username}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {platformLabel(acc.platform as PlatformName)} · Durum: <span className="font-semibold text-emerald-600">Aktif</span>
                      {acc.last_health_check_at && (
                        <span> · Son Senkron: {new Date(acc.last_health_check_at).toLocaleDateString("tr-TR")}</span>
                      )}
                    </p>
                  </div>
                </div>

                <form action={disconnectAccount}>
                  <input type="hidden" name="id" value={acc.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 transition"
                  >
                    Bağlantıyı Kes
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Available Integrations Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">Kullanılabilir Entegrasyonlar</h3>
          <p className="text-xs text-slate-500">Hesaplarınızı bağlayarak AI ile tek tıkla doğrudan yayınlayın.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableIntegrations.map((item) => {
            const isConnected = activeAccounts.some((a) => a.platform === item.icon);
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <PlatformIcon name={item.icon} className="h-9 w-9 rounded-xl shadow-xs" />
                    {isConnected ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        Bağlı ✓
                      </span>
                    ) : item.available ? (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                        Hazır
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                        Çok Yakında
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3.5">
                  {isConnected ? (
                    <span className="text-xs font-semibold text-slate-400">
                      Aktif ve yetkilendirildi
                    </span>
                  ) : item.available ? (
                    <a
                      href={item.href}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
                    >
                      {item.name} Hesabını Bağla →
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                    >
                      Entegrasyon Yakında
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { sendInboxReply } from "@/lib/social/sendInboxReply";
import { generateInboxReply, type InboxSmartReply } from "@/lib/ai/generateInboxReply";
import { DEMO_INBOX_MESSAGES } from "@/components/dashboard/inbox/demoInboxData";
import PlatformIcon from "@/components/PlatformIcon";

type SocialMessage = {
  id: string;
  platform: "instagram" | "facebook";
  kind: "comment" | "dm";
  direction: "inbound" | "outbound";
  external_id: string;
  external_thread_id: string | null;
  author_name: string | null;
  author_external_id: string | null;
  body: string | null;
  status: "open" | "done";
  created_at: string;
  isDemo?: boolean;
};

function toSocialMessage(d: (typeof DEMO_INBOX_MESSAGES)[number]): SocialMessage {
  return {
    id: d.id,
    platform: d.platform,
    kind: d.kind,
    direction: "inbound",
    external_id: d.id,
    external_thread_id: d.external_thread_id,
    author_name: d.author_name,
    author_external_id: null,
    body: d.body,
    status: d.status,
    created_at: d.created_at,
    isDemo: true,
  };
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "şimdi";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.round(hours / 24);
  return `${days} gün önce`;
}

export default function InboxPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  // Same real/demo split used in Approvals and Calendar: demo items only
  // appear while explicitly toggled on, and every mutation below routes by
  // isDemo so a demo reply never hits the real Graph API or the database.
  const [realMessages, setRealMessages] = useState<SocialMessage[]>([]);
  const [demoMessages, setDemoMessages] = useState<SocialMessage[]>(() => DEMO_INBOX_MESSAGES.map(toSocialMessage));
  const [showDemo, setShowDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAnyConnection, setHasAnyConnection] = useState(true);
  const [kindFilter, setKindFilter] = useState<"all" | "comment" | "dm">("all");
  const [statusFilter, setStatusFilter] = useState<"open" | "done" | "all">("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<SocialMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingAiReply, setGeneratingAiReply] = useState(false);
  const [aiReplyResult, setAiReplyResult] = useState<InboxSmartReply | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const messages = useMemo(
    () => (showDemo ? [...realMessages, ...demoMessages] : realMessages),
    [realMessages, demoMessages, showDemo]
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      const [{ data: accounts }, { data: rows, error: fetchError }] = await Promise.all([
        supabase.from("social_accounts").select("id").eq("brand_id", brand.id).eq("status", "active"),
        supabase
          .from("social_messages")
          .select("id, platform, kind, direction, external_id, external_thread_id, author_name, author_external_id, body, status, created_at")
          .eq("brand_id", brand.id)
          .eq("direction", "inbound")
          .order("created_at", { ascending: false }),
      ]);
      if (ignore) return;
      setHasAnyConnection((accounts ?? []).length > 0);
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRealMessages((rows ?? []) as SocialMessage[]);
      }
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, refreshKey]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (kindFilter !== "all" && m.kind !== kindFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      return true;
    });
  }, [messages, kindFilter, statusFilter]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    let ignore = false;
    (async () => {
      setReplyText("");
      setReplies([]);
      if (!selected?.external_thread_id || selected.isDemo) return;
      const { data } = await supabase
        .from("social_messages")
        .select("id, platform, kind, direction, external_id, external_thread_id, author_name, author_external_id, body, status, created_at")
        .eq("brand_id", brand.id)
        .eq("direction", "outbound")
        .eq("external_thread_id", selected.external_thread_id)
        .order("created_at", { ascending: true });
      if (ignore) return;
      setReplies((data ?? []) as SocialMessage[]);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, selected?.id, selected?.external_thread_id, selected?.isDemo]);

  async function handleMarkDone(id: string, isDemo?: boolean) {
    if (isDemo) {
      setDemoMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "done" } : m)));
      return;
    }
    setRealMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "done" } : m)));
    await supabase.from("social_messages").update({ status: "done" }).eq("id", id);
  }

  async function handleGenerateAiReply() {
    if (!selected?.body) return;
    setGeneratingAiReply(true);
    setError(null);
    try {
      const res = await generateInboxReply(
        brand.id,
        selected.body,
        selected.author_name || undefined,
        selected.kind,
        selected.platform
      );
      setAiReplyResult(res);
      setReplyText(res.recommended);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI yanıtı üretilemedi.");
    } finally {
      setGeneratingAiReply(false);
    }
  }

  async function handleSendReply() {
    if (!selected || !replyText.trim() || sending) return;
    setSending(true);
    setError(null);
    const text = replyText.trim();
    try {
      if (selected.isDemo) {
        setReplies((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            platform: selected.platform,
            kind: selected.kind,
            direction: "outbound",
            external_id: "",
            external_thread_id: selected.external_thread_id,
            author_name: null,
            author_external_id: null,
            body: text,
            status: "done",
            created_at: new Date().toISOString(),
          },
        ]);
        setDemoMessages((prev) => prev.map((m) => (m.id === selected.id ? { ...m, status: "done" } : m)));
        setReplyText("");
        return;
      }

      await sendInboxReply(selected.id, text);
      setReplies((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          platform: selected.platform,
          kind: selected.kind,
          direction: "outbound",
          external_id: "",
          external_thread_id: selected.external_thread_id,
          author_name: null,
          author_external_id: null,
          body: text,
          status: "done",
          created_at: new Date().toISOString(),
        },
      ]);
      setRealMessages((prev) => prev.map((m) => (m.id === selected.id ? { ...m, status: "done" } : m)));
      setReplyText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yanıt gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  const openCount = messages.filter((m) => m.status === "open").length;

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-5 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Sosyal Gelen Kutusu</h1>
          <p className="mt-1 text-sm text-slate-500">
            Instagram ve Facebook üzerinden gelen yorum ve mesajları buradan yanıtla.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDemo((v) => !v)}
            title="Gelen kutusunun tasarımını örnek mesajlarla önizle — gerçek verini etkilemez"
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              showDemo ? "bg-rose-100 text-rose-700" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            🧪 Örnek verileri {showDemo ? "gizle" : "göster"}
          </button>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50 cursor-pointer"
          >
            Yenile
          </button>
        </div>
      </div>

      {!loading && !hasAnyConnection && (
        <div className="mb-5 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-5 py-4 text-sm text-amber-900">
          Henüz bağlı bir Instagram veya Facebook hesabın yok. Gelen kutusunun çalışması için önce{" "}
          <a href="/settings?tab=baglantilar" className="font-semibold underline">
            Bağlantılar
          </a>{" "}
          sayfasından bir hesap bağla.
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-5">
        {/* Message list */}
        <div className="flex w-full max-w-sm shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-semibold">
              {(
                [
                  { key: "all", label: "Tümü" },
                  { key: "comment", label: "Yorum" },
                  { key: "dm", label: "Mesaj" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setKindFilter(f.key)}
                  className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                    kindFilter === f.key ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-semibold">
              {(
                [
                  { key: "open", label: `Açık${openCount > 0 ? ` (${openCount})` : ""}` },
                  { key: "done", label: "Yanıtlandı" },
                  { key: "all", label: "Tümü" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                    statusFilter === f.key ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">Yükleniyor...</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">Bu filtreye uyan mesaj yok.</p>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={`flex w-full items-start gap-2.5 border-b border-slate-100 px-4 py-3 text-left transition cursor-pointer ${
                    selectedId === m.id ? "bg-rose-50/50" : "hover:bg-slate-50"
                  }`}
                >
                  <PlatformIcon name={m.platform} className="h-8 w-8 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-slate-800">
                        {m.author_name || "Bilinmeyen kullanıcı"}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(m.created_at)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{m.body || "—"}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        {m.kind === "comment" ? "Yorum" : "Mesaj"}
                      </span>
                      {m.isDemo && (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-700">
                          Örnek
                        </span>
                      )}
                      {m.status === "open" && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail / reply panel */}
        <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              Görüntülemek için soldan bir mesaj seç.
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <PlatformIcon name={selected.platform} className="h-9 w-9 rounded-lg" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selected.author_name || "Bilinmeyen kullanıcı"}</p>
                    <p className="text-[11px] text-slate-400">
                      {selected.kind === "comment" ? "Gönderi yorumu" : "Direkt mesaj"} · {timeAgo(selected.created_at)}
                      {selected.isDemo && " · örnek veri"}
                    </p>
                  </div>
                </div>
                {selected.status === "open" && (
                  <button
                    type="button"
                    onClick={() => handleMarkDone(selected.id, selected.isDemo)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Yanıtlanmış olarak işaretle
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-lg rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-800">
                  {selected.body || "—"}
                </div>

                {replies.map((r) => (
                  <div key={r.id} className="mt-3 flex justify-end">
                    <div className="max-w-lg rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-2.5 text-sm text-white shadow-2xs">
                      {r.body}
                    </div>
                  </div>
                ))}
              </div>

              <div className="shrink-0 border-t border-slate-100 p-4 space-y-2">
                {error && <p className="text-xs text-red-600">{error}</p>}

                {/* AI Smart Reply Assistant Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleGenerateAiReply}
                      disabled={generatingAiReply}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      {generatingAiReply ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                          <span>AI Yanıt Yazıyor…</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Marka Tonunda AI Yanıtı Üret</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiReplyResult && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-medium text-[10px] mr-1">Ton Alternatifi:</span>
                      <button
                        type="button"
                        onClick={() => setReplyText(aiReplyResult.options.friendly)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                      >
                        😊 Samimi
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyText(aiReplyResult.options.concise)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                      >
                        👔 Kısa & Net
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyText(aiReplyResult.options.converting)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                      >
                        🚀 Satış Odaklı
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder="Bir yanıt yazın veya yukarıdaki 'AI Yanıtı Üret'e basın..."
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="rounded-xl bg-[#FA5252] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-600 disabled:opacity-40 cursor-pointer"
                  >
                    {sending ? "Gönderiliyor..." : "Gönder"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

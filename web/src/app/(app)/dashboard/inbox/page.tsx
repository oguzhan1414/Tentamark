"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { sendInboxReply } from "@/lib/social/sendInboxReply";
import { generateInboxReply, type InboxSmartReply } from "@/lib/ai/generateInboxReply";
import { DEMO_INBOX_MESSAGES } from "@/components/dashboard/inbox/demoInboxData";
import PlatformIcon from "@/components/PlatformIcon";

type SocialMessage = {
  id: string;
  platform: "instagram" | "facebook" | "telegram";
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

function timeAgo(iso: string, inboxT: { time: { justNow: string; mAgo: string; hAgo: string; dAgo: string } }) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return inboxT.time.justNow;
  if (mins < 60) return `${mins} ${inboxT.time.mAgo}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${inboxT.time.hAgo}`;
  const days = Math.round(hours / 24);
  return `${days} ${inboxT.time.dAgo}`;
}

export default function InboxPage() {
  const brand = useBrand();
  const { t } = useLanguage();
  const inboxT = t.dashboard.inbox;
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
      setError(err instanceof Error ? err.message : inboxT.errorAi);
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
      setError(err instanceof Error ? err.message : inboxT.errorSend);
    } finally {
      setSending(false);
    }
  }

  const openCount = messages.filter((m) => m.status === "open").length;

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-5 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{inboxT.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{inboxT.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Demo-data preview toggle intentionally hidden for now */}
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50 cursor-pointer"
          >
            {inboxT.refresh}
          </button>
        </div>
      </div>

      {!loading && !hasAnyConnection && (
        <div className="mb-5 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-5 py-4 text-sm text-amber-900">
          {inboxT.noConnection.split(inboxT.connectionsLink)[0]}
          <a href="/settings?tab=baglantilar" className="font-semibold underline">
            {inboxT.connectionsLink}
          </a>
          {inboxT.noConnection.split(inboxT.connectionsLink)[1] || ""}
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-5">
        {/* Message list */}
        <div className="flex w-full max-w-sm shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex shrink-0 flex-col gap-2.5 border-b border-slate-100 p-3.5">
            {/* Status Segmented Control (Open / Answered / All) */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/90 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter("open")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition cursor-pointer ${
                  statusFilter === "open"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="truncate">{inboxT.filters.open}</span>
                {openCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white leading-none shrink-0">
                    {openCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("done")}
                className={`flex items-center justify-center rounded-lg py-1.5 transition cursor-pointer ${
                  statusFilter === "done"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="truncate">{inboxT.filters.done}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`flex items-center justify-center rounded-lg py-1.5 transition cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="truncate">{inboxT.filters.all}</span>
              </button>
            </div>

            {/* Kind Filter Pills (All / Comment / DM) */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: "all", label: inboxT.filters.all },
                    { key: "comment", label: inboxT.filters.comment },
                    { key: "dm", label: inboxT.filters.dm },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setKindFilter(f.key)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      kindFilter === f.key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {filtered.length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">{inboxT.loading}</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">{inboxT.emptyFilter}</p>
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
                        {m.author_name || inboxT.unknownUser}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(m.created_at, inboxT)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{m.body || "—"}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        {m.kind === "comment" ? inboxT.filters.comment : inboxT.filters.dm}
                      </span>
                      {m.isDemo && (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-700">
                          {inboxT.sampleBadge}
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
              {inboxT.emptySelect}
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <PlatformIcon name={selected.platform} className="h-9 w-9 rounded-lg" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selected.author_name || inboxT.unknownUser}</p>
                    <p className="text-[11px] text-slate-400">
                      {selected.kind === "comment" ? inboxT.postComment : inboxT.directMessage} · {timeAgo(selected.created_at, inboxT)}
                      {selected.isDemo && ` · ${inboxT.sampleData}`}
                    </p>
                  </div>
                </div>
                {selected.status === "open" && (
                  <button
                    type="button"
                    onClick={() => handleMarkDone(selected.id, selected.isDemo)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    {inboxT.markDone}
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
                          <span>{inboxT.aiGenerating}</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>{inboxT.aiGenerateBtn}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiReplyResult && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-medium text-[10px] mr-1">{inboxT.toneLabel}</span>
                      <button
                        type="button"
                        onClick={() => setReplyText(aiReplyResult.options.friendly)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                      >
                        {inboxT.tones.friendly}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyText(aiReplyResult.options.concise)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                      >
                        {inboxT.tones.concise}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyText(aiReplyResult.options.converting)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                      >
                        {inboxT.tones.sales}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder={inboxT.replyPlaceholder}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="rounded-xl bg-[#FA5252] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-600 disabled:opacity-40 cursor-pointer"
                  >
                    {sending ? inboxT.sending : inboxT.send}
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

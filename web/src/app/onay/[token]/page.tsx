"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";

type ShareLinkInfo = {
  link_status: string;
  brand_name: string;
  platform: PlatformName | null;
  caption: string | null;
  media_url: string | null;
  media_type: string | null;
  content_status: string;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  NEEDS_REVIEW: "Onay bekliyor",
  APPROVED: "Onaylandı",
  SCHEDULED: "Zamanlandı",
  PUBLISHED: "Yayınlandı",
};

export default function ShareApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const supabase = useMemo(() => createClient(), []);

  const [info, setInfo] = useState<ShareLinkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data, error: rpcError } = await supabase.rpc("resolve_share_link", { p_token: token });
      if (ignore) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (rpcError || !row || row.link_status !== "active") {
        setError("Bu bağlantı geçersiz veya artık aktif değil.");
      } else {
        setInfo(row as ShareLinkInfo);
      }
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, token]);

  async function handleApprove() {
    setSubmitting(true);
    setActionError(null);
    const { error: rpcError } = await supabase.rpc("respond_to_share_link", { p_token: token, p_action: "approve" });
    setSubmitting(false);
    if (rpcError) {
      setActionError(rpcError.message);
      return;
    }
    setApproved(true);
    setInfo((prev) => (prev ? { ...prev, content_status: "APPROVED" } : prev));
  }

  async function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || submitting) return;
    setSubmitting(true);
    setActionError(null);
    const { error: rpcError } = await supabase.rpc("respond_to_share_link", {
      p_token: token,
      p_action: "feedback",
      p_note: note.trim(),
    });
    setSubmitting(false);
    if (rpcError) {
      setActionError(rpcError.message);
      return;
    }
    setFeedbackSent(true);
    setNote("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-400">Yükleniyor...</p>
        ) : error || !info ? (
          <p className="p-8 text-center text-sm text-slate-500">{error}</p>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <span className="text-sm font-bold text-slate-900">{info.brand_name}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {STATUS_LABEL[info.content_status] ?? info.content_status}
              </span>
            </div>

            {info.media_url && (
              <div className="aspect-square w-full bg-slate-100">
                {info.media_type?.startsWith("video/") ? (
                  <video src={info.media_url} controls className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={info.media_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            )}

            <div className="p-5 space-y-3">
              {info.platform && (
                <div className="flex items-center gap-2">
                  <PlatformIcon name={info.platform} className="h-6 w-6 rounded-lg" />
                  <span className="text-xs font-semibold text-slate-500">{info.platform}</span>
                </div>
              )}
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">{info.caption}</p>
            </div>

            <div className="border-t border-slate-100 p-5 space-y-4">
              {actionError && <p className="text-xs font-semibold text-red-600">{actionError}</p>}

              {approved ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ✓ Onayladın — teşekkürler!
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  Onayla
                </button>
              )}

              {feedbackSent ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Geri bildirimin iletildi, teşekkürler.</p>
              ) : (
                <form onSubmit={handleFeedback} className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Değişiklik istiyorsan buraya yaz..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!note.trim() || submitting}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    Geri Bildirim Gönder
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

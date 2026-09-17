"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  authorName: string;
};

type AuthorJoin = { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  author: AuthorJoin;
};

function authorName(author: AuthorJoin, t: Translations): string {
  const row = Array.isArray(author) ? author[0] : author;
  return row?.full_name || row?.email?.split("@")[0] || t.dashboard.posts.commentsPanel.defaultAuthor;
}

function timeAgo(iso: string, t: Translations): string {
  const p = t.dashboard.posts.commentsPanel;
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return p.justNow;
  if (mins < 60) return `${mins} ${p.minAgo}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${p.hourAgo}`;
  return `${Math.round(hours / 24)} ${p.dayAgo}`;
}

const SELECT = "id, body, created_at, author:profiles(full_name, email)";

/*
  A real threaded discussion on a piece of content (Planable-style: teammates
  leaving notes like "Alright! Scheduled." right on the post), separate from
  the approve/reject status action itself. Self-contained so it can be
  dropped into any content detail view (Posts inspector today; Calendar's
  post preview or the future Social Inbox could reuse it as-is).
*/
export default function ContentComments({ contentId }: { contentId: string }) {
  const { t } = useLanguage();
  const supabase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    // No reset-to-null here: the caller keys this component by contentId
    // (see ContentComments usage in posts/page.tsx), so a full remount —
    // not a dependency-change reset — is what gives every post its own
    // fresh `comments` state starting at null.
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("content_comments")
        .select(SELECT)
        .eq("content_id", contentId)
        .order("created_at", { ascending: true });
      if (ignore) return;
      if (error) {
        console.error("Failed to load comments:", error.message);
        setComments([]);
        return;
      }
      setComments(
        (data as unknown as CommentRow[]).map((row) => ({
          id: row.id,
          body: row.body,
          created_at: row.created_at,
          authorName: authorName(row.author, t),
        }))
      );
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, contentId, t]);

  async function submit() {
    const body = text.trim();
    if (!body || posting) return;
    setPosting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("content_comments")
      .insert({ content_id: contentId, author_id: user?.id ?? null, body });

    if (error) {
      console.error("Failed to post comment:", error.message);
      setPosting(false);
      return;
    }

    const { data } = await supabase
      .from("content_comments")
      .select(SELECT)
      .eq("content_id", contentId)
      .order("created_at", { ascending: true });
    setComments(
      ((data ?? []) as unknown as CommentRow[]).map((row) => ({
        id: row.id,
        body: row.body,
        created_at: row.created_at,
        authorName: authorName(row.author, t),
      }))
    );
    setText("");
    setPosting(false);
  }

  const cp = t.dashboard.posts.commentsPanel;
  const actions = t.dashboard.posts.actions;

  return (
    <div className="mt-5 space-y-3">
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
        {actions.comments}{comments && comments.length > 0 ? ` (${comments.length})` : ""}
      </span>

      <div className="space-y-2.5">
        {comments === null ? (
          <p className="text-xs text-slate-400">{cp.loading}</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-400">{cp.empty}</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-800">
                {c.authorName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{c.authorName}</span>
                  <span className="font-mono text-[10px] text-slate-400">{timeAgo(c.created_at, t)}</span>
                </div>
                <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-slate-700">{c.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={actions.quickCommentPlaceholder}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
        />
        <button
          type="button"
          disabled={!text.trim() || posting}
          onClick={submit}
          className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          {actions.sendComment}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { askAssistant, type ChatTurn, type ContentDraft } from "@/lib/ai/askAssistant";
import { PLATFORM_LABEL, type LaunchPlatform } from "@/lib/ai/platforms";
import MediaLibraryModal, { type MediaLibraryItem } from "@/components/dashboard/MediaLibraryModal";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imageUrl?: string | null;
  imageName?: string | null;
  draft?: ContentDraft | null;
  draftStatus?: "pending" | "accepted" | "rejected";
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

type AttachedImage = {
  url: string;
  name: string;
};

const STARTER_PROMPTS = [
  {
    icon: "🎬",
    title: "Viral Reels Konuları",
    desc: "Bu hafta viral olabilecek 3 Reels konusu ve kanca önerisi",
    prompt: "🚀 Bu hafta kitlemin ilgisini çekecek ve viral olabilecek 3 Reels konusu ve kanca önerisi hazırla.",
  },
  {
    icon: "🪝",
    title: "Kaydettiren Kancalar",
    desc: "Sektörümde kaydetme ve paylaşım getiren 5 güçlü kanca",
    prompt: "💡 Sektörümde kaydetme ve paylaşma oranını en çok artıran 5 güçlü soru/merak kancası öner.",
  },
  {
    icon: "🎯",
    title: "Satış Story Kurgusu",
    desc: "Hikayelerde takipçiyi müşteriye dönüştüren 3 adımlı akış",
    prompt: "🎯 Satış odaklı, etkileşim ve DM tetikleyen 3 adımlı bir Instagram Story serisi kurgusu hazırla.",
  },
  {
    icon: "📅",
    title: "Yarın İçin Gönderi",
    desc: "Yarın paylaşılmaya hazır, platformlara özel taslak üret",
    prompt: "Yarın için hazır bir gönderi taslağı üret ve takvime ekleyebileceğim şekilde hazırla.",
  },
];

function nowLabel(): string {
  return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function dayOffsetLabel(offset: number): string {
  if (offset === 0) return "Bugün";
  if (offset === 1) return "Yarın";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("tr-TR", { weekday: "long", day: "2-digit", month: "long" });
}

function scheduleForOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(0, Math.min(6, offset)));
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\p{L}0-9_]+/gu) ?? [];
  return Array.from(new Set(matches));
}

function formatSessionDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function createNewSession(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: "Yeni Sohbet",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export default function AssistantPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  // Conversation sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  // Input state
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<AttachedImage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingDraftId, setProcessingDraftId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = `tentamark_chat_sessions_${brand.id}`;

  // 1. Initial Load: Load sessions from localStorage & Supabase
  useEffect(() => {
    let ignore = false;

    (async () => {
      let savedSessions: ChatSession[] = [];
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Drop any empty sessions that slipped into storage before the
            // save-filter fix — otherwise old phantom "Yeni Sohbet" entries
            // stay stuck in the history forever even after the fix.
            savedSessions = parsed.filter(
              (s) => s && Array.isArray(s.messages) && s.messages.length > 0
            );
          }
        }
      } catch {
        savedSessions = [];
      }

      // If no localStorage sessions exist, try seeding from Supabase assistant_messages
      if (savedSessions.length === 0) {
        const { data: dbMessages } = await supabase
          .from("assistant_messages")
          .select("id, role, content, draft, draft_status, created_at")
          .eq("brand_id", brand.id)
          .order("created_at", { ascending: true })
          .limit(100);

        if (!ignore && dbMessages && dbMessages.length > 0) {
          const legacyMessages: Message[] = dbMessages.map((row) => ({
            id: row.id,
            role: row.role as "user" | "assistant",
            content: row.content,
            timestamp: new Date(row.created_at).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            draft: row.draft as ContentDraft | null,
            draftStatus: (row.draft_status ?? undefined) as Message["draftStatus"],
          }));

          const firstUserMsg = legacyMessages.find((m) => m.role === "user");
          const seedTitle = firstUserMsg
            ? firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? "…" : "")
            : "Önceki Sohbet";

          const seedSession: ChatSession = {
            id: `conv_legacy_${brand.id}`,
            title: seedTitle,
            createdAt: dbMessages[0].created_at,
            updatedAt: dbMessages[dbMessages.length - 1].created_at,
            messages: legacyMessages,
          };
          savedSessions = [seedSession];
        }
      }

      if (ignore) return;

      // User requested: "her sayfada yeni konuşma gelsin, solda da eski konuşmalara geçip konuşabilelim"
      // So on page visit, we create a fresh new session as active, keeping all past ones in the left sidebar!
      const freshSession = createNewSession();
      const initialList = [freshSession, ...savedSessions];

      setSessions(initialList);
      setActiveSessionId(freshSession.id);
      setSessionsLoaded(true);
    })();

    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, storageKey]);

  // Persist sessions to localStorage whenever they change (filtering out empty temporary sessions)
  useEffect(() => {
    if (!sessionsLoaded) return;
    try {
      // Only persist sessions that actually contain a real message — the
      // fresh empty session created on every page visit used to be kept
      // too (via `|| s.id === activeSessionId`), so opening the page and
      // leaving without typing anything still left a phantom "Yeni Sohbet"
      // entry in the history.
      const toSave = sessions.filter((s) => s.messages.length > 0);
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {
      // Ignore quota/private mode errors
    }
  }, [sessions, activeSessionId, sessionsLoaded, storageKey]);

  // Current active session
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) ?? sessions[0] ?? null;
  }, [sessions, activeSessionId]);

  const activeMessages = useMemo(() => {
    return activeSession?.messages ?? [];
  }, [activeSession]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, loading]);

  // Auto-resize textarea
  function handleTextareaChange(val: string) {
    setInput(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }

  // Create new chat
  function handleStartNewChat() {
    const fresh = createNewSession();
    setSessions((prev) => [fresh, ...prev.filter((s) => s.messages.length > 0)]);
    setActiveSessionId(fresh.id);
    setSelectedImage(null);
    setInput("");
    setMobileSidebarOpen(false);
  }

  // Delete chat
  function handleDeleteSession(e: React.MouseEvent, sessionId: string) {
    e.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      if (sessionId === activeSessionId) {
        if (next.length > 0) {
          setActiveSessionId(next[0].id);
        } else {
          const fresh = createNewSession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
      }
      return next;
    });
  }

  // File upload from disk
  async function handleFileUpload(file: File) {
    if (!file) return;
    setUploadingImage(true);
    setShowAttachMenu(false);

    try {
      const path = `${brand.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);

      if (uploadError) {
        // Fallback to local preview URL if bucket policy error
        const localUrl = URL.createObjectURL(file);
        setSelectedImage({ url: localUrl, name: file.name });
      } else {
        const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
        setSelectedImage({ url: publicUrl.publicUrl, name: file.name });
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      setSelectedImage({ url: localUrl, name: file.name });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Media Library Selection
  function handleMediaSelect(item: MediaLibraryItem) {
    setSelectedImage({
      url: item.file_url,
      name: item.file_name,
    });
    setShowMediaModal(false);
    setShowAttachMenu(false);
  }

  // Copy message to clipboard
  async function handleCopy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard write error
    }
  }

  // Database insert helper
  async function insertDbMessage(
    role: "user" | "assistant",
    content: string,
    draft?: ContentDraft | null,
    draftStatus?: Message["draftStatus"],
    imageUrl?: string | null
  ): Promise<string> {
    try {
      const draftPayload = draft
        ? { ...draft, ...(imageUrl ? { imageUrl } : {}) }
        : imageUrl
        ? { imageUrl }
        : null;

      const { data } = await supabase
        .from("assistant_messages")
        .insert({
          brand_id: brand.id,
          role,
          content,
          draft: draftPayload,
          draft_status: draftStatus ?? null,
        })
        .select("id")
        .single();

      return data?.id ?? `msg_${Date.now()}`;
    } catch {
      return `msg_${Date.now()}`;
    }
  }

  // Send message
  async function handleSend(customPrompt?: string) {
    const textToSend = (customPrompt || input).trim();
    if ((!textToSend && !selectedImage) || loading || !activeSession) return;

    const currentImg = selectedImage;
    setSelectedImage(null);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const displayText = textToSend || (currentImg ? `Görsel paylaştım: ${currentImg.name}` : "");
    const promptForAi = currentImg
      ? `[Ekli Görsel: ${currentImg.name} (${currentImg.url})]\n${textToSend || "Bu görseli sosyal medya içeriğim için nasıl kullanabilirim ve ne tür bir kanca veya açıklama yazmalıyım?"}`
      : textToSend;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: displayText,
      timestamp: nowLabel(),
      imageUrl: currentImg?.url ?? null,
      imageName: currentImg?.name ?? null,
    };

    // Auto title if first message
    const isFirstMessage = activeSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? displayText.slice(0, 30) + (displayText.length > 30 ? "…" : "")
      : activeSession.title;

    // Append user message immediately
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setLoading(true);

    // Persist to Supabase in background
    void insertDbMessage("user", displayText, null, undefined, currentImg?.url);

    try {
      const historyTurns: ChatTurn[] = activeSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await askAssistant(brand.id, historyTurns, promptForAi);

      const assistantMsgId = `ast_${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: reply.message,
        timestamp: nowLabel(),
        draft: reply.draft,
        draftStatus: reply.draft ? "pending" : undefined,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, assistantMsg],
            };
          }
          return s;
        })
      );

      // Persist assistant message to Supabase
      void insertDbMessage(
        "assistant",
        reply.message,
        reply.draft,
        reply.draft ? "pending" : undefined
      );
    } catch (err) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: `Üzgünüm, yanıt oluşturulurken bir hata oluştu: ${
          err instanceof Error ? err.message : "Bilinmeyen hata"
        }`,
        timestamp: nowLabel(),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, errorMsg],
            };
          }
          return s;
        })
      );
    } finally {
      setLoading(false);
    }
  }

  // Accept generated post draft
  async function handleAcceptDraft(messageId: string, draft: ContentDraft) {
    setProcessingDraftId(messageId);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: contentRow, error: contentError } = await supabase
        .from("content")
        .insert({
          brand_id: brand.id,
          title: draft.title,
          core_idea: draft.title,
          category: draft.category || null,
          status: "NEEDS_REVIEW",
          ai_generated: true,
          created_by: user?.id ?? null,
        })
        .select("id")
        .single();

      if (contentError || !contentRow) throw new Error(contentError?.message ?? "İçerik kaydedilemedi.");

      const scheduledIso = scheduleForOffset(draft.dayOffset);
      const platforms = Object.keys(draft.captions) as LaunchPlatform[];

      if (platforms.length > 0) {
        const { error: cpError } = await supabase.from("content_platforms").insert(
          platforms.map((platform) => {
            const caption = draft.captions[platform] ?? "";
            return {
              content_id: contentRow.id,
              platform,
              caption,
              hashtags: extractHashtags(caption),
              status: "PENDING",
              scheduled_at: scheduledIso,
            };
          })
        );
        if (cpError) throw new Error(cpError.message);
      }

      // Update state
      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, draftStatus: "accepted" } : m
          ),
        }))
      );

      // Update in Supabase if exists
      void supabase
        .from("assistant_messages")
        .update({ draft_status: "accepted", content_id: contentRow.id })
        .eq("id", messageId);
    } catch (err) {
      alert(`Taslak kaydedilemedi: ${err instanceof Error ? err.message : "bilinmeyen hata"}`);
    } finally {
      setProcessingDraftId(null);
    }
  }

  // Reject generated post draft
  function handleRejectDraft(messageId: string) {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, draftStatus: "rejected" } : m
        ),
      }))
    );
    void supabase
      .from("assistant_messages")
      .update({ draft_status: "rejected" })
      .eq("id", messageId);
  }

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] flex-col p-3 sm:p-5 lg:p-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="mb-3.5 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-[#FA5252] text-white shadow-xs">
            <span className="text-base">✨</span>
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              AI Pazarlama Asistanı & Copilot
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {brand.name} için kişiselleştirilmiş büyüme stratejisi ve onaylanabilir gönderi taslakları
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs text-slate-600 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">Canlı Danışman</span>
          </div>

          <button
            type="button"
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 rounded-xl bg-[#FA5252] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#E03131] transition cursor-pointer"
          >
            <span>+</span>
            <span>Yeni Sohbet</span>
          </button>
        </div>
      </div>

      {/* Main Container: ChatGPT 2-Column Shell */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFileUpload(file);
          }}
        />

        {/* ========================================================= */}
        {/* LEFT COLUMN: Conversation Threads Sidebar                 */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-y-0 left-0 z-30 flex w-72 sm:w-80 flex-col border-r border-slate-200/80 bg-slate-50/70 backdrop-blur-md transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Top: New Chat Button */}
          <div className="p-3 border-b border-slate-200/70 flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="flex flex-1 items-center justify-between rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni Sohbet Başlat</span>
              </span>
              <span className="text-[10px] text-slate-400">✨</span>
            </button>

            {/* Mobile close sidebar button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              ✕
            </button>
          </div>

          {/* Conversations History List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sohbet Geçmişi
            </div>

            {sessions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Henüz kayıtlı sohbet bulunmuyor.
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                const previewTitle = s.title || "Yeni Sohbet";
                const dateLabel = formatSessionDate(s.updatedAt);

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/90"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={`text-sm shrink-0 ${isActive ? "text-rose-600" : "text-slate-400"}`}>
                        💬
                      </span>
                      <span className="truncate">{previewTitle}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 group-hover:hidden">
                        {dateLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        title="Sohbeti Sil"
                        className="hidden group-hover:flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Bottom Brand Tag */}
          <div className="p-3 border-t border-slate-200/70 bg-white/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700 font-bold text-xs">
                  {brand.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-xs">
                  <p className="font-semibold text-slate-900 truncate">{brand.name}</p>
                  <p className="text-[10px] text-slate-400">Pazarlama Hafızası Aktif</p>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="AI Modeli Çevrimiçi" />
            </div>
          </div>
        </div>

        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Chat Conversation Feed & Prompt Input       */}
        {/* ========================================================= */}
        <div className="flex min-w-0 flex-1 flex-col bg-white overflow-hidden">
          {/* Main Top Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
                title="Sohbet Geçmişi"
              >
                ☰
              </button>

              <div>
                <h2 className="font-display text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                  {activeSession?.title || "Yeni Sohbet"}
                </h2>
                <p className="text-[10px] text-slate-400">
                  {activeMessages.length} mesaj • Marka DNA ve Tonunuzla senkronize
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                + Temiz Sohbet
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Empty State: Sleek ChatGPT-style Welcome */}
            {activeMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[380px] max-w-2xl mx-auto text-center px-4 py-8">
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-[#FA5252] text-white shadow-lg shadow-rose-500/20">
                  <Image
                    src="/images/tentamark-mascot.png"
                    alt="Tentamark"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white font-bold ring-2 ring-white">
                    ✓
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                  {brand.name} için bugün ne planlamak istersin?
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 max-w-md leading-relaxed">
                  İster genel strateji ve kancalar danış, ister doğrudan görsel ekleyip onaylanabilir gönderi taslağı ürettir.
                </p>

                {/* 4 Interactive Starter Chips */}
                <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
                  {STARTER_PROMPTS.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(starter.prompt)}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 transition-all hover:border-rose-300 hover:bg-rose-50/40 hover:shadow-xs cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-display text-xs font-bold text-slate-900 group-hover:text-rose-700">
                          <span className="text-base">{starter.icon}</span>
                          <span>{starter.title}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                          {starter.desc}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-end text-[10px] font-semibold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Başlat →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rendered Messages */}
            {activeMessages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant Avatar */}
                {m.role === "assistant" && (
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-[#FA5252] text-white font-bold text-xs shadow-xs">
                    T
                  </div>
                )}

                <div className={`space-y-2 ${m.role === "user" ? "max-w-[85%] sm:max-w-xl" : "max-w-2xl w-full"}`}>
                  {/* User attached image thumbnail */}
                  {m.imageUrl && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs mb-2 w-fit ml-auto">
                      <div className="relative h-44 w-60 sm:h-52 sm:w-72 bg-slate-100">
                        <Image
                          src={m.imageUrl}
                          alt={m.imageName || "Eklenen görsel"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {m.imageName && (
                        <div className="bg-slate-900/90 px-3 py-1 text-[10px] text-slate-200 truncate max-w-xs">
                          📷 {m.imageName}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`group relative rounded-2xl p-4 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "ml-auto bg-slate-900 text-white shadow-xs rounded-tr-xs"
                        : "border border-slate-100 bg-slate-50/80 text-slate-800 shadow-2xs rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line font-body">{m.content}</p>

                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-black/5 pt-2">
                      <span className={`text-[10px] font-mono ${m.role === "user" ? "text-slate-400" : "text-slate-400"}`}>
                        {m.timestamp}
                      </span>

                      {/* Copy button for assistant */}
                      {m.role === "assistant" && (
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.content)}
                          className="text-[10px] text-slate-400 hover:text-rose-600 font-medium transition cursor-pointer"
                        >
                          {copiedId === m.id ? "✓ Kopyalandı" : "Metni Kopyala"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Draft Card (If AI Generated a Post) */}
                  {m.draft && (
                    <div className="rounded-2xl border border-rose-100/80 bg-rose-50/30 p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          {m.draft.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 font-medium">
                          📅 {dayOffsetLabel(m.draft.dayOffset)}
                        </span>
                      </div>

                      <p className="mt-2 font-display text-sm font-bold text-slate-900">
                        {m.draft.title}
                      </p>

                      <div className="mt-3 space-y-2">
                        {Object.entries(m.draft.captions).map(([platform, caption]) => (
                          <div key={platform} className="rounded-xl border border-slate-200/80 bg-white p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                {PLATFORM_LABEL[platform as LaunchPlatform] || platform}
                              </span>
                            </div>
                            <p className="whitespace-pre-line text-xs text-slate-700 leading-relaxed">
                              {caption}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Acceptance Action Buttons */}
                      <div className="mt-3.5 pt-2 border-t border-rose-100">
                        {m.draftStatus === "accepted" ? (
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-200">
                            <span>✓</span> Taslak takvime kaydedildi! Takvim sayfasından inceleyebilirsiniz.
                          </p>
                        ) : m.draftStatus === "rejected" ? (
                          <p className="text-xs font-medium text-slate-400 py-1">Bu taslak reddedildi.</p>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptDraft(m.id, m.draft!)}
                              disabled={processingDraftId === m.id}
                              className="flex-1 rounded-xl bg-[#FA5252] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#E03131] transition disabled:opacity-50 cursor-pointer"
                            >
                              {processingDraftId === m.id ? "Takvime Ekleniyor…" : "✓ Onayla ve Takvime Ekle"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectDraft(m.id)}
                              disabled={processingDraftId === m.id}
                              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 transition disabled:opacity-50 cursor-pointer"
                            >
                              ✕ Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3.5 items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-[#FA5252] text-white font-bold text-xs shadow-xs">
                  T
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-xs text-rose-700 font-medium">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                  </span>
                  <span>Tentamark yanıtı hazırlıyor...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================= */}
          {/* BOTTOM DOCKED PROMPT INPUT AREA                           */}
          {/* ========================================================= */}
          <div className="shrink-0 p-3 sm:p-5 border-t border-slate-100 bg-white">
            <div className="max-w-4xl mx-auto space-y-2">
              {/* Selected Image Thumbnail Preview inside Input Box */}
              {selectedImage && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/60 p-2 text-xs">
                  <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-rose-200 bg-white shadow-2xs">
                    <Image
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{selectedImage.name}</p>
                    <p className="text-[10px] text-rose-600 font-medium">Görsel eklendi • AI analiz edecek</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-red-100 hover:text-red-600 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Main ChatGPT Input Shell */}
              <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/70 p-2 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/15 transition-all shadow-xs">
                {/* Auto-growing Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Tentamark danışmanına bir soru sorun veya görsel ekleyin... (Enter: Gönder, Shift+Enter: Yeni satır)"
                  className="w-full resize-none border-0 bg-transparent px-3 pt-1 pb-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed"
                />

                {/* Bottom Action Strip: Attach Image & Send */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 px-1.5">
                  {/* Left: Attachment actions */}
                  <div className="relative flex items-center gap-1">
                    {/* Attach Image Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu((v) => !v)}
                      title="Görsel Ekle"
                      disabled={uploadingImage}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-200 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                    >
                      {uploadingImage ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                      ) : (
                        <span>📷</span>
                      )}
                      <span>Görsel Ekle</span>
                    </button>

                    {/* Attach options popover */}
                    {showAttachMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-20">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer text-left"
                        >
                          <span>📁</span>
                          <span>Bilgisayardan Yükle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMediaModal(true);
                            setShowAttachMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer text-left"
                        >
                          <span>🖼️</span>
                          <span>Medya Kütüphanesinden Seç</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !selectedImage) || loading}
                    className="flex items-center gap-1.5 rounded-xl bg-[#FA5252] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Gönder</span>
                    <span>🚀</span>
                  </button>
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400">
                Tentamark AI, marka profilinizdeki kimlik, ses tonu ve sektör verilerinizi referans alarak yanıt üretir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal for picking existing brand media */}
      {showMediaModal && (
        <MediaLibraryModal
          brandId={brand.id}
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaModal(false)}
        />
      )}
    </div>
  );
}

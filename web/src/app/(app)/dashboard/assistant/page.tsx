"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { askAssistant } from "@/lib/ai/askAssistant";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const PROMPT_CHIPS = [
  "🚀 Bu hafta viral olabilecek 3 Reels konusu öner.",
  "💡 Sektörümde kaydetme oranını en çok artıran kancalar nelerdir?",
  "🎯 Satış odaklı bir hikaye (Story) serisi kurgusu hazırla.",
  "🔍 Profil biyografimi ve öne çıkanlarımı nasıl optimize etmeliyim?",
];

export default function AssistantPage() {
  const brand = useBrand();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Merhaba! Ben **Tentamark AI Pazarlama Danışmanınızım**. ${brand.name} markanızın kitle büyümesini hızlandırmak, algoritma trendlerine uygun kancalar üretmek veya haftalık içerik fikirleri geliştirmek için buradayım. Bugün ne üzerinde çalışmak istersiniz?`,
      timestamp: "Şimdi",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(promptText?: string) {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await askAssistant(brand.id, userMsg.content);
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: `Üzgünüm, yanıt oluşturulurken bir hata oluştu: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          AI Pazarlama Asistanı & Büyüme Önerileri
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Kitle davranışlarını, algoritma trendlerini ve içerik performansınızı analiz eden akıllı büyüme danışmanı.
        </p>
      </div>

      {/* 2. Hero Insight Banner */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-violet-700 via-indigo-600 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="pointer-events-none absolute -right-8 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <span>✨</span>
              <span>GENEL İÇERİK STRATEJİSİ İPUÇLARI</span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl text-white">
              Kısa video ve karusel formatları genellikle tekli görsellere göre daha yüksek etkileşim alır.
            </h2>
            <p className="text-sm text-indigo-100/90 leading-relaxed font-normal">
              Aşağıdaki öneriler yaygın platform davranış kalıplarına dayanıyor — markanıza özel performans verileri (Analiz sekmesi tamamlandığında) burayı gerçek sayılarınızla güncelleyecek.
            </p>
          </div>

          <div className="relative flex shrink-0 items-center justify-center">
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
              <Image
                src="/tenta-avatar-open.png"
                alt="Tentamark Danışmanı"
                fill
                sizes="144px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Three Strategic Recommendation Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Card 1 */}
        <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📱</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Genel İpucu
              </span>
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Karusel ve Video Ağırlığını Artırın
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Takipçiler genellikle çoklu slayt karusellerini tek görsellere kıyasla daha uzun süre görüntülüyor.
            </p>
          </div>
          <Link
            href="/dashboard/compose"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Şablonu Kullan</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">⏰</span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                Genel İpucu
              </span>
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Akşam Saatlerini Deneyin
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Genel sosyal medya araştırmalarına göre akşam 18:00-21:00 arası çoğu kitlede daha yüksek etkileşim görülüyor — kendi en iyi saatinizi Analiz sekmesi tamamlanınca burada göreceksiniz.
            </p>
          </div>
          <Link
            href="/dashboard/calendar"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Takvimde Zamanla</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🪝</span>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">
                Genel İpucu
              </span>
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Soru Cümlesiyle Kanca (Hook) Testi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              İlk 2 saniyede merak uyandıran bir soruyla başlayan içerikler genellikle daha fazla yorum ve paylaşım tetikliyor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSend("Bana kitlemi etkileyecek ve yoruma teşvik edecek 5 güçlü soru kancası önerir misin?")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 text-left"
          >
            <span>AI ile Kancaları İste</span>
            <span>✨</span>
          </button>
        </div>
      </div>

      {/* 4. Interactive AI Marketing Copilot Chat Area */}
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <span className="text-sm">💬</span>
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Tentamark Büyüme Copilot&apos;ı
              </h3>
              <p className="text-[11px] text-slate-400">Markanıza özel gerçek zamanlı AI pazarlama tavsiyesi</p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
            Canlı & Çevrimiçi
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700 transition font-medium text-left"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="max-h-[420px] overflow-y-auto space-y-3.5 pr-2 pt-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-xs">
                  T
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-100 bg-slate-50 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-line font-body">{m.content}</p>
                <span
                  className={`block text-[10px] mt-2 font-mono ${
                    m.role === "user" ? "text-slate-400 text-right" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-3 bg-indigo-50/60 rounded-xl w-fit">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Tentamark pazarlama stratejinizi hazırlıyor...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Bir soru sorun (örn: 'Bu ay etkileşimi artırmak için 3 yaratıcı fikir ver')..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Gönder 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

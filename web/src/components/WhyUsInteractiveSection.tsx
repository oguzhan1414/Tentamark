"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const palette = ["#172554", "#5B4BFF", "#3987F6", "#FF6670", "#D93B9D"];

function TentaMark({ size = 32 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm" style={{ width: size, height: size }}>
      <Image src="/brand/tentamark-mark-512.png" alt="" width={size} height={size} className="h-full w-full object-contain" />
    </span>
  );
}

function BrandDnaVisual({ isEn }: { isEn: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[390px] [perspective:1000px]">
      <div className="absolute -left-3 top-9 h-[82%] w-full -rotate-3 rounded-[24px] border border-white/70 bg-white/35 shadow-lg" />
      <div className="relative rounded-[24px] border border-white/90 bg-white/88 p-4 shadow-[0_24px_55px_rgba(51,40,92,0.16)] backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <TentaMark size={34} />
            <div><p className="text-[11px] font-bold text-slate-900">Tentamark Brand DNA</p><p className="text-[8px] text-slate-400">{isEn ? "Brand memory active" : "Marka hafızası aktif"}</p></div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{isEn ? "Ready" : "Hazır"}</span>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl bg-[#F5F2FF] p-3">
            <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-violet">{isEn ? "Brand voice" : "Marka tonu"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-slate-700 shadow-xs">Modern</span><span className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-slate-700 shadow-xs">{isEn ? "Friendly" : "Samimi"}</span><span className="rounded-full bg-violet px-2 py-1 text-[8px] font-semibold text-white">{isEn ? "Confident" : "Kendinden emin"}</span></div>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-slate-100 p-3">
            <div><p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-400">{isEn ? "Audience" : "Hedef kitle"}</p><p className="mt-1 text-[10px] font-bold text-slate-800">{isEn ? "Founders · Small businesses" : "Kurucular · Küçük işletmeler"}</p></div>
            <div className="flex -space-x-1.5">{["#E4D7FF", "#FFD9D2", "#D8ECFF"].map((color) => <span key={color} className="h-7 w-7 rounded-full border-2 border-white" style={{ backgroundColor: color }} />)}</div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
            <div><p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-slate-400">{isEn ? "Visual identity" : "Görsel kimlik"}</p><div className="mt-2 flex gap-1.5">{palette.map((color) => <span key={color} className="h-5 w-5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: color }} />)}</div></div>
            <span className="rounded-xl bg-emerald-50 px-2.5 py-2 text-[9px] font-bold text-emerald-700">✓ {isEn ? "Consistent" : "Tutarlı"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyFlowVisual({ isEn }: { isEn: boolean }) {
  const days = [
    { d: isEn ? "Mon" : "Pzt", c: "#5B4BFF", h: isEn ? "Brand story" : "Marka hikâyesi", type: "Carousel" },
    { d: isEn ? "Tue" : "Sal", c: "#3987F6", h: isEn ? "Product value" : "Ürün faydası", type: isEn ? "Post" : "Gönderi" },
    { d: isEn ? "Wed" : "Çar", c: "#FF6670", h: isEn ? "Customer Q&A" : "Müşteri sorusu", type: isEn ? "Idea" : "Fikir" },
    { d: isEn ? "Thu" : "Per", c: "#16B88A", h: isEn ? "Tip series" : "İpucu serisi", type: isEn ? "Post" : "Gönderi" },
    { d: isEn ? "Fri" : "Cum", c: "#D93B9D", h: isEn ? "Week recap" : "Hafta özeti", type: "Carousel" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-[410px]">
      <div className="rounded-[24px] border border-white/90 bg-white/90 p-4 shadow-[0_24px_55px_rgba(34,68,116,0.15)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5"><TentaMark size={34} /><div><p className="text-[11px] font-bold text-slate-900">{isEn ? "Weekly Flow" : "Haftalık Akış"}</p><p className="text-[8px] text-slate-400">{isEn ? "5 posts · 3 channels" : "5 içerik · 3 kanal"}</p></div></div>
          <span className="rounded-full bg-sky/10 px-2.5 py-1 text-[8px] font-bold text-sky">{isEn ? "AI planned" : "AI planladı"}</span>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-1.5">
          {days.map((item, index) => (
            <div key={item.d} className={`rounded-xl border p-1.5 ${index === 1 ? "border-sky/35 bg-sky/5 shadow-md" : "border-slate-100 bg-slate-50/70"}`}>
              <div className="flex items-center justify-between"><span className="text-[7px] font-bold text-slate-500">{item.d}</span><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.c }} /></div>
              <div className="mt-2 aspect-[4/5] rounded-lg bg-gradient-to-br from-white to-slate-100 p-1.5"><div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: item.c, opacity: 0.7 }} /><div className="mt-1 h-1 w-full rounded-full bg-slate-200" /><div className="mt-1 h-1 w-2/3 rounded-full bg-slate-200" /></div>
              <p className="mt-1.5 truncate text-[6.5px] font-bold text-slate-700">{item.h}</p><p className="text-[6px] text-slate-400">{item.type}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#F5F2FF] p-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet text-xs text-white">✦</span>
          <div className="min-w-0 flex-1"><p className="text-[8px] font-bold text-slate-800">{isEn ? "“Announce our new feature this week.”" : "“Yeni özelliğimizi bu hafta duyuralım.”"}</p><div className="mt-1 h-1 w-4/5 rounded-full bg-violet/15" /></div>
          <span className="rounded-lg bg-ink px-2 py-1.5 text-[7px] font-bold text-white">{isEn ? "Plan" : "Planla"}</span>
        </div>
      </div>
    </div>
  );
}

function ApprovalVisual({ isEn }: { isEn: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="absolute -right-3 top-8 h-[86%] w-full rotate-3 rounded-[24px] border border-white/70 bg-white/35 shadow-lg" />
      <div className="relative overflow-hidden rounded-[24px] border border-white/90 bg-white/90 p-4 shadow-[0_24px_55px_rgba(102,49,80,0.15)] backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><TentaMark size={34} /><div><p className="text-[11px] font-bold text-slate-900">{isEn ? "Approval Desk" : "Onay Masası"}</p><p className="text-[8px] text-slate-400">{isEn ? "Final review before publishing" : "Yayın öncesi son kontrol"}</p></div></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-bold text-amber-700">{isEn ? "Awaiting review" : "Onay bekliyor"}</span></div>
        <div className="mt-4 grid grid-cols-[0.85fr_1.15fr] gap-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#22254D,#5B4BFF_52%,#FF6670)] p-3 text-white shadow-lg">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full border border-white/20" /><div className="absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-white/10 blur-sm" />
            <TentaMark size={26} /><p className="relative mt-5 text-[7px] font-semibold uppercase tracking-[0.17em] text-white/65">{isEn ? "Idea of the week" : "Haftanın fikri"}</p><p className="relative mt-1 text-[12px] font-extrabold leading-tight">{isEn ? "Let your brand speak with one voice." : "Markanız her gün aynı sesle konuşsun."}</p><div className="absolute bottom-3 left-3 rounded-full bg-white px-2 py-1 text-[6px] font-bold text-violet">tentamark.com</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl border border-slate-100 p-3"><p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-400">Brand Guardian</p><div className="mt-2 flex items-center justify-between"><p className="text-[10px] font-bold text-slate-800">{isEn ? "Brand fit" : "Marka uyumu"}</p><span className="text-[12px] font-extrabold text-emerald-600">96%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[96%] rounded-full bg-gradient-to-r from-violet to-emerald-400" /></div></div>
            <div className="rounded-2xl border border-slate-100 p-3"><p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-400">Kanallar</p><div className="mt-2 flex gap-1.5">{["IG", "FB", "TH"].map((label, i) => <span key={label} className={`grid h-7 w-7 place-items-center rounded-lg text-[7px] font-extrabold ${i === 0 ? "bg-violet text-white" : "bg-slate-100 text-slate-500"}`}>{label}</span>)}</div></div>
            <div className="mt-auto grid grid-cols-2 gap-2"><span className="rounded-xl border border-slate-200 px-2 py-2 text-center text-[8px] font-bold text-slate-600">{isEn ? "Edit" : "Düzenle"}</span><span className="rounded-xl bg-emerald-500 px-2 py-2 text-center text-[8px] font-bold text-white shadow-md">✓ {isEn ? "Approve" : "Onayla"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhyUsInteractiveSection() {
  const { t, isEn } = useLanguage();
  const cards = [
    { copy: t.whyUs.card1, visual: <BrandDnaVisual isEn={isEn} />, tone: "from-[#F4F0FF] via-[#F8F6FF] to-[#EEE9FF]", number: "01" },
    { copy: t.whyUs.card2, visual: <WeeklyFlowVisual isEn={isEn} />, tone: "from-[#EEF6FF] via-[#F5F9FF] to-[#E8F3FF]", number: "02" },
    { copy: t.whyUs.card3, visual: <ApprovalVisual isEn={isEn} />, tone: "from-[#FFF1F2] via-[#FFF7F5] to-[#F8EEFF]", number: "03" },
  ];
  return (
    <section id="neden-biz" className="relative overflow-hidden border-t border-line bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[70rem] -translate-x-1/2 bg-[radial-gradient(circle,rgba(109,74,255,0.09),transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-violet">{isEn ? "The Tentamark workflow" : "Tentamark çalışma sistemi"}</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[44px]">{t.whyUs.mainTitle}</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 items-stretch gap-5 md:grid-cols-3 lg:gap-6">
          {cards.map((card) => (
            <article key={card.number} className={`group relative flex min-h-[590px] flex-col overflow-hidden rounded-[32px] border border-white bg-gradient-to-br ${card.tone} p-6 shadow-[0_18px_55px_rgba(34,27,68,0.07)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_75px_rgba(34,27,68,0.13)] sm:p-8`}>
              <div className="absolute right-6 top-5 font-mono text-5xl font-bold text-ink/[0.045]">{card.number}</div>
              <div className="relative"><h3 className="max-w-sm font-display text-xl font-bold leading-snug text-ink sm:text-[22px]">{card.copy.title}</h3><p className="mt-3 max-w-md font-body text-sm leading-relaxed text-muted">{card.copy.desc}</p></div>
              <div className="relative mt-auto pt-10 transition-transform duration-500 group-hover:scale-[1.015]">{card.visual}</div>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center"><Link href="/kayit" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-white shadow-[0_15px_30px_rgba(24,25,49,0.2)] transition hover:-translate-y-0.5 hover:bg-violet">{t.whyUs.ctaButton}<span aria-hidden="true">→</span></Link></div>
      </div>
    </section>
  );
}

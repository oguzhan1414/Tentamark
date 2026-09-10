import Image from "next/image";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function DashboardTopbar({ brandName }: { brandName: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left / Brand Info & AI Status Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="relative block h-8 w-8 shrink-0">
            <Image src="/images/tenta-mark.png" alt="" fill sizes="32px" className="object-contain" />
          </span>
          <span className="font-bold tracking-tight text-slate-900 text-sm">Tentamark</span>
        </div>

        {/* AI Engine Status Pill */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/70 px-3.5 py-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.08)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-800 tracking-tight">
            AI Marketing Engine <span className="font-normal text-emerald-600 hidden sm:inline">· Tüm sistemler aktif</span>
          </span>
        </div>
      </div>

      {/* Right / Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick notification bell */}
        <button
          type="button"
          aria-label="Bildirimler"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
        </button>

        {/* User / Brand Profile Pill */}
        <div className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-1 pl-1.5 pr-3.5 shadow-sm transition hover:border-slate-300">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 font-semibold text-xs text-white shadow-xs">
            {initials(brandName)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">{brandName}</span>
            <span className="text-[10px] font-medium text-indigo-600 leading-tight">Pro Plan</span>
          </div>
        </div>
      </div>
    </header>
  );
}

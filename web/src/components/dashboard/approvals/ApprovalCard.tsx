"use client";

import Image from "next/image";
import PlatformIcon from "@/components/PlatformIcon";
import { STATUS_LABEL } from "@/lib/contentStatus";
import { useLanguage } from "@/context/LanguageContext";
import type { ApprovalItem } from "./types";

type Props = {
  item: ApprovalItem;
  onClick: () => void;
};

export default function ApprovalCard({ item, onClick }: Props) {
  const { t } = useLanguage();
  const p = t.dashboard.posts;
  const commentCount = item.comments.length;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex cursor-pointer flex-col gap-2.5 rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      {/* Card Header: Platform & Time */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <PlatformIcon name={item.platform} variant="tile" className="h-4 w-4 rounded shrink-0" />
          <span className="truncate text-xs font-semibold text-slate-700">{item.accountName}</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 shrink-0">
          {item.timeLabel.includes(":") && !item.timeLabel.includes("Taslak") && (
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{item.timeLabel}</span>
        </div>
      </div>

      {/* Media Preview */}
      {item.imageUrl && (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-102"
          />

          {/* Center Indicator badge (Carousel or Video) */}
          {(item.isCarousel || item.imageIsVideo) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-xs shadow-sm">
                {item.imageIsVideo ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h10a2 2 0 012 2v2l4-3v14l-4-3v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caption Preview */}
      <p className="line-clamp-2 text-xs font-normal text-slate-800 leading-snug">
        {item.caption || item.title}
      </p>
      {item.platforms && item.platforms.length > 1 && <div className="flex flex-wrap gap-1">
        {item.platforms.map((platform) => {
          const status = platform.status ?? item.realStatus ?? "draft";
          return <span key={platform.id ?? platform.platform} title={platform.lastError ?? undefined} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_LABEL[status].className}`}>
            <PlatformIcon name={platform.platform} className="h-3 w-3" />{STATUS_LABEL[status].label}
          </span>;
        })}
      </div>}

      {/* Card Footer: Status & Comments */}
      <div className="mt-0.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
        {item.status === "APPROVED" ? (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{p.actions.approved}</span>
          </div>
        ) : (
          <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            {item.status === "FEEDBACK_GIVEN" ? p.kanbanColumns.feedbackGiven : p.kanbanColumns.pendingReview}
          </span>
        )}

        <div className="flex items-center gap-2">
          {item.assignedTo && (
            <div
              title={item.assignedTo.name}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white"
            >
              {item.assignedTo.name[0]?.toUpperCase()}
            </div>
          )}
          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{commentCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

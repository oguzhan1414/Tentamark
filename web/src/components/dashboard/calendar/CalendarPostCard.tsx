"use client";

import { useDraggable } from "@dnd-kit/core";
import Image from "next/image";
import PlatformIcon from "@/components/PlatformIcon";
import type { CalendarPost } from "./types";

type Props = {
  post: CalendarPost;
  onClick: () => void;
  draggable?: boolean;
};

export default function CalendarPostCard({ post, onClick, draggable = true }: Props) {
  const isApproved = post.approvalStatus === "APPROVED";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: isDragging ? 30 : undefined }
          : undefined
      }
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex flex-col gap-1.5 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
        draggable ? "cursor-grab touch-none select-none active:cursor-grabbing" : "cursor-pointer"
      } ${isDragging ? "opacity-30 shadow-xl" : ""}`}
    >
      {/* Top Tag Pills (matching screenshots 1, 2, 4) */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {post.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-tight ${
                tag.toLowerCase().includes("recipes")
                  ? "bg-amber-100 text-amber-800"
                  : tag.toLowerCase().includes("articles")
                  ? "bg-orange-100 text-orange-800"
                  : tag.toLowerCase().includes("jusco")
                  ? "bg-emerald-100 text-emerald-800"
                  : tag.toLowerCase().includes("campaign")
                  ? "bg-pink-100 text-pink-800"
                  : tag.toLowerCase().includes("engagement")
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Account Handle & Time Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <PlatformIcon name={post.platform} variant="tile" className="h-3.5 w-3.5 rounded shrink-0" />
          <span className="truncate text-[11px] font-semibold text-slate-700">{post.accountName}</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 shrink-0">
          {post.timeLabel.includes(":") && (
            <svg className="h-2.5 w-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{post.timeLabel}</span>
        </div>
      </div>

      {/* Media Thumbnail */}
      {post.imageUrl && (
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="240px"
            className="object-cover transition-transform duration-300 group-hover:scale-102"
          />

          {/* Video or Carousel Center Badge */}
          {(post.imageIsVideo || post.isCarousel) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-xs shadow-sm">
                {post.imageIsVideo ? (
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h10a2 2 0 012 2v2l4-3v14l-4-3v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caption Preview */}
      <p className="line-clamp-2 text-[11px] font-normal text-slate-800 leading-snug">
        {post.caption || post.title}
      </p>

      {/* Footer Status & Comments (matching screenshots 1, 2, 4) */}
      <div className="mt-0.5 flex items-center justify-between border-t border-slate-100 pt-1.5 text-xs">
        {isApproved ? (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Approved</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Pending</span>
          </div>
        )}

        {post.commentCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.commentCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

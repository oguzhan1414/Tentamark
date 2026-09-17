"use client";

import { useDraggable } from "@dnd-kit/core";
import Image from "next/image";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import type { CalendarPost } from "./types";

type Props = {
  post: CalendarPost;
  onClick: () => void;
  draggable?: boolean;
  // Month view has ~5-6 rows to fit in one screen, nowhere near enough room
  // for the full image-thumbnail card below — a single-line chip instead.
  // Week view and the drag overlay keep the full card.
  compact?: boolean;
  // Other platforms this same content is also going out to (see
  // groupCalendarPosts) — shown as small extra badges next to post.platform
  // so one merged card still says "this is going to 3 places", not just one.
  otherPlatforms?: PlatformName[];
};

import { useLanguage } from "@/context/LanguageContext";

// A rejected/unfinished item (content.status sent back to DRAFT) has to
// actually look different here — otherwise it sits in the grid identical to
// a post still on track to publish, which is exactly the confusion "reddet"
// is supposed to resolve.
function statusMeta(post: CalendarPost, locale: "tr" | "en" = "tr"): { dot: string; text: string; label: string } {
  const isEn = locale === "en";
  if (post.postStatus === "DRAFT") return { dot: "bg-slate-400", text: "text-slate-500", label: isEn ? "Draft" : "Taslak" };
  if (post.postStatus === "PUBLISHED") return { dot: "bg-blue-500", text: "text-blue-600", label: isEn ? "Published" : "Yayınlandı" };
  return post.approvalStatus === "APPROVED"
    ? { dot: "bg-emerald-500", text: "text-emerald-600", label: isEn ? "Approved" : "Onaylandı" }
    : { dot: "bg-amber-500", text: "text-amber-600", label: isEn ? "Pending" : "Bekliyor" };
}

export default function CalendarPostCard({ post, onClick, draggable = true, compact = false, otherPlatforms = [] }: Props) {
  const { locale } = useLanguage();
  const status = statusMeta(post, locale);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    disabled: !draggable,
  });

  if (compact) {
    const hasRealMedia = Boolean(post.imageUrl) && post.imageUrl !== "/images/no-image-placeholder.png";

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
        title={post.caption || post.title}
        className={`flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-1.5 py-1.5 shadow-2xs transition hover:border-slate-300 hover:shadow-sm ${
          draggable ? "cursor-grab touch-none select-none active:cursor-grabbing" : "cursor-pointer"
        } ${isDragging ? "opacity-30" : ""}`}
      >
        {/* Thumbnail + platform badge — at a glance, "what" and "where",
            not just a tiny icon that reads the same for every post. */}
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200/80">
          {hasRealMedia ? (
            post.imageIsVideo ? (
              <video src={post.imageUrl} muted className="h-full w-full object-cover" />
            ) : (
              <Image src={post.imageUrl} alt="" fill sizes="32px" className="object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PlatformIcon name={post.platform} variant="bare" className="h-4 w-4 text-slate-400" />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-white shadow-2xs">
            <PlatformIcon name={post.platform} variant="tile" className="h-3 w-3 rounded-full" />
          </span>
          {otherPlatforms.length > 0 && (
            <span
              title={locale === "en" ? `Also on ${otherPlatforms.length} more platform${otherPlatforms.length > 1 ? "s" : ""}` : `Ayrıca: ${otherPlatforms.length} platform daha`}
              className="absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-0.5 text-[8px] font-bold text-white ring-1 ring-white"
            >
              +{otherPlatforms.length}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`} />
            <span>{post.timeLabel}</span>
          </div>
          <p className="truncate text-[11px] font-medium leading-tight text-slate-800">
            {post.caption || post.title}
          </p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center -space-x-1 shrink-0">
            <PlatformIcon name={post.platform} variant="tile" className="h-3.5 w-3.5 rounded-full ring-1 ring-white" />
            {otherPlatforms.slice(0, 3).map((pf) => (
              <PlatformIcon key={pf} name={pf} variant="tile" className="h-3.5 w-3.5 rounded-full ring-1 ring-white" />
            ))}
          </div>
          {otherPlatforms.length > 3 && (
            <span className="text-[9px] font-bold text-slate-400 shrink-0">+{otherPlatforms.length - 3}</span>
          )}
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
        <div className={`flex items-center gap-1 text-[10px] font-semibold ${status.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          <span>{status.label}</span>
        </div>

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

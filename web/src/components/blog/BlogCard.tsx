"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/blog/blogTypes";
import { useLanguage } from "@/context/LanguageContext";
import { formatPublishedAt } from "@/lib/blog/formatPublishedAt";
import { HiOutlineClock, HiOutlineArrowRight } from "react-icons/hi2";

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
  const { locale, t } = useLanguage();
  const copy = t.pages.blog;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E3E6E9] bg-white transition-colors hover:border-[#B9C5CF]">
      {/* Cover Image */}
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-[#F0EEEB]">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Category & Meta */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#C92E35]">
            {copy.categories[post.category]?.name ?? post.categoryLabel}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs text-[#8691A0]">
            <HiOutlineClock className="w-3.5 h-3.5" />
            {copy.readingTime.replace("{count}", String(post.readingTime))}
          </span>
        </div>

        {/* Title */}
        {locale === "en" && <span className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700">{copy.articleLanguage}</span>}
        <h3 className="mb-3 line-clamp-2 font-body text-xl font-bold leading-snug tracking-[-0.025em] text-[#172B46] transition-colors group-hover:text-[#C92E35]">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="mb-6 line-clamp-3 flex-1 text-sm leading-7 text-[#536276]">
          {post.excerpt}
        </p>

        {/* Footer (Author & Date) */}
        <div className="flex items-center justify-between gap-3 border-t border-[#E3E6E9] pt-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-[#E3E6E9] bg-[#FAF9F6]">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                sizes="32px"
                className="object-contain p-0.5"
              />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-800">{post.author.name}</p>
              <p className="text-slate-400">{formatPublishedAt(post.publishedAt, locale)}</p>
            </div>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#C92E35] group-hover:translate-x-0.5 transition-transform"
          >
            <span>{copy.read}</span>
            <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlogCard from "@/components/blog/BlogCard";
import BlogShareBar from "@/components/blog/BlogShareBar";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import { getPostBySlug, getRelatedPosts, getAdjacentPosts, getAllPosts } from "@/lib/blog/blogUtils";
import {
  HiOutlineClock,
  HiOutlineChevronRight,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineTag,
} from "react-icons/hi2";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Yazı Bulunamadı | Tentamark Blog",
    };
  }

  const siteUrl = "https://tentamark.com";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | Tentamark Blog`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: "Tentamark Blog",
      locale: "tr_TR",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: `${siteUrl}${post.coverImage}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${siteUrl}${post.coverImage}`],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.id, 3);
  const { prev, next } = getAdjacentPosts(post.id);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#172B46] selection:bg-rose-100 selection:text-[#172B46]">
      <SiteHeader />

      <main className="pb-20 pt-20">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-[#E3E6E9]">
          <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto whitespace-nowrap px-4 py-3.5 text-xs text-[#6B7888] sm:px-6 lg:px-8">
            <Link href="/" className="hover:text-slate-900 transition">Ana Sayfa</Link>
            <HiOutlineChevronRight className="w-3 h-3 text-slate-300" />
            <Link href="/blog" className="hover:text-slate-900 transition">Blog</Link>
            <HiOutlineChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-semibold text-[#C92E35]">{post.categoryLabel}</span>
            <HiOutlineChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-800 truncate max-w-xs">{post.title}</span>
          </div>
        </div>

        {/* Article Header Container */}
        <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <header className="mb-9 max-w-[780px]">
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-[0.12em] text-[#C92E35]">
              <span>{post.categoryLabel}</span>
              <span className="text-[#A3ADB8]" aria-hidden="true">/</span>
              <span className="flex items-center gap-1 text-[#6B7888]">
                <HiOutlineClock className="h-3.5 w-3.5" />
                {post.readingTime} dk okuma
              </span>
            </div>

            <h1 className="font-body text-4xl font-bold leading-[1.13] tracking-[-0.045em] text-[#172B46] sm:text-5xl lg:text-[3.5rem]">
              {post.title}
            </h1>

            <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#536276] sm:text-xl">
              {post.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-[#E3E6E9] pt-5">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[#E3E6E9] bg-white">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    sizes="40px"
                    className="object-contain p-0.5"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#172B46]">{post.author.name}</p>
                  <p className="text-xs text-[#6B7888]">
                    {post.author.role} · {post.publishedAt}
                  </p>
                </div>
              </div>

              <BlogShareBar title={post.title} url={`https://tentamark.com/blog/${post.slug}`} />
            </div>
          </header>

          <div className="relative mb-12 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#E3E6E9] bg-[#F0EEEB] sm:aspect-[21/9]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </div>

          {post.tableOfContents.length > 0 && (
            <details className="mb-10 rounded-xl border border-[#E3E6E9] bg-white p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-bold text-[#172B46]">Bu yazıda neler var?</summary>
              <div className="mt-4"><BlogTableOfContents items={post.tableOfContents} embedded /></div>
            </details>
          )}

          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_260px] xl:gap-16">
            <div className="min-w-0 max-w-[72ch] space-y-12">
              <div className="border-l-[3px] border-[#FA5252] bg-white py-5 pl-6 pr-5 text-lg font-medium leading-8 text-[#334155] sm:pr-8">
                {post.excerpt}
              </div>

              {/* Sections */}
              {post.sections.map((sec) => (
                <section key={sec.id} id={sec.id} className="scroll-mt-28 space-y-6 border-t border-[#E3E6E9] pt-10">
                  <h2 className="font-body text-2xl font-bold leading-tight tracking-[-0.03em] text-[#172B46] sm:text-[1.8rem]">
                    {sec.title}
                  </h2>

                  {sec.lead && (
                    <p className="text-[17px] font-semibold leading-[1.8] text-[#334155] sm:text-lg">
                      {sec.lead}
                    </p>
                  )}

                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-[17px] leading-[1.85] text-[#334155] sm:text-lg">
                      {p}
                    </p>
                  ))}

                  {/* Section Inline Image (If present) */}
                  {sec.image && (
                    <figure className="my-9 overflow-hidden rounded-xl border border-[#E3E6E9] bg-white">
                      <div className="relative aspect-[16/10] w-full bg-slate-100">
                        <Image
                          src={sec.image.url}
                          alt={sec.image.alt || sec.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 768px"
                          className="object-cover"
                        />
                      </div>
                      {sec.image.caption && (
                        <figcaption className="p-3.5 text-center text-xs text-slate-500 font-medium bg-slate-50 border-t border-slate-100">
                          {sec.image.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Callout Box */}
                  {sec.callout && (
                    <div
                      className={`my-8 rounded-xl border p-5 sm:p-6 ${
                        sec.callout.type === "takeaway"
                          ? "border-[#F7C6C2] bg-[#FFF4F1] text-[#5B2930]"
                          : sec.callout.type === "tip"
                          ? "border-teal-200 bg-teal-50 text-teal-950"
                          : sec.callout.type === "checklist"
                          ? "border-sky-200 bg-sky-50 text-sky-950"
                          : "border-amber-200 bg-amber-50 text-amber-950"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm mb-2">
                        {sec.callout.type === "takeaway" && <HiOutlineSparkles className="w-5 h-5 text-[#C92E35]" />}
                        {sec.callout.type === "tip" && <HiOutlineLightBulb className="w-5 h-5 text-emerald-600" />}
                        {sec.callout.type === "checklist" && <HiOutlineCheckCircle className="w-5 h-5 text-sky-600" />}
                        {sec.callout.type === "quote" && <HiOutlineChatBubbleBottomCenterText className="w-5 h-5 text-amber-600" />}
                        <span>{sec.callout.title}</span>
                      </div>

                      {sec.callout.text && (
                        <p className="text-sm sm:text-base leading-relaxed">{sec.callout.text}</p>
                      )}

                      {sec.callout.items && (
                        <ul className="mt-3 space-y-2 text-sm">
                          {sec.callout.items.map((it, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <HiOutlineCheckCircle className="w-4 h-4 text-[#C92E35] flex-shrink-0 mt-0.5" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Key Points Bullet List */}
                  {sec.keyPoints && (
                    <div className="my-8 rounded-xl border border-[#E3E6E9] bg-white p-5 sm:p-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Kritik Başlıklar
                      </h4>
                      <ul className="space-y-2.5">
                        {sec.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#172B46] text-[10px] font-bold text-white">
                              {kIdx + 1}
                            </span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}

              <div className="border-t border-[#E3E6E9] pt-8">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#C92E35]">Tentamark ile devam edin</p>
                <h3 className="mt-2 font-body text-xl font-bold text-[#172B46]">Bu fikirleri içerik takviminize taşıyın</h3>
                <p className="mt-2 text-sm leading-7 text-[#536276]">Marka sesinize uygun içerikleri planlayın, düzenleyin ve yayın öncesinde gözden geçirin.</p>
                <Link href="/nasil-calisir" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#C92E35] hover:text-[#A5202B]">
                  Tentamark nasıl çalışır? <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Tags Section */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                  <HiOutlineTag className="w-4 h-4" />
                  <span>İlgili Etiketler:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prev / Next Post Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group flex flex-col rounded-xl border border-[#E3E6E9] bg-white p-4 hover:border-[#C6CED6] transition-colors"
                  >
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#6B7888] group-hover:text-[#C92E35] transition">
                      <HiOutlineArrowLeft className="w-3 h-3" />
                      <span>Önceki Rehber</span>
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                      {prev.title}
                    </span>
                  </Link>
                ) : <div />}

                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group flex flex-col items-end rounded-xl border border-[#E3E6E9] bg-white p-4 text-right hover:border-[#C6CED6] transition-colors"
                  >
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#6B7888] group-hover:text-[#C92E35] transition">
                      <span>Sonraki Rehber</span>
                      <HiOutlineArrowRight className="w-3 h-3" />
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                      {next.title}
                    </span>
                  </Link>
                ) : <div />}
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28">
              {post.tableOfContents.length > 0 && (
                <div className="hidden lg:block"><BlogTableOfContents items={post.tableOfContents} /></div>
              )}

              <div className="rounded-xl border border-[#E3E6E9] bg-white p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-[#E3E6E9] bg-[#FAF9F6]">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      fill
                      sizes="48px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#172B46]">{post.author.name}</h5>
                    <p className="text-xs text-slate-400">{post.author.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-[#536276]">
                  {post.author.bio}
                </p>
              </div>
            </aside>
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="mt-20 border-t border-[#E3E6E9] pt-12">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="font-body text-2xl font-bold tracking-[-0.025em] text-[#172B46]">
                    İlginizi Çekebilecek Diğer Rehberler
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {post.categoryLabel} kategorisinde ve ilişkili büyüme konularında devam edin
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="flex items-center gap-1 text-xs font-bold text-[#C92E35] hover:text-[#A5202B] transition"
                >
                  <span>Tümünü Gör</span>
                  <HiOutlineChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((rPost) => (
                  <BlogCard key={rPost.id} post={rPost} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

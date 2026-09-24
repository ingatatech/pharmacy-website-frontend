import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft, Clock, Tag } from "lucide-react";
import { apiFetch, ApiError, resolveUploadUrl } from "@/lib/api";
import type { Article } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { estimateReadMinutes, initials, roleLabel } from "@/lib/text";
import { T } from "@/lib/language-context";

async function getArticle(slug: string): Promise<Article | null> {
  try {
    return await apiFetch<Article>(`/api/articles/${slug}`, { next: { revalidate: 120 } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return {};
  }
  return {
    title: article.metaTitle || `${article.title} | Ingata Pharmacy`,
    description: article.metaDescription || undefined,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const date = new Date(article.publishedAt || article.createdAt);

  return (
    <>
      <PageHeader eyebrow={article.category || "Blog"} title={article.title} />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <T text="Back to blog" />
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {estimateReadMinutes(article.content)} <T text="min read" />
            </span>
            {article.category && (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <T text={article.category} />
              </span>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/9] w-full bg-slate-100">
              <Image
                src={article.featuredImageUrl ? resolveUploadUrl(article.featuredImageUrl) : "/images/bg.png"}
                alt=""
                fill
                sizes="768px"
                className="object-cover"
              />
            </div>

            <div className="p-6 sm:p-10">
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                <T text={article.content} />
              </p>

              {article.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/articles?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-200 hover:border-slate-300"
                    >
                      <T text={tag} />
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
                  {initials(article.author.fullName)}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{article.author.fullName}</p>
                  <p className="text-xs text-slate-500">
                    <T text={roleLabel(article.author.role)} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

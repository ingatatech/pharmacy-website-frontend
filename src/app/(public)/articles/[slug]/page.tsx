import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Newspaper, Tag } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Article } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { estimateReadMinutes, initials, roleLabel } from "@/lib/text";

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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {estimateReadMinutes(article.content)} min read
            </span>
            {article.category && (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                {article.category}
              </span>
            )}
          </div>

          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
            {article.featuredImageUrl ? (
              <Image src={article.featuredImageUrl} alt="" fill sizes="768px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Newspaper className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-slate-700">{article.content}</p>

          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
              {article.tags.map((t) => (
                <Link
                  key={t}
                  href={`/articles?tag=${encodeURIComponent(t)}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-200 hover:border-slate-300"
                >
                  {t}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-ink">
              {initials(article.author.fullName)}
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-900">{article.author.fullName}</p>
              <p className="text-xs text-slate-500">{roleLabel(article.author.role)}</p>
            </div>
          </div>

          <Link
            href="/articles"
            className="mt-10 inline-flex text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
          >
            ← Back to blog
          </Link>
        </div>
      </section>
    </>
  );
}

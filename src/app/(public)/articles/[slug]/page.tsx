import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowLeft, Clock, Tag, BookOpen } from "lucide-react";
import { apiFetch, ApiError, resolveUploadUrl } from "@/lib/api";
import type { Article } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ShareButton } from "@/components/articles/ShareButton";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
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

async function getArticles(): Promise<Article[]> {
  try {
    return await apiFetch<Article[]>("/api/articles", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

// "Related" favours the closest matches first — same category, then shared
// tags — and falls back to the most recent articles when nothing overlaps, so
// the sidebar is never empty for a one-off article.
function selectRelated(current: Article, all: Article[], limit = 3): Article[] {
  const score = (article: Article) => {
    let points = 0;
    if (current.category && article.category === current.category) points += 2;
    for (const tag of article.tags) {
      if (current.tags.includes(tag)) points += 1;
    }
    return points;
  };

  return all
    .filter((article) => article.id !== current.id)
    .sort((a, b) => {
      const byScore = score(b) - score(a);
      if (byScore !== 0) return byScore;
      return (
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
      );
    })
    .slice(0, limit);
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
  const [article, allArticles] = await Promise.all([getArticle(slug), getArticles()]);

  if (!article) {
    notFound();
  }

  const related = selectRelated(article, allArticles);
  const date = new Date(article.publishedAt || article.createdAt);

  return (
    <>
      <PageHeader
        eyebrow={article.category || "Blog"}
        title={article.title}
        backHref="/articles"
        backLabel="All articles"
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 hover:text-teal-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <T text="Back to blog" />
              </Link>

          <article className="mt-8">
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                <BookOpen className="h-3.5 w-3.5" />
                {article.category || "Blog"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {estimateReadMinutes(article.content)} <T text="min read" />
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl">
              <T text={article.title} />
            </h1>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-lg font-semibold text-white shadow-lg">
                  {initials(article.author.fullName)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{article.author.fullName}</p>
                  <p className="text-sm text-slate-600">
                    <T text={roleLabel(article.author.role)} />
                  </p>
                </div>
              </div>
              <ShareButton title={article.title} />
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-slate-100 to-slate-200">
                <Image
                  src={article.featuredImageUrl ? resolveUploadUrl(article.featuredImageUrl) : "/images/bg.png"}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 896px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-8 sm:p-12 lg:p-16">
                <div className="prose prose-lg prose-slate max-w-none">
                  <div
                    className="text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>

                {article.tags.length > 0 && (
                  <div className="mt-12 border-t border-slate-200 pt-8">
                    <h3 className="font-display text-sm font-semibold text-slate-900 uppercase tracking-wide">
                      <T text="Tags" />
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/articles?tag=${encodeURIComponent(tag)}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-800"
                        >
                          <Tag className="h-3.5 w-3.5" />
                          <T text={tag} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 to-slate-50 p-8">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-2xl font-bold text-white shadow-lg">
                  {initials(article.author.fullName)}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold text-slate-900">
                    <T text="About the author" />
                  </h3>
                  <p className="mt-2 text-base text-slate-700">
                    {article.author.fullName} is a <T text={roleLabel(article.author.role)} /> at Ingata Pharmacy,
                    dedicated to providing expert health guidance and pharmaceutical care.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-teal-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <T text="All articles" />
              </Link>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-teal-300 hover:bg-teal-50">
                  <T text="Print" />
                </button>
                <Link
                  href="/contact"
                  className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
                >
                  <T text="Ask a pharmacist" />
                </Link>
              </div>
            </div>
          </article>
            </div>
            <RelatedArticles articles={related} />
          </div>
        </div>
      </section>
    </>
  );
}

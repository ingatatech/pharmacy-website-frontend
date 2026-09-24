import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import type { Article } from "@/types";
import { estimateReadMinutes, excerpt, initials, roleLabel } from "@/lib/text";
import { T } from "@/lib/language-context";

// A compact horizontal card — small thumbnail beside the content instead
// of a full-width image on top — so a page of these reads as a list, not
// a stack of near-full-screen banners. Still has the day/month badge,
// category+meta row, title, excerpt, and an author row opposite a
// "Read more" link; just all sized down to match.
export function ArticleCard({ article }: { article: Article }) {
  const date = new Date(article.publishedAt || article.createdAt);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const readMinutes = estimateReadMinutes(article.content);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-slate-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/articles/${article.slug}`}
          className="group relative block aspect-[16/9] shrink-0 overflow-hidden bg-slate-100 sm:aspect-square sm:w-48"
        >
          <Image
            src={article.featuredImageUrl || "/images/bg.png"}
            alt=""
            fill
            sizes="(min-width: 640px) 192px, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col items-center justify-center rounded-md bg-teal-900 px-2.5 py-1.5 leading-none text-white">
            <span className="font-display text-base font-bold">{day}</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wide">{month}</span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            {article.category && (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                <T text={article.category} />
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readMinutes} <T text="min read" />
            </span>
          </div>

          <h3 className="mt-2">
            <Link
              href={`/articles/${article.slug}`}
              className="font-display text-lg font-semibold leading-snug text-slate-900 transition-colors duration-200 hover:text-teal-700 sm:text-xl"
            >
              <T text={article.title} />
            </Link>
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            <T text={excerpt(article.content)} />
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-ink">
                {initials(article.author.fullName)}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900">{article.author.fullName}</p>
                <p className="text-xs text-slate-500">
                  <T text={roleLabel(article.author.role)} />
                </p>
              </div>
            </div>

            <Link
              href={`/articles/${article.slug}`}
              className="group inline-flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800"
            >
              <T text="Read more" />
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

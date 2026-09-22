import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Newspaper, Tag } from "lucide-react";
import type { Article } from "@/types";
import { estimateReadMinutes, excerpt, initials, roleLabel } from "@/lib/text";

// Mirrors qtglobal.rw/blog-standard's post-card arrangement: image with a
// day/month date badge, a category+meta row, title, excerpt, then an
// author row opposite a "Read more" button. No comment count (we don't
// have comments) and no stock author photo — an initials avatar instead.
export function ArticleCard({ article }: { article: Article }) {
  const date = new Date(article.publishedAt || article.createdAt);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const readMinutes = estimateReadMinutes(article.content);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-slate-300 hover:shadow-lg">
      <Link
        href={`/articles/${article.slug}`}
        className="group relative block aspect-[16/9] overflow-hidden bg-slate-100"
      >
        {article.featuredImageUrl ? (
          <Image
            src={article.featuredImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center transition-transform duration-500 ease-out group-hover:scale-105">
            <Newspaper className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-col items-center justify-center rounded-md bg-teal-900 px-3.5 py-2 leading-none text-white">
          <span className="font-display text-xl font-bold">{day}</span>
          <span className="mt-0.5 text-[11px] uppercase tracking-wide">{month}</span>
        </div>
      </Link>

      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
          {article.category && (
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {article.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readMinutes} min read
          </span>
        </div>

        <h3 className="mt-3">
          <Link
            href={`/articles/${article.slug}`}
            className="font-display text-2xl font-semibold leading-snug text-slate-900 transition-colors duration-200 hover:text-teal-700"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">{excerpt(article.content)}</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-ink">
              {initials(article.author.fullName)}
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-900">{article.author.fullName}</p>
              <p className="text-xs text-slate-500">{roleLabel(article.author.role)}</p>
            </div>
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="group inline-flex items-center gap-2 rounded-md bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
          >
            Read more
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

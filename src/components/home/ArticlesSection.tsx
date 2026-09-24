import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/types";
import { T } from "@/lib/language-context";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function ArticlesSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return null;
  }

  const shown = articles.slice(0, 3);
  const gridClass =
    shown.length >= 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : shown.length === 2
        ? "sm:grid-cols-2 max-w-3xl"
        : "max-w-md";

  return (
    <section className="border-t border-teal-100 bg-sage">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <span className="text-sm font-medium text-teal-600">
          <T text="Our blog" />
        </span>
        <h2 className="mt-2 font-display text-3xl font-medium text-slate-900 sm:text-4xl">
          <T text="From the pharmacy desk" />
        </h2>

        <div className={`mt-10 grid gap-x-8 gap-y-10 ${gridClass}`}>
          {shown.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-slate-300 hover:shadow-lg"
            >
              {/* Image zooms, tilts and darkens on hover, and the category
                  tag sits in the corner over it — same mechanic as
                  qtglobal.rw's blog cards. */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={article.featuredImageUrl || "/images/bg.png"}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:rotate-1 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                {article.category && (
                  <span className="absolute left-3 top-3 rounded-full bg-teal-800 px-3 py-1 text-xs font-medium text-white">
                    <T text={article.category} />
                  </span>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-semibold leading-snug text-slate-900">
                  <T text={article.title} />
                </h3>
                {article.publishedAt && (
                  <p className="mt-3 text-xs text-slate-400">{formatDate(article.publishedAt)}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors duration-200 group-hover:text-teal-700">
                  <T text="Read article" />
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

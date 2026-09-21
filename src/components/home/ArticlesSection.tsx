import Link from "next/link";
import type { Article } from "@/types";

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
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl font-medium text-slate-900 sm:text-4xl">
          From the pharmacy desk
        </h2>

        <div className={`mt-10 grid gap-x-8 gap-y-10 ${gridClass}`}>
          {shown.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
              {article.category && (
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
                  {article.category}
                </span>
              )}
              <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-slate-900 group-hover:text-teal-700 group-hover:underline">
                {article.title}
              </h3>
              {article.publishedAt && (
                <p className="mt-3 text-xs text-slate-400">{formatDate(article.publishedAt)}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

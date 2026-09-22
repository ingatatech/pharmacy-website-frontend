import Image from "next/image";
import Link from "next/link";
import { Calendar, Newspaper, Search } from "lucide-react";
import type { Article } from "@/types";

const widgetClass = "rounded-xl border border-slate-200 bg-white p-6";

function WidgetHeading({ children }: { children: string }) {
  return (
    <h3 className="relative pb-3 font-display text-base font-semibold text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-8 after:bg-teal-600">
      {children}
    </h3>
  );
}

// Mirrors the four-widget sidebar from qtglobal.rw/blog-standard (Search,
// Category, Recent Post, Tags), but every value here is computed from the
// real article list — no placeholder counts or dummy links.
export function BlogSidebar({
  articles,
  query,
  activeCategory,
  activeTag,
}: {
  articles: Article[];
  query?: string;
  activeCategory?: string;
  activeTag?: string;
}) {
  const categoryCounts = new Map<string, number>();
  for (const article of articles) {
    if (!article.category) continue;
    categoryCounts.set(article.category, (categoryCounts.get(article.category) || 0) + 1);
  }

  const tagSet = new Set<string>();
  for (const article of articles) {
    for (const tag of article.tags) tagSet.add(tag);
  }

  const recent = [...articles]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className={widgetClass}>
        <WidgetHeading>Search</WidgetHeading>
        <form action="/articles" method="GET" className="mt-4 flex overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search articles"
            className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex shrink-0 items-center justify-center px-4 text-slate-500 transition-colors duration-200 hover:text-teal-700"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {categoryCounts.size > 0 && (
        <div className={widgetClass}>
          <WidgetHeading>Category</WidgetHeading>
          <ul className="mt-4 space-y-2">
            {[...categoryCounts.entries()].map(([name, count]) => {
              const active = activeCategory === name;
              return (
                <li key={name}>
                  <Link
                    href={`/articles?category=${encodeURIComponent(name)}`}
                    className={`flex min-w-0 items-center justify-between gap-2 rounded-md bg-slate-50 px-4 py-3 text-sm transition-colors duration-200 hover:text-teal-700 ${
                      active ? "text-teal-700 ring-1 ring-inset ring-teal-600" : "text-slate-700"
                    }`}
                  >
                    <span className="min-w-0 truncate">{name}</span>
                    <span className="shrink-0 text-slate-400">({count})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div className={widgetClass}>
          <WidgetHeading>Recent Post</WidgetHeading>
          <ul className="mt-4 space-y-4">
            {recent.map((article) => (
              <li key={article.id}>
                <Link href={`/articles/${article.slug}`} className="group flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {article.featuredImageUrl ? (
                      <Image src={article.featuredImageUrl} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Newspaper className="h-5 w-5 text-slate-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-snug text-slate-900 transition-colors duration-200 group-hover:text-teal-700">
                      {article.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tagSet.size > 0 && (
        <div className={widgetClass}>
          <WidgetHeading>Tags</WidgetHeading>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...tagSet].map((tag) => {
              const active = activeTag === tag;
              return (
                <Link
                  key={tag}
                  href={`/articles?tag=${encodeURIComponent(tag)}`}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    active
                      ? "border-teal-800 bg-teal-800 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

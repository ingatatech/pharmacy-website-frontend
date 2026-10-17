import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { Article } from "@/types";
import { resolveUploadUrl } from "@/lib/api";
import { estimateReadMinutes } from "@/lib/text";
import { T } from "@/lib/language-context";

// A compact list of other articles shown beside the article body. Each entry
// is a thumbnail + date + title, matching the "Recent Post" widget on the blog
// index so the two sidebars read as the same idea at different scopes.
export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
      <h2 className="relative pb-3 font-display text-base font-semibold text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-8 after:bg-teal-600">
        <T text="Related articles" />
      </h2>

      <ul className="mt-5 space-y-5">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.slug}`} className="group flex items-start gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                <Image
                  src={article.featuredImageUrl ? resolveUploadUrl(article.featuredImageUrl) : "/images/bg.png"}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3 shrink-0" />
                    {estimateReadMinutes(article.content)} <T text="min read" />
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug text-slate-900 transition-colors duration-200 group-hover:text-teal-700">
                  <T text={article.title} />
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

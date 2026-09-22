import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Article } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { BlogSidebar } from "@/components/articles/BlogSidebar";

export const metadata: Metadata = {
  title: "Blog | Ingata Pharmacy",
  description: "Health tips, medication guidance and news from the Ingata Pharmacy team.",
};

async function getArticles(): Promise<Article[]> {
  try {
    return await apiFetch<Article[]>("/api/articles", { next: { revalidate: 120 } });
  } catch {
    return [];
  }
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>;
}) {
  const { q, category, tag } = await searchParams;
  const articles = await getArticles();

  let filtered = articles;
  let filterLabel: string | null = null;

  if (q) {
    const needle = q.toLowerCase();
    filtered = articles.filter(
      (article) => article.title.toLowerCase().includes(needle) || article.content.toLowerCase().includes(needle)
    );
    filterLabel = `Results for "${q}"`;
  } else if (category) {
    filtered = articles.filter((article) => article.category === category);
    filterLabel = `Category: ${category}`;
  } else if (tag) {
    filtered = articles.filter((article) => article.tags.includes(tag));
    filterLabel = `Tag: ${tag}`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Our blog"
        title="Blog"
        description="Health tips, medication guidance and news from the Ingata Pharmacy team."
      />

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div>
              {filterLabel && (
                <div className="mb-8 flex min-w-0 items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <span className="min-w-0 truncate">{filterLabel}</span>
                  <Link
                    href="/articles"
                    className="inline-flex shrink-0 items-center gap-1 font-medium text-teal-700 hover:text-teal-800"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Link>
                </div>
              )}

              {filtered.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {articles.length === 0
                    ? "Articles will be posted here shortly."
                    : "No articles match that filter."}
                </p>
              ) : (
                <div className="space-y-8">
                  {filtered.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>

            <BlogSidebar articles={articles} query={q} activeCategory={category} activeTag={tag} />
          </div>
        </div>
      </section>
    </>
  );
}

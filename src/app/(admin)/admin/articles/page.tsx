"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Article, ArticleStatus } from "@/types";

const FILTERS: { label: string; value: ArticleStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending review", value: "pending_review" },
  { label: "Approved", value: "approved" },
  { label: "Published", value: "published" },
];

export default function AdminArticlesPage() {
  const { token, user } = useAuth();
  const showToast = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ArticleStatus | "all">("all");

  useEffect(() => {
    if (!token) return;
    apiFetch<Article[]>("/api/articles/admin/all", {}, token)
      .then(setArticles)
      .catch(() => showToast("error", "Failed to load articles."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = filter === "all" ? articles : articles.filter((a) => a.status === filter);

  // Mirrors the backend: either staff role may publish from any status, so the
  // only state without a Publish button is one that is already live.
  const canPublish = (a: Article) => a.status !== "published";

  async function publishArticle(article: Article) {
    if (!token) return;
    setBusyId(article.id);
    try {
      const updated = await apiFetch<Article>(`/api/articles/${article.id}/publish`, { method: "POST" }, token);
      // Replace the row rather than patch it in place: the response carries the
      // author/reviewer relations the same way the list endpoint does.
      setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
      showToast("success", `"${article.title}" is now live on the public site.`);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Publish failed.");
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<Article>[] = [
    {
      header: "Title",
      cell: (a) => (
        <Link href={`/admin/articles/${a.id}`} className="font-medium text-slate-900 hover:text-teal-700">
          {a.title}
        </Link>
      ),
    },
    { header: "Category", cell: (a) => a.category || <span className="text-slate-400">—</span> },
    { header: "Status", cell: (a) => <StatusBadge status={a.status} set="article" /> },
    { header: "Author", cell: (a) => a.author.fullName },
    {
      header: "Updated",
      cell: (a) => new Date(a.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      header: "Actions",
      cell: (a) => {
        if (a.status === "published") {
          return (
            <Link
              href={`/articles/${a.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              View live
            </Link>
          );
        }
        if (canPublish(a)) {
          return (
            <button
              type="button"
              onClick={() => void publishArticle(a)}
              disabled={busyId === a.id}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-60"
            >
              {busyId === a.id ? "Publishing…" : "Publish"}
            </button>
          );
        }
        return (
          <Link href={`/admin/articles/${a.id}`} className="text-xs font-medium text-teal-700 hover:text-teal-800">
            Open
          </Link>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Articles</h1>
          <p className="mt-1 text-sm text-slate-500">Draft, review, and publish blog content.</p>
        </div>
        {user?.role === "admin" && (
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
          >
            <Plus className="h-4 w-4" />
            New article
          </Link>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
              filter === f.value ? "bg-teal-800 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={rows} rowKey={(a) => a.id} loading={loading} emptyMessage="No articles here." />
      </div>
    </div>
  );
}

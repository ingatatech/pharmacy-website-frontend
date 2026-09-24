"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ArticleForm } from "@/components/admin/articles/ArticleForm";
import type { Article } from "@/types";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<Article[]>("/api/articles/admin/all", {}, token)
      .then((articles) => setArticle(articles.find((a) => a.id === id) || null))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!article) {
    return <p className="text-sm text-slate-500">Article not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit article</h1>
      <div className="mt-6">
        <ArticleForm article={article} onSaved={setArticle} />
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArticleForm } from "@/components/admin/articles/ArticleForm";

export default function NewArticlePage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">New article</h1>
      <div className="mt-6">
        <ArticleForm onSavedAction={(article) => router.push(`/pharmacist/articles/${article.id}`)} />
      </div>
    </div>
  );
}

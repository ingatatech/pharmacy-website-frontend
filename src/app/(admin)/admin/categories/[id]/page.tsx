"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import type { Category } from "@/types";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Category[]>("/api/categories")
      .then((categories) => setCategory(categories.find((c) => c.id === id) || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!category) {
    return <p className="text-sm text-slate-500">Category not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Edit category</h1>
      <div className="mt-6">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}

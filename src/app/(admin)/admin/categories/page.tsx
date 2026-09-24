"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiFetch<Category[]>("/api/categories")
      .then(setCategories)
      .catch(() => showToast("error", "Failed to load categories."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/categories/${toDelete.id}`, { method: "DELETE" }, token);
      setCategories((current) => current.filter((c) => c.id !== toDelete.id));
      showToast("success", "Category deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Category>[] = [
    { header: "Name", cell: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
    { header: "Slug", cell: (c) => <span className="font-mono text-xs text-slate-500">{c.slug}</span> },
    {
      header: "Applies to",
      cell: (c) => (
        <span className="capitalize text-slate-600">{c.type === "service" ? "Services" : "Products"}</span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/categories/${c.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Edit ${c.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(c)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${c.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Groupings used by the Services and Products catalog.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New category
        </Link>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={categories}
          rowKey={(c) => c.id}
          loading={loading}
          emptyMessage="No categories yet."
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        description={`"${toDelete?.name}" will be removed. Services or products using it will keep their other data but lose this category.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

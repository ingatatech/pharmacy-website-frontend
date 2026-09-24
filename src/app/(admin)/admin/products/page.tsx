"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Product[]>("/api/products/admin/all", {}, token)
      .then(setProducts)
      .catch(() => showToast("error", "Failed to load products."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/products/${toDelete.id}`, { method: "DELETE" }, token);
      setProducts((current) => current.filter((p) => p.id !== toDelete.id));
      showToast("success", "Product deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Product>[] = [
    { header: "Name", cell: (p) => <span className="font-medium text-slate-900">{p.name}</span> },
    { header: "Brand", cell: (p) => p.brandName || <span className="text-slate-400">—</span> },
    { header: "Availability", cell: (p) => <StatusBadge status={p.availabilityStatus} set="availability" /> },
    { header: "Status", cell: (p) => <StatusBadge status={String(p.isPublished)} set="published" /> },
    {
      header: "",
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/products/${p.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Edit ${p.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(p)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${p.name}`}
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Medication and health products in the catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New product
        </Link>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={products} rowKey={(p) => p.id} loading={loading} emptyMessage="No products yet." />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        description={`"${toDelete?.name}" will be permanently removed from the site.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

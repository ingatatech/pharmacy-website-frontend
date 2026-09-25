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
import type { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Testimonial[]>("/api/testimonials/admin/all", {}, token)
      .then(setTestimonials)
      .catch(() => showToast("error", "Failed to load testimonials."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/testimonials/${toDelete.id}`, { method: "DELETE" }, token);
      setTestimonials((current) => current.filter((t) => t.id !== toDelete.id));
      showToast("success", "Testimonial deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete testimonial.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Testimonial>[] = [
    { header: "Customer", cell: (t) => <span className="font-medium text-slate-900">{t.customerName}</span> },
    { header: "Category", cell: (t) => t.customerCategory || "—" },
    { header: "Order", cell: (t) => t.displayOrder },
    { header: "Status", cell: (t) => <StatusBadge status={String(t.isPublished)} set="published" /> },
    {
      header: "",
      className: "text-right",
      cell: (t) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/testimonials/${t.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(t)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">Testimonials</h1>
          <p className="mt-1 text-sm text-slate-500">
            Genuine customer quotes shown on the homepage. Only publish ones a customer actually gave and approved.
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New testimonial
        </Link>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={testimonials}
          rowKey={(t) => t.id}
          loading={loading}
          emptyMessage="No testimonials yet."
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete testimonial?"
        description={`The quote from "${toDelete?.customerName}" will be permanently removed.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

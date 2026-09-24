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
import type { Faq } from "@/types";

export default function AdminFaqsPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Faq | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Faq[]>("/api/faqs/admin/all", {}, token)
      .then(setFaqs)
      .catch(() => showToast("error", "Failed to load FAQs."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/faqs/${toDelete.id}`, { method: "DELETE" }, token);
      setFaqs((current) => current.filter((f) => f.id !== toDelete.id));
      showToast("success", "FAQ deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete FAQ.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Faq>[] = [
    { header: "Question", cell: (f) => <span className="font-medium text-slate-900">{f.question}</span> },
    { header: "Order", cell: (f) => f.displayOrder },
    { header: "Status", cell: (f) => <StatusBadge status={String(f.isPublished)} set="published" /> },
    {
      header: "",
      className: "text-right",
      cell: (f) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/faqs/${f.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(f)}
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">FAQs</h1>
          <p className="mt-1 text-sm text-slate-500">Frequently asked questions shown on the public site.</p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New FAQ
        </Link>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={faqs} rowKey={(f) => f.id} loading={loading} emptyMessage="No FAQs yet." />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete FAQ?"
        description={`"${toDelete?.question}" will be permanently removed.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

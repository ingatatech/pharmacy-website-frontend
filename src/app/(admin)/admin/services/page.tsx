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
import type { Service } from "@/types";

export default function AdminServicesPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Service[]>("/api/services/admin/all", {}, token)
      .then(setServices)
      .catch(() => showToast("error", "Failed to load services."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/services/${toDelete.id}`, { method: "DELETE" }, token);
      setServices((current) => current.filter((s) => s.id !== toDelete.id));
      showToast("success", "Service deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete service.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Service>[] = [
    { header: "Name", cell: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
    { header: "Category", cell: (s) => s.category?.name || <span className="text-slate-400">—</span> },
    { header: "Status", cell: (s) => <StatusBadge status={String(s.isPublished)} set="published" /> },
    {
      header: "",
      className: "text-right",
      cell: (s) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/services/${s.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Edit ${s.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(s)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${s.name}`}
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">Services</h1>
          <p className="mt-1 text-sm text-slate-500">Pharmacy services shown across the public site.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New service
        </Link>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={services} rowKey={(s) => s.id} loading={loading} emptyMessage="No services yet." />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete service?"
        description={`"${toDelete?.name}" will be permanently removed from the site.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

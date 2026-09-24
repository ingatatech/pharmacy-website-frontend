"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { PharmacyLocation } from "@/types";

const ACTIVE_STYLES: Record<string, string> = {
  true: "bg-emerald-100 text-emerald-800",
  false: "bg-slate-100 text-slate-700",
};

export default function AdminLocationsPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [locations, setLocations] = useState<PharmacyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<PharmacyLocation | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<PharmacyLocation[]>("/api/locations/admin/all", {}, token)
      .then(setLocations)
      .catch(() => showToast("error", "Failed to load locations."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/locations/${toDelete.id}`, { method: "DELETE" }, token);
      setLocations((current) => current.filter((l) => l.id !== toDelete.id));
      showToast("success", "Location deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete location.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<PharmacyLocation>[] = [
    { header: "Branch", cell: (l) => <span className="font-medium text-slate-900">{l.branchName}</span> },
    { header: "Address", cell: (l) => <span className="text-slate-600">{l.address}</span> },
    { header: "Phone", cell: (l) => l.telephone || <span className="text-slate-400">—</span> },
    {
      header: "Status",
      cell: (l) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ACTIVE_STYLES[String(l.isActive)]}`}>
          {l.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (l) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/locations/${l.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Edit ${l.branchName}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(l)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${l.branchName}`}
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">Locations</h1>
          <p className="mt-1 text-sm text-slate-500">Pharmacy branches and their details.</p>
        </div>
        <Link
          href="/admin/locations/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New location
        </Link>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={locations} rowKey={(l) => l.id} loading={loading} emptyMessage="No locations yet." />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete location?"
        description={`"${toDelete?.branchName}" will be permanently removed.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

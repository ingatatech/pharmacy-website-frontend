"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { PharmacistShift } from "@/types";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export default function AdminSchedulePage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [shifts, setShifts] = useState<PharmacistShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<PharmacistShift | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<PharmacistShift[]>("/api/schedule/admin/all", {}, token ?? undefined)
      .then(setShifts)
      .catch(() => showToast("error", "Failed to load the schedule."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/schedule/${toDelete.id}`, { method: "DELETE" }, token);
      setShifts((current) => current.filter((shift) => shift.id !== toDelete.id));
      showToast("success", "Shift deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete the shift.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<PharmacistShift>[] = [
    {
      header: "Pharmacist",
      cell: (shift) => (
        <span className="font-medium text-slate-900">{shift.teamMember?.fullName || "Unknown"}</span>
      ),
    },
    { header: "Branch", cell: (shift) => shift.location?.branchName || "—" },
    { header: "Day", cell: (shift) => DAY_LABELS[shift.dayOfWeek] || "—" },
    {
      header: "Time",
      cell: (shift) => `${formatTime(shift.startTime)} – ${formatTime(shift.endTime)}`,
    },
    {
      header: "Status",
      cell: (shift) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            shift.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
          }`}
        >
          {shift.isActive ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (shift) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/schedule/${shift.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(shift)}
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">Pharmacist schedule</h1>
          <p className="mt-1 text-sm text-slate-500">
            The weekly roster shown on the public schedule page and in each pharmacist&apos;s portal.
          </p>
        </div>
        <Link
          href="/admin/schedule/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New shift
        </Link>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={shifts} rowKey={(shift) => shift.id} loading={loading} emptyMessage="No shifts scheduled yet." />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete shift?"
        description={`This shift for "${toDelete?.teamMember?.fullName ?? "this pharmacist"}" will be removed from the schedule.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

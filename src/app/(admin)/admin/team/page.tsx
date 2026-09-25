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
import type { TeamMember } from "@/types";

export default function AdminTeamPage() {
  const { token } = useAuth();
  const showToast = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<TeamMember[]>("/api/team/admin/all", {}, token)
      .then(setMembers)
      .catch(() => showToast("error", "Failed to load team members."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/team/${toDelete.id}`, { method: "DELETE" }, token);
      setMembers((current) => current.filter((m) => m.id !== toDelete.id));
      showToast("success", "Team member deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete team member.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<TeamMember>[] = [
    { header: "Name", cell: (m) => <span className="font-medium text-slate-900">{m.fullName}</span> },
    { header: "Role", cell: (m) => m.role },
    { header: "Branch", cell: (m) => m.location?.branchName || <span className="text-slate-400">Unassigned</span> },
    { header: "Order", cell: (m) => m.displayOrder },
    { header: "Status", cell: (m) => <StatusBadge status={String(m.isPublished)} set="published" /> },
    {
      header: "",
      className: "text-right",
      cell: (m) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/team/${m.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(m)}
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">Team</h1>
          <p className="mt-1 text-sm text-slate-500">
            Staff shown on the About page and on their assigned branch page. Only real, approved staff.
          </p>
        </div>
        <Link
          href="/admin/team/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New team member
        </Link>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={members} rowKey={(m) => m.id} loading={loading} emptyMessage="No team members yet." />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete team member?"
        description={`"${toDelete?.fullName}" will be permanently removed.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

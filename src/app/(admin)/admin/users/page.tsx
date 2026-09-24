"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/admin/Toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { roleLabel } from "@/lib/text";
import type { User } from "@/types";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-gold/20 text-amber-800",
  pharmacist_reviewer: "bg-teal-100 text-teal-800",
  customer: "bg-slate-100 text-slate-700",
};

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const showToast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<User[]>("/api/admin/users", {}, token)
      .then(setUsers)
      .catch(() => showToast("error", "Failed to load users."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete() {
    if (!toDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/users/${toDelete.id}`, { method: "DELETE" }, token);
      setUsers((current) => current.filter((u) => u.id !== toDelete.id));
      showToast("success", "User deleted.");
      setToDelete(null);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<User>[] = [
    { header: "Name", cell: (u) => <span className="font-medium text-slate-900">{u.fullName}</span> },
    { header: "Email", cell: (u) => u.email },
    {
      header: "Role",
      cell: (u) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_STYLES[u.role] || ROLE_STYLES.customer}`}>
          {roleLabel(u.role)}
        </span>
      ),
    },
    {
      header: "Joined",
      cell: (u) => new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      header: "",
      className: "text-right",
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/users/${u.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Edit ${u.fullName}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setToDelete(u)}
            disabled={u.id === currentUser?.id}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={`Delete ${u.fullName}`}
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
          <h1 className="font-display text-2xl font-semibold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Admin, reviewer and customer accounts.</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
        >
          <Plus className="h-4 w-4" />
          New user
        </Link>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} rows={users} rowKey={(u) => u.id} loading={loading} emptyMessage="No users yet." />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete user?"
        description={`"${toDelete?.fullName}" will be permanently removed. This fails if they've authored/reviewed articles or have audit log history.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
